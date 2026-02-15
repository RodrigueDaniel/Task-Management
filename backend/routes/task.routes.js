import express from "express";
import { verifyToken } from "../middleware/auth.middleware"
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from "../controllers/task.controller";

const router = express.Router();

router.use(verifyToken);

router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;