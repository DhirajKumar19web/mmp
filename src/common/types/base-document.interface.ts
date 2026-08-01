import { type Document, type Types } from "mongoose";

export interface IBaseDocument extends Document {
  organization?: Types.ObjectId;

  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;

  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}
