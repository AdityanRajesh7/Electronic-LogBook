import { Router, type IRouter } from "express";

const router: IRouter = Router();

const mockDashboardData = {
  student: {
    id: 1,
    name: "Dr. Aarav Sharma",
    registrationNumber: "PG2024-PAED-014",
    specialty: "MD Paediatrics",
    batch: "2024 - 2027",
    department: "Department of Paediatrics",
    mentor: "Prof. Dr. Piyush Gupta",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
  },
  currentPosting: {
    id: 101,
    postingName: "Pediatric Intensive Care Unit (PICU)",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    daysElapsed: 27,
    totalDays: 31,
    inCharge: "Dr. Meenakshi Sundaram",
    status: "active",
  },
  overallShortfallSummary: {
    status: "at_risk",
    atRiskCount: 2,
    behindCount: 1,
    onTrackCount: 3,
    message: "Shortfall detected in Independent Procedures and M&M Meetings relative to NMC PGMER-2023 baseline targets.",
  },
  categories: [
    {
      id: "cases",
      name: "Clinical Case Exposure",
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
      id: "mm_meetings",
      name: "M&M Meetings Attended",
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
      competency: "Assisted",
      facultyRemarks: "Please expand on CSF analysis findings and post-procedure monitoring notes.",
    },
  ],
  attendance: {
    clockedIn: true,
    clockInTime: "08:00 AM",
    attendanceRate: 96.4,
    totalDaysPresent: 26,
    leavesTaken: 1,
    todayStatus: "Present (Duty On)",
  },
};

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
    patientInfo: `${req.body.patientAge || 5} yr / ${req.body.patientGender || "Male"}`,
    detail: req.body.managementPlan || "Submitted for faculty review",
  };
  mockDashboardData.recentLogs.unshift(newLog);
  res.status(201).json({ success: true, log: newLog });
});

router.post("/attendance/clock-in", (_req, res) => {
  mockDashboardData.attendance.clockedIn = true;
  mockDashboardData.attendance.clockInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  res.json({ success: true, attendance: mockDashboardData.attendance });
});

router.post("/attendance/clock-out", (_req, res) => {
  mockDashboardData.attendance.clockedIn = false;
  res.json({ success: true, attendance: mockDashboardData.attendance });
});

export default router;
