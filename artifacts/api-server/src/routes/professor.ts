import { Router, type IRouter } from "express";

const router: IRouter = Router();

const mockProfessorData = {
  faculty: {
    id: 10,
    name: "Prof. Dr. Mohammad MTP",
    role: "Professor & Guide",
    department: "Department of Pediatrics",
    assignedMenteesCount: 2,
    pendingReviewCount: 4,
  },
  pendingReviews: [
    {
      id: 1092,
      studentId: 1,
      studentName: "Dr. Adithya Nair",
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
      id: 1093,
      studentId: 2,
      studentName: "Dr. Anilkumar A",
      type: "Procedure",
      title: "Neonatal Resuscitation and Bag-mask Ventilation",
      date: "2026-07-26",
      patientUhid: "UHID-2026-004255",
      patientInfo: "2 days",
      detail: "Emergency procedure performed under direct supervision.",
      declaredCompetency: "Performed under supervision",
      status: "pending",
    },
    {
      id: 1094,
      studentId: 1,
      studentName: "Dr. Adithya Nair",
      type: "Academic",
      title: "Conference Paper: Management of Septic Shock in Children",
      date: "2026-07-25",
      detail: "Paper presentation with literature review and departmental discussion.",
      status: "pending",
    },
    {
      id: 1095,
      studentId: 1,
      studentName: "Dr. Adithya Nair",
      type: "Procedure",
      title: "Bone Marrow Aspiration",
      date: "2026-07-25",
      patientUhid: "UHID-2026-004198",
      patientInfo: "6 years",
      detail: "Invasive procedure performed under direct supervision.",
      declaredCompetency: "Performed under supervision",
      status: "pending",
    },
  ],
  assignedMentees: [
    { id: 1, name: "Dr. Adithya Nair", registrationNumber: "PG2024-PAED-014", overallCompletion: 73, shortfallStatus: "at_risk", pendingLogs: 2, lastLogDate: "2026-07-26" },
    { id: 2, name: "Dr. Anilkumar A", registrationNumber: "PG2024-PAED-018", overallCompletion: 88, shortfallStatus: "on_track", pendingLogs: 1, lastLogDate: "2026-07-26" },
  ],
};

router.get("/dashboard", (_req, res) => {
  res.json(mockProfessorData);
});

router.post("/review", (req, res) => {
  const { number, logId, status, remarks, grade, verifiedCompetency } = req.body;
  const targetNumber = Number(number ?? logId);
  mockProfessorData.pendingReviews = mockProfessorData.pendingReviews.filter((review) => review.id !== targetNumber);
  mockProfessorData.faculty.pendingReviewCount = mockProfessorData.pendingReviews.length;
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
