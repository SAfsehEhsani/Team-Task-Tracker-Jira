'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Team } from '@/types';
import { 
  X, 
  Mail, 
  UserPlus, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  Copy, 
  Check, 
  Server, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  team: Team;
  onClose: () => void;
  onMemberInvited: (updatedTeam: Team) => void;
}

export default function InviteMemberModal({ isOpen, team, onClose, onMemberInvited }: Props) {
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0b101d] border border-white/[0.1] shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Direct Email Invitation</h3>
              <p className="text-xs text-slate-400">
                Workspace: <span className="text-slate-200 font-semibold">{team.name}</span>
              </p>
            </div>
          </div>
          <button
            id="btn-close-invite-modal"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Banner with Join Link */}
        {successInfo && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-xs space-y-3">
            <div className="flex items-start space-x-2.5 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-300">{successInfo.message}</p>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">
                  Delivery status: <strong className="text-white uppercase">{successInfo.emailMethod === 'smtp' ? 'Dispatched to Inbox (SMTP)' : 'Ready / Console Logged'}</strong>
                </p>
              </div>
            </div>

            {successInfo.inviteLink && (
              <div className="p-3.5 rounded-xl bg-black/60 border border-emerald-500/30 text-xs text-slate-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-400 text-[11px] uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Member Direct Join Link</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      id="btn-copy-join-link"
                      onClick={() => handleCopyLink(successInfo.inviteLink || '')}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-[11px] transition-all"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span className={copied ? 'text-emerald-400 font-bold' : ''}>{copied ? 'Copied Link!' : 'Copy Link'}</span>
                    </button>
                    <a
                      href={successInfo.inviteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-[11px] transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open Link</span>
                    </a>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-black/80 border border-white/[0.08] font-mono text-[11px] text-indigo-300 break-all select-all">
                  {successInfo.inviteLink}
                </div>

                <p className="text-[11px] text-slate-400">
                  The recipient can open this link on any device to enter their name and password and immediately join <span className="text-white font-medium">{team.name}</span>.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Recipient Email Address <span className="text-purple-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                id="input-invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Direct Email Status Explainer */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center space-x-2 text-slate-300 font-semibold">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>Direct Email Dispatch System</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When you submit, PulseSync dispatches a direct HTML invitation containing workspace link and credentials.
            </p>
            <p className="text-[10px] text-slate-500">
              Tip: Configure your <code className="text-indigo-300 bg-white/[0.05] px-1 py-0.5 rounded">EMAIL_HOST_USER</code> &amp; <code className="text-indigo-300 bg-white/[0.05] px-1 py-0.5 rounded">EMAIL_HOST_PASSWORD</code> in <code className="text-slate-300">backend/.env</code> for live Gmail or SMTP inbox delivery!
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Close
            </button>
            <button
              id="btn-submit-invite"
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <span>Sending Email...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Direct Email</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
