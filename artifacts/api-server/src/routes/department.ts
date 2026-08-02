import { Router, type IRouter } from "express";
import { db, usersTable, departmentsTable, studentsTable, caseLogsTable, procedureLogsTable, academicLogsTable, departmentConfigsTable } from "@workspace/db";
import { eq, and, inArray, count, sql } from "drizzle-orm";

const router: IRouter = Router();

function computeCompletion(cases: number, procs: number, acad: number, reqCases: number, reqProcs: number, reqAcad: number) {
  const score =
    (Math.min(cases / (reqCases || 1), 1) +
     Math.min(procs / (reqProcs || 1), 1) +
     Math.min(acad / (reqAcad || 1), 1)) / 3;
  return Math.round(score * 100);
}

// GET /api/departments/:departmentId/config
router.get("/:departmentId/config", async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId, 10);
    if (isNaN(departmentId)) {
      res.status(400).json({ message: "Invalid departmentId" });
      return;
    }

    const [config] = await db.select().from(departmentConfigsTable).where(eq(departmentConfigsTable.departmentId, departmentId));
    res.json(config || { requiredCases: 50, requiredProcedures: 101, requiredAcademic: 15 });
  } catch (error) {
    req.log.error(error, "Error fetching department config");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:departmentId/professors", async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId, 10);
    if (isNaN(departmentId)) {
      res.status(400).json({ message: "Invalid departmentId format" });
      return;
    }

    const professors = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        role: usersTable.role,
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.departmentId, departmentId),
          inArray(usersTable.role, ["professor", "hod"])
        )
      );

    res.json(professors);
  } catch (error) {
    req.log.error(error, "Error fetching professors by department");
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/departments/:departmentId/analytics
router.get("/:departmentId/analytics", async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId, 10);
    if (isNaN(departmentId)) {
      res.status(400).json({ message: "Invalid departmentId format" });
      return;
    }

    // 404 if department doesn't exist
    const deptMatch = await db.select().from(departmentsTable).where(eq(departmentsTable.id, departmentId)).limit(1);
    if (deptMatch.length === 0) {
      res.status(404).json({ message: "Department not found" });
      return;
    }

    // All students in this department (via users.departmentId)
    const studentsInDept = await db
      .select({
        studentId:          studentsTable.id,
        userId:             studentsTable.userId,
        registrationNumber: studentsTable.registrationNumber,
        dateOfJoining:      studentsTable.dateOfJoining,
        kuhsId:             studentsTable.kuhsId,
        fullName:           usersTable.fullName,
        email:              usersTable.email,
      })
      .from(studentsTable)
      .innerJoin(usersTable, eq(studentsTable.userId, usersTable.id))
      .where(eq(usersTable.departmentId, departmentId));

    const studentIds = studentsInDept.map(s => s.studentId);

    // ── Log status breakdown across all three tables ──────────────────────────
    let logStats = { pending: 0, verified: 0, rejected: 0 };

    if (studentIds.length > 0) {
      const countByStatus = async (tbl: typeof caseLogsTable | typeof procedureLogsTable | typeof academicLogsTable, idCol: any) =>
        db.select({ status: (tbl as any).status, cnt: count() })
          .from(tbl)
          .where(inArray(idCol, studentIds))
          .groupBy((tbl as any).status);

      const [caseCounts, procCounts, acadCounts] = await Promise.all([
        countByStatus(caseLogsTable, caseLogsTable.studentId),
        countByStatus(procedureLogsTable, procedureLogsTable.studentId),
        countByStatus(academicLogsTable, academicLogsTable.studentId),
      ]);

      for (const row of [...caseCounts, ...procCounts, ...acadCounts] as any[]) {
        const s = row.status as "pending" | "verified" | "rejected";
        logStats[s] = (logStats[s] || 0) + Number(row.cnt);
      }
    }

    // ── Top procedure types ───────────────────────────────────────────────────
    let topProcedures: { name: string; count: number }[] = [];

    if (studentIds.length > 0) {
      const procRows = await db
        .select({ name: procedureLogsTable.procedureName, cnt: count() })
        .from(procedureLogsTable)
        .where(inArray(procedureLogsTable.studentId, studentIds))
        .groupBy(procedureLogsTable.procedureName)
        .orderBy(sql`count(*) DESC`)
        .limit(5);

      topProcedures = (procRows as any[]).map(r => ({ name: r.name, count: Number(r.cnt) }));
    }

    // ── Per-student completion (verified only) → average ─────────────────────
    let avgCompletion = 0;

    if (studentIds.length > 0) {
      const [caseRows, procRows2, acadRows] = await Promise.all([
        db.select({ studentId: caseLogsTable.studentId, cnt: count() })
          .from(caseLogsTable)
          .where(and(inArray(caseLogsTable.studentId, studentIds), eq(caseLogsTable.status, "verified")))
          .groupBy(caseLogsTable.studentId),
        db.select({ studentId: procedureLogsTable.studentId, cnt: count() })
          .from(procedureLogsTable)
          .where(and(inArray(procedureLogsTable.studentId, studentIds), eq(procedureLogsTable.status, "verified")))
          .groupBy(procedureLogsTable.studentId),
        db.select({ studentId: academicLogsTable.studentId, cnt: count() })
          .from(academicLogsTable)
          .where(and(inArray(academicLogsTable.studentId, studentIds), eq(academicLogsTable.status, "verified")))
          .groupBy(academicLogsTable.studentId),
      ]);

      const toMap = (rows: { studentId: number; cnt: number }[]) =>
        Object.fromEntries(rows.map(r => [r.studentId, Number(r.cnt)]));

      const caseMap = toMap(caseRows as any);
      const procMap = toMap(procRows2 as any);
      const acadMap = toMap(acadRows as any);

      const [config] = await db.select().from(departmentConfigsTable).where(eq(departmentConfigsTable.departmentId, departmentId));
      const reqCases = config?.requiredCases || 50;
      const reqProcs = config?.requiredProcedures || 101;
      const reqAcad = config?.requiredAcademic || 15;

      const completions = studentsInDept.map(s =>
        computeCompletion(caseMap[s.studentId] ?? 0, procMap[s.studentId] ?? 0, acadMap[s.studentId] ?? 0, reqCases, reqProcs, reqAcad)
      );
      avgCompletion = completions.length > 0
        ? Math.round(completions.reduce((a, b) => a + b, 0) / completions.length)
        : 0;
    }

    // ── Student list for the registrations table ──────────────────────────────
    // Status field: since there's no separate registration status column yet,
    // we treat all students as "Active" (they are in the DB = admitted).
    // Future: add a status column to studentsTable.
    const students = studentsInDept.map((s, i) => ({
      number:             i + 1,
      name:               s.fullName,
      department:         deptMatch[0].name,
      registrationNumber: s.registrationNumber,
      dateOfJoining:      s.dateOfJoining,
      expectedCompletion: (() => {
        // 3-year programme: joining date + 3 years
        const d = new Date(s.dateOfJoining);
        d.setFullYear(d.getFullYear() + 3);
        return d.toISOString().split("T")[0];
      })(),
      status:  "Active" as const,
    }));

    res.json({
      totalStudents:   studentsInDept.length,
      avgCompletion,
      logStats,
      topProcedures,
      students,
    });
  } catch (error) {
    req.log.error(error, "Error fetching department analytics");
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
