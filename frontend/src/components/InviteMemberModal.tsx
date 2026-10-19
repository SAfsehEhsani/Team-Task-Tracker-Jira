'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Team, User } from '@/types';
import { 
  X, 
  Mail, 
  UserPlus, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  Copy, 
  Check, 
  Search,
  Users,
  ShieldCheck,
  UserCheck,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  team: Team;
  onClose: () => void;
  onMemberInvited: (updatedTeam: Team) => void;
}

export default function InviteMemberModal({ isOpen, team, onClose, onMemberInvited }: Props) {
  const [activeTab, setActiveTab] = useState<'existing' | 'invite'>('existing');
  
  // Tab 1: Existing Users State
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Member' | 'Admin'>('All');
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [addingExisting, setAddingExisting] = useState(false);

  // Tab 2: Invite by Email State
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    emailSent: boolean;
    emailMethod: string;
    inviteLink?: string;
    recipientEmail?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessInfo(null);
      setEmail('');
      setSelectedUserIds([]);
      setSearchQuery('');
      fetchOrgUsers();
    }
  }, [isOpen, team]);

  const fetchOrgUsers = async () => {
    try {
      setFetchingUsers(true);
      const res = await api.get('/auth/users/');
      const allUsers: User[] = res.data.users || [];
      // Filter out users who are already in this team
      const existingMemberIds = new Set(team.members.map((m) => m.id));
      const notInTeam = allUsers.filter((u) => !existingMemberIds.has(u.id));
      setAvailableUsers(notInTeam);
      if (notInTeam.length === 0) {
        setActiveTab('invite');
      } else {
        setActiveTab('existing');
      }
    } catch (err) {
      console.error('Failed to load org users', err);
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

  const handleAddExistingUsers = async () => {
    if (selectedUserIds.length === 0) return;
    setAddingExisting(true);
    setError(null);
    try {
      const res = await api.post(`/teams/${team.id}/add-members/`, {
        user_ids: selectedUserIds,
      });
      onMemberInvited(res.data.team);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add members to team');
    } finally {
      setAddingExisting(false);
    }
  };

  const handleEmailInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessInfo(null);

    try {
      const res = await api.post(`/teams/${team.id}/invite/`, {
        email: email.trim(),
      });

      onMemberInvited(res.data.team);
      setSuccessInfo({
        message: res.data.message,
        emailSent: res.data.email_sent || false,
        emailMethod: res.data.email_method || 'console',
        inviteLink: res.data.invite_link,
        recipientEmail: email.trim(),
      });
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.email?.[0] || 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClose = () => {
    setError(null);
    setSuccessInfo(null);
    setEmail('');
    setSelectedUserIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0b101d] border border-white/[0.1] shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-52 h-52 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Add Team Members</h3>
              <p className="text-xs text-slate-400">
                Workspace: <span className="text-slate-200 font-semibold">{team.name}</span>
              </p>
            </div>
          </div>
          <button
            id="btn-close-invite-modal"
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 flex rounded-2xl bg-black/40 p-1 border border-white/[0.08] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('existing')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'existing'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Add Existing Users ({availableUsers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invite')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'invite'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Invite via Email / Link</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: Add Existing Organization Members */}
        {activeTab === 'existing' && (
          <div className="mt-4 flex-1 flex flex-col min-h-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Registered Organization Members
              </span>
              {filteredUsers.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
                >
                  {filteredUsers.every((u) => selectedUserIds.includes(u.id)) ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {/* Search & Filters */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
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
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto max-h-56 space-y-1.5 pr-1">
              {fetchingUsers ? (
                <div className="py-8 flex items-center justify-center text-xs text-slate-500 space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span>Loading members...</span>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  All registered organization members are already part of this workspace!
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No matching members found for '{searchQuery}'.
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
                          ? 'bg-purple-950/40 border-purple-500/60 text-white shadow-md shadow-purple-950/30'
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
                            <p className="text-xs font-semibold text-white truncate">{u.name}</p>
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
                            ? 'bg-purple-600 border-purple-500 text-white'
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

            {/* Add Button */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-add-members"
                type="button"
                disabled={selectedUserIds.length === 0 || addingExisting}
                onClick={handleAddExistingUsers}
                className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
              >
                {addingExisting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Adding to Team...</span>
                  </>
                ) : (
                  <>
                    <span>Add {selectedUserIds.length} Member{selectedUserIds.length === 1 ? '' : 's'} to Team</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Invite by Email / Link */}
        {activeTab === 'invite' && (
          <div className="mt-4 space-y-4">
            {!successInfo ? (
              <form onSubmit={handleEmailInviteSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Invitee Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      id="input-invite-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teammate@company.com"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400 space-y-1">
                  <div className="flex items-center space-x-1.5 text-purple-400 font-semibold">
                    <Send className="w-3.5 h-3.5" />
                    <span>Instant Join Link + Email Dispatch</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    A secure, single-use cryptographic invitation link will be created and dispatched via SMTP.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-submit-invite"
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Invitation...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Invitation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-200">Invitation Link Generated!</h4>
                    <p className="mt-0.5 text-slate-300">{successInfo.message}</p>
                  </div>
                </div>

                {successInfo.inviteLink && (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Direct Join Link (Single-Use Token)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={successInfo.inviteLink}
                        className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs font-mono select-all focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyLink(successInfo.inviteLink!)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all ${
                          copied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-purple-600 hover:bg-purple-500 text-white'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-semibold transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
