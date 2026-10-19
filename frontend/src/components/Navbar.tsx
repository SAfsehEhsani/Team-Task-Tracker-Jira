'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Activity,
  Layers,
  LogOut,
  ShieldCheck,
  UserCheck,
  Bell,
  Search,
  Command,
  ChevronDown,
  Sparkles,
  Users,
  Check
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#070913]/85 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Links */}
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              {/* Luminous Pulse Wave Icon */}
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <div className="w-full h-full bg-[#090d1a] rounded-[11px] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Team Task Tracker Tool
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400/90 leading-none">
                  Team Task Tracker
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center pl-4 border-l border-white/[0.08] space-x-1">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all flex items-center space-x-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dashboard</span>
              </Link>
              {user?.role === 'Admin' && (
                <Link
                  id="nav-link-users"
                  href="/users"
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all flex items-center space-x-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Users &amp; Access</span>
                </Link>
              )}
            </div>
          </div>

          {/* Center: Search pill with Cmd+K */}
          <div className="hidden lg:flex items-center">
            <div className="flex items-center w-80 px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-white/[0.08] text-xs text-slate-400 shadow-inner">
              <Search className="w-3.5 h-3.5 text-slate-500 mr-2.5 shrink-0" />
              <input
                type="text"
                placeholder="Search tasks, teams, members..."
                className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-xs"
              />
              <span className="flex items-center space-x-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white/[0.06] border border-white/[0.08] rounded text-slate-400 shrink-0 ml-2">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </span>
            </div>
          </div>

          {/* Right: Notifications, Role & User Menu */}
          <div className="flex items-center space-x-3">
            {/* Notification bell */}
            <button
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#070913] animate-pulse" />
            </button>

            {user ? (
              <div className="relative">
                {/* User Pill Button */}
                <button
                  id="btn-user-menu"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2.5 pl-2 pr-3 py-1 rounded-full bg-slate-900/80 border border-white/[0.08] hover:border-indigo-500/40 transition-all"
                >
                  {/* Avatar with role ring */}
                  <div className={`relative w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-md ${user.role === 'Admin'
                      ? 'bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 ring-2 ring-indigo-500/40'
                      : 'bg-gradient-to-tr from-emerald-500 to-teal-600 ring-2 ring-emerald-500/40'
                    }`}>
                    {getInitials(user.name)}
                  </div>

                  {/* Name and Role Badge */}
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-200 leading-tight">
                      {user.name}
                    </p>
                    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${user.role === 'Admin' ? 'text-indigo-400' : 'text-emerald-400'
                      }`}>
                      {user.role === 'Admin' ? <ShieldCheck className="w-2.5 h-2.5" /> : <UserCheck className="w-2.5 h-2.5" />}
                      {user.role}
                    </span>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </button>

                {/* Dropdown Menu with Quick Switcher */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0e1322] border border-white/[0.1] shadow-2xl p-3 z-50 animate-fade-in backdrop-blur-2xl">
                    <div className="px-3 py-2 border-b border-white/[0.06]">
                      <p className="text-xs font-semibold text-white">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${user.role === 'Admin'
                            ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          }`}>
                          {user.role} Access
                        </span>
                      </div>
                    </div>

                    {user.role === 'Admin' && (
                      <div className="py-2 border-b border-white/[0.06]">
                        <Link
                          id="dropdown-link-users"
                          href="/users"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-indigo-300 hover:bg-white/[0.05] transition-colors font-medium"
                        >
                          <Users className="w-3.5 h-3.5 text-purple-400" />
                          <span>User Directory &amp; Permissions</span>
                        </Link>
                      </div>
                    )}


                    {/* Sign Out */}
                    <button
                      id="btn-logout-menu"
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full mt-1 flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-indigo-400 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
