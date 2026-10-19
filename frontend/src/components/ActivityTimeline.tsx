'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Activity } from '@/types';
import { 
  Activity as ActivityIcon, 
  RotateCw, 
  PlusCircle, 
  MessageSquare, 
  UserPlus, 
  UserMinus, 
  Trash2, 
  Edit3,
  Shield,
  ArrowRightLeft,
  Sparkles,
  Radio
} from 'lucide-react';
import { formatTimeAgo, getInitials } from '@/lib/utils';

interface Props {
  teamId: string;
}

export default function ActivityTimeline({ teamId }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLivePolling, setIsLivePolling] = useState(true);

  const fetchActivities = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await api.get(`/teams/${teamId}/timeline/`);
      setActivities(res.data.activities || []);
    } catch (err) {
      console.error('Failed to fetch timeline activities', err);
    } finally {
      setLoading(false);
      if (!silent) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    if (!isLivePolling) return;

    // Polling every 5 seconds for real-time live updates
    const interval = setInterval(() => {
      fetchActivities(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [teamId, isLivePolling]);

  const getActionDetails = (actionType: string) => {
    switch (actionType) {
      case 'status_changed':
        return {
          icon: <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />,
          glow: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
          dot: 'bg-blue-400',
        };
      case 'task_created':
        return {
          icon: <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />,
          glow: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
          dot: 'bg-emerald-400',
        };
      case 'comment_added':
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-purple-400" />,
          glow: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
          dot: 'bg-purple-400',
        };
      case 'member_invited':
        return {
          icon: <UserPlus className="w-3.5 h-3.5 text-indigo-400" />,
          glow: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
          dot: 'bg-indigo-400',
        };
      case 'member_removed':
        return {
          icon: <UserMinus className="w-3.5 h-3.5 text-rose-400" />,
          glow: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
          dot: 'bg-rose-400',
        };
      case 'team_created':
        return {
          icon: <Shield className="w-3.5 h-3.5 text-amber-400" />,
          glow: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
          dot: 'bg-amber-400',
        };
      case 'task_deleted':
        return {
          icon: <Trash2 className="w-3.5 h-3.5 text-rose-400" />,
          glow: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
          dot: 'bg-rose-400',
        };
      default:
        return {
          icon: <Edit3 className="w-3.5 h-3.5 text-slate-400" />,
          glow: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
          dot: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="flex flex-col h-full rounded-3xl bg-[#0b101d]/85 border border-white/[0.08] shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Header with live pulse */}
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-black/20">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shadow-inner">
            <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Activity Stream
            </h3>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isLivePolling ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span className="text-[10px] text-slate-400 font-medium">
                {isLivePolling ? 'Live Polling (5s)' : 'Live Paused'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            id="btn-toggle-live-polling"
            onClick={() => setIsLivePolling(!isLivePolling)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              isLivePolling 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20' 
                : 'bg-white/[0.05] text-slate-400 hover:text-white border border-white/[0.05]'
            }`}
          >
            {isLivePolling ? 'Active' : 'Paused'}
          </button>
          <button
            id="btn-refresh-timeline"
            onClick={() => fetchActivities(false)}
            disabled={refreshing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Refresh Timeline"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Timeline Stream with vertical glowing track */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3">
                <div className="w-7 h-7 rounded-full bg-slate-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-800 rounded w-3/4" />
                  <div className="h-2 bg-slate-800/60 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-14 text-slate-500 text-xs">
            <ActivityIcon className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-50" />
            <p className="font-medium text-slate-400">No activity logged yet</p>
            <p className="text-[11px] text-slate-500 mt-1">Actions on tasks & members will appear here live.</p>
          </div>
        ) : (
          <div className="relative pl-3 space-y-4 before:absolute before:left-6 before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-indigo-500/40 before:via-purple-500/20 before:to-transparent">
            {activities.map((act) => {
              const details = getActionDetails(act.action_type);

              return (
                <div key={act.id} className="relative flex items-start space-x-3 group">
                  {/* Glowing Node Icon Pill */}
                  <div className={`relative z-10 w-7 h-7 rounded-full border flex items-center justify-center shrink-0 shadow-lg ${details.glow}`}>
                    {details.icon}
                  </div>

                  {/* Activity Event Card */}
                  <div className="flex-1 min-w-0 p-3 rounded-2xl bg-[#0e1424]/90 border border-white/[0.07] group-hover:border-indigo-500/30 group-hover:shadow-md group-hover:shadow-indigo-500/5 transition-all">
                    <p className="text-xs text-slate-200 leading-snug font-normal">
                      {act.message}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-300 flex items-center space-x-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${details.dot}`} />
                        <span>{act.user_name}</span>
                      </span>
                      <span className="text-slate-500 font-mono">
                        {formatTimeAgo(act.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
