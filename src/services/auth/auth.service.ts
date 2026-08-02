import bcrypt from "bcryptjs";

import { OrganizationModel, UserModel } from "@/models";
import { config } from "@config";
import { ConflictError, NotFoundError } from "@errors";
import { generateAndStoreTokens, type TokenGenerationMeta, type TokenPayload } from "@utils";

import { tokenRotationService } from "./token-rotation.service";

import type { RegisterInput } from "./types";

export class AuthService {
  /**
   * Self User Registration for an Existing Organization
   */
  public async register(input: RegisterInput, meta?: TokenGenerationMeta) {
    const {
      email,
      password,
      firstName,
      lastName,
      organization,
      phone,
      gender,
      dob,
      preferredLanguage,
    } = input;

    // Check if organization exists
    const existingOrg = await OrganizationModel.findById(organization);
    if (!existingOrg) {
      throw new NotFoundError("Organization not found");
    }

    // Check if active user already exists with this email
    const existingUser = await UserModel.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });

    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.security.bcrypt.saltRounds);

    // Create User
    const user = await UserModel.create({
      firstName,
      ...(lastName ? { lastName } : {}),
      email: email.toLowerCase(),
      password: hashedPassword,
      organization,
      ...(phone ? { phone } : {}),
      ...(gender ? { gender } : {}),
      ...(dob ? { dob: new Date(dob) } : {}),
      ...(preferredLanguage ? { preferredLanguage } : {}),
    });

    const tokenPayload: Omit<TokenPayload, "jti" | "familyId"> = {
      userId: user._id.toString(),
      email: user.email,
      organizationId: user.organization.toString(),
    };

    // Generate JWT tokens AND store RefreshToken document in DB
    const tokens = await generateAndStoreTokens(tokenPayload, meta);

    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Enterprise Refresh Token Rotation with Reuse Detection & Redis Locks
   */
  public async refreshTokens(incomingRefreshToken: string, meta?: TokenGenerationMeta) {
    return tokenRotationService.rotate(incomingRefreshToken, meta);
  }
}

export const authService = new AuthService();
