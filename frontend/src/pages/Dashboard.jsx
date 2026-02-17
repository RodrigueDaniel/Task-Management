import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch {
      toast.error("Failed to fetch tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add Task
  const handleAddTask = async () => {
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      setLoading(true);

      await API.post("/tasks", {
        title,
        description,
      });

      toast.success("Task added");
      setTitle("");
      setDescription("");
      fetchTasks();
    } catch {
      toast.error("Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  // Update Status
  const handleStatusChange = async (task) => {
    let nextStatus;

    if (task.status === "PENDING") nextStatus = "IN_PROGRESS";
    else if (task.status === "IN_PROGRESS") nextStatus = "COMPLETED";
    else nextStatus = "PENDING";

    try {
      await API.patch(`/tasks/${task.id}`, {
        status: nextStatus,
      });

      toast.success("Status updated");
      fetchTasks();
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Delete Task
  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      toast.success("Task deleted");
      fetchTasks();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      toast.success("Logged out successfully");
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
  const pendingTasks = tasks.filter(t => t.status !== "COMPLETED").length;

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6 hidden md:block">
        <h2 className="text-2xl font-bold text-green-600 mb-8">
          TaskFlow
        </h2>
      </div>

      {/* Main */}
      <div className="flex-1 p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome Back 👋
          </h1>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">Total Tasks</h3>
            <p className="text-2xl font-bold">{totalTasks}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">Completed</h3>
            <p className="text-2xl font-bold text-green-600">
              {completedTasks}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">Pending</h3>
            <p className="text-2xl font-bold text-yellow-500">
              {pendingTasks}
            </p>
          </div>
        </div>

        {/* Add Task */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Task</h2>

          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description (optional)"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />

            <button
              onClick={handleAddTask}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Task"}
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">My Tasks</h2>

          {tasks.length === 0 && (
            <p className="text-gray-500 text-center">
              No tasks yet. Add your first task
            </p>
          )}

          <ul className="space-y-4">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="bg-gray-50 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{task.title}</p>
                  {task.description && (
                    <p className="text-sm text-gray-500">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">

                  {/* Status Badge */}
                  <span
                    onClick={() => handleStatusChange(task)}
                    className={`cursor-pointer px-3 py-1 rounded-full text-sm font-medium transition ${
                      task.status === "COMPLETED"
                        ? "bg-green-100 text-green-600"
                        : task.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {task.status}
                  </span>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>

                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;