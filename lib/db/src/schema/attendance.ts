import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { studentsTable } from "./students.js";
import { usersTable } from "./users.js";

export const attendanceLogsTable = pgTable("attendance_logs", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  date: text("date").notNull(),
  clockIn: text("clock_in"),
  clockOut: text("clock_out"),
  status: text("status", { enum: ["present", "absent", "half_day", "leave"] }).notNull().default("present"),
  verifiedBy: integer("verified_by").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAttendanceSchema = createInsertSchema(attendanceLogsTable);
export type InsertAttendance = typeof attendanceLogsTable.$inferInsert;
export type Attendance = typeof attendanceLogsTable.$inferSelect;

export const leaveApplicationsTable = pgTable("leave_applications", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  fromDate: text("from_date").notNull(),
  toDate: text("to_date").notNull(),
  totalDays: integer("total_days").notNull(),
  leaveType: text("leave_type").notNull(),
  reason: text("reason").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  approvedBy: integer("approved_by").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeaveApplicationSchema = createInsertSchema(leaveApplicationsTable);
export type InsertLeaveApplication = typeof leaveApplicationsTable.$inferInsert;
export type LeaveApplication = typeof leaveApplicationsTable.$inferSelect;
