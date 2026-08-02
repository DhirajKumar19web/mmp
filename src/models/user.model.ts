import { model, Schema } from "mongoose";

import { LocalizedStringSchema } from "@/models/localized-string.model";
import { Gender } from "@/types/user/user.types";

import type { IUser } from "@/types/user/user.interface";

const UserSchema = new Schema(
  {
    // ==========================
    // Personal Information
    // ==========================

    firstName: LocalizedStringSchema,

    lastName: LocalizedStringSchema,

    fullName: LocalizedStringSchema,

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
      url: String,
      publicId: String,
      mimeType: String,
      size: Number,
    },

    // ==========================
    // Authentication
    // ==========================

    password: {
      type: String,
      required: true,
      select: false,
    },

    providerId: String,

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

    permissionOverrides: [
      {
        permission: {
          type: Schema.Types.ObjectId,
          ref: "Permission",
        },

        isGranted: Boolean,
      },
    ],

    // ==========================
    // Status
    // ==========================

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "LOCKED", "SUSPENDED", "INVITED"],
      default: "ACTIVE",
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

UserSchema.pre("save", function (this: unknown) {
  const user = this as IUser;

  if (!user.isModified("firstName") && !user.isModified("lastName")) {
    return;
  }

  const firstName = (user.firstName as Record<string, string> | undefined) ?? {};
  const lastName = (user.lastName as Record<string, string> | undefined) ?? {};

  const languages = new Set([...Object.keys(firstName), ...Object.keys(lastName)]);

  const fullName: Record<string, string> = {};

  for (const lang of languages) {
    const first = firstName[lang]?.trim() ?? "";
    const last = lastName[lang]?.trim() ?? "";

    fullName[lang] = [first, last].filter(Boolean).join(" ");
  }

  user.fullName = fullName;
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

UserSchema.index({
  organization: 1,
  status: 1,
  createdAt: -1,
});

export const UserModel = model<IUser>("User", UserSchema);
export default UserModel;
