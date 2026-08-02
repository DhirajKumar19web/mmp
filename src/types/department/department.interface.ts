import type { DepartmentStatus } from "@/types/department/department.types";
import type { LocalizedString } from "@/types/user/user.interface";
import type { Document, Types } from "mongoose";

export interface IDepartment extends Document {
  organization: Types.ObjectId;
  name: LocalizedString;
  slug: string;
  description?: LocalizedString;

  // Materialized Path & Ancestors for tree lookups
  ancestors: Types.ObjectId[];
  parent?: Types.ObjectId | null;
  path: string;

  head?: Types.ObjectId | null;
  status: DepartmentStatus;

  // Soft Delete & Audit
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;

  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}
