import { model, Schema } from "mongoose";

import { LocalizedStringSchema } from "@/models/localized-string.model";
import { Gender, UserStatus, type IUser } from "@/types/user";

const UserSchema = new Schema(
  {
    // ==========================
    // Personal Information
    // ==========================

    firstName: {
      type: LocalizedStringSchema,
      required: true,
    },

    lastName: {
      type: LocalizedStringSchema,
      default: {},
    },

    fullName: {
      type: LocalizedStringSchema,
      default: {},
    },

    username: {
      type: String,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      enum: Object.values(Gender),
    },

    dob: Date,

    profileImage: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
      mimeType: {
        type: String,
        default: null,
      },
      size: {
        type: Number,
        default: null,
      },
    },

    // ==========================
    // Authentication
    // ==========================

    password: {
      type: String,
      required: true,
      select: false,
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },

    // ==========================
    // Verification
    // ==========================

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: Date,

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: Date,

    // ==========================
    // Login Security
    // ==========================

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: Date,

    lastLogin: Date,

    lastLoginIp: String,

    lastLoginDevice: String,

    lastLoginPlatform: String,

    passwordChangedAt: Date,

    // ==========================
    // Organization
    // ==========================

    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    preferredLanguage: {
      type: String,
      default: "en",
    },

    // ==========================
    // Department
    // ==========================

    primaryDepartment: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },

    departments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Department",
      },
    ],

    // ==========================
    // RBAC
    // ==========================

    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: "Role",
      },
    ],

    directPermissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],

    deniedPermissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],

    // ==========================
    // Status
    // ==========================

    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },

    isSuperAdmin: {
      type: Boolean,
      default: false,
    },

    isProtected: {
      type: Boolean,
      default: false,
    },

    // ==========================
    // Soft Delete
    // ==========================

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: Date,

    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    restoredAt: Date,

    restoredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // ==========================
    // Audit
    // ==========================

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("validate", function (this: unknown) {
  const user = this as IUser;
  if (!user.username && user.email) {
    const emailPrefix = user.email.split("@")[0];
    if (emailPrefix) {
      user.username = emailPrefix.toLowerCase();
    }
  }
});

UserSchema.pre("save", function (this: IUser) {
  if (!this.isModified("firstName") && !this.isModified("lastName")) {
    return;
  }

  const getPlainObj = (val: unknown): Record<string, string> => {
    if (!val) return {};
    return JSON.parse(JSON.stringify(val)) as Record<string, string>;
  };

  const firstObj = getPlainObj(this.firstName);
  const lastObj = getPlainObj(this.lastName);

  const fullName: Record<string, string> = {};
  for (const lang of ["en", "hi", "ar", "fr", "es"]) {
    const first = firstObj[lang]?.trim() ?? "";
    const last = lastObj[lang]?.trim() ?? "";
    const name = [first, last].filter(Boolean).join(" ");

    if (name) {
      fullName[lang] = name;
    }
  }

  if (Object.keys(fullName).length > 0) {
    this.fullName = fullName;
  }
});

UserSchema.index(
  {
    organization: 1,
    email: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  }
);

UserSchema.index(
  {
    organization: 1,
    phone: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      phone: { $exists: true },
      isDeleted: false,
    },
  }
);

UserSchema.index(
  {
    organization: 1,
    username: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      username: { $exists: true },
      isDeleted: false,
    },
  }
);

UserSchema.index({ organization: 1, isDeleted: 1, status: 1, createdAt: -1 });

export const UserModel = model<IUser>("User", UserSchema);
export default UserModel;
