import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const departmentConfigsTable = pgTable("department_configs", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id").notNull(),
  requiredCases: integer("required_cases").default(0),
  requiredProcedures: integer("required_procedures").default(0),
  requiredAcademic: integer("required_academic").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDepartmentConfigSchema = createInsertSchema(departmentConfigsTable);
export type InsertDepartmentConfig = typeof departmentConfigsTable.$inferInsert;
export type DepartmentConfig = typeof departmentConfigsTable.$inferSelect;
