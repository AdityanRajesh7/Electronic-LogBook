import { Router, type IRouter } from "express";
import { db, studentsTable, caseLogsTable, procedureLogsTable, academicLogsTable, usersTable, departmentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const departments = ["Pediatrics", "General Medicine", "General Surgery", "Obstetrics & Gynecology", "Orthopedics", "Radiodiagnosis"];
const postingChiefs: Record<string, string> = {
  "Ward Posting U1": "Dr. Mohamad",
  "Ward Posting U2": "Dr. Mohamad",
  PICU: "Dr. Mohammed",
  NICU: "Dr. Urmila",
  DRP: "Dr. Mohamad",
};
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

type CaseLog = {
  number: number;
  date: string;
  patientUhid: string;
  age: string;
  gender: string;
  chiefComplaints: string;
  history: string;
  examination: string;
  investigations: string;
  diagnosis: string;
  differentialDiagnosis: string;
  management: string;
  outcome: string;
  learningPoints: string;
  status: string;
};

const caseLogs: CaseLog[] = [
  {
    number: 3,
    date: "2026-07-26",
    patientUhid: "UHID-2026-004281",
    age: "7 years",
    gender: "Male",
    chiefComplaints: "Breathlessness and wheeze for 8 hours.",
    history: "Known asthma with controller non-adherence for one week.",
    examination: "RR 42/min, SpO₂ 89% on room air, intercostal retractions and diffuse expiratory wheeze.",
    investigations: "PEFR 35% predicted; chest radiograph showed hyperinflation.",
    diagnosis: "Acute Severe Asthma Exacerbation",
    differentialDiagnosis: "Foreign-body aspiration; bronchopneumonia.",
    management: "Oxygen, nebulized salbutamol–ipratropium, IV hydrocortisone and magnesium sulphate.",
    outcome: "Respiratory distress settled and child transferred to the ward.",
    learningPoints: "Applied severity classification and documented serial response.",
    status: "pending",
  },
  {
    number: 2,
    date: "2026-07-23",
    patientUhid: "UHID-2026-004097",
    age: "3 years",
    gender: "Female",
    chiefComplaints: "High fever for five days and reduced urine output.",
    history: "Reduced oral intake with no previous major illness.",
    examination: "Cold extremities, delayed capillary refill and tender hepatomegaly.",
    investigations: "Rising haematocrit, platelet count 42,000/mm³ and positive dengue NS1.",
    diagnosis: "Severe Dengue with Plasma Leakage",
    differentialDiagnosis: "Septic shock; enteric fever.",
    management: "Judicious IV crystalloid with serial perfusion, haematocrit and urine-output monitoring.",
    outcome: "Haemodynamically stable after 24 hours.",
    learningPoints: "Used dynamic clinical endpoints to guide fluids.",
    status: "verified",
  },
  {
    number: 1,
    date: "2026-07-19",
    patientUhid: "UHID-2026-003812",
    age: "10 months",
    gender: "Male",
    chiefComplaints: "Loose stools and vomiting for two days.",
    history: "Eight watery stools, three episodes of vomiting and no blood in stool.",
    examination: "Irritable, thirsty, sunken eyes and reduced skin turgor.",
    investigations: "Serum electrolytes within normal limits.",
    diagnosis: "Acute Gastroenteritis with Some Dehydration",
    differentialDiagnosis: "Urinary tract infection; surgical abdomen.",
    management: "ORS Plan B, zinc supplementation and continued breastfeeding.",
    outcome: "Hydration restored and discharged with danger-sign counselling.",
    learningPoints: "Classified dehydration clinically and demonstrated ORS preparation.",
    status: "verified",
  },
];

type ProcedureLog = {
  number: number;
  date: string;
  procedureGroup: string;
  procedureName: string;
  patientUhid: string;
  age: string;
  experience: string;
  facultyVerifiedLevel: string;
  status: string;
};

const procedureNames = [
  ["Endotracheal Intubation", "emergency"],
  ["Lumbar Puncture", "invasive"],
  ["ICD Insertion", "emergency"],
  ["Bone Marrow Aspiration", "invasive"],
  ["Central Venous Line Insertion", "invasive"],
  ["Peritoneal Dialysis", "invasive"],
  ["Umbilical Venous Catheterisation", "invasive"],
  ["Arterial Blood Gas", "emergency"],
  ["Mechanical Ventilation Setup", "emergency"],
  ["CPAP / HFNC", "emergency"],
  ["Endotracheal Intubation", "emergency"],
] as const;

const procedureLogs: ProcedureLog[] = procedureNames.map(([procedureName, procedureGroup], index) => ({
  number: index + 1,
  date: `2026-07-${String(index + 10).padStart(2, "0")}`,
  procedureGroup,
  procedureName,
  patientUhid: `UHID-2026-${String(3900 + index).padStart(6, "0")}`,
  age: index % 2 === 0 ? "7 years" : "4 months",
  experience: "Performed under supervision",
  facultyVerifiedLevel: "Performed under supervision",
  status: "verified",
})).reverse();

type AcademicLog = {
  number: number;
  date: string;
  activityType: string;
  presentationType: string | null;
  topic: string;
  professor: string;
  status: string;
};

const academicLogs: AcademicLog[] = [
  { number: 4, date: "2026-07-26", activityType: "Case Discussion", presentationType: null, topic: "Acute Severe Asthma Exacerbation", professor: "Dr. Mohammed", status: "verified" },
  { number: 3, date: "2026-07-22", activityType: "Journal Club", presentationType: null, topic: "High-Flow Nasal Cannula versus CPAP", professor: "Dr. Mohammed", status: "verified" },
  { number: 2, date: "2026-07-16", activityType: "Seminar", presentationType: null, topic: "Approach to Pediatric Shock", professor: "Dr. Mohamad", status: "verified" },
  { number: 1, date: "2026-07-04", activityType: "Interesting Case Presentation", presentationType: null, topic: "Recurrent Hypoglycaemia in Infancy", professor: "Dr. Urmila", status: "verified" },
];

type Posting = {
  number: number;
  postingName: string;
  startDate: string;
  endDate: string;
  chief: string;
  status: string;
};

const postings: Posting[] = [
  { number: 1, postingName: "Ward Posting U1", startDate: "2026-03-01", endDate: "2026-04-30", chief: "Dr. Mohamad", status: "completed" },
  { number: 2, postingName: "NICU", startDate: "2026-05-01", endDate: "2026-06-30", chief: "Dr. Urmila", status: "completed" },
  { number: 3, postingName: "PICU", startDate: "2026-07-01", endDate: "2026-07-31", chief: "Dr. Mohammed", status: "submitted" },
];

const assessments = [
  { number: 3, assessmentType: "Quarterly", date: "2026-06-30", marks: 78, maximumMarks: 100, assessor: "Dr. Mohamad", remarks: "Good progress in clinical reasoning." },
  { number: 2, assessmentType: "Quarterly", date: "2026-03-31", marks: 74, maximumMarks: 100, assessor: "Dr. Mohammed", remarks: "Satisfactory progress." },
  { number: 1, assessmentType: "Annual", date: "2025-12-20", marks: 71, maximumMarks: 100, assessor: "Dr. Urmila", remarks: "Meets year-one outcomes." },
];

const thesis = {
  topic: "Clinical profile and predictors of severe acute asthma in children admitted to a tertiary-care centre",
  guide: "Dr. Mohamad",
  coGuide: "Dr. Mohammed",
  protocolSubmissionDate: "2025-08-12",
  iecClearanceDate: "2025-10-06",
  dataCollectionStartDate: "2025-11-01",
  dataCollectionEndDate: "2026-10-31",
  submissionDate: "2027-03-15",
};

type LeaveRecord = {
  number: number;
  appliedOn: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  leaveType: string;
  reason: string;
  status: string;
  approvedBy: string;
};

const leaveRecords: LeaveRecord[] = [
  { number: 2, appliedOn: "2026-07-27", fromDate: "2026-08-12", toDate: "2026-08-14", totalDays: 3, leaveType: "Academic Leave", reason: "National Pediatric Pulmonary Conference", status: "pending", approvedBy: "Awaiting HOD" },
  { number: 1, appliedOn: "2026-06-04", fromDate: "2026-06-10", toDate: "2026-06-11", totalDays: 2, leaveType: "Casual Leave", reason: "Personal leave", status: "approved", approvedBy: "Dr. Mohamad" },
];

function expectedCompletion(dateOfJoining: string) {
  const date = new Date(`${dateOfJoining}T00:00:00Z`);
  date.setUTCFullYear(date.getUTCFullYear() + 3);
  return date.toISOString().slice(0, 10);
}

router.post("/register", (req, res) => {
  const { fullName, email, department, registrationNumber, joiningDate, password, paymentMethod } = req.body;
  if (!fullName || !email || !departments.includes(department) || !registrationNumber || !joiningDate || !password || !paymentMethod) {
    res.status(400).json({ success: false, message: "Complete student, course, password and payment details are required." });
    return;
  }
  const parsedDate = new Date(`${joiningDate}T00:00:00Z`);
  if (Number.isNaN(parsedDate.getTime())) {
    res.status(400).json({ success: false, message: "A valid joining day, month and year are required." });
    return;
  }
  res.status(201).json({
    success: true,
    student: {
      fullName,
      email,
      department,
      registrationNumber,
      joiningDate,
      joiningYear: parsedDate.getUTCFullYear(),
      expectedCompletionDate: expectedCompletion(joiningDate),
      paymentStatus: "paid",
      paymentReference: `PAY-${Date.now()}`,
      registrationStatus: "pending_verification",
    },
  });
});

router.post("/auth/sign-in", (req, res) => {
  if (!req.body.registrationNumber || !req.body.password) {
    res.status(400).json({ success: false, message: "Registration number and password are required." });
    return;
  }
  res.json({ success: true, role: "student" });
});

router.get("/dashboard", (_req, res) => {
  res.json({
    student: {
      id: 1,
      name: "Dr. Anilkumar A",
      registrationNumber: "PG2024-PAED-014",
      dateOfJoining: "2024-06-03",
      joiningYear: 2024,
      expectedCompletionDate: "2027-06-03",
      paymentStatus: "paid",
      registrationStatus: "active",
      specialty: "MD Pediatrics",
      department: "Department of Pediatrics",
    },
    categories: [
      { id: "cases", name: "Clinical Cases Presented", logged: 42, required: 50, verified: 38, percentage: 84 },
      { id: "procedures", name: "Required Procedures", logged: 11, required: 101, verified: 10, percentage: 11 },
      { id: "academics", name: "Case Discussions", logged: 18, required: 50, verified: 15, percentage: 36 },
      { id: "assessments", name: "Assessments", logged: 3, required: 4, verified: 3, percentage: 75 },
    ],
    recentLogs: [caseLogs[0], procedureLogs[0], academicLogs[0]],
  });
});

router.get("/requirements", (_req, res) => res.json({ procedureRequirements, academicRequirements }));
router.get("/logs/cases", (_req, res) => res.json({ data: caseLogs }));
router.get("/logs/procedures", (_req, res) => res.json({ data: procedureLogs }));
router.get("/logs/academics", (_req, res) => res.json({ data: academicLogs }));
router.get("/postings", (_req, res) => res.json({ options: Object.keys(postingChiefs), data: postings }));
router.get("/assessments", (_req, res) => res.json({ data: assessments }));
router.get("/thesis", (_req, res) => res.json({ data: thesis }));
router.get("/leave-records", (_req, res) => res.json({ data: leaveRecords }));

router.post("/logs/case", (req, res) => {
  const entry: CaseLog = {
    number: Math.max(...caseLogs.map((item) => item.number)) + 1,
    date: req.body.date,
    patientUhid: req.body.patientUhid,
    age: req.body.age,
    gender: req.body.gender,
    chiefComplaints: req.body.chiefComplaints,
    history: req.body.history,
    examination: req.body.examination,
    investigations: req.body.investigations,
    diagnosis: req.body.diagnosis,
    differentialDiagnosis: req.body.differentialDiagnosis,
    management: req.body.management,
    outcome: req.body.outcome,
    learningPoints: req.body.learningPoints,
    status: "pending",
  };
  caseLogs.unshift(entry);
  res.status(201).json({ success: true, log: entry });
});

router.post("/logs/procedure", (req, res) => {
  const requirement = procedureRequirements.find((item) => item.name === req.body.procedureName);
  if (!requirement || requirement.group !== req.body.procedureGroup || !req.body.patientUhid) {
    res.status(400).json({ success: false, message: "Select a valid required procedure and include patient UHID." });
    return;
  }
  const entry: ProcedureLog = {
    number: Math.max(...procedureLogs.map((item) => item.number)) + 1,
    date: req.body.date,
    procedureGroup: req.body.procedureGroup,
    procedureName: req.body.procedureName,
    patientUhid: req.body.patientUhid,
    age: req.body.age,
    experience: req.body.experience,
    facultyVerifiedLevel: "Pending professor verification",
    status: "pending",
  };
  procedureLogs.unshift(entry);
  res.status(201).json({ success: true, log: entry });
});

router.post("/logs/academic", (req, res) => {
  const entry: AcademicLog = {
    number: Math.max(...academicLogs.map((item) => item.number)) + 1,
    date: req.body.date,
    activityType: req.body.activityType,
    presentationType: req.body.presentationType ?? null,
    topic: req.body.topic,
    professor: req.body.professor,
    status: "pending",
  };
  academicLogs.unshift(entry);
  res.status(201).json({ success: true, log: entry });
});

router.post("/postings", (req, res) => {
  const chief = postingChiefs[req.body.postingName];
  const start = new Date(`${req.body.startDate}T00:00:00Z`).getTime();
  const end = new Date(`${req.body.endDate}T00:00:00Z`).getTime();
  if (!chief || !Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    res.status(400).json({ success: false, message: "Select a valid posting and start/end dates." });
    return;
  }
  const entry: Posting = {
    number: Math.max(...postings.map((item) => item.number)) + 1,
    postingName: req.body.postingName,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    chief,
    status: "submitted",
  };
  postings.push(entry);
  res.status(201).json({ success: true, posting: entry });
});

router.post("/leave-records", (req, res) => {
  const from = new Date(`${req.body.fromDate}T00:00:00Z`).getTime();
  const to = new Date(`${req.body.toDate}T00:00:00Z`).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from || !req.body.leaveType || !req.body.reason) {
    res.status(400).json({ success: false, message: "A valid leave period, leave type and reason are required." });
    return;
  }
  const entry: LeaveRecord = {
    number: Math.max(...leaveRecords.map((item) => item.number)) + 1,
    appliedOn: new Date().toISOString().slice(0, 10),
    fromDate: req.body.fromDate,
    toDate: req.body.toDate,
    totalDays: Math.floor((to - from) / 86_400_000) + 1,
    leaveType: req.body.leaveType,
    reason: req.body.reason,
    status: "pending",
    approvedBy: "Awaiting HOD",
  };
  leaveRecords.unshift(entry);
  res.status(201).json({ success: true, leave: entry });
});

router.get("/:studentId/logs", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (isNaN(studentId)) {
      res.status(400).json({ message: "Invalid studentId format" });
      return;
    }

    // Verify student exists
    const studentMatch = await db
      .select()
      .from(studentsTable)
      .where(eq(studentsTable.id, studentId))
      .limit(1);

    if (studentMatch.length === 0) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    const studentRow = studentMatch[0];

    // Fetch user and department for profile
    const userMatch = await db
      .select({
        departmentName: departmentsTable.name,
      })
      .from(usersTable)
      .leftJoin(departmentsTable, eq(usersTable.departmentId, departmentsTable.id))
      .where(eq(usersTable.id, studentRow.userId))
      .limit(1);

    const departmentName = userMatch.length > 0 && userMatch[0].departmentName ? userMatch[0].departmentName : "Department Unassigned";

    // Query logs with supervisor name join
    const [caseLogsRaw, procedureLogsRaw, academicLogsRaw] = await Promise.all([
      db.select({
        log: caseLogsTable,
        supervisorName: usersTable.fullName,
      })
      .from(caseLogsTable)
      .leftJoin(usersTable, eq(caseLogsTable.supervisorId, usersTable.id))
      .where(eq(caseLogsTable.studentId, studentId)),

      db.select({
        log: procedureLogsTable,
        supervisorName: usersTable.fullName,
      })
      .from(procedureLogsTable)
      .leftJoin(usersTable, eq(procedureLogsTable.supervisorId, usersTable.id))
      .where(eq(procedureLogsTable.studentId, studentId)),

      db.select({
        log: academicLogsTable,
        supervisorName: usersTable.fullName,
      })
      .from(academicLogsTable)
      .leftJoin(usersTable, eq(academicLogsTable.supervisorId, usersTable.id))
      .where(eq(academicLogsTable.studentId, studentId)),
    ]);

    res.json({
      profile: {
        department: departmentName,
        registrationNumber: studentRow.registrationNumber,
        dateOfJoining: studentRow.dateOfJoining,
        joiningYear: studentRow.batch, // using batch as joining year proxy for now
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

// Helper for validating supervisor
async function validateSupervisor(supervisorId: number) {
  if (isNaN(supervisorId)) return false;
  const supervisorMatch = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, supervisorId))
    .limit(1);
  return supervisorMatch.length > 0 && ["professor", "hod"].includes(supervisorMatch[0].role);
}

// POST /:studentId/case-logs
router.post("/:studentId/case-logs", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (isNaN(studentId)) {
      res.status(400).json({ message: "Invalid studentId format" });
      return;
    }
    const studentMatch = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId)).limit(1);
    if (studentMatch.length === 0) {
      res.status(404).json({ message: "Student not found" });
      return;
    }
    const { supervisorId, date, patientUhid, patientAge, patientGender, chiefComplaints, diagnosisProvisional, learningPoints } = req.body;
    if (!supervisorId || !date || !patientUhid || !patientAge || !patientGender || !chiefComplaints || !diagnosisProvisional || !learningPoints) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    const supervisorIdNum = parseInt(supervisorId, 10);
    if (!(await validateSupervisor(supervisorIdNum))) {
      res.status(400).json({ message: "Invalid supervisorId or user is not a professor/hod" });
      return;
    }
    
    const [inserted] = await db.insert(caseLogsTable).values({
      studentId,
      supervisorId: supervisorIdNum,
      date,
      patientUhid,
      patientAge,
      patientGender,
      chiefComplaints,
      diagnosisProvisional,
      diagnosisFinal: req.body.diagnosisFinal,
      history: req.body.history,
      examination: req.body.examination,
      investigations: req.body.investigations,
      differentialDiagnosis: req.body.differentialDiagnosis,
      managementPlan: req.body.managementPlan,
      outcome: req.body.outcome,
      learningPoints,
      status: "pending"
    }).returning();
    
    res.status(201).json(inserted);
  } catch (error) {
    req.log.error(error, "Error creating case log");
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /:studentId/procedure-logs
router.post("/:studentId/procedure-logs", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (isNaN(studentId)) {
      res.status(400).json({ message: "Invalid studentId format" });
      return;
    }
    const studentMatch = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId)).limit(1);
    if (studentMatch.length === 0) {
      res.status(404).json({ message: "Student not found" });
      return;
    }
    const { supervisorId, procedureGroup, procedureName, date, patientUhid, patientAge, competencyLevel } = req.body;
    if (!supervisorId || !procedureGroup || !procedureName || !date || !patientUhid || !patientAge || !competencyLevel) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    const supervisorIdNum = parseInt(supervisorId, 10);
    if (!(await validateSupervisor(supervisorIdNum))) {
      res.status(400).json({ message: "Invalid supervisorId or user is not a professor/hod" });
      return;
    }

    const [inserted] = await db.insert(procedureLogsTable).values({
      studentId,
      supervisorId: supervisorIdNum,
      procedureGroup,
      procedureName,
      date,
      patientUhid,
      patientAge,
      competencyLevel,
      status: "pending"
    }).returning();
    
    res.status(201).json(inserted);
  } catch (error) {
    req.log.error(error, "Error creating procedure log");
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /:studentId/academic-logs
router.post("/:studentId/academic-logs", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (isNaN(studentId)) {
      res.status(400).json({ message: "Invalid studentId format" });
      return;
    }
    const studentMatch = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId)).limit(1);
    if (studentMatch.length === 0) {
      res.status(404).json({ message: "Student not found" });
      return;
    }
    const { supervisorId, activityType, topic, date } = req.body;
    if (!supervisorId || !activityType || !topic || !date) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    const supervisorIdNum = parseInt(supervisorId, 10);
    if (!(await validateSupervisor(supervisorIdNum))) {
      res.status(400).json({ message: "Invalid supervisorId or user is not a professor/hod" });
      return;
    }

    const [inserted] = await db.insert(academicLogsTable).values({
      studentId,
      supervisorId: supervisorIdNum,
      activityType,
      presentationType: req.body.presentationType,
      topic,
      date,
      presenter: req.body.presenter,
      status: "pending"
    }).returning();
    
    res.status(201).json(inserted);
  } catch (error) {
    req.log.error(error, "Error creating academic log");
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
