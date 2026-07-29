import { Router, type IRouter } from "express";

const router: IRouter = Router();

type StudentRegistration = {
  number: number;
  name: string;
  department: string;
  registrationNumber: string;
  dateOfJoining: string;
  joiningYear: number;
  expectedCompletionDate: string;
  paymentStatus: "paid";
  registrationStatus: "pending_verification" | "active" | "rejected";
};

const studentRegistrations: StudentRegistration[] = [
  { number: 1, name: "Dr. Anilkumar A", department: "Pediatrics", registrationNumber: "PG2024-PAED-014", dateOfJoining: "2024-06-03", joiningYear: 2024, expectedCompletionDate: "2027-06-03", paymentStatus: "paid", registrationStatus: "active" },
  { number: 2, name: "Dr. Radhamani KV", department: "Pediatrics", registrationNumber: "PG2025-PAED-018", dateOfJoining: "2025-05-12", joiningYear: 2025, expectedCompletionDate: "2028-05-12", paymentStatus: "paid", registrationStatus: "pending_verification" },
  { number: 3, name: "Dr. Mohammad MTP", department: "Pediatrics", registrationNumber: "PG2026-PAED-003", dateOfJoining: "2026-06-01", joiningYear: 2026, expectedCompletionDate: "2029-06-01", paymentStatus: "paid", registrationStatus: "pending_verification" },
];

let pendingLeaves = [
  { number: 1, residentId: 1, residentName: "Dr. Anilkumar A", fromDate: "2026-08-12", toDate: "2026-08-14", totalDays: 3, type: "Academic Leave", reason: "National Pediatric Pulmonary Conference", status: "pending" },
  { number: 2, residentId: 2, residentName: "Dr. Radhamani KV", fromDate: "2026-08-22", toDate: "2026-08-22", totalDays: 1, type: "Casual Leave", reason: "Personal appointment", status: "pending" },
];

router.get("/dashboard", (_req, res) => {
  res.json({
    department: {
      name: "Department of Pediatrics",
      hod: "Dr. Mohamad",
      totalResidents: studentRegistrations.length,
      paidRegistrations: studentRegistrations.filter((item) => item.paymentStatus === "paid").length,
      pendingVerification: studentRegistrations.filter((item) => item.registrationStatus === "pending_verification").length,
    },
    studentRegistrations,
    pendingLeaves,
    requirements: {
      procedures: 101,
      caseDiscussions: 50,
      journalClubsPerMonth: 2,
      seminarsPerMonth: 2,
      interestingCasePresentationsPerMonth: 1,
    },
  });
});

router.post("/registrations/action", (req, res) => {
  const number = Number(req.body.number);
  const registration = studentRegistrations.find((item) => item.number === number);
  if (!registration || !["activate", "reject"].includes(req.body.action)) {
    res.status(400).json({ success: false, message: "A valid registration and action are required." });
    return;
  }
  registration.registrationStatus = req.body.action === "activate" ? "active" : "rejected";
  res.json({ success: true, registration });
});

router.post("/leave/action", (req, res) => {
  const targetNumber = Number(req.body.number ?? req.body.leaveId);
  pendingLeaves = pendingLeaves.filter((leave) => leave.number !== targetNumber);
  res.json({ success: true, message: `Leave number ${targetNumber} ${req.body.action}` });
});

export default router;
