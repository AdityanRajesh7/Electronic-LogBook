import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const procedureTypesTable = pgTable("procedure_types", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id").notNull(),
  name: text("name").notNull(),
  group: text("group", { enum: ["emergency", "invasive"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProcedureTypeSchema = createInsertSchema(procedureTypesTable);
export type InsertProcedureType = typeof procedureTypesTable.$inferInsert;
export type ProcedureType = typeof procedureTypesTable.$inferSelect;
