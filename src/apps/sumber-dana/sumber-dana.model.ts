import { varchar } from "drizzle-orm/mysql-core";
import { createGenericModel } from "../../common/utils/route-generator.util";

export const sumberDanaTable = createGenericModel("sumber_dana", {
    nama: varchar("nama", { length: 255 }).notNull(),
});