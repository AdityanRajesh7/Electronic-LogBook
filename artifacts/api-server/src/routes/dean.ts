import { Router, type IRouter } from "express";

const router: IRouter = Router();

const mockDeanData = {
  institution: {
    name: "Grant Government Medical College & JJ Hospital, Mumbai",
    totalDepartments: 14,
    totalPGResidents: 240,
    totalFaculty: 85,
    overallNMCCompliance: "91.2%",
    lastInspectionDate: "2025-11-14",
  },
  departmentComplianceHeatmap: [
    { name: "Paediatrics", totalResidents: 18, complianceRate: 84, status: "at_risk", atRiskResidents: 7, lastAudited: "2026-07-20" },
    { name: "General Surgery", totalResidents: 32, complianceRate: 94, status: "on_track", atRiskResidents: 2, lastAudited: "2026-07-22" },
    { name: "Obstetrics & Gynaecology (OBG)", totalResidents: 28, complianceRate: 92, status: "on_track", atRiskResidents: 3, lastAudited: "2026-07-21" },
    { name: "General Medicine", totalResidents: 36, complianceRate: 88, status: "at_risk", atRiskResidents: 6, lastAudited: "2026-07-18" },
    { name: "Orthopaedics", totalResidents: 20, complianceRate: 96, status: "on_track", atRiskResidents: 1, lastAudited: "2026-07-24" },
    { name: "Anaesthesiology", totalResidents: 24, complianceRate: 79, status: "behind", atRiskResidents: 8, lastAudited: "2026-07-15" },
  ],
};

router.get("/dashboard", (_req, res) => {
  res.json(mockDeanData);
});

export default router;
