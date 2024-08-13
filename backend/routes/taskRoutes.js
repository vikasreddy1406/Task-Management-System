import express from "express";
import { createTask, getTasks, updateTaskStatus } from "../controllers/taskController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route('/create').post( createTask);
router.route('/:projectId').get( getTasks);
router.route('/update').put( updateTaskStatus);

export default router;
