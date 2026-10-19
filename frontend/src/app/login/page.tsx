'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Activity,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Loader2
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickSigningIn, setQuickSigningIn] = useState<'admin' | 'member' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'member', userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setQuickSigningIn(role);
    setError(null);
    try {
      await login(userEmail, userPass);
    } catch (err: any) {
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Failed to sign in with preset account.');
      setQuickSigningIn(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#070913] text-slate-100 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-2xl shadow-indigo-600/30 mb-4">
            <div className="w-full h-full bg-[#090d1a] rounded-[15px] flex items-center justify-center">
              <Activity className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome to Team Task Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Role-based task management with live chronologies & privacy isolation
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl bg-[#0b101d]/90 border border-white/[0.08] shadow-2xl p-6 sm:p-8 backdrop-blur-2xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Dual Role 1-Click Login Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Select Account to Sign In</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">1-Click Instant Login</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Admin Card */}
              <div className="relative rounded-2xl p-4 bg-gradient-to-b from-indigo-950/40 to-indigo-900/10 border border-indigo-500/30 hover:border-indigo-500/60 transition-all flex flex-col justify-between group shadow-lg shadow-indigo-950/30">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <ShieldCheck className="w-3 h-3 text-indigo-400" />
                      <span>Admin</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Full Access</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">
                    Saumyakanta
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono truncate">admin@tasktracker.io</p>
                </div>

                <button
                  id="btn-login-admin"
                  type="button"
                  disabled={loading || quickSigningIn !== null}
                  onClick={() => handleQuickLogin('admin', 'admin@tasktracker.io', 'Password123!')}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  {quickSigningIn === 'admin' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Login as Admin</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              {/* Member / User Card */}
              <div className="relative rounded-2xl p-4 bg-gradient-to-b from-emerald-950/40 to-emerald-900/10 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex flex-col justify-between group shadow-lg shadow-emerald-950/30">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <UserCheck className="w-3 h-3 text-emerald-400" />
                      <span>User / Member</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Task Board</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-emerald-200 transition-colors">
                    Alice Chen
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono truncate">alice@tasktracker.io</p>
                </div>

                <button
                  id="btn-login-member"
                  type="button"
                  disabled={loading || quickSigningIn !== null}
                  onClick={() => handleQuickLogin('member', 'alice@tasktracker.io', 'Password123!')}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  {quickSigningIn === 'member' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Login as User</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-white/[0.08] w-full" />
            <span className="bg-[#0b101d] px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider shrink-0">
              Or sign in with email
            </span>
            <div className="border-t border-white/[0.08] w-full" />
          </div>

          {/* Standard Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="input-login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@tasktracker.io"
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
                  id="input-login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading || quickSigningIn !== null}
              className="w-full mt-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Need a new account?{' '}
          <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
