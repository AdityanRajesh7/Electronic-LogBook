import { pgTable, uuid, timestamp, integer, text, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { studentsTable } from "./students.js";
import { usersTable } from "./users.js";
import { createInsertSchema } from "drizzle-zod";

export const leaveTypeEnum = pgEnum("leave_type", ["casual", "academic", "medical", "other"]);
export const leaveStatusEnum = pgEnum("leave_status", ["pending", "approved", "rejected"]);

export const leaveTable = pgTable("leave", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Note: Using integer instead of uuid for foreign key to match studentsTable.id
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  fromDate: timestamp("from_date").notNull(),
  toDate: timestamp("to_date").notNull(),
  totalDays: integer("total_days").notNull(),
  leaveType: leaveTypeEnum("leave_type").notNull(),
  reason: text("reason").notNull(),
  status: leaveStatusEnum("status").default("pending").notNull(),
  // Note: Using integer instead of uuid for foreign key to match usersTable.id
  approvedById: integer("approved_by_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaveRelations = relations(leaveTable, ({ one }) => ({
  student: one(studentsTable, {
    fields: [leaveTable.studentId],
    references: [studentsTable.id],
  }),
  approvedBy: one(usersTable, {
    fields: [leaveTable.approvedById],
    references: [usersTable.id],
  }),
}));

export const insertLeaveSchema = createInsertSchema(leaveTable);
export type InsertLeave = typeof leaveTable.$inferInsert;
export type Leave = typeof leaveTable.$inferSelect;
