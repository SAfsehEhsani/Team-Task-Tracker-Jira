'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Team, Task, TaskStatus } from '@/types';
import Navbar from '@/components/Navbar';
import KanbanBoard from '@/components/KanbanBoard';
import ActivityTimeline from '@/components/ActivityTimeline';
import TaskModal from '@/components/TaskModal';
import TaskDetailModal from '@/components/TaskDetailModal';
import InviteMemberModal from '@/components/InviteMemberModal';
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  ShieldCheck, 
  AlertCircle,
  MessageSquare,
  Sparkles,
  Layers
} from 'lucide-react';
import { getInitials, formatTimeAgo } from '@/lib/utils';

function TeamDetailContent() {
  const params = useParams();
  const teamId = params?.id as string;

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [team, setTeam] = useState<Team | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Views
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus>('Pending');
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchTeamAndTasks = async () => {
    try {
      setLoading(true);
      const [teamRes, tasksRes] = await Promise.all([
        api.get(`/teams/${teamId}/`),
        api.get(`/teams/${teamId}/tasks/`),
      ]);
      setTeam(teamRes.data.team);
      setTasks(tasksRes.data.tasks || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && teamId) {
      fetchTeamAndTasks();
    }
  }, [user, teamId]);

  // Handle Quick Move Status from Kanban Board
  const handleQuickMoveStatus = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    try {
      const res = await api.patch(`/tasks/${taskId}/`, {
        status: newStatus,
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? res.data.task : t))
      );
    } catch (err) {
      console.error('Failed to update task status', err);
      fetchTeamAndTasks();
    }
  };

  const handleOpenCreateTask = (status: TaskStatus = 'Pending') => {
    setTaskToEdit(null);
    setDefaultTaskStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleTaskSaved = (savedTask: Task, isEdit: boolean) => {
    if (isEdit) {
      setTasks((prev) =>
        prev.map((t) => (t.id === savedTask.id ? savedTask : t))
      );
      if (selectedTaskForDetail?.id === savedTask.id) {
        setSelectedTaskForDetail(savedTask);
      }
    } else {
      setTasks((prev) => [savedTask, ...prev]);
    }
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    setSelectedTaskForDetail(updatedTask);
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTaskForDetail(null);
  };

  if (loading && !team) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-[#070913] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied or Not Found</h2>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            {error || 'You do not have access to this team workspace.'}
          </p>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Filter tasks based on status, search, and assignee
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) {
      return false;
    }
    if (assigneeFilter === 'me' && t.assigned_to?.id !== user?.id) {
      return false;
    }
    if (assigneeFilter === 'unassigned' && t.assigned_to !== null) {
      return false;
    }
    if (
      assigneeFilter !== 'All' &&
      assigneeFilter !== 'me' &&
      assigneeFilter !== 'unassigned' &&
      t.assigned_to?.id !== assigneeFilter
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-indigo-400 transition-colors flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-semibold">{team.name}</span>
        </div>

        {/* Luminous Team Workspace Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0c1224] via-[#090e1d] to-[#070913] border border-white/[0.08] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Subtle Ambient Mesh Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {team.name}
                </h1>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                  {team.member_count} {team.member_count === 1 ? 'member' : 'members'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                {team.description || 'Workspace for task tracking, assignment, and updates.'}
              </p>
              <div className="flex items-center space-x-2 pt-1 text-xs text-slate-400">
                <span>Created by <strong className="text-slate-300 font-medium">{team.created_by?.name}</strong></span>
                <span>•</span>
                <span className="text-slate-500">{formatTimeAgo(team.created_at)}</span>
              </div>
            </div>

            {/* Team Actions & Avatar Cluster */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Member Avatars Stack (Admin Only) */}
              {isAdmin && (
                <div className="flex items-center space-x-2 pr-3 border-r border-white/[0.08]">
                  <div className="flex -space-x-2 overflow-hidden">
                    {team.members.map((m) => (
                      <div
                        key={m.id}
                        title={`${m.name} (${m.email})`}
                        className="inline-block h-8 w-8 rounded-full bg-slate-800 ring-2 ring-[#0c1224] text-[10px] font-bold text-slate-200 flex items-center justify-center cursor-default shadow-sm"
                      >
                        {getInitials(m.name)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invite Member (Admin Only) */}
              {isAdmin ? (
                <button
                  id="btn-invite-member"
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-purple-600/90 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add / Invite Members</span>
                </button>
              ) : (
                <div
                  className="px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-[11px] text-slate-400 flex items-center space-x-1.5 cursor-not-allowed"
                  title="Only Admins can invite new members to teams"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Admin-only Invites</span>
                </div>
              )}

              {/* Create Task Button */}
              <button
                id="btn-create-task-main"
                onClick={() => handleOpenCreateTask('Pending')}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-3xl bg-[#0b101d]/80 border border-white/[0.08] backdrop-blur-xl">
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['All', 'Pending', 'In Progress', 'Done'] as const).map((st) => {
              const count = st === 'All' ? tasks.length : tasks.filter((t) => t.status === st).length;
              const isActive = statusFilter === st;

              return (
                <button
                  key={st}
                  id={`btn-filter-status-${st.toLowerCase().replace(' ', '-')}`}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-2 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <span>{st === 'Done' ? 'Completed' : st}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-700 text-white' : 'bg-white/[0.08] text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search, Assignee filter & View Mode */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="w-full sm:w-48 relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                id="input-search-tasks"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-8 pr-3 py-1.5 rounded-2xl bg-black/40 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Assignee Filter Dropdown */}
            <select
              id="select-filter-assignee"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-3.5 py-1.5 rounded-2xl bg-black/40 border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="All">All Assignees</option>
              <option value="me">Assigned to Me</option>
              <option value="unassigned">Unassigned</option>
              {isAdmin && team.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-2xl bg-black/40 border border-white/[0.08]">
              <button
                id="btn-view-kanban"
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
                title="Kanban Board View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                id="btn-view-list"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
                title="Table List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Work Area: Left (Board/List) + Right (Timeline) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Tasks Column (8 Cols on large) */}
          <div className="lg:col-span-8 space-y-4">
            {viewMode === 'kanban' ? (
              <KanbanBoard
                tasks={filteredTasks}
                onTaskClick={(task) => setSelectedTaskForDetail(task)}
                onAddTaskToColumn={(status) => handleOpenCreateTask(status)}
                onQuickMoveStatus={handleQuickMoveStatus}
              />
            ) : (
              /* High-Density Table List View */
              <div className="rounded-3xl bg-[#0b101d]/85 border border-white/[0.08] overflow-hidden shadow-2xl backdrop-blur-xl">
                <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-black/20">
                  <h3 className="text-sm font-bold text-white">Tasks List ({filteredTasks.length})</h3>
                  <button
                    onClick={() => handleOpenCreateTask('Pending')}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    + Add Task
                  </button>
                </div>
                <div className="divide-y divide-white/[0.06]">
                  {filteredTasks.length === 0 ? (
                    <div className="py-14 text-center text-xs text-slate-500">
                      No matching tasks found.
                    </div>
                  ) : (
                    filteredTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTaskForDetail(t)}
                        className="p-4 hover:bg-white/[0.03] transition-colors cursor-pointer flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2.5">
                            <h4 className="text-sm font-semibold text-slate-200 truncate">{t.title}</h4>
                            <span
                              className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                                t.status === 'Done'
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  : t.status === 'In Progress'
                                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>
                          {t.description && (
                            <p className="text-xs text-slate-400 truncate mt-1">{t.description}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 shrink-0">
                          {t.comment_count > 0 && (
                            <div className="flex items-center space-x-1 text-slate-400 text-xs">
                              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{t.comment_count}</span>
                            </div>
                          )}
                          <div className="text-right">
                            <p className="text-xs text-slate-300 font-medium">
                              {t.assigned_to ? t.assigned_to.name : 'Unassigned'}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">{formatTimeAgo(t.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Activity Timeline Column (4 Cols on large) */}
          <div className="lg:col-span-4 h-[650px] sticky top-20">
            <ActivityTimeline teamId={teamId} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        team={team}
        taskToEdit={taskToEdit}
        defaultStatus={defaultTaskStatus}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskSaved={handleTaskSaved}
      />

      <TaskDetailModal
        isOpen={!!selectedTaskForDetail}
        task={selectedTaskForDetail}
        team={team}
        onClose={() => setSelectedTaskForDetail(null)}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
        onEditRequest={(t) => {
          setSelectedTaskForDetail(null);
          setTaskToEdit(t);
          setIsTaskModalOpen(true);
        }}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        team={team}
        onClose={() => setIsInviteModalOpen(false)}
        onMemberInvited={(updatedTeam) => setTeam(updatedTeam)}
      />
    </div>
  );
}

export default function TeamDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070913] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TeamDetailContent />
    </Suspense>
  );
}
