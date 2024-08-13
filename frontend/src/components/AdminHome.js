import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import { Link } from "react-router-dom";
import { alertContext } from "../context/alertContext";
import LoadingUi from "./LoadingUi";
import { MdDelete } from "react-icons/md";
import {jwtDecode} from "jwt-decode";

export default function AdminHome() {
  const [projects, setProjects] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    deadline: "",
    assignedTo: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = useContext(alertContext);

  useEffect(() => {
    // const role = Cookie.get("role");
    const token = Cookie.get("accessToken");
      const decodedToken = jwtDecode(token);
      const role = decodedToken.role
    if (role === "member") {
      navigate("/");
    } else if (role === "teamLead") {
      navigate("/home");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const response = await axios.get("http://localhost:4000/api/project/getprojects");
      const projectsWithTasks = await Promise.all(
        response.data.map(async (project) => {
          const tasksResponse = await axios.get(`http://localhost:4000/api/task/${project._id}`);
          project.tasks = tasksResponse.data;
          return project;
        })
      );
      setLoading(false);
      setProjects(projectsWithTasks);
    };

    const fetchTeamLeads = async () => {
      const response = await axios.get("http://localhost:4000/api/user/teamleads");
      setTeamLeads(response.data);
    };

    fetchProjects();
    fetchTeamLeads();
  }, []);

  useEffect(() => {
    if (!Cookie.get("accessToken")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:4000/api/project/createproject", newProject);
    setNewProject({ name: "", description: "", deadline: "", assignedTo: "" });
    const response = await axios.get("http://localhost:4000/api/project/getprojects");
    const projectsWithTasks = await Promise.all(
      response.data.map(async (project) => {
        const tasksResponse = await axios.get(`http://localhost:4000/api/task/${project._id}`);
        project.tasks = tasksResponse.data;
        return project;
      })
    );
    setProjects(projectsWithTasks);
    setIsModalOpen(false);
    showAlert("Project created successfully");
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setNewProject((newProject) => ({ ...newProject, [name]: value }));
  };

  const handleSortByDeadline = () => {
    const sortedProjects = [...projects].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    setProjects(sortedProjects);
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`http://localhost:4000/api/project/delete/${projectId}`);
      setProjects(projects.filter((project) => project._id !== projectId));
      showAlert("Project deleted successfully");
    } catch (error) {
      showAlert("Failed to delete project");
    }
  };

  return loading ? (
    <LoadingUi />
  ) : (
    <div className="">
      <div className="container mx-auto mt-8 max-w-screen-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Admin Dashboard</h1>
        <div className="mb-4 flex justify-between">
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => setIsModalOpen(true)}
          >
            Add a New Project
          </button>
          <button
            className="text-white mr-9 bg-green-700 hover:bg-green-800 disabled:cursor-not-allowed focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={handleSortByDeadline}
            disabled={projects.length===0}
          >
            Sort by Deadline
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {projects.map((project) => {
            const totalTasks = project.tasks.length;
            const completedTasks = project.tasks.filter((task) => task.status === "Done").length;
            const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            return (
              <div className="relative max-w-sm p-6 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 bg-[#F5F7F8] hover:scale-105" key={project._id}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteProject(project._id);
                  }}
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                >
                  <MdDelete size={20  }/>
                </button>
                <Link to={`/project/${project._id}`}>
                  <h2 className="mb-2 text-2xl font-bold tracking-tight text-red-600 dark:text-white text-center">
                    {project.name}
                  </h2>
                  <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                    {project.description}
                  </p>
                  <p className="my-1">
                    <span className="font-semibold">Deadline: </span>{" "}
                    {new Date(project.deadline).toLocaleDateString()}
                  </p>
                  <p className="my-1">
                    <span className="font-semibold">Assigned To: </span>{" "}
                    <span className="text-blue-500">{project.assignedTo.fullName}</span>
                  </p>
                  <p className="my-1">
                    <span className="font-semibold">Role: </span>{" "}
                    <span>{project.assignedTo.role === "teamLead" && "Team Lead"}</span>
                  </p>
                  <p className="my-1">
                    <span className="font-semibold text-black">Completion: </span>{" "}
                    {completionPercentage.toFixed(2)}%
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
                </Link>
              </div>
            );
          })}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center mt-10">
            <div className="relative bg-white w-full max-w-lg mx-auto rounded-lg shadow-lg p-6">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 border-gray-700"
                onClick={() => setIsModalOpen(false)}
              >
                &#10005;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">Create a New Project</h2>
              <form onSubmit={handleCreateProject}>
                <div className="mb-5">
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Project Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={newProject.name}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    onChange={handleOnChange}
                    required
                  />
                </div>
                <div className="mb-5">
                  <label
                    htmlFor="description"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Description <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={newProject.description}
                    onChange={handleOnChange}
                    required
                  ></textarea>
                </div>
                <div className="mb-5">
                  <label
                    htmlFor="deadline"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Deadline <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    id="deadline"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={newProject.deadline}
                    onChange={handleOnChange}
                    required
                  />
                </div>
                <div className="mb-5">
                  <label
                    htmlFor="assignedTo"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Assigned To <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="assignedTo"
                    name="assignedTo"
                    value={newProject.assignedTo}
                    onChange={handleOnChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                  >
                    <option value="">Select Team Lead</option>
                    {teamLeads.map((lead) => (
                      <option key={lead._id} value={lead._id}>
                        {lead.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Create Project
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
