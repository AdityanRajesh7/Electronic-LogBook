import { Router, type IRouter } from "express";
import { db, caseLogsTable, procedureLogsTable, academicLogsTable, usersTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

const router: IRouter = Router();

async function validateReviewer(reviewerId: number) {
  const reviewerMatch = await db.select().from(usersTable).where(eq(usersTable.id, reviewerId)).limit(1);
  return reviewerMatch.length > 0 && ["professor", "hod"].includes(reviewerMatch[0].role);
}

// PATCH /api/logs/:logType/:logId/review
router.patch("/:logType/:logId/review", async (req, res) => {
  try {
    const { logType, logId } = req.params;
    const { status, comments, reviewerId } = req.body;

    const id = parseInt(logId, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid logId" });

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (!reviewerId) {
      return res.status(400).json({ message: "Missing reviewerId" });
    }

    const reviewerIdNum = parseInt(reviewerId, 10);
    if (!(await validateReviewer(reviewerIdNum))) {
      return res.status(400).json({ message: "Invalid reviewerId or user is not a professor/hod" });
    }

    let updatedRows;
    const updateData = {
      status,
      facultyRemarks: comments || null,
      reviewedBy: reviewerIdNum,
      reviewedAt: new Date()
    };

    if (logType === "case") {
      updatedRows = await db.update(caseLogsTable).set(updateData).where(eq(caseLogsTable.id, id)).returning();
    } else if (logType === "procedure") {
      updatedRows = await db.update(procedureLogsTable).set(updateData).where(eq(procedureLogsTable.id, id)).returning();
    } else if (logType === "academic") {
      updatedRows = await db.update(academicLogsTable).set(updateData).where(eq(academicLogsTable.id, id)).returning();
    } else {
      return res.status(400).json({ message: "Invalid logType" });
    }

    if (updatedRows.length === 0) {
      return res.status(404).json({ message: "Log not found" });
    }

    res.json(updatedRows[0]);
  } catch (error) {
    req.log.error(error, "Error updating log review status");
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
