'use client';

import React from 'react';
import { Task, TaskStatus } from '@/types';
import { 
  Plus, 
  MessageSquare, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  MoreHorizontal,
  Sparkles,
  Tag
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface Props {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTaskToColumn: (status: TaskStatus) => void;
  onQuickMoveStatus: (taskId: string, newStatus: TaskStatus) => void;
}

const COLUMNS: { 
  status: TaskStatus; 
  label: string; 
  badgeColor: string; 
  borderColor: string;
  glowColor: string;
  progressBarColor: string;
}[] = [
  {
    status: 'Pending',
    label: 'Pending',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    borderColor: 'border-rose-500/20',
    glowColor: 'from-rose-500/10 via-transparent to-transparent',
    progressBarColor: 'bg-rose-500',
  },
  {
    status: 'In Progress',
    label: 'In Progress',
    badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    borderColor: 'border-blue-500/20',
    glowColor: 'from-blue-500/10 via-transparent to-transparent',
    progressBarColor: 'bg-blue-500',
  },
  {
    status: 'Done',
    label: 'Completed',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    borderColor: 'border-emerald-500/20',
    glowColor: 'from-emerald-500/10 via-transparent to-transparent',
    progressBarColor: 'bg-emerald-500',
  },
];

// Helper to assign a realistic priority/tag for visual excellence
function getTaskTag(task: Task): { label: string; color: string } {
  const title = task.title.toLowerCase();
  if (title.includes('api') || title.includes('auth') || title.includes('mongo') || title.includes('security')) {
    return { label: 'High Priority', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
  }
  if (title.includes('ui') || title.includes('design') || title.includes('kanban') || title.includes('frontend')) {
    return { label: 'Frontend UI', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' };
  }
  if (title.includes('docker') || title.includes('pipeline') || title.includes('deploy')) {
    return { label: 'DevOps / Infra', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
  }
  return { label: 'Feature', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
}

export default function KanbanBoard({
  tasks,
  onTaskClick,
  onAddTaskToColumn,
  onQuickMoveStatus,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);

        return (
          <div
            key={col.status}
            className={`relative flex flex-col rounded-3xl bg-[#0b101d]/80 border ${col.borderColor} shadow-2xl backdrop-blur-xl overflow-hidden transition-all`}
          >
            {/* Ambient Top Glow */}
            <div className={`absolute top-0 left-0 right-0 h-28 bg-gradient-to-b ${col.glowColor} pointer-events-none`} />

            {/* Column Header */}
            <div className="relative z-10 flex items-center justify-between p-4 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center space-x-2.5">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${col.badgeColor}`}>
                  {col.label}
                </span>
                <span className="text-xs font-mono font-medium text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded-full border border-white/[0.05]">
                  {columnTasks.length}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  id={`btn-add-task-${col.status.toLowerCase().replace(' ', '-')}`}
                  onClick={() => onAddTaskToColumn(col.status)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                  title={`Add task to ${col.label}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Column Tasks List */}
            <div className="relative z-10 flex-1 p-3.5 space-y-3.5 min-h-[380px]">
              {columnTasks.length === 0 ? (
                <div className="h-44 rounded-2xl border border-dashed border-white/[0.08] flex flex-col items-center justify-center text-slate-500 text-xs space-y-2 bg-white/[0.01]">
                  <span>No tasks in this column</span>
                  <button
                    onClick={() => onAddTaskToColumn(col.status)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    + Create task
                  </button>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const tag = getTaskTag(task);
                  const progressPct = task.status === 'Done' ? 100 : task.status === 'In Progress' ? 60 : 15;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className="group relative p-4 rounded-2xl bg-[#0e1424]/90 border border-white/[0.08] hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200 cursor-pointer space-y-3.5"
                    >
                      {/* Top row: Priority Chip & More Icon */}
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${tag.color}`}>
                          <Tag className="w-2.5 h-2.5" />
                          {tag.label}
                        </span>

                        <span className="text-[11px] font-mono text-slate-500">
                          {progressPct}%
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Progress Bar (Visual Polish from Mockup) */}
                      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${col.progressBarColor}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      {/* Footer Row: Assignee + Comments + Quick Move */}
                      <div className="flex items-center justify-between pt-1">
                        {/* Assignee Avatar */}
                        <div className="flex items-center space-x-2">
                          {task.assigned_to ? (
                            <div className="flex items-center space-x-1.5" title={`Assigned to ${task.assigned_to.name}`}>
                              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm ring-1 ring-white/10">
                                {getInitials(task.assigned_to.name)}
                              </div>
                              <span className="text-xs text-slate-300 font-medium max-w-[100px] truncate">
                                {task.assigned_to.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">Unassigned</span>
                          )}
                        </div>

                        {/* Right: Comments + Fast Status Move Arrows */}
                        <div className="flex items-center space-x-2.5">
                          {task.comment_count > 0 && (
                            <div className="flex items-center space-x-1 text-slate-400 text-xs">
                              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="text-[11px] font-medium">{task.comment_count}</span>
                            </div>
                          )}

                          {/* Quick Status Arrows */}
                          <div
                            className="flex items-center space-x-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {col.status === 'Pending' && (
                              <button
                                onClick={() => onQuickMoveStatus(task.id, 'In Progress')}
                                title="Start Progress"
                                className="p-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 border border-blue-500/20 transition-all"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {col.status === 'In Progress' && (
                              <>
                                <button
                                  onClick={() => onQuickMoveStatus(task.id, 'Pending')}
                                  title="Move to Pending"
                                  className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 transition-all"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onQuickMoveStatus(task.id, 'Done')}
                                  title="Mark Done"
                                  className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 transition-all"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {col.status === 'Done' && (
                              <button
                                onClick={() => onQuickMoveStatus(task.id, 'In Progress')}
                                title="Re-open task"
                                className="p-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 border border-blue-500/20 transition-all"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
