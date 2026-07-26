import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const requirementsMasterTable = pgTable("requirements_master", {
  id: serial("id").primaryKey(),
  specialty: text("specialty").notNull(),
  category: text("category", { enum: ["posting", "case", "procedure", "academic"] }).notNull(),
  itemName: text("item_name").notNull(),
  minRequiredCount: integer("min_required_count").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRequirementSchema = createInsertSchema(requirementsMasterTable);
export type InsertRequirement = typeof requirementsMasterTable.$inferInsert;
export type Requirement = typeof requirementsMasterTable.$inferSelect;
