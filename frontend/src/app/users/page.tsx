'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { User, Role } from '@/types';
import Navbar from '@/components/Navbar';
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  Search,
  Filter,
  Edit2,
  Trash2,
  Clock,
  Mail,
  Lock,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowLeft,
  KeyRound,
  Check,
  Calendar
} from 'lucide-react';
import { getInitials, formatTimeAgo } from '@/lib/utils';

export default function UsersManagementPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'Admin' | 'Member'>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Member' as Role,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Access control: only Admins can access this page
  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.push('/login');
      } else if (currentUser.role !== 'Admin') {
        router.push('/dashboard');
      }
    }
  }, [currentUser, authLoading, router]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users/');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'Admin') {
      fetchUsers();
    }
  }, [currentUser]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Add User
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);

    try {
      const res = await api.post('/auth/users/', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      setUsers([res.data.user, ...users]);
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'Member' });
      showNotification(`User ${res.data.user.name} created successfully in MongoDB!`);
    } catch (err: any) {
      setActionError(
        err.response?.data?.email?.[0] ||
        err.response?.data?.name?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.error ||
        'Failed to create user.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setActionLoading(true);
    setActionError(null);

    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
      };
      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      const res = await api.patch(`/auth/users/${editingUser.id}/`, payload);
      setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...res.data.user } : u)));
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'Member' });
      showNotification(`User ${res.data.user.name} updated successfully!`);
    } catch (err: any) {
      setActionError(
        err.response?.data?.email?.[0] ||
        err.response?.data?.error ||
        'Failed to update user.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete User
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    setActionLoading(true);
    setActionError(null);

    try {
      await api.delete(`/auth/users/${deletingUser.id}/`);
      setUsers(users.filter((u) => u.id !== deletingUser.id));
      showNotification(`User ${deletingUser.name} was removed from the database and all teams.`);
      setDeletingUser(null);
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Failed to delete user.');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (target: User) => {
    setEditingUser(target);
    setFormData({
      name: target.name,
      email: target.email,
      password: '',
      role: target.role,
    });
    setActionError(null);
  };

  if (authLoading || (!currentUser && loading)) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === 'Admin').length;
  const memberCount = users.filter((u) => u.role === 'Member').length;
  const activeCount = users.filter((u) => u.last_login).length;

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-indigo-400 flex items-center space-x-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-white font-medium">User Directory &amp; Permissions</span>
        </div>

        {/* Global Notification Toast */}
        {notification && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center space-x-3 shadow-xl animate-fade-in">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            <span className="font-semibold">{notification}</span>
          </div>
        )}

        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1428] via-[#090e1f] to-[#070913] border border-white/[0.08] p-7 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin Access Control Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Registered Users &amp; Member Directory
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                Live database records saved in MongoDB. Manage credentials, assign roles (Admin vs Member), inspect login timestamps, and add or remove accounts in real time.
              </p>
            </div>

            <button
              id="btn-open-add-user"
              onClick={() => {
                setFormData({ name: '', email: '', password: '', role: 'Member' });
                setActionError(null);
                setIsAddModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0b101d]/80 border border-white/[0.07] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Users</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mt-1.5 font-mono">{users.length}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Stored in MongoDB</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b101d]/80 border border-white/[0.07] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Admin Roles</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-400 mt-1.5 font-mono">{adminCount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Full control permissions</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b101d]/80 border border-white/[0.07] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Team Members</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-1.5 font-mono">{memberCount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Task collaborators</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b101d]/80 border border-white/[0.07] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Logged-In Users</span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-cyan-400 mt-1.5 font-mono">{activeCount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Recorded login sessions</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b101d]/70 border border-white/[0.06]">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              id="input-search-users"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium shrink-0">Filter Role:</span>
            <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/[0.08] space-x-1">
              {(['ALL', 'Admin', 'Member'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    roleFilter === r
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r === 'ALL' ? 'All Roles' : r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table / Directory */}
        <div className="rounded-3xl bg-[#0b101d]/90 border border-white/[0.08] shadow-2xl overflow-hidden backdrop-blur-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] border-b border-white/[0.06] text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-4 px-6">User / Account</th>
                  <th className="py-4 px-6">Role &amp; Permissions</th>
                  <th className="py-4 px-6">Last Login</th>
                  <th className="py-4 px-6">Workspaces</th>
                  <th className="py-4 px-6">Registered On</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Loading users from database...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No registered users match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = currentUser?.id === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                        {/* User details */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-md ${
                                u.role === 'Admin'
                                  ? 'bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 ring-2 ring-indigo-500/30'
                                  : 'bg-gradient-to-tr from-emerald-500 to-teal-600 ring-2 ring-emerald-500/30'
                              }`}
                            >
                              {getInitials(u.name)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                  {u.name}
                                </span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              u.role === 'Admin'
                                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {u.role === 'Admin' ? (
                              <ShieldCheck className="w-3 h-3 text-purple-400" />
                            ) : (
                              <UserCheck className="w-3 h-3 text-emerald-400" />
                            )}
                            <span>{u.role}</span>
                          </span>
                        </td>

                        {/* Last Login */}
                        <td className="py-4 px-6">
                          {u.last_login ? (
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-slate-300 font-medium">
                                {formatTimeAgo(u.last_login)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Never logged in</span>
                          )}
                        </td>

                        {/* Workspaces */}
                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 rounded-lg bg-white/[0.04] text-slate-300 font-mono text-[11px] border border-white/[0.06]">
                            {u.teams_count || 0} teams
                          </span>
                        </td>

                        {/* Registered On */}
                        <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              id={`btn-edit-user-${u.id}`}
                              onClick={() => openEditModal(u)}
                              title="Edit user details & role"
                              className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 border border-white/[0.06] hover:border-indigo-500/30 transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {!isSelf ? (
                              <button
                                id={`btn-delete-user-${u.id}`}
                                onClick={() => setDeletingUser(u)}
                                title="Remove user from database"
                                className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/[0.06] hover:border-rose-500/30 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-600 px-1.5">Locked</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL 1: ADD NEW USER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0b101d] border border-white/[0.1] shadow-2xl p-6 sm:p-7 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Add New User</h3>
                  <p className="text-xs text-slate-400">Create real account directly in MongoDB</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name <span className="text-indigo-400">*</span>
                </label>
                <input
                  id="input-add-user-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address <span className="text-indigo-400">*</span>
                </label>
                <input
                  id="input-add-user-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password <span className="text-indigo-400">*</span>
                </label>
                <input
                  id="input-add-user-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Role &amp; Permissions
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setFormData({ ...formData, role: 'Member' })}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      formData.role === 'Member'
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                        : 'bg-black/40 border-white/[0.08] text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-semibold text-xs">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Member</span>
                    </div>
                    <p className="text-[10px] mt-1 text-slate-400">Regular team access</p>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, role: 'Admin' })}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      formData.role === 'Admin'
                        ? 'bg-purple-950/40 border-purple-500 text-purple-300'
                        : 'bg-black/40 border-white/[0.08] text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-semibold text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </div>
                    <p className="text-[10px] mt-1 text-slate-400">Can manage all teams &amp; users</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-add-user"
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-semibold rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Creating User...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0b101d] border border-white/[0.1] shadow-2xl p-6 sm:p-7 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit User Account</h3>
                  <p className="text-xs text-slate-400">{editingUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  id="input-edit-user-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  id="input-edit-user-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Reset Password (Leave blank to keep existing)
                </label>
                <input
                  id="input-edit-user-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="New password (optional)"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Role Assignment
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setFormData({ ...formData, role: 'Member' })}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      formData.role === 'Member'
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                        : 'bg-black/40 border-white/[0.08] text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-semibold text-xs">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Member</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, role: 'Admin' })}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      formData.role === 'Admin'
                        ? 'bg-purple-950/40 border-purple-500 text-purple-300'
                        : 'bg-black/40 border-white/[0.08] text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-semibold text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-edit-user"
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-semibold rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0b101d] border border-rose-500/30 shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Permanently Remove User?</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">{deletingUser.name}</strong> ({deletingUser.email})?
              This will erase their account from MongoDB and remove them from all team workspaces.
            </p>

            {actionError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {actionError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05]"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-user"
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Removing...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
