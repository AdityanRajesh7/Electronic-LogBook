import { Router, type IRouter } from "express";
import { db, usersTable, studentsTable, departmentsTable, registrationOtpsTable } from "@workspace/db";
import { eq, ilike, and, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../lib/mailer.js";

const router: IRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev-only";

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  try {
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existingUser.length > 0) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const recentOtp = await db.select().from(registrationOtpsTable)
      .where(eq(registrationOtpsTable.email, email))
      .orderBy(desc(registrationOtpsTable.createdAt))
      .limit(1);

    const now = new Date();
    if (recentOtp.length > 0) {
      const timeSinceCreation = now.getTime() - new Date(recentOtp[0].createdAt).getTime();
      if (timeSinceCreation < 60000) {
        res.status(429).json({ message: "Please wait 60 seconds before requesting another OTP" });
        return;
      }
    }

    await db.delete(registrationOtpsTable).where(
      and(eq(registrationOtpsTable.email, email), eq(registrationOtpsTable.verified, false))
    );

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(now.getTime() + 10 * 60000);

    await db.insert(registrationOtpsTable).values({
      email,
      otpHash,
      expiresAt,
    });

    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent" });
  } catch (error) {
    req.log.error(error, "Error sending OTP");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({ message: "Email and OTP are required" });
    return;
  }

  try {
    const latestOtp = await db.select().from(registrationOtpsTable)
      .where(eq(registrationOtpsTable.email, email))
      .orderBy(desc(registrationOtpsTable.createdAt))
      .limit(1);

    if (latestOtp.length === 0) {
      res.status(400).json({ message: "No OTP found for this email" });
      return;
    }

    const otpRecord = latestOtp[0];

    if (new Date() > new Date(otpRecord.expiresAt)) {
      res.status(400).json({ message: "OTP has expired" });
      return;
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isValid) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    await db.update(registrationOtpsTable)
      .set({ verified: true })
      .where(eq(registrationOtpsTable.id, otpRecord.id));

    res.status(200).json({ message: "Email verified" });
  } catch (error) {
    req.log.error(error, "Error verifying OTP");
    res.status(500).json({ message: "Internal server error" });
  }
});

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

    const verifiedOtp = await db.select().from(registrationOtpsTable)
      .where(
        and(
          eq(registrationOtpsTable.email, email),
          eq(registrationOtpsTable.verified, true)
        )
      )
      .orderBy(desc(registrationOtpsTable.createdAt))
      .limit(1);

    if (verifiedOtp.length === 0 || new Date() > new Date(verifiedOtp[0].expiresAt)) {
      res.status(400).json({ message: "Email not verified. Please verify your email before registering." });
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

    await db.delete(registrationOtpsTable).where(eq(registrationOtpsTable.email, email));

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
