import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import axios from "axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import LoadingUi from "./LoadingUi"
import {jwtDecode} from "jwt-decode";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [loading, setLoading] = useState(false)
  let navigate = useNavigate();
  useEffect(() => {
  
    const token = Cookie.get("accessToken");
      const decodedToken = jwtDecode(token);
      const role = decodedToken.role
    if (role !== "member") {
      navigate("/login");
    }

    if (role === "admin") {
      navigate("/admin");
    } else if (role === "teamLead") {
      navigate("/home");
    }
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const userId = Cookie.get("userId");
        const response = await axios.get(
          `http://localhost:4000/api/project/getmemberprojects/${userId}`
        );
        const projects = response.data;

        for (let project of projects) {
          const taskResponse = await axios.get(
            `http://localhost:4000/api/task/${project._id}`
          );
          project.tasks = taskResponse.data;
        }
        setLoading(false)
        setProjects(projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  const handleProjectClick = async (projectId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/task/${projectId}`
      );
      setTasks(response.data);
      setSelectedProject(projectId);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleTaskStatusChange = async (taskId, status) => {
    try {
      await axios.put("http://localhost:4000/api/task/update", {
        taskId,
        status,
      });
      const response = await axios.get(
        `http://localhost:4000/api/task/${selectedProject}`
      );
      setTasks(response.data);

      setProjects((prevProjects) => {
        return prevProjects.map((project) => {
          if (project._id === selectedProject) {
            const updatedTasks = response.data;
            project.tasks = updatedTasks;
          }
          return project;
        });
      });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleNextClick = () => {
    if (currentProjectIndex < projects.length - 3) {
      setCurrentProjectIndex(currentProjectIndex + 1);
    }
  };

  const handlePrevClick = () => {
    if (currentProjectIndex > 0) {
      setCurrentProjectIndex(currentProjectIndex - 1);
    }
  };

  useEffect(() => {
    if (!Cookie.get("accessToken")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSortByDeadline = () => {
    const sortedProjects = [...projects].sort(
      (a, b) => new Date(a.deadline) - new Date(b.deadline)
    );
    setProjects(sortedProjects);
    setCurrentProjectIndex(0);
  };

  const displayedProjects = projects.slice(
    currentProjectIndex,
    currentProjectIndex + 3
  );

  const totalTasks = projects.reduce(
    (acc, project) => acc + project.tasks.length,
    0
  );
  const completedTasks = projects.reduce(
    (acc, project) =>
      acc + project.tasks.filter((task) => task.status === "Done").length,
    0
  );
  const pendingTasks = totalTasks - completedTasks;

  return (
    loading ? <LoadingUi/> : <div>
      <div className="container mx-auto mt-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Member Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 text-center">
          <div className="bg-white shadow-md rounded-lg p-4 border-2">
            <h2 className="text-xl font-bold mb-2 text-red-500">Total Tasks</h2>
            <p className="text-gray-700 mb-2 text-3xl">{totalTasks}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 border-2">
            <h2 className="text-xl font-bold mb-2 text-yellow-500">
              Pending Tasks
            </h2>
            <p className="text-gray-700 mb-2 text-3xl">{pendingTasks}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 border-2">
            <h2 className="text-xl font-bold mb-2 text-green-500">
              Completed Tasks
            </h2>
            <p className="text-gray-700 mb-2 text-3xl">{completedTasks}</p>
          </div>
        </div>

        <div className="flex justify-between mb-5">
          <h1 className="text-xl font-bold mb-4">Projects</h1>
          <button
            className="text-white mr-9 bg-green-700 hover:bg-green-800 disabled:cursor-not-allowed focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={handleSortByDeadline}
            disabled={projects.length===0}
          >
            Sort by Deadline
          </button>
        </div>
        <div className=" my-4 p-5 ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {displayedProjects.map((project) => {
              const totalTasks = project.tasks.length;
              const completedTasks = project.tasks.filter(
                (task) => task.status === "Done"
              ).length;
              const completionPercentage =
                totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

              return (
              <div
                  key={project._id}
                //   className=" shadow-md rounded-lg p-4 hover:shadow-lg cursor-pointer hover:scale-105 border-2 bg-[#F5F7F8]"
                className={`shadow-md rounded-lg p-4 hover:shadow-lg cursor-pointer hover:scale-105 border-2 ${
                    selectedProject === project._id ? "bg-[#C9DABF]" : "bg-[#F5F7F8]"
                  }`}
                  onClick={() => handleProjectClick(project._id)}
                >
                  <h2 className="text-xl font-bold mb-2 text-red-500 text-center">
                    {project.name}
                  </h2>
                  <p className="text-gray-700 mb-2">{project.description}</p>
                  <p className="text-gray-500 my-1 font-semibold ">
                    Deadline: {new Date(project.deadline).toLocaleDateString()}
                  </p>
                  <p className=" my-2 font-semibold text-black">
                    Completion: {completionPercentage.toFixed(2)}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                    <div
                      className="bg-blue-600 text-xs font-medium text-white text-center p-0.5 leading-none rounded-full"
                      style={{ width: `${Math.floor(completionPercentage)}%` }}
                    >
                      {" "}
                      {completionPercentage.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center">
            <button
              className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group focus:ring-4 focus:outline-none transition-all ease-in duration-75 ${
                currentProjectIndex === 0
                  ? "cursor-not-allowed bg-gray-300 text-gray-500 dark:text-gray-400"
                  : "bg-gradient-to-br from-purple-600 to-blue-500 text-gray-900 dark:text-white hover:text-white group-hover:from-purple-600 group-hover:to-blue-500 dark:focus:ring-blue-800"
              }`}
              onClick={handlePrevClick}
              disabled={currentProjectIndex === 0}
            >
              <span
                className={`relative px-5 py-2.5 rounded-md ${
                  currentProjectIndex !== 0
                    ? "bg-white dark:bg-gray-900 group-hover:bg-opacity-0"
                    : ""
                }`}
              >
                <FaChevronLeft size={24} />
              </span>
            </button>
            <button
              className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group focus:ring-4 focus:outline-none transition-all ease-in duration-75 ${
                currentProjectIndex >= projects.length - 3
                  ? "cursor-not-allowed bg-gray-300 text-gray-500 dark:text-gray-400"
                  : "bg-gradient-to-br from-purple-600 to-blue-500 text-gray-900 dark:text-white hover:text-white group-hover:from-purple-600 group-hover:to-blue-500 dark:focus:ring-blue-800"
              }`}
              onClick={handleNextClick}
              disabled={currentProjectIndex >= projects.length - 3}
            >
              <span
                className={`relative px-5 py-2.5 rounded-md ${
                  currentProjectIndex < projects.length - 3
                    ? "bg-white dark:bg-gray-900 group-hover:bg-opacity-0"
                    : ""
                }`}
              >
                <FaChevronRight size={24} />
              </span>
            </button>
          </div>
        </div>
        {selectedProject && (
          <div>
            <h2 className="text-xl font-bold mb-4">Tasks</h2>
            <div className="flex gap-6 mb-8">
              <div className="w-full md:w-1/3 border-2 p-5 rounded-2xl bg-white">
                <h3 className="text-lg font-bold mb-2 text-center">Todo</h3>
                {tasks
                  .filter((task) => task.status === "Todo")
                  .map((task) => (
                    <div
                      key={task._id}
                      className=" shadow-md rounded-lg p-4 mb-4 border-2 bg-[#F5F7F8]"
                    >
                      <h4 className="text-lg font-semibold mb-2 text-red-500">
                        {task.name}
                      </h4>
                      <p className="text-gray-700 mb-2">{task.description}</p>
                      <p className="text-gray-700 mb-2 font-semibold">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                      <p className=" font-semibold text-black">
                        Assigned To: {task.assignedTo.fullName}
                      </p>
                      <button
                        className="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1 mt-2"
                        onClick={() =>
                          handleTaskStatusChange(task._id, "Doing")
                        }
                      >
                        Move to Doing
                      </button>
                    </div>
                  ))}
              </div>
              <div className="w-full md:w-1/3 border-2 p-5 rounded-2xl bg-white">
                <h3 className="text-lg font-bold mb-2 text-center">Doing</h3>
                {tasks
                  .filter((task) => task.status === "Doing")
                  .map((task) => (
                    <div
                      key={task._id}
                      className=" shadow-md rounded-lg p-4 mb-4 border-2 bg-[#F5F7F8]"
                    >
                      <h4 className="text-lg font-semibold mb-2 text-blue-500">
                        {task.name}
                      </h4>
                      <p className="text-gray-700 mb-2">{task.description}</p>
                      <p className="text-gray-700 mb-2 font-semibold">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                      <p className="font-semibold text-black">
                        Assigned To: {task.assignedTo.fullName}
                      </p>
                      <div className="flex gap-2">
                        <button
                          className="text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-1 mt-2"
                          onClick={() =>
                            handleTaskStatusChange(task._id, "Todo")
                          }
                        >
                          Move to Todo
                        </button>
                        <button
                          className="text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-3 py-1 mt-2"
                          onClick={() =>
                            handleTaskStatusChange(task._id, "Done")
                          }
                        >
                          Move to Done
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="w-full md:w-1/3 border-2 p-5 rounded-2xl bg-white">
                <h3 className="text-lg font-bold mb-2 text-center">Done</h3>
                {tasks
                  .filter((task) => task.status === "Done")
                  .map((task) => (
                    <div
                      key={task._id}
                      className=" shadow-md rounded-lg p-4 mb-4 border-2 bg-[#F5F7F8]"
                    >
                      <h4 className="text-lg font-semibold mb-2 text-green-500">
                        {task.name}
                      </h4>
                      <p className="text-gray-700 mb-2">{task.description}</p>
                      <p className="text-gray-700 mb-2 font-semibold">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                      <p className="font-semibold text-black">
                        Assigned To: {task.assignedTo.fullName}
                      </p>
                      <button
                        className="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1 mt-2"
                        onClick={() =>
                          handleTaskStatusChange(task._id, "Doing")
                        }
                      >
                        Move to Doing
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
