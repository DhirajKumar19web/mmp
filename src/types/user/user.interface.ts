import type { Gender, UserStatus } from "@/types/user/user.types";
import type { Document, Types } from "mongoose";

export type LocalizedString = string | Map<string, string> | Record<string, string>;

export interface IUser extends Document {
  firstName: LocalizedString;
  lastName: LocalizedString;
  fullName?: LocalizedString;

  email: string;
  username?: string;
  phone?: string;

  password: string;

  profileImage?: {
    url?: string | null;
    publicId?: string | null;
    mimeType?: string | null;
    size?: number | null;
  };

  gender?: Gender;
  dob?: Date;

  organization: Types.ObjectId;

  primaryDepartment?: Types.ObjectId | null;
  departments?: Types.ObjectId[];

  roles: Types.ObjectId[];
  directPermissions?: Types.ObjectId[];
  deniedPermissions?: Types.ObjectId[];

  isEmailVerified: boolean;
  isPhoneVerified: boolean;

  isSuperAdmin?: boolean;
  isProtected?: boolean;

  status: UserStatus;
  preferredLanguage?: string;

  lastLogin?: Date;

  // Soft Delete & Audit
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;

  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}
