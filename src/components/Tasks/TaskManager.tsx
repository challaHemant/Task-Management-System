import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useTask } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { TaskDetails } from './TaskDetails';
import { ConfirmDialog } from './ConfirmDialog';

interface TaskManagerProps {
  view: string;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ view }) => {
  const { tasks, addTask, updateTask, deleteTask } = useTask();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<Task['status'] | 'all'>('all');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by view
    switch (view) {
      case 'high-priority':
        filtered = filtered.filter(task => task.priority === 'high');
        break;
      case 'in-progress':
        filtered = filtered.filter(task => task.status === 'in-progress');
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === 'completed');
        break;
      default:
        // Show user's tasks if not admin, all tasks if admin
        if (user?.role !== 'admin') {
          filtered = filtered.filter(task => task.assignedTo === user?.id);
        }
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    return filtered.sort((a, b) => {
      // Sort by priority first (high -> medium -> low)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      // Then by due date (earliest first)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks, view, user, searchTerm, filterStatus]);

  const getViewTitle = () => {
    switch (view) {
      case 'high-priority': return 'High Priority Tasks';
      case 'in-progress': return 'Tasks In Progress';
      case 'completed': return 'Completed Tasks';
      default: return 'All Tasks';
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowForm(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowForm(true);
    setShowDetails(false);
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setShowDetails(true);
  };

  const handleSaveTask = (taskData: any) => {
    if (selectedTask) {
      updateTask(selectedTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setShowForm(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    updateTask(taskId, { status });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getViewTitle()}</h1>
          <p className="text-gray-600 mt-1">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <button
          onClick={handleCreateTask}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center font-medium shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as Task['status'] | 'all')}
                className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
              onView={handleViewTask}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tasks found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your filters to see more tasks.'
              : 'Get started by creating your first task.'}
          </p>
          {(!searchTerm && filterStatus === 'all') && (
            <button
              onClick={handleCreateTask}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
            >
              Create Task
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <TaskForm
          task={selectedTask || undefined}
          onSave={handleSaveTask}
          onCancel={() => {
            setShowForm(false);
            setSelectedTask(null);
          }}
          isEditing={!!selectedTask}
        />
      )}

      {showDetails && selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={() => {
            setShowDetails(false);
            setSelectedTask(null);
          }}
          onEdit={handleEditTask}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        type="danger"
      />
    </div>
  );
};