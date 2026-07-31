import { Router, type IRouter } from "express";
import { db, usersTable, studentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required" });
      return;
    }

    // TODO: Temporary unsecured auth step! Do not use in production.
    // Replace with real password hashing and JWT signing.

    let userRow = null;

    // 1. Check if username matches an email in usersTable (for profs/hods)
    const profMatch = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, username))
      .limit(1);
    
    if (profMatch.length > 0) {
      userRow = profMatch[0];
    } else {
      // 2. Check if it's a student registration number
      const studentMatch = await db
        .select()
        .from(studentsTable)
        .where(eq(studentsTable.registrationNumber, username))
        .limit(1);

      if (studentMatch.length > 0) {
        const studentUserMatch = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, studentMatch[0].userId))
          .limit(1);
        
        if (studentUserMatch.length > 0) {
          userRow = studentUserMatch[0];
        }
      }
    }

    if (!userRow) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    let studentProfileId = null;
    if (userRow.role === "student") {
      const studentProfileMatch = await db
        .select()
        .from(studentsTable)
        .where(eq(studentsTable.userId, userRow.id))
        .limit(1);
      
      if (studentProfileMatch.length > 0) {
        studentProfileId = studentProfileMatch[0].id;
      }
    }

    res.json({
      id: userRow.id,
      name: userRow.fullName,
      role: userRow.role,
      departmentId: userRow.departmentId,
      studentProfileId,
    });
  } catch (error) {
    req.log.error(error, "Login error");
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
