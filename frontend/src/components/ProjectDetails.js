import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingUi from "./LoadingUi"

export default function ProjectDetails() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    let navigate = useNavigate();

    useEffect(() => {
        const fetchProjectDetails = async () => {
            const response = await axios.get(`http://localhost:4000/api/project/getproject/${projectId}`);
            setProject(response.data);
        };
        fetchProjectDetails();
    }, [projectId]);

    const handleBackClick = (e) => {
        e.preventDefault();
        navigate("/admin");
    };

    const handleSendMail = () => {
        const mailtoLink = `mailto:${project.assignedTo.email}?subject=Project Update: ${project.name}&from=admin@gmail.com`;
        window.location.href = mailtoLink;
    };

    if (!project) return <LoadingUi/>;

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.status === 'Done').length;
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return (
        <div className='my-10'>
            <div className="container mx-auto mt-8 max-w-screen-lg my-10">
                <div className="max-w-3xl mx-auto p-6 border border-gray-200 rounded-lg shadow bg-[#F5F7F8]">
                    <h1 className="text-2xl font-bold mb-4 text-center text-red-600">{project.name}</h1>
                    <p className="mb-3 font-normal text-gray-700">{project.description}</p>
                    <p><span className="font-semibold">Deadline:</span> {new Date(project.deadline).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Assigned To:</span> {project.assignedTo.fullName}</p>
                    <p><span className="font-semibold">Completion:</span> {completionPercentage.toFixed(2)}%</p>
                    <div className="w-full bg-gray-200 rounded-full">
                        <div className="bg-blue-600 text-xs font-medium text-white text-center p-0.5 leading-none rounded-full" style={{ width: `${Math.floor(completionPercentage)}%` }}>{completionPercentage.toFixed(2)}%</div>
                    </div>

                    <h2 className="text-xl font-bold mt-6 mb-4">Tasks</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {project.tasks.length > 0 ? project.tasks.map(task => (
                            <div key={task._id} className="p-4 border border-gray-200 rounded-lg bg-white shadow">
                                <h3 className="text-lg font-bold text-red-600">{task.name}</h3>
                                <p>{task.description}</p>
                                <p><span className="font-semibold">Status:</span> {task.status}</p>
                                <p><span className="font-semibold">Assigned To:</span> {task.assignedTo.fullName}</p>
                                {task.deadline && (
                                    <p><span className="font-semibold">Deadline:</span> {new Date(task.deadline).toLocaleDateString()}</p>
                                )}
                            </div>
                        )) : <span className='text-red-600 text-2xl font-semi'>No tasks</span>}
                    </div>
                </div>
            </div>
            <div className='flex justify-center my-8'>
                <button
                    type="button"
                    onClick={handleBackClick}
                    className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={handleSendMail}
                    className="ml-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    Send Mail
                </button>
            </div>
        </div>
    );
}
