import { Router, type IRouter } from "express";
import { 
  db, studentsTable, caseLogsTable, procedureLogsTable, 
  academicLogsTable, usersTable, departmentsTable,
  postingsTable, leaveTable, appraisalsTable, researchTable
} from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";

const router: IRouter = Router();

// Static Requirements Data
const procedureRequirements = [
  { name: "Endotracheal Intubation", required: 15, group: "emergency" },
  { name: "Lumbar Puncture", required: 20, group: "invasive" },
  { name: "ICD Insertion", required: 5, group: "emergency" },
  { name: "Bone Marrow Aspiration", required: 3, group: "invasive" },
  { name: "Central Venous Line Insertion", required: 3, group: "invasive" },
  { name: "Peritoneal Dialysis", required: 2, group: "invasive" },
  { name: "Umbilical Venous Catheterisation", required: 20, group: "invasive" },
  { name: "Arterial Blood Gas", required: 3, group: "emergency" },
  { name: "Mechanical Ventilation Setup", required: 20, group: "emergency" },
  { name: "CPAP / HFNC", required: 10, group: "emergency" },
];

const academicRequirements = [
  { name: "Case Discussion", required: 50, period: "total" },
  { name: "Journal Club", required: 2, period: "month" },
  { name: "Seminar", required: 2, period: "month" },
  { name: "Interesting Case Presentation", required: 1, period: "month" },
];

router.get("/requirements", (_req, res) => res.json({ procedureRequirements, academicRequirements }));

// Helper for validating supervisor
async function validateSupervisor(supervisorId: number) {
  if (isNaN(supervisorId)) return false;
  const supervisorMatch = await db.select().from(usersTable).where(eq(usersTable.id, supervisorId)).limit(1);
  return supervisorMatch.length > 0 && ["professor", "hod"].includes(supervisorMatch[0].role);
}

// ---------------------------------------------------------
// NEW REAL DATABASE ROUTES
// ---------------------------------------------------------

router.get("/:studentId/dashboard", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (isNaN(studentId)) res.status(400).json({ message: "Invalid studentId" }); return;

    const studentMatch = await db.select({
      id: studentsTable.id,
      name: usersTable.fullName,
      registrationNumber: studentsTable.registrationNumber,
      dateOfJoining: studentsTable.dateOfJoining,
      batch: studentsTable.batch,
      department: departmentsTable.name,
    })
    .from(studentsTable)
    .innerJoin(usersTable, eq(studentsTable.userId, usersTable.id))
    .leftJoin(departmentsTable, eq(usersTable.departmentId, departmentsTable.id))
    .where(eq(studentsTable.id, studentId))
    .limit(1);

    if (studentMatch.length === 0) res.status(404).json({ message: "Student not found" }); return;
    const student = studentMatch[0];

    // Counts
    const caseLogsCounts = await db.select({ status: caseLogsTable.status, count: count() }).from(caseLogsTable).where(eq(caseLogsTable.studentId, studentId)).groupBy(caseLogsTable.status);
    const procLogsCounts = await db.select({ status: procedureLogsTable.status, count: count() }).from(procedureLogsTable).where(eq(procedureLogsTable.studentId, studentId)).groupBy(procedureLogsTable.status);
    const acadLogsCounts = await db.select({ status: academicLogsTable.status, count: count() }).from(academicLogsTable).where(eq(academicLogsTable.studentId, studentId)).groupBy(academicLogsTable.status);

    const calcCounts = (counts: any[]) => ({
      verified: counts.find(c => c.status === "verified")?.count || 0,
      total: counts.reduce((acc, c) => acc + Number(c.count), 0)
    });

    const cases = calcCounts(caseLogsCounts);
    const procs = calcCounts(procLogsCounts);
    const acads = calcCounts(acadLogsCounts);

    // Recent Logs (simplified for dashboard)
    const recentCases = await db.select().from(caseLogsTable).where(eq(caseLogsTable.studentId, studentId)).orderBy(desc(caseLogsTable.createdAt)).limit(1);
    const recentProcs = await db.select().from(procedureLogsTable).where(eq(procedureLogsTable.studentId, studentId)).orderBy(desc(procedureLogsTable.createdAt)).limit(1);
    
    res.json({
      student: {
        id: student.id,
        name: student.name,
        registrationNumber: student.registrationNumber,
        dateOfJoining: student.dateOfJoining,
        joiningYear: student.batch,
        department: student.department || "Unassigned",
      },
      categories: [
        { id: "cases", name: "Clinical Cases Presented", logged: cases.total, required: 50, verified: cases.verified, percentage: Math.min(100, Math.round((cases.verified / 50) * 100)) },
        { id: "procedures", name: "Required Procedures", logged: procs.total, required: 101, verified: procs.verified, percentage: Math.min(100, Math.round((procs.verified / 101) * 100)) },
        { id: "academics", name: "Case Discussions", logged: acads.total, required: 50, verified: acads.verified, percentage: Math.min(100, Math.round((acads.verified / 50) * 100)) },
      ],
      recentLogs: [...recentCases, ...recentProcs]
    });
  } catch (error) {
    req.log.error(error, "Error fetching dashboard");
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logs (Cases, Procedures, Academics) are fetched in one go by the frontend using /:studentId/logs
router.get("/:studentId/logs", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (isNaN(studentId)) res.status(400).json({ message: "Invalid studentId format" }); return;

    // Fetch profile
    const studentMatch = await db.select({
      id: studentsTable.id,
      registrationNumber: studentsTable.registrationNumber,
      dateOfJoining: studentsTable.dateOfJoining,
      batch: studentsTable.batch,
      department: departmentsTable.name,
    })
    .from(studentsTable)
    .innerJoin(usersTable, eq(studentsTable.userId, usersTable.id))
    .leftJoin(departmentsTable, eq(usersTable.departmentId, departmentsTable.id))
    .where(eq(studentsTable.id, studentId))
    .limit(1);

    if (studentMatch.length === 0) res.status(404).json({ message: "Student not found" }); return;

    const [caseLogsRaw, procedureLogsRaw, academicLogsRaw] = await Promise.all([
      db.select({ log: caseLogsTable, supervisorName: usersTable.fullName })
        .from(caseLogsTable).leftJoin(usersTable, eq(caseLogsTable.supervisorId, usersTable.id))
        .where(eq(caseLogsTable.studentId, studentId)).orderBy(desc(caseLogsTable.createdAt)),
      db.select({ log: procedureLogsTable, supervisorName: usersTable.fullName })
        .from(procedureLogsTable).leftJoin(usersTable, eq(procedureLogsTable.supervisorId, usersTable.id))
        .where(eq(procedureLogsTable.studentId, studentId)).orderBy(desc(procedureLogsTable.createdAt)),
      db.select({ log: academicLogsTable, supervisorName: usersTable.fullName })
        .from(academicLogsTable).leftJoin(usersTable, eq(academicLogsTable.supervisorId, usersTable.id))
        .where(eq(academicLogsTable.studentId, studentId)).orderBy(desc(academicLogsTable.createdAt)),
    ]);

    res.json({
      profile: {
        department: studentMatch[0].department || "Unassigned",
        registrationNumber: studentMatch[0].registrationNumber,
        dateOfJoining: studentMatch[0].dateOfJoining,
        joiningYear: studentMatch[0].batch,
      },
      caseLogs: caseLogsRaw.map(r => ({ ...r.log, supervisorName: r.supervisorName })),
      procedureLogs: procedureLogsRaw.map(r => ({ ...r.log, supervisorName: r.supervisorName })),
      academicLogs: academicLogsRaw.map(r => ({ ...r.log, supervisorName: r.supervisorName })),
    });
  } catch (error) {
    req.log.error(error, "Error fetching student logs");
    res.status(500).json({ message: "Internal server error" });
  }
});

// Postings
router.get("/:studentId/postings", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    const data = await db.select().from(postingsTable).where(eq(postingsTable.studentId, studentId)).orderBy(desc(postingsTable.createdAt));
    res.json({ options: ["Ward Posting U1", "Ward Posting U2", "PICU", "NICU", "DRP"], data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/:studentId/postings", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    const { postingName, startDate, endDate } = req.body;
    const start = new Date(`${startDate}T00:00:00Z`).getTime();
    const end = new Date(`${endDate}T00:00:00Z`).getTime();
    const durationDays = Math.floor((end - start) / 86_400_000);
    
    const [inserted] = await db.insert(postingsTable).values({
      studentId,
      postingName,
      startDate,
      endDate,
      durationDays,
      hodOrGuide: "Assigned Guide",
      status: "active"
    }).returning();
    res.status(201).json({ success: true, posting: inserted });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Leave Records
router.get("/:studentId/leave-records", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    const data = await db.select().from(leaveTable).where(eq(leaveTable.studentId, studentId)).orderBy(desc(leaveTable.createdAt));
    res.json({ data: data.map(d => ({ ...d, number: d.id })) }); // Map id to number for frontend compat
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/:studentId/leave-records", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    const { fromDate, toDate, leaveType, reason } = req.body;
    const start = new Date(`${fromDate}T00:00:00Z`).getTime();
    const end = new Date(`${toDate}T00:00:00Z`).getTime();
    const totalDays = Math.floor((end - start) / 86_400_000) + 1;
    
    // Convert to native JS Date for timestamp mapping
    const fromDateObj = new Date(`${fromDate}T00:00:00Z`);
    const toDateObj = new Date(`${toDate}T00:00:00Z`);

    // Only map known leaveTypes to avoid enum error
    const type = ["casual", "academic", "medical"].includes(leaveType.toLowerCase()) ? leaveType.toLowerCase() : "other";

    const [inserted] = await db.insert(leaveTable).values({
      studentId,
      fromDate: fromDateObj,
      toDate: toDateObj,
      totalDays,
      leaveType: type,
      reason,
      status: "pending"
    }).returning();
    res.status(201).json({ success: true, leave: { ...inserted, number: inserted.id } });
  } catch (error) {
    req.log.error(error, "Leave POST error");
    res.status(500).json({ message: "Internal server error" });
  }
});

// Assessments and Thesis (Return empty for now or map to DB if available)
router.get("/:studentId/assessments", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    const data = await db.select().from(appraisalsTable).where(eq(appraisalsTable.studentId, studentId)).orderBy(desc(appraisalsTable.createdAt));
    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:studentId/thesis", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    const match = await db.select().from(researchTable).where(eq(researchTable.studentId, studentId)).limit(1);
    res.json({ data: match.length > 0 ? match[0] : null });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});


// ---------------------------------------------------------
// POST LOGS (Existing DB endpoints preserved)
// ---------------------------------------------------------

router.post("/:studentId/case-logs", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    const { supervisorId, date, patientUhid, patientAge, patientGender, chiefComplaints, diagnosisProvisional, learningPoints } = req.body;
    const supervisorIdNum = parseInt(supervisorId, 10);
    if (!(await validateSupervisor(supervisorIdNum))) res.status(400).json({ message: "Invalid supervisorId" }); return;
    
    const [inserted] = await db.insert(caseLogsTable).values({
      studentId, supervisorId: supervisorIdNum, date, patientUhid, patientAge, patientGender, chiefComplaints, 
      diagnosisProvisional, diagnosisFinal: req.body.diagnosisFinal, history: req.body.history, 
      examination: req.body.examination, investigations: req.body.investigations, 
      differentialDiagnosis: req.body.differentialDiagnosis, managementPlan: req.body.managementPlan, 
      outcome: req.body.outcome, learningPoints, status: "pending"
    }).returning();
    res.status(201).json(inserted);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/:studentId/procedure-logs", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    const { supervisorId, procedureGroup, procedureName, date, patientUhid, patientAge, competencyLevel } = req.body;
    const supervisorIdNum = parseInt(supervisorId, 10);
    if (!(await validateSupervisor(supervisorIdNum))) res.status(400).json({ message: "Invalid supervisorId" }); return;

    const [inserted] = await db.insert(procedureLogsTable).values({
      studentId, supervisorId: supervisorIdNum, procedureGroup, procedureName, date, 
      patientUhid, patientAge, competencyLevel, status: "pending"
    }).returning();
    res.status(201).json(inserted);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/:studentId/academic-logs", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    const { supervisorId, activityType, topic, date } = req.body;
    const supervisorIdNum = parseInt(supervisorId, 10);
    if (!(await validateSupervisor(supervisorIdNum))) res.status(400).json({ message: "Invalid supervisorId" }); return;

    const [inserted] = await db.insert(academicLogsTable).values({
      studentId, supervisorId: supervisorIdNum, activityType, presentationType: req.body.presentationType, 
      topic, date, presenter: req.body.presenter, status: "pending"
    }).returning();
    res.status(201).json(inserted);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
