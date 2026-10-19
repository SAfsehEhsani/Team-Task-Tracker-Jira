'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';
import { 
  CheckSquare, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  UserCheck,
  Check,
  Loader2
} from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register(name.trim(), email.trim(), password, role);
    } catch (err: any) {
      const emailErr = err.response?.data?.email?.[0];
      const generalErr = err.response?.data?.detail || err.response?.data?.error;
      setError(emailErr || generalErr || 'Failed to register account. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#070913] text-slate-100 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background ambient gradient glow */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-2xl shadow-indigo-600/30 mb-3">
            <div className="w-full h-full bg-[#090d1a] rounded-[15px] flex items-center justify-center">
              <CheckSquare className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Choose your account role and get started collaborating with your team
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-[#0b101d]/90 border border-white/[0.08] shadow-2xl p-6 sm:p-8 backdrop-blur-2xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="input-register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="input-register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@tasktracker.io"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="input-register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Role Selection Option */}
            <div className="pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Choose Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* User / Member Option */}
                <button
                  type="button"
                  id="btn-select-member-role"
                  onClick={() => setRole('Member')}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    role === 'Member'
                      ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-950/40'
                      : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.2] opacity-80 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <UserCheck className="w-3 h-3 text-emerald-400" />
                        <span>User / Member</span>
                      </span>
                      {role === 'Member' && (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-white font-semibold mt-1">Standard Access</p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Collaborate on assigned teams & track personal tasks
                    </p>
                  </div>
                </button>

                {/* Admin Option */}
                <button
                  type="button"
                  id="btn-select-admin-role"
                  onClick={() => setRole('Admin')}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    role === 'Admin'
                      ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-950/40'
                      : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.2] opacity-80 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <ShieldCheck className="w-3 h-3 text-indigo-400" />
                        <span>Admin</span>
                      </span>
                      {role === 'Admin' && (
                        <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-white font-semibold mt-1">Full Management</p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Manage teams, assign users, inspect timeline audit logs
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <button
              id="btn-register-submit"
              type="submit"
              disabled={loading}
              className={`w-full mt-4 py-2.5 px-4 rounded-2xl text-white font-semibold text-xs sm:text-sm shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer ${
                role === 'Admin'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-600/30'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-600/30'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating {role} Account...</span>
                </>
              ) : (
                <>
                  <span>Create {role === 'Admin' ? 'Admin' : 'User'} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
