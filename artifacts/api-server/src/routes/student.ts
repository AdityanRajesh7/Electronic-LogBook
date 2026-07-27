import { Router, type IRouter } from "express";

const router: IRouter = Router();

const mockDashboardData = {
  student: {
    id: 1,
    name: "Dr. Adithya Nair",
    registrationNumber: "PG2024-PAED-014",
    dateOfJoining: "2024-06-15",
    kuhzId: "KUHZ-MD-PED-2024-014",
    specialty: "MD Paediatrics",
    batch: "2024 - 2027",
    department: "Department of Paediatrics",
    mentor: "Prof. Dr. Mohammad MTP",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
  },
  currentPosting: {
    id: 101,
    postingName: "Pediatric Intensive Care Unit (PICU)",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    daysElapsed: 27,
    totalDays: 31,
    hodOrGuide: "Dr. Meenakshi Sundaram",
    status: "active",
  },
  overallShortfallSummary: {
    status: "at_risk",
    atRiskCount: 2,
    behindCount: 1,
    onTrackCount: 3,
    message: "Shortfall detected in Independent Procedures and Mortality Meetings relative to MCI logbook targets.",
  },
  categories: [
    {
      id: "cases",
      name: "Clinical Cases Presented",
      logged: 42,
      required: 50,
      verified: 38,
      status: "on_track",
      percentage: 84,
      unit: "cases",
    },
    {
      id: "procedures",
      name: "Independent Procedures",
      logged: 9,
      required: 15,
      verified: 7,
      status: "behind",
      percentage: 60,
      unit: "procedures",
    },
    {
      id: "journal_clubs",
      name: "Journal Club Presentations",
      logged: 7,
      required: 8,
      verified: 6,
      status: "on_track",
      percentage: 87,
      unit: "clubs",
    },
    {
      id: "seminars",
      name: "Seminars Presented",
      logged: 5,
      required: 6,
      verified: 5,
      status: "on_track",
      percentage: 83,
      unit: "seminars",
    },
    {
      id: "bedside",
      name: "Bedside Case Presentations",
      logged: 14,
      required: 20,
      verified: 12,
      status: "at_risk",
      percentage: 70,
      unit: "presentations",
    },
    {
      id: "mortality_meetings",
      name: "Mortality Meetings Attended",
      logged: 2,
      required: 4,
      verified: 2,
      status: "at_risk",
      percentage: 50,
      unit: "meetings",
    },
  ],
  recentLogs: [
    {
      id: "LOG-1092",
      type: "Case Log",
      title: "Acute Severe Asthma Exacerbation in a 7yo Child",
      date: "2026-07-26",
      posting: "PICU",
      status: "pending",
      statusLabel: "Pending Faculty Review",
      patientUhid: "UHID-2026-004281",
      patientInfo: "7 yr / Male",
      detail: "Managed with Nebulized Salbutamol + Ipratropium, IV Hydrocortisone, supplemental O2",
    },
    {
      id: "LOG-1088",
      type: "Procedure",
      title: "Endotracheal Intubation (Pediatric)",
      date: "2026-07-24",
      posting: "PICU",
      status: "verified",
      statusLabel: "Faculty Verified",
      patientUhid: "UHID-2026-003944",
      patientInfo: "Age: 7 years",
      competency: "Performed Independently",
      facultyRemarks: "Well performed with standard sterile technique under supervision.",
    },
    {
      id: "LOG-1081",
      type: "Academic",
      title: "Journal Club: High-Flow Nasal Cannula vs CPAP in Pediatric Bronchiolitis",
      date: "2026-07-22",
      posting: "Paediatric Wards",
      status: "verified",
      statusLabel: "Faculty Verified",
      detail: "Critical appraisal of NEJM 2025 RCT study design",
    },
    {
      id: "LOG-1075",
      type: "Procedure",
      title: "Lumbar Puncture (Infant)",
      date: "2026-07-20",
      posting: "Emergency Ward",
      status: "rejected",
      statusLabel: "Needs Revision",
      patientUhid: "UHID-2026-003771",
      patientInfo: "Age: 4 months",
      competency: "Assisted",
      facultyRemarks: "Please expand on CSF analysis findings and post-procedure monitoring notes.",
    },
  ],
  attendance: {
    approvedLeaves: 1,
    pendingLeaves: 1,
    approvedLeaveDays: 2,
  },
};

const mockLeaveRecords = [
  {
    id: "LV-402",
    studentId: 1,
    appliedOn: "2026-07-27",
    fromDate: "2026-08-12",
    toDate: "2026-08-14",
    totalDays: 3,
    leaveType: "Academic Leave",
    reason: "Attending National Paediatric Pulmonary Conference (IAP)",
    status: "pending",
    approvedBy: "Awaiting HOD",
  },
  {
    id: "LV-388",
    studentId: 1,
    appliedOn: "2026-06-04",
    fromDate: "2026-06-10",
    toDate: "2026-06-11",
    totalDays: 2,
    leaveType: "Casual Leave",
    reason: "Personal leave",
    status: "approved",
    approvedBy: "Prof. Dr. Mohammad MTP",
  },
];

router.get("/dashboard", (_req, res) => {
  res.json(mockDashboardData);
});

router.get("/logs/cases", (_req, res) => {
  res.json({
    data: mockDashboardData.recentLogs.filter((l) => l.type === "Case Log"),
  });
});

router.get("/logs/procedures", (_req, res) => {
  res.json({
    data: mockDashboardData.recentLogs.filter((l) => l.type === "Procedure"),
  });
});

router.get("/logs/academics", (_req, res) => {
  res.json({
    data: mockDashboardData.recentLogs.filter((l) => l.type === "Academic"),
  });
});

router.post("/logs/case", (req, res) => {
  const newLog = {
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    type: "Case Log",
    title: req.body.diagnosisProvisional || "New Clinical Case Entry",
    date: new Date().toISOString().split("T")[0],
    posting: "PICU",
    status: "pending",
    statusLabel: "Pending Faculty Review",
    patientUhid: req.body.patientUhid,
    patientInfo: `${req.body.patientAge || 5} yr / ${req.body.patientGender || "Male"}`,
    detail: req.body.managementPlan || "Submitted for faculty review",
  };
  mockDashboardData.recentLogs.unshift(newLog);
  res.status(201).json({ success: true, log: newLog });
});

router.post("/logs/procedure", (req, res) => {
  const newLog = {
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    type: "Procedure",
    title: req.body.procedureName || "New Procedure Entry",
    date: new Date().toISOString().split("T")[0],
    posting: "PICU",
    status: "pending",
    statusLabel: "Pending Faculty Review",
    patientUhid: req.body.patientUhid,
    patientInfo: `Age: ${req.body.patientAge}`,
    competency: req.body.competencyLevel || "Performed Under Supervision",
    facultyRemarks: "Awaiting faculty verification.",
  };
  mockDashboardData.recentLogs.unshift(newLog);
  res.status(201).json({ success: true, log: newLog });
});

router.get("/leave-records", (_req, res) => {
  res.json({ data: mockLeaveRecords });
});

router.post("/leave-records", (req, res) => {
  const from = new Date(`${req.body.fromDate}T00:00:00Z`).getTime();
  const to = new Date(`${req.body.toDate}T00:00:00Z`).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from || !req.body.leaveType || !req.body.reason) {
    res.status(400).json({ success: false, message: "A valid leave period, leave type, and reason are required." });
    return;
  }
  const totalDays = Math.floor((to - from) / 86_400_000) + 1;
  const newLeave = {
    id: `LV-${Math.floor(400 + Math.random() * 500)}`,
    studentId: 1,
    appliedOn: new Date().toISOString().split("T")[0],
    fromDate: req.body.fromDate,
    toDate: req.body.toDate,
    totalDays,
    leaveType: req.body.leaveType,
    reason: req.body.reason,
    status: "pending",
    approvedBy: "Awaiting HOD",
  };
  mockLeaveRecords.unshift(newLeave);
  res.status(201).json({ success: true, leave: newLeave });
});

export default router;
