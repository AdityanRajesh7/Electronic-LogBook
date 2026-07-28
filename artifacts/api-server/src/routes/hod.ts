import { Router, type IRouter } from "express";

const router: IRouter = Router();

const studentAccounts = [
  { number: 14, name: "Dr. Adithya Nair", registrationNumber: "PG2024-PAED-014", kuhsId: "KUHS-MD-PED-2024-014", dateOfJoining: "2024-06-03", guide: "Prof. Dr. Mohammad MTP", accessStatus: "active" },
  { number: 18, name: "Dr. Anilkumar A", registrationNumber: "PG2024-PAED-018", kuhsId: "KUHS-MD-PED-2024-018", dateOfJoining: "2024-06-03", guide: "Dr. Radhamani KV", accessStatus: "active" },
];

const mockHODData = {
  department: {
    name: "Department of Pediatrics",
    hod: "Dr. Radhamani KV",
    totalResidents: 18,
    facultyCount: 3,
    onTrackCount: 11,
    atRiskCount: 5,
    behindCount: 2,
    inspectionReadiness: "84%",
  },
  residentsGapOverview: [
    { id: 1, name: "Dr. Adithya Nair", registrationNumber: "PG2024-PAED-014", guide: "Prof. Dr. Mohammad MTP", casesCompleted: 42, casesRequired: 50, proceduresCompleted: 11, proceduresRequired: 15, shortfallSeverity: "at_risk", shortfallNote: "Four required procedures remain." },
    { id: 2, name: "Dr. Anilkumar A", registrationNumber: "PG2024-PAED-018", guide: "Dr. Radhamani KV", casesCompleted: 46, casesRequired: 50, proceduresCompleted: 14, proceduresRequired: 15, shortfallSeverity: "on_track", shortfallNote: "Requirements are on schedule." },
  ],
  pendingLeaves: [
    { number: 402, residentId: 1, residentName: "Dr. Adithya Nair", fromDate: "2026-08-12", toDate: "2026-08-14", totalDays: 3, type: "Academic Leave", reason: "National Pediatric Pulmonary Conference", status: "pending" },
    { number: 407, residentId: 2, residentName: "Dr. Anilkumar A", fromDate: "2026-08-22", toDate: "2026-08-22", totalDays: 1, type: "Casual Leave", reason: "Personal appointment", status: "pending" },
  ],
  studentAccounts,
};

router.get("/dashboard", (_req, res) => res.json(mockHODData));

router.post("/students", (req, res) => {
  const student = {
    number: Math.max(...studentAccounts.map((item) => item.number)) + 1,
    name: req.body.name,
    registrationNumber: req.body.registrationNumber,
    kuhsId: req.body.kuhsId,
    dateOfJoining: req.body.dateOfJoining,
    guide: req.body.guide,
    accessStatus: "invite_issued",
  };
  studentAccounts.unshift(student);
  res.status(201).json({
    success: true,
    student,
    temporaryPasswordIssued: true,
    requiresPasswordReset: true,
  });
});

router.post("/leave/action", (req, res) => {
  const targetNumber = Number(req.body.number ?? req.body.leaveId);
  mockHODData.pendingLeaves = mockHODData.pendingLeaves.filter((leave) => leave.number !== targetNumber);
  res.json({ success: true, message: `Leave number ${targetNumber} ${req.body.action}` });
});

export default router;
