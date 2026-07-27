import { Router, type IRouter } from "express";

const router: IRouter = Router();

const mockHODData = {
  department: {
    name: "Department of Paediatrics",
    totalResidents: 18,
    facultyCount: 8,
    onTrackCount: 11,
    atRiskCount: 5,
    behindCount: 2,
    inspectionReadiness: "84%",
  },
  residentsGapOverview: [
    {
      id: 1,
      name: "Dr. Rohan Verma",
      registrationNumber: "PG2023-PAED-005",
      batch: "2023-2026",
      mentor: "Prof. Dr. Mohammad MTP",
      currentPosting: "General Wards",
      casesCompleted: 28,
      casesRequired: 60,
      proceduresCompleted: 8,
      proceduresRequired: 25,
      shortfallSeverity: "behind",
      shortfallNote: "Severely lagging in Independent Procedures (-17) & Bedside Presentations.",
    },
    {
      id: 2,
      name: "Dr. Kabir Mehta",
      registrationNumber: "PG2023-PAED-009",
      batch: "2023-2026",
      mentor: "Dr. Meenakshi Sundaram",
      currentPosting: "Pediatric Surgery",
      casesCompleted: 35,
      casesRequired: 60,
      proceduresCompleted: 12,
      proceduresRequired: 25,
      shortfallSeverity: "behind",
      shortfallNote: "Behind on Procedure target pace; requires re-posting in Emergency.",
    },
    {
      id: 3,
      name: "Dr. Adithya Nair",
      registrationNumber: "PG2024-PAED-014",
      batch: "2024-2027",
      mentor: "Prof. Dr. Mohammad MTP",
      currentPosting: "PICU",
      casesCompleted: 42,
      casesRequired: 50,
      proceduresCompleted: 9,
      proceduresRequired: 15,
      shortfallSeverity: "at_risk",
      shortfallNote: "Procedure target at 60%; needs 6 additional independent procedures.",
    },
    {
      id: 4,
      name: "Dr. Priyanshi Patel",
      registrationNumber: "PG2024-PAED-019",
      batch: "2024-2027",
      mentor: "Dr. Sunita Kulkarni",
      currentPosting: "Outpatient Dept (OPD)",
      casesCompleted: 38,
      casesRequired: 50,
      proceduresCompleted: 10,
      proceduresRequired: 15,
      shortfallSeverity: "at_risk",
      shortfallNote: "Mortality meeting attendance below minimum threshold.",
    },
    {
      id: 5,
      name: "Dr. Ananya Roy",
      registrationNumber: "PG2024-PAED-018",
      batch: "2024-2027",
      mentor: "Prof. Dr. Mohammad MTP",
      currentPosting: "NICU",
      casesCompleted: 46,
      casesRequired: 50,
      proceduresCompleted: 14,
      proceduresRequired: 15,
      shortfallSeverity: "on_track",
      shortfallNote: "Excellent logging pace; all requirements on schedule.",
    },
  ],
  pendingLeaves: [
    {
      id: "LV-401",
      residentId: 1,
      residentName: "Dr. Rohan Verma",
      fromDate: "2026-08-05",
      toDate: "2026-08-08",
      totalDays: 4,
      type: "Casual Leave",
      reason: "Family medical emergency",
      status: "pending",
    },
    {
      id: "LV-402",
      residentId: 3,
      residentName: "Dr. Adithya Nair",
      fromDate: "2026-08-12",
      toDate: "2026-08-14",
      totalDays: 3,
      type: "Academic Leave",
      reason: "Attending National Paediatric Pulmonary Conference (IAP)",
      status: "pending",
    },
  ],
};

router.get("/dashboard", (_req, res) => {
  res.json(mockHODData);
});

router.post("/leave/action", (req, res) => {
  const { leaveId, action } = req.body;
  mockHODData.pendingLeaves = mockHODData.pendingLeaves.filter((l) => l.id !== leaveId);
  res.json({ success: true, message: `Leave ${leaveId} ${action}d` });
});

export default router;
