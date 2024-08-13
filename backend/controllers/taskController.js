import { Task } from "../models/Task.js";
import { Project } from "../models/Project.js";

const createTask = async (req, res) => {
    const { name, description, deadline, status, assignedTo, project } = req.body;
    try {
        const task = await Task.create({ name, description, deadline, status, assignedTo, project });
        await Project.findByIdAndUpdate(project, { $push: { tasks: task._id } });
        return res.status(200).json(task);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getTasks = async (req, res) => {
    const { projectId } = req.params;
    try {
        const tasks = await Task.find({ project: projectId }).populate('assignedTo');
        return res.status(200).json(tasks);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const updateTaskStatus = async (req, res) => {
    const { taskId, status } = req.body;
    try {
        const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true });
        return res.status(200).json(task);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export { createTask, getTasks, updateTaskStatus };
