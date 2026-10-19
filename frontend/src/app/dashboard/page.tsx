'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Team } from '@/types';
import Navbar from '@/components/Navbar';
import CreateTeamModal from '@/components/CreateTeamModal';
import { 
  Users, 
  Plus, 
  ArrowRight, 
  FolderGit2, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  Layers,
  Sparkles,
  Search,
  Activity,
  Kanban
} from 'lucide-react';
import { getInitials, formatTimeAgo } from '@/lib/utils';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams/');
      setTeams(res.data.teams || []);
    } catch (err) {
      console.error('Failed to fetch teams', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Luminous Hero Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1428] via-[#090e1f] to-[#070913] border border-white/[0.08] p-8 sm:p-10 shadow-2xl">
          {/* Background Ambient Aura */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Workspace Overview
                </span>
                {user?.role === 'Admin' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    Admin Access
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Team Member
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.name}
              </h1>
              <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                Track assigned tasks, collaborate with team members, and observe real-time chronologies across your active workspaces.
              </p>
            </div>

            {/* Action CTA */}
            <div className="flex items-center space-x-3 shrink-0">
              {user?.role === 'Admin' ? (
                <div className="flex items-center space-x-2.5">
                  <Link
                    id="btn-manage-users-dashboard"
                    href="/users"
                    className="px-4 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 hover:text-white font-semibold text-xs sm:text-sm transition-all flex items-center space-x-2"
                  >
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>Manage Users</span>
                  </Link>
                  <button
                    id="btn-create-team-dashboard"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Team</span>
                  </button>
                </div>
              ) : (
                <div className="px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span>Member Access Active</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0b101d]/80 border border-white/[0.07] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Teams</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mt-2 font-mono">{teams.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Active workspaces</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0b101d]/80 border border-white/[0.07] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Your Role</span>
              <div className={`p-2 rounded-xl ${user?.role === 'Admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {user?.role === 'Admin' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              </div>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{user?.role}</p>
            <p className="text-[11px] text-slate-500 mt-1">{user?.role === 'Admin' ? 'Can manage & invite' : 'Task collaborator'}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0b101d]/80 border border-white/[0.07] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Live Polling</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-2 font-mono">5s</p>
            <p className="text-[11px] text-slate-500 mt-1">Timeline refresh rate</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0b101d]/80 border border-white/[0.07] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Storage</span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mt-2">MongoDB</p>
            <p className="text-[11px] text-slate-500 mt-1">MongoEngine ODM</p>
          </div>
        </div>

        {/* Teams Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <Kanban className="w-5 h-5 text-indigo-400" />
              <span>Assigned Workspaces ({filteredTeams.length})</span>
            </h2>
            <p className="text-xs text-slate-400">Select a team to view tasks and live activity stream</p>
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              id="input-search-teams"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspaces..."
              className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-[#0b101d] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-[#0b101d] border border-white/[0.06] animate-pulse" />
            ))}
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-[#0b101d]/60 border border-white/[0.06] p-8 space-y-4">
            <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-300">No teams found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchQuery
                ? 'No workspaces match your search keyword.'
                : user?.role === 'Admin'
                ? 'Get started by creating your first team workspace.'
                : 'You have not been added to any team yet. Contact your team Admin.'}
            </p>
            {user?.role === 'Admin' && !searchQuery && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Team</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team, idx) => {
              // Alternate gradient icons for richness
              const gradients = [
                'from-indigo-600 to-purple-600',
                'from-purple-600 to-pink-600',
                'from-cyan-600 to-blue-600',
                'from-emerald-600 to-teal-600',
              ];
              const gradient = gradients[idx % gradients.length];

              return (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="group flex flex-col justify-between p-6 rounded-3xl bg-[#0b101d]/85 border border-white/[0.08] hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Subtle hover aura */}
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl group-hover:opacity-100 opacity-0 transition-opacity" />

                  <div>
                    <div className="flex items-start justify-between">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition-transform`}>
                        {getInitials(team.name)}
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 bg-white/[0.05] px-2.5 py-1 rounded-full border border-white/[0.06]">
                        {team.member_count} {team.member_count === 1 ? 'member' : 'members'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors mt-4 tracking-tight">
                      {team.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {team.description || 'Workspace for task tracking, assignment, and updates.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    {/* Member avatar bubbles (Admin Only) */}
                    {user?.role === 'Admin' ? (
                      <div className="flex -space-x-2 overflow-hidden">
                        {team.members.slice(0, 4).map((member, i) => (
                          <div
                            key={member.id || i}
                            title={member.name}
                            className="inline-block h-7 w-7 rounded-full bg-slate-800 ring-2 ring-[#0b101d] text-[10px] font-bold text-slate-300 flex items-center justify-center"
                          >
                            {getInitials(member.name)}
                          </div>
                        ))}
                        {team.members.length > 4 && (
                          <div className="inline-block h-7 w-7 rounded-full bg-slate-700 ring-2 ring-[#0b101d] text-[10px] font-bold text-slate-300 flex items-center justify-center">
                            +{team.members.length - 4}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Team Workspace</span>
                      </div>
                    )}

                    <span className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 flex items-center space-x-1.5">
                      <span>Open Board</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTeamCreated={(newTeam) => setTeams([newTeam, ...teams])}
      />
    </div>
  );
}
