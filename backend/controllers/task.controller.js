import { prisma } from "../lib/prisma.js";

export const createTask = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { title, description } = req.body;

        if(!title || !userId){
            return res.status(400).json({ message: "Title and required"});
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

        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                userId,
            }
        })

        if(!task) {
            return res.status(404).json({ message: "Task not found" })
        }

        const updated = await prisma.task.update({
            where: { id:taskId },
            data: { title, description, status }
        });
        res.json({ message: "Task updated successfully", task: updated});
    } catch (error) {
        next(error);
    }
}

export const deleteTask = async (req, res, next) => {
    try {
        const userId = req.userId;
        const taskId = parseInt(req.params.id);

        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                userId,
            }
        })

        if(!task) {
            return res.status(404).json({ message: "Task not found"})
        }
        await prisma.task.delete({
            where:{ id: taskId }
        });
        res.json({ message: "Task deleted sucessfully" });
    } catch (error) {
        next(error);
    }
}