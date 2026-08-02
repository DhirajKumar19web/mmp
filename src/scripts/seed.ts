import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { OrganizationModel, RoleModel, UserModel } from "@/models";
import { OrganizationStatus } from "@/types/organization";
import { RoleStatus } from "@/types/role";
import { UserStatus } from "@/types/user";
import { config, connectDB, disconnectDB, logger } from "@config";

export const seedDatabase = async (): Promise<void> => {
  try {
    await connectDB();

    const seedEmail = config.seed.admin.email.toLowerCase();
    const seedPassword = config.seed.admin.password;
    const seedAdminName = config.seed.admin.name;

    logger.info("Checking database seed status...");

    const hashedPassword = await bcrypt.hash(seedPassword, config.security.bcrypt.saltRounds);

    // 1. Create or Update Organization
    let org = await OrganizationModel.findOne({ email: seedEmail, isDeleted: false });

    if (!org) {
      const tempOwnerId = new mongoose.Types.ObjectId();
      org = new OrganizationModel({
        name: {
          en: `${seedAdminName} Tech India Pvt Ltd`,
          hi: `${seedAdminName} टेक इंडिया प्राइवेट लिमिटेड`,
        },
        code: "TECH_INDIA",
        slug: "tech-india-pvt-ltd",
        email: seedEmail,
        phone: "+919876543210",
        address: {
          street: {
            en: "Plot No. 42, Bandra Kurla Complex, Bandra East",
            hi: "प्लॉट नं. 42, बांद्रा कुर्ला कॉम्प्लेक्स, बांद्रा ईस्ट",
          },
          city: { en: "Mumbai", hi: "मुंबई" },
          state: { en: "Maharashtra", hi: "महाराष्ट्र" },
          country: { en: "India", hi: "भारत" },
          zipCode: "400051",
        },
        owner: tempOwnerId,
        status: OrganizationStatus.ACTIVE,
        defaultLanguage: "en",
      });

      await org.save();
    }

    // 2. Create or Update System Roles
    let superAdminRole = await RoleModel.findOne({
      organization: org._id,
      slug: "super-admin",
      isDeleted: false,
    });

    if (!superAdminRole) {
      superAdminRole = await RoleModel.create({
        name: { en: "Super Admin", hi: "सुपर एडमिन" },
        slug: "super-admin",
        description: {
          en: "Full system administration access",
          hi: "पूर्ण सिस्टम प्रशासनिक पहुँच",
        },
        organization: org._id,
        isSystemRole: true,
        status: RoleStatus.ACTIVE,
      });

      await RoleModel.create([
        {
          name: { en: "Admin", hi: "एडमिन" },
          slug: "admin",
          description: { en: "Organization administrator", hi: "संगठन प्रशासक" },
          organization: org._id,
          isSystemRole: true,
          status: RoleStatus.ACTIVE,
        },
        {
          name: { en: "Manager", hi: "मैनेजर" },
          slug: "manager",
          description: { en: "Department manager", hi: "विभाग प्रबंधक" },
          organization: org._id,
          isSystemRole: true,
          status: RoleStatus.ACTIVE,
        },
      ]);
    }

    // 3. Create or Update SuperAdmin User using config.seed.admin env values
    let user = await UserModel.findOne({ email: seedEmail, isDeleted: false });

    const adminFirstName = seedAdminName || "Super";
    const adminLastName = "Admin";
    const adminFullName = `${adminFirstName} ${adminLastName}`;

    if (user) {
      user.firstName = { en: adminFirstName, hi: adminFirstName };
      user.lastName = { en: adminLastName, hi: adminLastName };
      user.fullName = { en: adminFullName, hi: adminFullName };
      user.password = hashedPassword;
      user.organization = org._id;
      user.roles = [superAdminRole._id];
      user.isSuperAdmin = true;
      user.isProtected = true;
      user.isEmailVerified = true;
      user.isPhoneVerified = true;
      user.status = UserStatus.ACTIVE;
      await user.save();
    } else {
      user = new UserModel({
        firstName: { en: adminFirstName, hi: adminFirstName },
        lastName: { en: adminLastName, hi: adminLastName },
        fullName: { en: adminFullName, hi: adminFullName },
        email: seedEmail,
        username: seedEmail.split("@")[0],
        password: hashedPassword,
        organization: org._id,
        roles: [superAdminRole._id],
        isEmailVerified: true,
        isPhoneVerified: true,
        isSuperAdmin: true,
        isProtected: true,
        status: UserStatus.ACTIVE,
      });

      await user.save();
    }

    // Ensure Organization owner reference points to User
    org.owner = user._id;
    await org.save();

    logger.info("==================================================");
    logger.info("Database Seeding Completed Successfully!");
    logger.info(`Organization: ${seedAdminName} Tech India Pvt Ltd (TECH_INDIA)`);
    logger.info(`SuperAdmin User Configured: ${seedEmail}`);
    logger.info(`Name: ${adminFullName} | isSuperAdmin: true`);
    logger.info("==================================================");
  } catch (error) {
    logger.error({ err: error }, "Database seeding failed!");
  } finally {
    await disconnectDB();
  }
};

// Execute if run directly via CLI
if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  void seedDatabase();
}
