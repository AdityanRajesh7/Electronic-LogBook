import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studentRouter from "./student";
import professorRouter from "./professor";
import hodRouter from "./hod";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/student", studentRouter);
router.use("/professor", professorRouter);
router.use("/hod", hodRouter);

export default router;
