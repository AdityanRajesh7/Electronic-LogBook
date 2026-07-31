
import bcrypt from "bcryptjs";
import { 
  db,
  departmentsTable, usersTable, studentsTable, 
  caseLogsTable, procedureLogsTable, leaveTable
} from "@workspace/db";

import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding database...");

  try {
    // 1. Create or Find Department
    let dept;
    const existingDept = await db.select().from(departmentsTable).where(eq(departmentsTable.code, "PAED")).limit(1);
    if (existingDept.length > 0) {
      dept = existingDept[0];
      console.log(`Found existing Department: ${dept.name}`);
    } else {
      [dept] = await db.insert(departmentsTable).values({
        name: "Pediatrics",
        code: "PAED",
        description: "Department of Pediatrics"
      }).returning();
      console.log(`Created Department: ${dept.name}`);
    }

    // 2. Create or Find HOD User
    let hod;
    const existingHod = await db.select().from(usersTable).where(eq(usersTable.email, "hod@elogbook.com")).limit(1);
    if (existingHod.length > 0) {
      hod = existingHod[0];
      console.log(`Found existing HOD: ${hod.fullName}`);
    } else {
      const hodHash = await bcrypt.hash("password123", 10);
      [hod] = await db.insert(usersTable).values({
        fullName: "Dr. Mohamad (HOD)",
        email: "hod@elogbook.com",
        passwordHash: hodHash,
        role: "hod",
        status: "approved",
        departmentId: dept.id
      }).returning();
      console.log(`Created HOD: ${hod.fullName}`);
    }

    // 3. Create or Find Professor User
    let prof;
    const existingProf = await db.select().from(usersTable).where(eq(usersTable.email, "prof@elogbook.com")).limit(1);
    if (existingProf.length > 0) {
      prof = existingProf[0];
      console.log(`Found existing Professor: ${prof.fullName}`);
    } else {
      const profHash = await bcrypt.hash("password123", 10);
      [prof] = await db.insert(usersTable).values({
        fullName: "Dr. Mohammed (Prof)",
        email: "prof@elogbook.com",
        passwordHash: profHash,
        role: "professor",
        status: "approved",
        departmentId: dept.id
      }).returning();
      console.log(`Created Professor: ${prof.fullName}`);
    }

    // 4. Create or Find Student User
    let studentUser;
    const existingStudent = await db.select().from(usersTable).where(eq(usersTable.email, "student@elogbook.com")).limit(1);
    if (existingStudent.length > 0) {
      studentUser = existingStudent[0];
      console.log(`Found existing Student User: ${studentUser.fullName}`);
    } else {
      const studentHash = await bcrypt.hash("password123", 10);
      [studentUser] = await db.insert(usersTable).values({
        fullName: "Dr. Anilkumar A (Resident)",
        email: "student@elogbook.com",
        passwordHash: studentHash,
        role: "student",
        status: "approved",
        departmentId: dept.id
      }).returning();
      console.log(`Created Student User: ${studentUser.fullName}`);
    }

    // 5. Create or Find Student Profile
    let studentProfile;
    const existingProfile = await db.select().from(studentsTable).where(eq(studentsTable.userId, studentUser.id)).limit(1);
    if (existingProfile.length > 0) {
      studentProfile = existingProfile[0];
      console.log(`Found existing Student Profile: ${studentProfile.registrationNumber}`);
    } else {
      [studentProfile] = await db.insert(studentsTable).values({
        userId: studentUser.id,
        registrationNumber: "PG2024-PAED-014",
        dateOfJoining: "2024-06-03",
        batch: "2024",
        kuhsId: "KUHS12345",
        specialty: "Pediatrics"
      }).returning();
      console.log(`Created Student Profile: ${studentProfile.registrationNumber}`);
    }

    // 6. Create Case Log for Professor to Review
    await db.insert(caseLogsTable).values({
      studentId: studentProfile.id,
      supervisorId: prof.id,
      date: new Date().toISOString().slice(0, 10),
      patientUhid: "UHID99023",
      patientAge: "5 months",
      patientGender: "male",
      chiefComplaints: "Fever and cough since 3 days",
      diagnosisProvisional: "Acute Bronchiolitis",
      status: "pending"
    });
    console.log("Created Mock Case Log");

    // 7. Create Leave Request for HOD to Review
    await db.insert(leaveTable).values({
      studentId: studentProfile.id,
      fromDate: new Date(),
      toDate: new Date(Date.now() + 86400000 * 2),
      totalDays: 2,
      leaveType: "casual",
      reason: "Family emergency",
      status: "pending"
    });
    console.log("Created Mock Leave Request");

    console.log("Seeding complete! You can now log in with the following credentials:");
    console.log("- HOD: hod@elogbook.com / password123");
    console.log("- Professor: prof@elogbook.com / password123");
    console.log("- Student: student@elogbook.com / password123");

  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

main();
