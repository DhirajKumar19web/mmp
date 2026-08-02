import type { IOrganizationAddress } from "@/types/organization";
import type { Gender, LocalizedString } from "@/types/user";

export interface RegisterOrganizationInput {
  email: string;
  password: string;
  firstName: LocalizedString;
  lastName?: LocalizedString;
  phone?: string;
  gender?: Gender;
  dob?: Date;
  preferredLanguage?: string;

  organization: {
    name: LocalizedString;
    code?: string;
    email: string;
    phone: string;
    address: IOrganizationAddress;
    defaultLanguage?: string;
  };
}

export interface RegisterOrganizationResult {
  organization: {
    id: string;
    name: LocalizedString;
    code: string;
    slug: string;
    email: string;
  };
  user: {
    id: string;
    email: string;
    firstName: LocalizedString;
    lastName?: LocalizedString;
  };
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: LocalizedString;
  lastName?: LocalizedString;
  organization: string;
  phone?: string;
  gender?: Gender;
  dob?: Date | string;
  preferredLanguage?: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: LocalizedString;
  lastName?: LocalizedString;
  organization: string;
  phone?: string;
  gender?: Gender;
  dob?: Date | string;
  roles?: string[];
  permissions?: string[];
  primaryDepartment?: string;
  departments?: string[];
  directPermissions?: string[];
  deniedPermissions?: string[];
}
