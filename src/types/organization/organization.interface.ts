import type { OrganizationStatus } from "@/types/organization/organization.types";
import type { LocalizedString } from "@/types/user/user.interface";
import type { Document, Types } from "mongoose";

export interface IOrganizationLogo {
  url?: string | null;
  key?: string | null;
}

export interface IOrganizationAddress {
  street: LocalizedString;
  city: LocalizedString;
  state: LocalizedString;
  country: LocalizedString;
  zipCode: string;
}

export interface IOrganization extends Document {
  name: LocalizedString;
  code: string;
  slug: string;
  logo?: IOrganizationLogo;

  email: string;
  phone: string;
  address: IOrganizationAddress;

  owner: Types.ObjectId;
  status: OrganizationStatus;
  defaultLanguage?: string;

  // Soft Delete & Audit
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;

  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}
