import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { studentsTable } from "./students.js";
import { usersTable } from "./users.js";



export const thesisMilestonesTable = pgTable("thesis_milestones", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id).unique(),
  topic: text("topic").notNull(),
  guideId: integer("guide_id").references(() => usersTable.id),
  coGuideId: integer("co_guide_id").references(() => usersTable.id),
  protocolSubmissionDate: text("protocol_submission_date"),
  iecClearanceDate: text("iec_clearance_date"),
  dataCollectionStartDate: text("data_collection_start_date"),
  dataCollectionEndDate: text("data_collection_end_date"),
  submissionDate: text("submission_date"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertThesisMilestoneSchema = createInsertSchema(thesisMilestonesTable);
export type InsertThesisMilestone = typeof thesisMilestonesTable.$inferInsert;
export type ThesisMilestone = typeof thesisMilestonesTable.$inferSelect;
