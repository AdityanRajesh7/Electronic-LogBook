import { Router, type IRouter } from "express";

const router: IRouter = Router();

const caseLogs = [
  {
    number: 1092,
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
];

const procedureLogs = [
  { number: 1088, date: "2026-07-24", procedureGroup: "emergency", procedureName: "Endotracheal Intubation", patientUhid: "UHID-2026-003944", age: "7 years", experience: "Performed under supervision", facultyVerifiedLevel: "Performed under supervision", status: "verified" },
  { number: 1075, date: "2026-07-20", procedureGroup: "invasive", procedureName: "Lumbar Puncture", patientUhid: "UHID-2026-003771", age: "4 months", experience: "Assisted", facultyVerifiedLevel: "Assisted", status: "revision" },
];

const academicLogs = [
  { number: 1081, date: "2026-07-22", activityType: "Journal Club", presentationType: null, topic: "High-Flow Nasal Cannula versus CPAP in Pediatric Bronchiolitis", guide: "Prof. Dr. Mohammad MTP", status: "verified" },
  { number: 1072, date: "2026-07-16", activityType: "Symposia", presentationType: "Paper", topic: "Approach to Neonatal Cholestasis", guide: "Dr. Radhamani KV", status: "verified" },
  { number: 1065, date: "2026-07-10", activityType: "Conference Presentation", presentationType: "Case presentation", topic: "Nephrotic Syndrome with Anasarca", guide: "Dr. Anilkumar A", status: "pending" },
];

const assessments = [
  { number: 3, assessmentType: "Quarterly", date: "2026-06-30", marks: 78, maximumMarks: 100, assessor: "Prof. Dr. Mohammad MTP", remarks: "Good progress in clinical reasoning." },
  { number: 2, assessmentType: "Quarterly", date: "2026-03-31", marks: 74, maximumMarks: 100, assessor: "Dr. Radhamani KV", remarks: "Satisfactory progress." },
  { number: 1, assessmentType: "Annual", date: "2025-12-20", marks: 71, maximumMarks: 100, assessor: "Dr. Anilkumar A", remarks: "Meets year-one outcomes." },
];

const thesis = {
  topic: "Clinical profile and predictors of severe acute asthma in children admitted to a tertiary-care centre",
  guide: "Prof. Dr. Mohammad MTP",
  coGuide: "Dr. Radhamani KV",
  protocolSubmissionDate: "2025-08-12",
  iecClearanceDate: "2025-10-06",
  dataCollectionStartDate: "2025-11-01",
  dataCollectionEndDate: "2026-10-31",
  submissionDate: "2027-03-15",
};

const leaveRecords = [
  { number: 402, appliedOn: "2026-07-27", fromDate: "2026-08-12", toDate: "2026-08-14", totalDays: 3, leaveType: "Academic Leave", reason: "National Pediatric Pulmonary Conference", status: "pending", approvedBy: "Awaiting HOD" },
  { number: 388, appliedOn: "2026-06-04", fromDate: "2026-06-10", toDate: "2026-06-11", totalDays: 2, leaveType: "Casual Leave", reason: "Personal leave", status: "approved", approvedBy: "Prof. Dr. Mohammad MTP" },
];

router.post("/auth/sign-in", (req, res) => {
  if (!req.body.registrationNumber || !req.body.password) {
    res.status(400).json({ success: false, message: "Registration number and password are required." });
    return;
  }
  res.json({ success: true, requiresPasswordReset: req.body.password !== "Demo@2026", role: "student" });
});

router.get("/dashboard", (_req, res) => {
  res.json({
    student: {
      id: 1,
      name: "Dr. Adithya Nair",
      registrationNumber: "PG2024-PAED-014",
      dateOfJoining: "2024-06-03",
      kuhsId: "KUHS-MD-PED-2024-014",
      specialty: "MD Pediatrics",
      department: "Department of Pediatrics",
      guide: "Prof. Dr. Mohammad MTP",
    },
    categories: [
      { id: "cases", name: "Clinical Cases Presented", logged: 42, required: 50, verified: 38, percentage: 84 },
      { id: "procedures", name: "Required Procedures", logged: 11, required: 15, verified: 9, percentage: 73 },
      { id: "academics", name: "Academic Activities", logged: 18, required: 20, verified: 15, percentage: 90 },
      { id: "assessments", name: "Assessments", logged: 3, required: 4, verified: 3, percentage: 75 },
    ],
    recentLogs: [...caseLogs, ...procedureLogs, ...academicLogs].sort((a, b) => b.number - a.number),
  });
});

router.get("/logs/cases", (_req, res) => res.json({ data: caseLogs }));
router.get("/logs/procedures", (_req, res) => res.json({ data: procedureLogs }));
router.get("/logs/academics", (_req, res) => res.json({ data: academicLogs }));
router.get("/assessments", (_req, res) => res.json({ data: assessments }));
router.get("/thesis", (_req, res) => res.json({ data: thesis }));
router.get("/leave-records", (_req, res) => res.json({ data: leaveRecords }));

router.post("/logs/case", (req, res) => {
  const entry = {
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
  const entry = {
    number: Math.max(...procedureLogs.map((item) => item.number)) + 1,
    date: req.body.date,
    procedureGroup: req.body.procedureGroup,
    procedureName: req.body.procedureName,
    patientUhid: req.body.patientUhid,
    age: req.body.age,
    experience: req.body.experience,
    facultyVerifiedLevel: "Pending guide verification",
    status: "pending",
  };
  procedureLogs.unshift(entry);
  res.status(201).json({ success: true, log: entry });
});

router.post("/logs/academic", (req, res) => {
  const entry = {
    number: Math.max(...academicLogs.map((item) => item.number)) + 1,
    date: req.body.date,
    activityType: req.body.activityType,
    presentationType: req.body.presentationType ?? null,
    topic: req.body.topic,
    guide: req.body.guide,
    status: "pending",
  };
  academicLogs.unshift(entry);
  res.status(201).json({ success: true, log: entry });
});

router.post("/leave-records", (req, res) => {
  const from = new Date(`${req.body.fromDate}T00:00:00Z`).getTime();
  const to = new Date(`${req.body.toDate}T00:00:00Z`).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from || !req.body.leaveType || !req.body.reason) {
    res.status(400).json({ success: false, message: "A valid leave period, leave type and reason are required." });
    return;
  }
  const entry = {
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

export default router;
