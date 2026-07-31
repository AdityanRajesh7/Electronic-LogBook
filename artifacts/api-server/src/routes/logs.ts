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
    if (isNaN(id)) res.status(400).json({ message: "Invalid logId" }); return;

    if (!["verified", "rejected"].includes(status)) {
      res.status(400).json({ message: "Invalid status" }); return;
    }

    if (!reviewerId) {
      res.status(400).json({ message: "Missing reviewerId" }); return;
    }

    const reviewerIdNum = parseInt(reviewerId, 10);
    if (!(await validateReviewer(reviewerIdNum))) {
      res.status(400).json({ message: "Invalid reviewerId or user is not a professor/hod" }); return;
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
      res.status(400).json({ message: "Invalid logType" }); return;
    }

    if (updatedRows.length === 0) {
      res.status(404).json({ message: "Log not found" }); return;
    }

    res.json(updatedRows[0]);
  } catch (error) {
    req.log.error(error, "Error updating log review status");
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
