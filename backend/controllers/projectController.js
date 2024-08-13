import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";

const createProject = async (req, res) => {
    const { name, description,deadline, assignedTo } = req.body;
    try {
        const project = await Project.create({name, description, deadline, assignedTo})
        return res.status(200).json(project);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate('assignedTo').populate('tasks');
        return res.status(200).json(projects);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getProjectsOfUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const projects = await Project.find({ assignedTo: userId }); 
        return res.status(200).json(projects);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getProjectById=async (req,res)=>{
    try{
        const projectId=req.params.projectId
        const project = await Project.findById(projectId)
        .populate('assignedTo')  
        .populate({
            path: 'tasks',
            populate: { path: 'assignedTo', select: 'fullName' }  
        });
        return res.status(200).json(project);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const deleteProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const project = await Project.findByIdAndDelete(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        await Task.deleteMany({ project: projectId });

        return res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}




const getProjectsOfMember=async (req,res)=>{
    try{
        const userId = req.params.userId;
        const tasks = await Task.find({ assignedTo: userId });

        const projectIds = [...new Set(tasks.map(task => task.project))];
        const projects = await Project.find({ _id: { $in: projectIds } }).populate('assignedTo').populate('tasks');

        return res.status(200).json(projects);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export {
    createProject,
    getProjects,
    deleteProject,
    getProjectById,
    getProjectsOfUser,
    getProjectsOfMember,
}