'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  X, 
  Database, 
  Layers, 
  Search, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  FileText, 
  Code2, 
  Users, 
  Kanban, 
  CheckSquare, 
  Clock, 
  Mail,
  ShieldCheck,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type CollectionType = 'all' | 'users' | 'teams' | 'tasks' | 'activities' | 'invitations';
type ViewMode = 'formatted' | 'cards' | 'raw';

export default function MongoStorageModal({ isOpen, onClose }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState<CollectionType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('formatted');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDatabaseData();
    }
  }, [isOpen]);

  const fetchDatabaseData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/auth/database-inspector/');
      setData(res.data);
    } catch (err: any) {
      console.error('Failed to inspect database', err);
      setError(err.response?.data?.error || 'Failed to fetch MongoDB database inspect dump.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getFilteredData = () => {
    if (!data || !data.collections) return null;
    if (activeCollection === 'all') {
      return data.collections;
    }
    return data.collections[activeCollection] || [];
  };

  const currentDisplayData = getFilteredData();

  // Search filter
  const filterByQuery = (content: any): any => {
    if (!searchQuery.trim()) return content;
    const q = searchQuery.toLowerCase();

    if (Array.isArray(content)) {
      return content.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
    } else if (typeof content === 'object' && content !== null) {
      const filteredObj: any = {};
      Object.keys(content).forEach((key) => {
        const val = content[key];
        if (Array.isArray(val)) {
          filteredObj[key] = val.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
        } else if (JSON.stringify(val).toLowerCase().includes(q)) {
          filteredObj[key] = val;
        }
      });
      return filteredObj;
    }
    return content;
  };

  const finalFilteredData = filterByQuery(currentDisplayData);
  const jsonString = JSON.stringify(finalFilteredData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data?.collections || {}, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mongodb_tasktracker_dump_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl h-[88vh] rounded-3xl bg-[#080d1a] border border-cyan-500/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Glow Ambient Mesh */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-[#090f20]">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  MongoDB Live Database Inspector
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Live JSON
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Database: <span className="text-cyan-300 font-mono">tasktracker_db</span> • 
                Engine: <span className="text-slate-300 font-medium">MongoEngine ODM</span> • 
                Total Docs: <span className="text-slate-200 font-bold font-mono">{data?.counts?.total_documents || '...'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-refresh-db-inspector"
              onClick={fetchDatabaseData}
              disabled={loading}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Refresh live data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              id="btn-copy-db-json"
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
              title="Copy current view to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>

            <button
              id="btn-download-db-dump"
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
              title="Download entire database dump as JSON file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Dump</span>
            </button>

            <button
              id="btn-close-db-inspector"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collection Category Bar */}
        <div className="px-5 sm:px-6 py-2.5 bg-black/40 border-b border-white/[0.06] flex items-center justify-between gap-3 overflow-x-auto shrink-0 text-xs">
          <div className="flex items-center space-x-1.5">
            {[
              { id: 'all', label: 'All Collections', count: data?.counts?.total_documents, icon: Layers },
              { id: 'users', label: 'Users', count: data?.counts?.users, icon: Users },
              { id: 'teams', label: 'Teams', count: data?.counts?.teams, icon: Kanban },
              { id: 'tasks', label: 'Tasks', count: data?.counts?.tasks, icon: CheckSquare },
              { id: 'activities', label: 'Activities', count: data?.counts?.activities, icon: Clock },
              { id: 'invitations', label: 'Invitations', count: data?.counts?.invitations, icon: Mail },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCollection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCollection(tab.id as CollectionType)}
                  className={`px-3 py-1.5 rounded-xl font-medium flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-cyan-500/40 text-cyan-200' : 'bg-white/[0.06] text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* View Mode Switch */}
          <div className="flex items-center space-x-1 p-0.5 rounded-xl bg-white/[0.03] border border-white/[0.08] shrink-0">
            <button
              onClick={() => setViewMode('formatted')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                viewMode === 'formatted' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              JSON Syntax
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                viewMode === 'raw' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Raw
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-5 sm:px-6 py-2 bg-[#0a1022] border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Filter documents in ${activeCollection}...`}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/50 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <span className="text-[11px] text-slate-400">
            {searchQuery ? `Filtered View` : `Full Collection View`}
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 font-mono text-xs">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
              <p className="text-sm font-sans">Connecting to MongoDB & fetching live collections...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3 text-rose-400">
              <AlertCircle className="w-10 h-10" />
              <p className="text-sm font-sans">{error}</p>
            </div>
          ) : viewMode === 'formatted' ? (
            <div className="rounded-2xl bg-black/60 border border-white/[0.08] p-4 text-emerald-400 overflow-x-auto leading-relaxed shadow-inner">
              <pre className="whitespace-pre">{jsonString}</pre>
            </div>
          ) : viewMode === 'raw' ? (
            <textarea
              readOnly
              value={jsonString}
              className="w-full h-full p-4 rounded-2xl bg-black/60 border border-white/[0.08] text-slate-200 font-mono text-xs focus:outline-none resize-none leading-relaxed select-all"
            />
          ) : (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-sans">
              {Array.isArray(finalFilteredData) ? (
                finalFilteredData.map((item: any, idx: number) => (
                  <div
                    key={item.id || idx}
                    className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] transition-all"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] mb-2.5">
                      <span className="text-xs font-bold text-cyan-400 truncate max-w-[200px]">
                        {item.name || item.title || item.action_type || item.email || `Doc #${idx + 1}`}
                      </span>
                      {item.role && (
                        <span
                          className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                            item.role === 'Admin'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {item.role}
                        </span>
                      )}
                      {item.status && (
                        <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {item.status}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {item.email && (
                        <p className="text-slate-300">
                          <span className="text-slate-500 font-medium">Email: </span>
                          <span className="font-mono text-cyan-200">{item.email}</span>
                        </p>
                      )}
                      {item.description && (
                        <p className="text-slate-400 text-[11px] line-clamp-2">
                          <span className="text-slate-500 font-medium">Description: </span>
                          {item.description}
                        </p>
                      )}
                      {item.assigned_to && (
                        <p className="text-slate-300">
                          <span className="text-slate-500 font-medium">Assignee: </span>
                          <span className="text-emerald-300">{item.assigned_to.name}</span>
                        </p>
                      )}
                      {item.members && (
                        <p className="text-slate-300">
                          <span className="text-slate-500 font-medium">Members: </span>
                          <span className="text-slate-200">{item.members.length} member(s)</span>
                        </p>
                      )}
                      {item.created_at && (
                        <p className="text-slate-500 text-[10px] pt-1">
                          Created: {new Date(item.created_at).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Expand raw JSON button */}
                    <div className="mt-3 pt-2 border-t border-white/[0.04] flex justify-end">
                      <span className="text-[10px] text-slate-500 font-mono">_id: {item.id}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-10 text-slate-400">
                  Switch to a specific collection (Users, Teams, Tasks) to browse in Card view, or explore JSON Syntax mode.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-[#090f20] border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-500 shrink-0 font-sans">
          <span>MongoDB URI Authenticated • Database Access Restricted to Admins</span>
          <span className="font-mono text-slate-400">JSON Format Compliant (RFC 8259)</span>
        </div>
      </div>
    </div>
  );
}
