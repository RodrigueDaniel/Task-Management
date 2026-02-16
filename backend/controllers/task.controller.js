import { prisma } from "../lib/prisma.js";

export const createTask = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { title, description } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({ message: "Title is required" });
        }

        const task = await prisma.task.create({
            data: { title, description, userId }
        })

        res.status(201).json({ message: "Task created successfully", task });
    } catch (error) {
        next(error);
    }
}

export const getTasks = async (req, res, next) => {
    try {
        const userId = req.userId;

        const tasks = await prisma.task.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        res.json(tasks);
    } catch (error) {
        next(error);
    }
}

export const getTaskById = async (req, res, next) => {
    try {
        const userId = req.userId;
        const taskId = parseInt(req.params.id);

        if(isNaN(taskId)){
            return res.status(400).json({ message: "Invalid task ID" });
        }
        const task = await prisma.task.findFirst({
            where: { id: taskId, userId }
        });
        if(!task){
            return res.status(404).json({ message: "Task not found" });
        }
        res.json(task);
    } catch (error) {
        next(error);
    }
}

export const updateTask = async (req, res, next) => {
  try {
    const userId = req.userId;
    const taskId = parseInt(req.params.id);
    const { title, description, status } = req.body;

    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const allowedStatus = ["PENDING", "IN_PROGRESS", "COMPLETED"];
    if (status !== undefined && !allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;

    const result = await prisma.task.updateMany({
      where: { id: taskId, userId },
      data
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task updated successfully" });

  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const userId = req.userId;
    const taskId = parseInt(req.params.id);

    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const result = await prisma.task.deleteMany({
      where: { id: taskId, userId }
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });

  } catch (error) {
    next(error);
  }
};