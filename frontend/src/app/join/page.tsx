'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Lock,
  UserCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Loader2,
  Mail,
  User,
  ShieldAlert,
  Briefcase
} from 'lucide-react';

interface InvitationDetails {
  valid: boolean;
  token: string;
  email: string;
  team_id: string;
  team_name: string;
  team_description: string;
  inviter_name: string;
  user_exists: boolean;
}

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { user: currentUser, setSession } = useAuth();

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [joinedSuccess, setJoinedSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setFetchError('No invitation token found in this link. Please ask your Team Admin for a valid invite link.');
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        const res = await api.get(`/invitations/${token}/`);
        setInvitation(res.data);
      } catch (err: any) {
        setFetchError(
          err.response?.data?.error || 
          'This invitation link is invalid or has already expired. Please request a new invite from your team admin.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !invitation) return;

    setSubmitError(null);

    // Validation for new user
    if (!invitation.user_exists) {
      if (!name.trim()) {
        setSubmitError('Please enter your full name.');
        return;
      }
      if (!password || password.length < 6) {
        setSubmitError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setSubmitError('Passwords do not match.');
        return;
      }
    } else {
      // Existing user: check if already logged in as that email
      const isAlreadyLoggedInAsInvited = currentUser && currentUser.email.toLowerCase() === invitation.email.toLowerCase();
      if (!isAlreadyLoggedInAsInvited && !password) {
        setSubmitError('Please enter your account password.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload: any = {};
      if (!invitation.user_exists) {
        payload.name = name.trim();
        payload.password = password;
      } else {
        if (password) {
          payload.password = password;
        }
      }

      const res = await api.post(`/invitations/${token}/accept/`, payload);

      setSession(res.data.user, res.data.tokens);
      setJoinedSuccess(true);

      setTimeout(() => {
        router.push(`/teams/${res.data.team_id}`);
      }, 1500);
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.error || 
        err.response?.data?.password?.[0] || 
        err.response?.data?.name?.[0] || 
        'Failed to accept invitation. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white">Verifying Invitation Token...</h2>
        <p className="text-sm text-slate-400 mt-2">Connecting to workspace...</p>
      </div>
    );
  }

  // Error state (invalid or missing token)
  if (fetchError || !invitation) {
    return (
      <div className="relative w-full max-w-md mx-auto">
        <div className="rounded-3xl bg-[#0b101d]/90 border border-rose-500/30 shadow-2xl p-7 sm:p-8 backdrop-blur-2xl text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Invalid Invitation</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            {fetchError || 'This invitation link is not valid or has expired.'}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all text-center"
            >
              Go to Sign In
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-semibold text-xs transition-all text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Already logged in as invited user check
  const isAlreadyLoggedInAsInvited = currentUser && currentUser.email.toLowerCase() === invitation.email.toLowerCase();

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Team Invitation Card */}
      <div className="rounded-3xl bg-[#0b101d]/90 border border-white/[0.08] shadow-2xl p-7 sm:p-8 backdrop-blur-2xl">
        {/* Workspace Pill */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Team Invitation</span>
          </div>
        </div>

        {/* Workspace Headline */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-xl shadow-indigo-600/25 mb-3">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Join &ldquo;{invitation.team_name}&rdquo;
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            <span className="text-indigo-300 font-semibold">{invitation.inviter_name}</span> has invited you to collaborate in their team workspace on PulseSync.
          </p>
        </div>

        {/* Success Alert */}
        {joinedSuccess && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center space-x-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            <div>
              <p className="font-semibold text-emerald-300">Welcome to {invitation.team_name}!</p>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">Redirecting you to the team board now...</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {submitError && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Email (Locked) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Invited Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={invitation.email}
                disabled
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-black/60 border border-white/[0.08] text-slate-300 font-medium text-xs cursor-not-allowed opacity-80"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 pl-1">
              This invitation is exclusively bound to this email address.
            </p>
          </div>

          {/* Form Fields: If new user */}
          {!invitation.user_exists ? (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Your Full Name <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    id="input-join-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Choose a Password <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    id="input-join-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Confirm Password <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    id="input-join-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Existing User */
            <>
              {isAlreadyLoggedInAsInvited ? (
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center space-x-2.5">
                  <UserCheck className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>
                    You are already logged in as <strong>{currentUser?.name}</strong>. Click below to join the workspace immediately!
                  </span>
                </div>
              ) : (
                <div>
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-slate-400 mb-3">
                    An account already exists for <strong>{invitation.email}</strong>. Enter your password to authenticate and join.
                  </div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Account Password <span className="text-indigo-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      id="input-join-existing-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your existing password"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <button
            id="btn-accept-invitation-submit"
            type="submit"
            disabled={submitting || joinedSuccess}
            className="w-full mt-3 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Joining Workspace...</span>
              </>
            ) : joinedSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Joined Successfully!</span>
              </>
            ) : (
              <>
                <span>
                  {!invitation.user_exists
                    ? 'Create Account & Join Team'
                    : isAlreadyLoggedInAsInvited
                    ? 'Accept & Enter Workspace'
                    : 'Sign In & Join Team'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
          <p className="text-[11px] text-slate-500">
            By accepting, you will gain access to tasks, comments, and the team Kanban board as a Member.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#070913] text-slate-100 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center text-center p-6">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
            <p className="text-xs text-slate-400">Loading invitation...</p>
          </div>
        }
      >
        <JoinContent />
      </Suspense>
    </div>
  );
}
