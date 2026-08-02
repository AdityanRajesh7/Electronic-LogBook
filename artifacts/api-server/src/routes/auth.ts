import { Router, type IRouter } from "express";
import { db, usersTable, studentsTable, departmentsTable } from "@workspace/db";
import { eq, ilike } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router: IRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev-only";

router.post("/register", async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      password, 
      registrationNumber, 
      batch, 
      dateOfJoining, 
      kuhsId, 
      specialty 
    } = req.body;

    if (!fullName || !email || !password || !registrationNumber || !batch || !dateOfJoining || !kuhsId || !specialty) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Check if email or reg number exists
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existingUser.length > 0) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const existingStudent = await db.select().from(studentsTable).where(eq(studentsTable.registrationNumber, registrationNumber)).limit(1);
    if (existingStudent.length > 0) {
      res.status(400).json({ message: "Registration number already registered" });
      return;
    }

    // Lookup departmentId from specialty
    if (!specialty) {
      res.status(400).json({ message: "Specialty (Department) is required" });
      return;
    }

    const deptMatch = await db
      .select()
      .from(departmentsTable)
      .where(ilike(departmentsTable.name, specialty))
      .limit(1);
      
    if (deptMatch.length === 0) {
      res.status(400).json({ message: `Invalid department: ${specialty}` });
      return;
    }
    
    const departmentId = deptMatch[0].id;

    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user (defaults to role: student, status: pending)
    const [newUser] = await db.insert(usersTable).values({
      fullName,
      email,
      passwordHash,
      role: "student",
      status: "pending",
      departmentId,
    }).returning();

    // Insert student profile
    await db.insert(studentsTable).values({
      userId: newUser.id,
      registrationNumber,
      batch,
      dateOfJoining,
      kuhsId,
      specialty
    });

    res.status(201).json({ message: "Registration successful. Pending HOD approval." });
  } catch (error) {
    req.log.error(error, "Registration error");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required" });
      return;
    }

    let userRow = null;

    // Check usersTable (email)
    const match = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, username))
      .limit(1);
    
    if (match.length > 0) {
      userRow = match[0];
    } else {
      // Fallback: Check registration number for students
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

    if (!userRow || !userRow.passwordHash) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, userRow.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    if (userRow.status === "pending") {
      res.status(403).json({ message: "Account pending HOD approval" });
      return;
    }

    if (userRow.status === "rejected") {
      res.status(403).json({ message: "Account rejected by HOD" });
      return;
    }

    const token = jwt.sign(
      { id: userRow.id, role: userRow.role, departmentId: userRow.departmentId },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

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

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });
  res.json({ message: "Logged out successfully" });
});

router.get("/me", async (req, res) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const [userRow] = await db.select().from(usersTable).where(eq(usersTable.id, decoded.id)).limit(1);
    
    if (!userRow) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    res.json({
      id: userRow.id,
      name: userRow.fullName,
      role: userRow.role,
      departmentId: userRow.departmentId,
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
