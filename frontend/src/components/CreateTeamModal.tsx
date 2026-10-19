'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Team } from '@/types';
import { X, Users, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: (team: Team) => void;
}

export default function CreateTeamModal({ isOpen, onClose, onTeamCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
      });
      onTeamCreated(res.data.team);
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create team. Ensure you are an Admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Create New Team</h3>
              <p className="text-xs text-slate-400">Admins can create teams & invite members</p>
            </div>
          </div>
          <button
            id="btn-close-create-team-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Team Name <span className="text-indigo-400">*</span>
            </label>
            <input
              id="input-team-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Frontend Engineering, Product Squad"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Description <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              id="input-team-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this team works on..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-team"
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <span>Creating...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create Team</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
