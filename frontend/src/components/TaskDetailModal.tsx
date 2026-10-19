'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Task, Team, TaskStatus, TaskComment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { 
  X, 
  MessageSquare, 
  Send, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  Clock3, 
  AlertCircle, 
  Trash2, 
  Edit3,
  Layers
} from 'lucide-react';
import { formatDateTime, formatTimeAgo, getInitials } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  task: Task | null;
  team: Team;
  onClose: () => void;
  onTaskUpdated: (updatedTask: Task) => void;
  onTaskDeleted: (taskId: string) => void;
  onEditRequest: (task: Task) => void;
}

export default function TaskDetailModal({
  isOpen,
  task,
  team,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
  onEditRequest,
}: Props) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !task) return null;

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === task.status) return;
    setStatusLoading(true);
    setError(null);
    try {
      const res = await api.patch(`/tasks/${task.id}/`, {
        status: newStatus,
      });
      onTaskUpdated(res.data.task);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommentLoading(true);
    setError(null);
    try {
      const res = await api.post(`/tasks/${task.id}/comments/`, {
        text: commentText.trim(),
      });
      onTaskUpdated(res.data.task);
      setCommentText('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      return;
    }
    setDeleteLoading(true);
    setError(null);
    try {
      await api.delete(`/tasks/${task.id}/`);
      onTaskDeleted(task.id);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete task');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Done':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Done
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Clock3 className="w-3.5 h-3.5" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            {getStatusBadge(task.status)}
            <span className="text-xs text-slate-400 font-mono">
              ID: {task.id.slice(-6)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-edit-task"
              onClick={() => onEditRequest(task)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Edit Task"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              id="btn-delete-task"
              onClick={handleDeleteTask}
              disabled={deleteLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              id="btn-close-detail-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Title & Description */}
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {task.title}
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {task.description || <span className="text-slate-500 italic">No description provided.</span>}
            </p>
          </div>

          {/* Metadata Row & Quick Status Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Assigned To</p>
              <div className="mt-1.5 flex items-center space-x-2">
                {task.assigned_to ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {getInitials(task.assigned_to.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{task.assigned_to.name}</p>
                      <p className="text-[10px] text-slate-400">{task.assigned_to.email}</p>
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-slate-500 italic">Unassigned</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Created By</p>
              <div className="mt-1.5 flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-medium text-slate-300">
                  {getInitials(task.created_by?.name || 'User')}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{task.created_by?.name || 'Unknown'}</p>
                  <p className="text-[10px] text-slate-400">{formatTimeAgo(task.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Status Toggles */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Update Status (Logs to Timeline)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Pending', 'In Progress', 'Done'] as TaskStatus[]).map((st) => {
                const isActive = task.status === st;
                return (
                  <button
                    key={st}
                    disabled={statusLoading}
                    onClick={() => handleStatusChange(st)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                      isActive
                        ? st === 'Done'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30'
                          : st === 'In Progress'
                          ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                          : 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/30'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comments Section (Bonus points) */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                  Task Discussion ({task.comments?.length || 0})
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">Every comment triggers timeline logs</span>
            </div>

            {/* Comments List */}
            <div className="space-y-3 mb-4">
              {!task.comments || task.comments.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-center text-xs text-slate-500">
                  No comments yet. Start the conversation below!
                </div>
              ) : (
                task.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] flex items-center justify-center">
                          {getInitials(comment.user_name)}
                        </div>
                        <span className="font-semibold text-xs text-slate-200">
                          {comment.user_name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 pl-7 whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input Box */}
            <form onSubmit={handleAddComment} className="flex items-center space-x-2">
              <input
                id="input-comment-text"
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment or update..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <button
                id="btn-submit-comment"
                type="submit"
                disabled={commentLoading || !commentText.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center space-x-1.5 shrink-0"
              >
                {commentLoading ? (
                  <span>Posting...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
