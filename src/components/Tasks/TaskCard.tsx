import React from 'react';
import { Calendar, User, Edit, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Task } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onView: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onView
}) => {
  const { users } = useAuth();
  const assignedUser = users.find(u => u.id === task.assignedTo);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-orange-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-gray-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 
              className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors duration-200"
              onClick={() => onView(task)}
            >
              {task.title}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {task.description}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </span>
          
          <div className="flex items-center text-sm text-gray-600">
            {getStatusIcon(task.status)}
            <span className="ml-1 capitalize">{task.status.replace('-', ' ')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              {new Date(task.dueDate).toLocaleDateString()}
              {isOverdue && ' (Overdue)'}
            </span>
          </div>
          
          {assignedUser && (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{assignedUser.name}</span>
            </div>
          )}
        </div>

        {task.status !== 'completed' && (
          <div className="mt-4 flex space-x-2">
            {task.status === 'pending' && (
              <button
                onClick={() => onStatusChange(task.id, 'in-progress')}
                className="flex-1 bg-orange-100 text-orange-700 py-2 px-3 rounded-lg hover:bg-orange-200 transition-colors duration-200 text-sm font-medium"
              >
                Start Task
              </button>
            )}
            
            <button
              onClick={() => onStatusChange(task.id, 'completed')}
              className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
            >
              Mark Complete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};