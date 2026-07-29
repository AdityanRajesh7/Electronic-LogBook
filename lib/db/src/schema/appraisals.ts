import { pgTable, uuid, timestamp, integer, text, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { studentsTable } from "./students.js";
import { usersTable } from "./users.js";
import { createInsertSchema } from "drizzle-zod";

export const appraisalsTable = pgTable("appraisals", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Note: Using integer instead of uuid for foreign keys to match referenced tables
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  evaluatorId: integer("evaluator_id").notNull().references(() => usersTable.id),
  quarter: integer("quarter").notNull(),
  year: integer("year").notNull(),
  scholasticGrade: varchar("scholastic_grade", { length: 8 }).notNull(),
  patientCareGrade: varchar("patient_care_grade", { length: 8 }).notNull(),
  professionalAttributesGrade: varchar("professional_attributes_grade", { length: 8 }).notNull(),
  facultyRemarks: text("faculty_remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appraisalsRelations = relations(appraisalsTable, ({ one }) => ({
  student: one(studentsTable, {
    fields: [appraisalsTable.studentId],
    references: [studentsTable.id],
  }),
  evaluator: one(usersTable, {
    fields: [appraisalsTable.evaluatorId],
    references: [usersTable.id],
  }),
}));

export const insertAppraisalSchema = createInsertSchema(appraisalsTable);
export type InsertAppraisal = typeof appraisalsTable.$inferInsert;
export type Appraisal = typeof appraisalsTable.$inferSelect;
