import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { studentsTable } from "./students.js";

export const postingsTable = pgTable("postings", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  postingName: text("posting_name").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  durationDays: integer("duration_days").notNull(),
  attendanceInCharge: text("attendance_in_charge").notNull(),
  status: text("status", { enum: ["active", "completed", "upcoming"] }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPostingSchema = createInsertSchema(postingsTable);
export type InsertPosting = typeof postingsTable.$inferInsert;
export type Posting = typeof postingsTable.$inferSelect;
