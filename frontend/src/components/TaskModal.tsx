'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Task, Team, TaskStatus, User } from '@/types';
import { X, CheckSquare, Sparkles, AlertCircle, User as UserIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  team: Team;
  taskToEdit?: Task | null;
  defaultStatus?: TaskStatus;
  onClose: () => void;
  onTaskSaved: (task: Task, isEdit: boolean) => void;
}

export default function TaskModal({
  isOpen,
  team,
  taskToEdit,
  defaultStatus = 'Pending',
  onClose,
  onTaskSaved,
}: Props) {
  const { user: currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
      setAssignedTo(taskToEdit.assigned_to ? taskToEdit.assigned_to.id : '');
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setAssignedTo('');
    }
    setError(null);
  }, [taskToEdit, defaultStatus, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (taskToEdit) {
        // Edit existing task
        const res = await api.patch(`/tasks/${taskToEdit.id}/`, {
          title: title.trim(),
          description: description.trim(),
          status,
          assigned_to: assignedTo || null,
        });
        onTaskSaved(res.data.task, true);
      } else {
        // Create new task
        const res = await api.post(`/teams/${team.id}/tasks/`, {
          title: title.trim(),
          description: description.trim(),
          status,
          assigned_to: assignedTo || null,
        });
        onTaskSaved(res.data.task, false);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.title?.[0] || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {taskToEdit ? 'Edit Task' : 'Create New Task'}
              </h3>
              <p className="text-xs text-slate-400">Team: <span className="text-slate-200">{team.name}</span></p>
            </div>
          </div>
          <button
            id="btn-close-task-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Task Title <span className="text-indigo-400">*</span>
            </label>
            <input
              id="input-task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement authentication middleware"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              id="input-task-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide technical context, acceptance criteria, or goals..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Status
              </label>
              <select
                id="select-task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Assign To
              </label>
              <select
                id="select-task-assignee"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                <option value="">Unassigned</option>
                {currentUser?.role === 'Admin' ? (
                  team.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))
                ) : (
                  currentUser && (
                    <option value={currentUser.id}>
                      Assign to Me ({currentUser.name})
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-task"
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
