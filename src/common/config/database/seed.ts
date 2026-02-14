import { db } from "./database.config";
import { userTable } from "../../../apps/auth/user/user.model";
import { roleTable } from "../../../apps/auth/role/role.model";
import { userRoleTable } from "../../../apps/auth/user-role/user-role.model";
import { appLogger } from "../logging/logging.config";

const seed = async () => {
    appLogger.info(" Seeding database...");

    try {
        await db.delete(userRoleTable);
        await db.delete(userTable);
        await db.delete(roleTable);

        appLogger.info("Inserting roles...");
        await db.insert(roleTable).values([
            {
                uuid: 'c0f29810-dfe4-11f0-a259-145afc5d4423',
                nama: 'super_admin'
            },
            {
                uuid: 'e6df4ca8-dff1-11f0-a259-145afc5d4423',
                nama: 'accounting'
            }
        ]);

        appLogger.info("Inserting admin user...");
        const hashedPassword = await Bun.password.hash("admin", {
            algorithm: "bcrypt",
        })

        await db.insert(userTable).values({
            uuid: '5f522ed1-8a70-4c10-8ce4-b89c47b0a240',
            nama: 'ADMINISTRATOR',
            username: 'admin',
            password: hashedPassword
        });

        appLogger.info("Assigning roles to admin...");
        await db.insert(userRoleTable).values([
            {
                uuid: crypto.randomUUID(),
                userUuid: '5f522ed1-8a70-4c10-8ce4-b89c47b0a240',
                roleUuid: 'c0f29810-dfe4-11f0-a259-145afc5d4423'
            }
        ]);

        appLogger.info("Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        appLogger.error(error, "Seeding failed:");
        process.exit(1);
    }
};

seed();