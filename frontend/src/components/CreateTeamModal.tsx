'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Team, User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { 
  X, 
  Users, 
  Sparkles, 
  AlertCircle, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Check, 
  UserPlus,
  Loader2 
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: (team: Team) => void;
}

export default function CreateTeamModal({ isOpen, onClose, onTeamCreated }: Props) {
  const { user: currentUser } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Member' | 'Admin'>('All');
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setError(null);
      setSearchQuery('');
      setRoleFilter('All');
      // By default, select creator
      if (currentUser?.id) {
        setSelectedUserIds([]);
      }
      fetchOrganizationUsers();
    }
  }, [isOpen, currentUser]);

  const fetchOrganizationUsers = async () => {
    try {
      setFetchingUsers(true);
      const res = await api.get('/auth/users/');
      const usersList: User[] = res.data.users || [];
      // Filter out current user from the selectable list since they are automatically included as Creator
      setAvailableUsers(usersList.filter((u) => u.id !== currentUser?.id));
    } catch (err) {
      console.error('Failed to load organization users for team creation', err);
    } finally {
      setFetchingUsers(false);
    }
  };

  if (!isOpen) return null;

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const filteredIds = filteredUsers.map((u) => u.id);
    const allSelected = filteredIds.every((id) => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const filteredUsers = availableUsers.filter((u) => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a team name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/teams/', {
        name: name.trim(),
        description: description.trim(),
        member_ids: selectedUserIds,
      });
      onTeamCreated(res.data.team);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create team. Ensure you are an Admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0b101d] border border-white/[0.08] shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create New Workspace</h3>
              <p className="text-xs text-slate-400">Configure team name, description, and assign initial members</p>
            </div>
          </div>
          <button
            id="btn-close-create-team-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 flex-1 overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Workspace / Team Name <span className="text-indigo-400">*</span>
            </label>
            <input
              id="input-team-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Core Engineering, Product Delivery, Mobile App"
              required
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Description <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              id="input-team-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Primary objectives, milestones, or workspace context..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Member Selection Section */}
          <div className="pt-2 border-t border-white/[0.08]">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Assign Initial Members & Admins
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select people to add to this workspace ({selectedUserIds.length + 1} will be added)
                </p>
              </div>
              {filteredUsers.length > 0 && (
                <button
                  type="button"
                  id="btn-select-all-team-members"
                  onClick={handleSelectAll}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer transition-colors"
                >
                  {filteredUsers.every((u) => selectedUserIds.includes(u.id)) ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {/* Search & Filters */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search members or admins..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-1 p-0.5 rounded-xl bg-black/40 border border-white/[0.08] text-[11px]">
                {(['All', 'Member', 'Admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleFilter(r)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      roleFilter === r
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Creator Row (Always Included) */}
            {currentUser && (
              <div className="mb-2 p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                      <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-300">
                        Workspace Creator
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-indigo-400 flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Always Added</span>
                </span>
              </div>
            )}

            {/* Users List */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {fetchingUsers ? (
                <div className="py-6 flex items-center justify-center text-xs text-slate-500 space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Loading organization members...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No matching organization members found.
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = selectedUserIds.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      onClick={() => toggleUserSelection(u.id)}
                      className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/30 border-indigo-500/50 text-white'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            u.role === 'Admin'
                              ? 'bg-indigo-600/40 text-indigo-300 border border-indigo-500/40'
                              : 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {getInitials(u.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <p className="text-xs font-medium text-white truncate">{u.name}</p>
                            <span
                              className={`text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded-full border ${
                                u.role === 'Admin'
                                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {u.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{u.email}</p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-white/[0.2] bg-white/[0.02]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end space-x-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-submit-create-team"
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Workspace...</span>
                </>
              ) : (
                <>
                  <span>Create Workspace ({selectedUserIds.length + 1} Members)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
