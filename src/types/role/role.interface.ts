import type { RoleStatus } from "@/types/role/role.types";
import type { LocalizedString } from "@/types/user/user.interface";
import type { Document, Types } from "mongoose";

export interface IRole extends Document {
  name: LocalizedString;
  slug: string;
  description?: LocalizedString;

  organization: Types.ObjectId;
  permissions: Types.ObjectId[];

  isSystemRole: boolean;
  status: RoleStatus;

  // Soft Delete & Audit
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;

  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}
