import { Schema, model } from "mongoose";
import slugify from "slugify";

import { LocalizedStringSchema } from "@/models/localized-string.model";
import { DepartmentStatus, type IDepartment } from "@/types/department";

const DepartmentSchema = new Schema<IDepartment>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    name: {
      type: LocalizedStringSchema,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: LocalizedStringSchema,
      default: null,
    },

    // Materialized Path & Ancestors array for sub-millisecond tree lookups
    ancestors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Department",
      },
    ],

    parent: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    path: {
      type: String,
      default: "",
    },

    head: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: Object.values(DepartmentStatus),
      default: DepartmentStatus.ACTIVE,
    },

    // Soft Delete Fields
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for direct sub-departments
DepartmentSchema.virtual("children", {
  ref: "Department",
  localField: "_id",
  foreignField: "parent",
});

// Pre-validate Hook: Auto-generate slug from English name if missing
DepartmentSchema.pre("validate", function (this: IDepartment) {
  if (!this.slug && this.name && typeof this.name === "object" && "en" in this.name) {
    const enName = (this.name as { en?: string }).en;
    if (enName) {
      this.slug = slugify(enName, { lower: true, strict: true });
    }
  }
});

// Pre-save Hook: Safety checks & Materialized Path maintenance
DepartmentSchema.pre("save", async function (this: IDepartment) {
  // 1. Prevent self-parenting circular reference
  if (this.parent?.equals(this._id)) {
    throw new Error("A department cannot be its own parent.");
  }

  // 2. Re-calculate ancestors & materialized path if parent changes
  if (this.isModified("parent")) {
    const oldPath = this.path;

    if (!this.parent) {
      this.ancestors = [];
      this.path = `,${this._id.toString()},`;
    } else {
      const parentDept = await model<IDepartment>("Department").findById(this.parent);
      if (!parentDept) {
        throw new Error("Parent department not found.");
      }

      // Prevent cycle: parent cannot be a descendant of this department
      if (parentDept.ancestors.some((ancId) => ancId.equals(this._id))) {
        throw new Error(
          "Cannot set parent to a descendant department (circular reference detected)."
        );
      }

      this.ancestors = [...parentDept.ancestors, parentDept._id];
      this.path = `${parentDept.path}${this._id.toString()},`;
    }

    // 3. Cascade update paths for all descendants if path changed on existing document
    if (oldPath && oldPath !== this.path && !this.isNew) {
      const descendants = await model<IDepartment>("Department").find({
        ancestors: this._id,
      });

      for (const child of descendants) {
        const newChildPath = child.path.replace(oldPath, this.path);
        const selfIndexInAncestors = child.ancestors.findIndex((anc) => anc.equals(this._id));
        const updatedAncestors = [
          ...this.ancestors,
          this._id,
          ...child.ancestors.slice(selfIndexInAncestors + 1),
        ];

        await model<IDepartment>("Department").updateOne(
          { _id: child._id },
          { $set: { path: newChildPath, ancestors: updatedAncestors } }
        );
      }
    }
  }
});

// Unique slug per organization ignoring soft-deleted departments
DepartmentSchema.index(
  {
    organization: 1,
    slug: 1,
  },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  }
);

// Performance Indexes for tree lookups & multi-tenant queries
DepartmentSchema.index({ organization: 1, parent: 1, isDeleted: 1 });
DepartmentSchema.index({ organization: 1, ancestors: 1, isDeleted: 1 });
DepartmentSchema.index({ organization: 1, path: 1, isDeleted: 1 });
DepartmentSchema.index({ organization: 1, status: 1, isDeleted: 1 });
DepartmentSchema.index({ organization: 1, isDeleted: 1, createdAt: -1 });

export const DepartmentModel = model<IDepartment>("Department", DepartmentSchema);
export default DepartmentModel;
