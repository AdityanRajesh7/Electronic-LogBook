import { Router, type IRouter } from "express";

const router: IRouter = Router();

const mockProfessorData = {
  faculty: {
    id: 10,
    name: "Prof. Dr. Mohammad MTP",
    role: "Professor & HOD",
    department: "Department of Paediatrics",
    assignedMenteesCount: 6,
    pendingReviewCount: 8,
  },
  pendingReviews: [
    {
      id: "LOG-1092",
      studentId: 1,
      studentName: "Dr. Adithya Nair",
      batch: "2024-2027",
      type: "Case Log",
      title: "Acute Severe Asthma Exacerbation in a 7yo Child",
      date: "2026-07-26",
      posting: "PICU",
      patientUhid: "UHID-2026-004281",
      patientInfo: "7 yr / Male",
      detail: "Managed with Nebulized Salbutamol + Ipratropium, IV Hydrocortisone, supplemental O2",
      diagnosis: "Acute Severe Asthma",
      status: "pending",
    },
    {
      id: "LOG-1093",
      studentId: 2,
      studentName: "Dr. Ananya Roy",
      batch: "2024-2027",
      type: "Procedure",
      title: "Neonatal Resuscitation & Bag-Mask Ventilation",
      date: "2026-07-26",
      posting: "NICU",
      patientUhid: "UHID-2026-004255",
      patientInfo: "Age: 2 days",
      detail: "Performed under emergency supervision during meconium aspiration presentation",
      declaredCompetency: "Performed Independently",
      status: "pending",
    },
    {
      id: "LOG-1094",
      studentId: 3,
      studentName: "Dr. Rohan Verma",
      batch: "2023-2026",
      type: "Academic",
      title: "Seminar: Management of Septic Shock in Children",
      date: "2026-07-25",
      posting: "Paediatric Emergency",
      detail: "Presented comprehensive literature review on Surviving Sepsis Campaign 2024 guidelines",
      status: "pending",
    },
    {
      id: "LOG-1095",
      studentId: 1,
      studentName: "Dr. Adithya Nair",
      batch: "2024-2027",
      type: "Procedure",
      title: "Bone Marrow Aspiration (Diagnostic)",
      date: "2026-07-25",
      posting: "PICU",
      patientUhid: "UHID-2026-004198",
      patientInfo: "Age: 6 years",
      detail: "Performed under direct supervision of Senior Resident for Acute Leukemia evaluation",
      declaredCompetency: "Performed Under Supervision",
      status: "pending",
    },
  ],
  assignedMentees: [
    {
      id: 1,
      name: "Dr. Adithya Nair",
      registrationNumber: "PG2024-PAED-014",
      batch: "2024-2027",
      currentPosting: "PICU",
      overallCompletion: 73,
      shortfallStatus: "at_risk",
      pendingLogs: 2,
      lastLogDate: "2026-07-26",
    },
    {
      id: 2,
      name: "Dr. Ananya Roy",
      registrationNumber: "PG2024-PAED-018",
      batch: "2024-2027",
      currentPosting: "NICU",
      overallCompletion: 88,
      shortfallStatus: "on_track",
      pendingLogs: 1,
      lastLogDate: "2026-07-26",
    },
    {
      id: 3,
      name: "Dr. Rohan Verma",
      registrationNumber: "PG2023-PAED-005",
      batch: "2023-2026",
      currentPosting: "General Wards",
      overallCompletion: 48,
      shortfallStatus: "behind",
      pendingLogs: 3,
      lastLogDate: "2026-07-25",
    },
  ],
};

router.get("/dashboard", (_req, res) => {
  res.json(mockProfessorData);
});

router.post("/review", (req, res) => {
  const { logId, status, remarks, grade, verifiedCompetency } = req.body;
  mockProfessorData.pendingReviews = mockProfessorData.pendingReviews.filter((r) => r.id !== logId);
  mockProfessorData.faculty.pendingReviewCount = mockProfessorData.pendingReviews.length;
  res.json({ success: true, message: `Log ${logId} evaluated as ${status}`, logId, remarks, grade, verifiedCompetency });
});

export default router;
