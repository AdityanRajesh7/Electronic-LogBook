import { Router, type IRouter } from "express";

const router: IRouter = Router();

type Review = {
  id: number;
  studentId: number;
  studentName: string;
  department: string;
  type: string;
  title: string;
  date: string;
  detail: string;
  status: string;
  patientUhid?: string;
  patientInfo?: string;
  diagnosis?: string;
  declaredCompetency?: string;
};

let pendingReviews: Review[] = [
  {
    id: 3,
    studentId: 1,
    studentName: "Dr. Anilkumar A",
    department: "Pediatrics",
    type: "Case Log",
    title: "Acute Severe Asthma Exacerbation in a 7-year-old",
    date: "2026-07-26",
    patientUhid: "UHID-2026-004281",
    patientInfo: "7 years / Male",
    detail: "Complete case record includes complaints, history, examination, investigations, differentials, management, outcome and learning points.",
    diagnosis: "Acute Severe Asthma Exacerbation",
    status: "pending",
  },
  {
    id: 11,
    studentId: 2,
    studentName: "Dr. Radhamani KV",
    department: "General Medicine",
    type: "Procedure",
    title: "Endotracheal Intubation",
    date: "2026-07-26",
    patientUhid: "UHID-2026-004255",
    patientInfo: "2 days",
    detail: "Emergency procedure performed under direct supervision.",
    declaredCompetency: "Performed under supervision",
    status: "pending",
  },
  {
    id: 8,
    studentId: 3,
    studentName: "Dr. Mohammad MTP",
    department: "General Surgery",
    type: "Academic",
    title: "Case Discussion: Management of Septic Shock in Children",
    date: "2026-07-25",
    detail: "Literature review and departmental case discussion.",
    status: "pending",
  },
];

const allStudents = [
  { id: 1, name: "Dr. Anilkumar A", department: "Pediatrics", registrationNumber: "PG2024-PAED-014", overallCompletion: 73, shortfallStatus: "at_risk", pendingLogs: 1, lastLogDate: "2026-07-26" },
  { id: 2, name: "Dr. Radhamani KV", department: "General Medicine", registrationNumber: "PG2024-MED-018", overallCompletion: 88, shortfallStatus: "on_track", pendingLogs: 1, lastLogDate: "2026-07-26" },
  { id: 3, name: "Dr. Mohammad MTP", department: "General Surgery", registrationNumber: "PG2025-SURG-003", overallCompletion: 64, shortfallStatus: "behind", pendingLogs: 1, lastLogDate: "2026-07-25" },
];

router.get("/dashboard", (_req, res) => {
  res.json({
    faculty: {
      id: 10,
      name: "Dr. Mohammed",
      role: "Professor",
      department: "All Departments",
      studentAccessScope: "all_students",
      studentCount: allStudents.length,
      pendingReviewCount: pendingReviews.length,
    },
    pendingReviews,
    assignedMentees: allStudents,
  });
});

router.post("/review", (req, res) => {
  const { number, logId, status, remarks, grade, verifiedCompetency } = req.body;
  const targetNumber = Number(number ?? logId);
  pendingReviews = pendingReviews.filter((review) => review.id !== targetNumber);
  res.json({
    success: true,
    message: `Number ${targetNumber} evaluated as ${status}`,
    number: targetNumber,
    remarks,
    grade,
    verifiedCompetency,
  });
});

export default router;
