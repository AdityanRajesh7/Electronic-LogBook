import { Router, type IRouter } from "express";
import { db, caseLogsTable, procedureLogsTable, academicLogsTable, studentsTable, usersTable, departmentsTable } from "@workspace/db";
import { eq, and, inArray, count } from "drizzle-orm";

const router: IRouter = Router();

const REQUIRED_CASES = 50;
const REQUIRED_PROCS = 101;
const REQUIRED_ACAD  = 50;

function computeCompletion(cases: number, procs: number, acad: number) {
  const score =
    (Math.min(cases / REQUIRED_CASES, 1) +
     Math.min(procs / REQUIRED_PROCS, 1) +
     Math.min(acad / REQUIRED_ACAD, 1)) / 3;
  return Math.round(score * 100);
}

function shortfallStatus(pct: number): "on_track" | "at_risk" | "behind" {
  if (pct >= 75) return "on_track";
  if (pct >= 40) return "at_risk";
  return "behind";
}

router.get("/:professorId/review-queue", async (req, res) => {
  try {
    const professorId = parseInt(req.params.professorId, 10);
    if (isNaN(professorId)) {
      res.status(400).json({ message: "Invalid professorId" });
      return;
    }

    const profMatch = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, professorId), inArray(usersTable.role, ["professor", "hod"])))
      .limit(1);

    if (profMatch.length === 0) {
      res.status(404).json({ message: "Professor not found" });
      return;
    }

    const cases = await db.select({
      log: caseLogsTable,
      student: studentsTable,
      user: usersTable,
      department: departmentsTable,
    })
    .from(caseLogsTable)
    .where(and(eq(caseLogsTable.supervisorId, professorId), eq(caseLogsTable.status, "pending")))
    .innerJoin(studentsTable, eq(caseLogsTable.studentId, studentsTable.id))
    .innerJoin(usersTable, eq(studentsTable.userId, usersTable.id))
    .leftJoin(departmentsTable, eq(usersTable.departmentId, departmentsTable.id));

    const procedures = await db.select({
      log: procedureLogsTable,
      student: studentsTable,
      user: usersTable,
      department: departmentsTable,
    })
    .from(procedureLogsTable)
    .where(and(eq(procedureLogsTable.supervisorId, professorId), eq(procedureLogsTable.status, "pending")))
    .innerJoin(studentsTable, eq(procedureLogsTable.studentId, studentsTable.id))
    .innerJoin(usersTable, eq(studentsTable.userId, usersTable.id))
    .leftJoin(departmentsTable, eq(usersTable.departmentId, departmentsTable.id));

    const academics = await db.select({
      log: academicLogsTable,
      student: studentsTable,
      user: usersTable,
      department: departmentsTable,
    })
    .from(academicLogsTable)
    .where(and(eq(academicLogsTable.supervisorId, professorId), eq(academicLogsTable.status, "pending")))
    .innerJoin(studentsTable, eq(academicLogsTable.studentId, studentsTable.id))
    .innerJoin(usersTable, eq(studentsTable.userId, usersTable.id))
    .leftJoin(departmentsTable, eq(usersTable.departmentId, departmentsTable.id));

    const pendingReviews = [
      ...cases.map(c => ({
        id: `case-${c.log.id}`,
        dbId: c.log.id,
        logType: "case",
        studentId: c.student.id,
        studentName: c.user.fullName,
        registrationNumber: c.student.registrationNumber,
        department: c.department?.name || "Unknown",
        type: "Case Log",
        title: `${c.log.diagnosisProvisional} — ${c.log.patientAge}, ${c.log.patientGender}`,
        date: c.log.date,
        patientUhid: c.log.patientUhid,
        patientInfo: `${c.log.patientAge} / ${c.log.patientGender}`,
        detail: c.log.chiefComplaints,
        diagnosis: c.log.diagnosisProvisional,
        status: c.log.status
      })),
      ...procedures.map(p => ({
        id: `procedure-${p.log.id}`,
        dbId: p.log.id,
        logType: "procedure",
        studentId: p.student.id,
        studentName: p.user.fullName,
        registrationNumber: p.student.registrationNumber,
        department: p.department?.name || "Unknown",
        type: "Procedure",
        title: p.log.procedureName,
        date: p.log.date,
        patientUhid: p.log.patientUhid,
        patientInfo: p.log.patientAge,
        detail: `${p.log.procedureGroup} procedure`,
        declaredCompetency: p.log.competencyLevel,
        status: p.log.status
      })),
      ...academics.map(a => ({
        id: `academic-${a.log.id}`,
        dbId: a.log.id,
        logType: "academic",
        studentId: a.student.id,
        studentName: a.user.fullName,
        registrationNumber: a.student.registrationNumber,
        department: a.department?.name || "Unknown",
        type: "Academic",
        title: `${a.log.activityType}: ${a.log.topic}`,
        date: a.log.date,
        detail: a.log.presentationType || a.log.activityType,
        status: a.log.status
      }))
    ];

    // ── Mentees (all students in the professor's department) ──────────────────
    const deptId = profMatch[0].departmentId;

    let menteesData: any[] = [];
    if (deptId != null) {
      const studentsInDept = await db
        .select({
          studentId: studentsTable.id,
          userId:    studentsTable.userId,
          regNum:    studentsTable.registrationNumber,
          fullName:  usersTable.fullName,
          deptName:  departmentsTable.name,
        })
        .from(studentsTable)
        .innerJoin(usersTable,      eq(studentsTable.userId,      usersTable.id))
        .leftJoin(departmentsTable, eq(usersTable.departmentId,   departmentsTable.id))
        .where(eq(usersTable.departmentId, deptId));

      // Count only verified logs per student for Professor Portal evaluation
      const caseCountRows = await db
        .select({ studentId: caseLogsTable.studentId, cnt: count() })
        .from(caseLogsTable)
        .where(eq(caseLogsTable.status, "verified"))
        .groupBy(caseLogsTable.studentId);

      const procCountRows = await db
        .select({ studentId: procedureLogsTable.studentId, cnt: count() })
        .from(procedureLogsTable)
        .where(eq(procedureLogsTable.status, "verified"))
        .groupBy(procedureLogsTable.studentId);

      const acadCountRows = await db
        .select({ studentId: academicLogsTable.studentId, cnt: count() })
        .from(academicLogsTable)
        .where(eq(academicLogsTable.status, "verified"))
        .groupBy(academicLogsTable.studentId);

      const toMap = (rows: { studentId: number; cnt: number }[]) =>
        Object.fromEntries(rows.map(r => [r.studentId, Number(r.cnt)]));

      const caseMap = toMap(caseCountRows as any);
      const procMap = toMap(procCountRows as any);
      const acadMap = toMap(acadCountRows as any);

      menteesData = studentsInDept.map(s => {
        const cases = caseMap[s.studentId] ?? 0;
        const procs = procMap[s.studentId] ?? 0;
        const acad  = acadMap[s.studentId]  ?? 0;
        const pct   = computeCompletion(cases, procs, acad);
        return {
          id:                 s.studentId,
          name:               s.fullName,
          registrationNumber: s.regNum,
          department:         s.deptName || "Unknown",
          overallCompletion:  pct,
          shortfallStatus:    shortfallStatus(pct),
          logCounts: { cases, procs, acad },
        };
      });
    }

    res.json({
      pendingReviews,
      assignedMentees: menteesData,
    });
  } catch (error) {
    req.log.error(error, "Error fetching professor review queue");
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
