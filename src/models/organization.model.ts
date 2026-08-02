import { model, Schema } from "mongoose";
import slugify from "slugify";

import { LocalizedStringSchema } from "@/models/localized-string.model";
import { OrganizationStatus, type IOrganization } from "@/types/organization";

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: LocalizedStringSchema,
      required: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    logo: {
      url: {
        type: String,
        default: null,
      },
      key: {
        type: String,
        default: null,
      },
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      street: {
        type: LocalizedStringSchema,
        required: true,
      },
      city: {
        type: LocalizedStringSchema,
        required: true,
      },
      state: {
        type: LocalizedStringSchema,
        required: true,
      },
      country: {
        type: LocalizedStringSchema,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(OrganizationStatus),
      default: OrganizationStatus.ACTIVE,
    },

    defaultLanguage: {
      type: String,
      default: "en",
      lowercase: true,
      trim: true,
    },

    // Soft Delete Fields
    isDeleted: {
      type: Boolean,
      default: false,
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

// Pre-validate Hook: Auto-generate slug and code from English name if missing
OrganizationSchema.pre("validate", function (this: IOrganization) {
  if (!this.slug && this.name && typeof this.name === "object" && "en" in this.name) {
    const enName = (this.name as { en?: string }).en;
    if (enName) {
      this.slug = slugify(enName, { lower: true, strict: true });
    }
  }

  if (!this.code && this.slug) {
    this.code = this.slug.replace(/-/g, "_").toUpperCase();
  }
});

// Partial Unique Indexes (ignoring soft-deleted documents)
OrganizationSchema.index(
  { code: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

OrganizationSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

OrganizationSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

OrganizationSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

OrganizationSchema.index({ status: 1, isDeleted: 1 });

export const OrganizationModel = model<IOrganization>("Organization", OrganizationSchema);
export default OrganizationModel;
