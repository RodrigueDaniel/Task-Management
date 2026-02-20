import { useEffect, useState } from "react";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 border-blue-300",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-100 text-green-700 border-green-300",
  },
};

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // NEW: State to control the loading indicator for the edit modal
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Day 9 Requirement
  const [filterStatus, setFilterStatus] = useState("ALL");
  
  // State to control the visibility of the logout confirmation modal
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch {
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // CREATE
  const handleCreateTask = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      return toast.error("Task title cannot be empty");
    }

    const isDuplicate = tasks.some(
      (task) => task.title.toLowerCase() === trimmedTitle.toLowerCase()
    );

    if (isDuplicate) {
      return toast.error("Task with this title already exists");
    }

    try {
      setCreating(true);
      const res = await api.post("/tasks", {
        title: trimmedTitle,
        description: trimmedDescription || undefined,
      });

      setTasks((prev) => [res.data.task, ...prev]);
      setTitle("");
      setDescription("");
      toast.success("Task created");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  // DELETE
  const handleDelete = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  // UPDATE STATUS
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  // EDIT SAVE
  const handleUpdateTask = async () => {
    if (!editingTask.title.trim()) {
      return toast.error("Title cannot be empty");
    }

    try {
      setIsUpdating(true); // Start loading state
      await api.put(`/tasks/${editingTask.id}`, {
        title: editingTask.title,
        description: editingTask.description,
      });

      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTask.id ? editingTask : task
        )
      );

      setEditingTask(null);
      toast.success("Task updated");
    } catch {
      toast.error("Failed to update task");
    } finally {
      setIsUpdating(false); // End loading state
    }
  };

  // LOGOUT (Actual action)
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  // Filter tasks based on selected status
  const filteredTasks = tasks.filter((task) =>
    filterStatus === "ALL" ? true : task.status === filterStatus
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Task Manager 📋
          </h1>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* CREATE TASK CARD */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Create New Task
          </h2>

          <form onSubmit={handleCreateTask} className="space-y-3">
            <input
              type="text"
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              placeholder="Description (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={creating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 w-full sm:w-auto transition flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : "Add Task"}
            </button>
          </form>
        </div>

        {/* TASK FILTERING UI */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filterStatus === "ALL"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-600 border shadow-sm hover:bg-gray-50"
            }`}
          >
            All Tasks
          </button>
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition border shadow-sm ${
                filterStatus === key
                  ? config.color
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* TASK LIST */}
        <div className="grid gap-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow text-center text-gray-500">
              {tasks.length === 0 
                ? "No tasks yet. Create your first task 🎯" 
                : "No tasks found for this filter."}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  {/* LEFT CONTENT */}
                  <div className="flex-1 w-full">
                    <h3 className="text-lg font-bold text-gray-800">
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-gray-600 mt-1">
                        {task.description}
                      </p>
                    )}

                    {/* STATUS BUTTON GROUP */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {Object.keys(statusConfig).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(task.id, status)}
                          className={`px-3 py-1 text-xs border rounded-full transition ${
                            task.status === status
                              ? statusConfig[status].color
                              : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {statusConfig[status].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-3 sm:gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600 hover:underline text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-40">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Task</h2>

            <input
              type="text"
              value={editingTask.title}
              onChange={(e) =>
                setEditingTask({ ...editingTask, title: e.target.value })
              }
              className="w-full border px-4 py-2 rounded-xl mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isUpdating}
            />

            <textarea
              rows={3}
              value={editingTask.description || ""}
              onChange={(e) =>
                setEditingTask({
                  ...editingTask,
                  description: e.target.value,
                })
              }
              className="w-full border px-4 py-2 rounded-xl mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isUpdating}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingTask(null)}
                className="px-5 py-2 rounded-xl border font-medium text-gray-700 hover:bg-gray-50 transition"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTask}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-xl transition flex items-center justify-center gap-2 min-w-25 disabled:opacity-70"
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl transform transition-all">
            <div className="text-center">
              {/* Icon Container */}
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
                <span className="text-2xl">🚪</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Ready to leave?
              </h3>
              
              <p className="text-gray-500 mb-6 px-2">
                Are you sure you want to log out of your account?
              </p>
              
              {/* Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 shadow-md shadow-red-500/30 transition duration-200"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;