import { Schema, model } from "mongoose";
import slugify from "slugify";

import { LocalizedStringSchema } from "@/models/localized-string.model";
import { RoleStatus, type IRole } from "@/types/role";

const RoleSchema = new Schema<IRole>(
  {
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

    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],

    isSystemRole: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(RoleStatus),
      default: RoleStatus.ACTIVE,
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
  }
);

// Pre-validate Hook: Auto-generate slug from English name if missing
RoleSchema.pre("validate", function (this: IRole) {
  if (!this.slug && this.name && typeof this.name === "object" && "en" in this.name) {
    const enName = (this.name as { en?: string }).en;
    if (enName) {
      this.slug = slugify(enName, { lower: true, strict: true });
    }
  }
});

// Pre-save Safeguard: Prevent deleting system roles
RoleSchema.pre("save", function (this: IRole) {
  if (this.isSystemRole && this.isDeleted) {
    throw new Error("System roles cannot be soft-deleted.");
  }
});

// Compound Indexes
RoleSchema.index(
  {
    organization: 1,
    slug: 1,
  },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  }
);

RoleSchema.index({
  organization: 1,
  status: 1,
  isDeleted: 1,
});

RoleSchema.index({
  organization: 1,
  isSystemRole: 1,
  isDeleted: 1,
});

RoleSchema.index({
  organization: 1,
  isDeleted: 1,
  createdAt: -1,
});

export const RoleModel = model<IRole>("Role", RoleSchema);
export default RoleModel;
