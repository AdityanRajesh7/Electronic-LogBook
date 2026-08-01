import { Router } from "express";
import { db, usersTable, studentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

// Only HODs can access these routes
router.use(requireAuth, requireRole(["hod"]));

// GET /api/admin/students/pending
// List all students pending approval
router.get("/students/pending", async (req, res) => {
  try {
    const departmentId = req.user?.departmentId;
    const conditions = [
      eq(usersTable.role, "student"), 
      eq(usersTable.status, "pending")
    ];
    if (departmentId) {
      conditions.push(eq(usersTable.departmentId, departmentId));
    }

    const pendingUsers = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        registrationNumber: studentsTable.registrationNumber,
        batch: studentsTable.batch,
        createdAt: usersTable.createdAt
      })
      .from(usersTable)
      .innerJoin(studentsTable, eq(usersTable.id, studentsTable.userId))
      .where(and(...conditions));

    res.json(pendingUsers);
  } catch (error) {
    req.log.error(error, "Error fetching pending students");
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/admin/students/:id/approve
// Approve a student account
router.post("/students/:id/approve", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    await db.update(usersTable)
      .set({ status: "approved" })
      .where(and(eq(usersTable.id, userId), eq(usersTable.role, "student")));

    res.json({ message: "Student approved successfully" });
  } catch (error) {
    req.log.error(error, "Error approving student");
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/admin/professors
// Create a new professor account
router.post("/professors", async (req, res) => {
  try {
    const { fullName, email, password, departmentId } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ message: "Full name, email, and password are required" });
      return;
    }

    const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existingUser.length > 0) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newProf] = await db.insert(usersTable).values({
      fullName,
      email,
      passwordHash,
      role: "professor",
      status: "approved", // Professors created by HOD are auto-approved
      departmentId: departmentId || null
    }).returning();

    res.status(201).json({ 
      message: "Professor created successfully",
      professor: {
        id: newProf.id,
        fullName: newProf.fullName,
        email: newProf.email,
        departmentId: newProf.departmentId
      }
    });
  } catch (error) {
    req.log.error(error, "Error creating professor");
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/admin/leaves/pending
// List all pending leave requests for the department
router.get("/leaves/pending", async (req, res) => {
  try {
    const { leaveTable } = await import("@workspace/db");
    
    // We should ideally filter by department, but for MVP HOD sees all leaves or leaves in their dept
    const pendingLeaves = await db
      .select({
        id: leaveTable.id,
        number: leaveTable.id, // for frontend compat
        fromDate: leaveTable.fromDate,
        toDate: leaveTable.toDate,
        totalDays: leaveTable.totalDays,
        type: leaveTable.leaveType,
        reason: leaveTable.reason,
        status: leaveTable.status,
        residentName: usersTable.fullName,
        residentId: studentsTable.id
      })
      .from(leaveTable)
      .innerJoin(studentsTable, eq(leaveTable.studentId, studentsTable.id))
      .innerJoin(usersTable, eq(studentsTable.userId, usersTable.id))
      .where(eq(leaveTable.status, "pending"));

    res.json(pendingLeaves);
  } catch (error) {
    req.log.error(error, "Error fetching pending leaves");
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/admin/leaves/:id/action
router.post("/leaves/:id/action", async (req, res) => {
  try {
    const leaveId = req.params.id;
    const { action } = req.body; // "approve" or "reject"
    const { leaveTable } = await import("@workspace/db");

    if (!["approve", "reject"].includes(action)) {
      res.status(400).json({ message: "Invalid action" });
      return;
    }

    const status = action === "approve" ? "approved" : "rejected";

    const [updated] = await db.update(leaveTable)
      .set({ 
        status, 
        approvedById: req.user?.id 
      })
      .where(eq(leaveTable.id, leaveId))
      .returning();

    if (!updated) {
      res.status(404).json({ message: "Leave not found" });
      return;
    }

    res.json({ message: `Leave ${status} successfully` });
  } catch (error) {
    req.log.error(error, "Error updating leave status");
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
