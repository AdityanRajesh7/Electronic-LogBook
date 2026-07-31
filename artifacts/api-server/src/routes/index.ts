import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studentRouter from "./student";
import professorRouter from "./professor";
import hodRouter from "./hod";
import authRouter from "./auth";
import departmentRouter from "./department";
import logsRouter from "./logs";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/student", studentRouter);
router.use("/students", studentRouter);
router.use("/professors", professorRouter);
router.use("/hod", hodRouter);
router.use("/departments", departmentRouter);
router.use("/logs", logsRouter);

export default router;
