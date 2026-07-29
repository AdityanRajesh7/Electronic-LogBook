import { pgTable, uuid, varchar, timestamp, jsonb, pgEnum, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./users.js";
import { createInsertSchema } from "drizzle-zod";

export const auditActionEnum = pgEnum("audit_action", ["CREATE", "UPDATE", "DELETE"]);

export const auditTable = pgTable("audit", {
  id: uuid("id").primaryKey().defaultRandom(),
  tableName: varchar("table_name").notNull(),
  // Note: Using varchar instead of uuid because existing tables (users, students) use integer IDs.
  // A uuid column cannot store integer values.
  recordId: varchar("record_id").notNull(), 
  action: auditActionEnum("action").notNull(),
  // Note: Using integer instead of uuid for foreign keys to match the referenced usersTable.id
  performedById: integer("performed_by_id").notNull().references(() => usersTable.id),
  beforeState: jsonb("before_state"),
  afterState: jsonb("after_state"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const auditRelations = relations(auditTable, ({ one }) => ({
  performedBy: one(usersTable, {
    fields: [auditTable.performedById],
    references: [usersTable.id],
  }),
}));

export const insertAuditSchema = createInsertSchema(auditTable);
export type InsertAudit = typeof auditTable.$inferInsert;
export type Audit = typeof auditTable.$inferSelect;
