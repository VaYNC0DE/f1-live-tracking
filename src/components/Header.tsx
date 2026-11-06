'use client';

import React, { useEffect, useState } from 'react';
import { Session } from '../lib/types';
import { Flag, Clock, Sun, Moon, Github } from 'lucide-react';
import { useTheme } from '../lib/themeContext';

interface HeaderProps {
  sessionInfo: Session | null;
  isLive: boolean;
  currentLap?: number;
  totalLaps?: number;
  availableSessions?: Session[];
  selectedYear?: number;
  onSelectYear?: (year: number) => void;
  selectedSessionKey?: number | null;
  onSelectSession?: (sessionKey: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  sessionInfo,
  isLive,
  currentLap = 62,
  totalLaps = 62,
  availableSessions = [],
  selectedYear = 2026,
  onSelectYear,
  selectedSessionKey,
  onSelectSession,
}) => {
  const [mounted, setMounted] = useState(false);
  const [clockTime, setClockTime] = useState<string>('');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setClockTime(
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'UTC',
        }) + ' UTC'
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const sessionTitle = sessionInfo
    ? `${sessionInfo.year} ${sessionInfo.country_name || sessionInfo.location} Grand Prix`
    : 'Formula 1 Grand Prix';

  const sessionType = sessionInfo?.session_name || 'Race Session';
  const circuitName = sessionInfo?.circuit_short_name
    ? `${sessionInfo.circuit_short_name} Circuit`
    : 'Marina Bay Street Circuit';

  return (
    <header className="w-full bg-white/95 dark:bg-zinc-950 border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl backdrop-blur-md sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left section: F1 Brand pill, Session Title & Circuit */}
          <div className="flex items-center space-x-3.5">
            {/* F1 Logo Emblem */}
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-base tracking-tighter shadow-[0_0_15px_rgba(220,38,38,0.4)] flex-shrink-0">
              F1
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-zinc-100 uppercase font-sans">
                  {sessionTitle}
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-zinc-300 uppercase">
                  {sessionType}
                </span>

                {/* Season Year Dropdown */}
                <select
                  value={selectedYear}
                  onChange={(e) => onSelectYear?.(Number(e.target.value))}
                  aria-label="Select F1 Season Year"
                  className="bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-slate-700 hover:border-red-500/70 text-slate-900 dark:text-zinc-100 text-xs font-mono font-bold rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors cursor-pointer shadow-sm"
                >
                  {[2026, 2025, 2024, 2023].map((yr) => (
                    <option key={yr} value={yr} className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-mono py-1">
                      {yr} SEASON
                    </option>
                  ))}
                </select>

                {/* Session / Grand Prix Selector Dropdown */}
                {availableSessions.length > 0 && (
                  <select
                    value={selectedSessionKey || sessionInfo?.session_key || ''}
                    onChange={(e) => onSelectSession?.(Number(e.target.value))}
                    aria-label="Select Grand Prix Session"
                    className="bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-slate-700 hover:border-slate-500 text-slate-800 dark:text-zinc-200 text-xs font-mono font-semibold rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors cursor-pointer max-w-[210px] sm:max-w-[280px] truncate shadow-sm"
                  >
                    {availableSessions.map((s) => {
                      const label = `${s.year} ${s.country_name || s.circuit_short_name} - ${s.session_name}`;
                      return (
                        <option
                          key={s.session_key}
                          value={s.session_key}
                          className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 py-1"
                        >
                          {label}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
                <Flag className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                <span>{circuitName}</span>
                <span className="text-slate-300 dark:text-zinc-600">•</span>
                <span>{sessionInfo?.location || 'Singapore'}</span>
              </div>
            </div>
          </div>

          {/* Right section: Lap/Time Counter, LIVE SYNC badge, Light/Dark Toggle & GitHub Link */}
          <div className="flex items-center justify-between md:justify-end space-x-2 sm:space-x-2.5">
            {/* Lap / Time Counter */}
            <div className="flex items-center space-x-3 bg-slate-100/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-lg shadow-inner">
              <div className="flex items-center space-x-2 border-r border-slate-300 dark:border-slate-800 pr-3">
                <Clock className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                <div>
                  <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 leading-none">
                    LAP
                  </div>
                  <div className="text-xs sm:text-sm font-mono font-black text-slate-900 dark:text-zinc-100 leading-tight">
                    {currentLap} / {totalLaps}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 leading-none">
                  SESSION CLOCK
                </div>
                <div className="text-xs sm:text-sm font-mono font-black text-slate-900 dark:text-zinc-100 leading-tight">
                  {mounted ? clockTime : '--:--:-- UTC'}
                </div>
              </div>
            </div>

            {/* Green pulsing "LIVE SYNC" badge */}
            <div
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400/80 dark:border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)] dark:shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse flex-shrink-0"
              title={isLive ? 'Live OpenF1 Telemetry Connected' : 'Synchronized Playback Telemetry'}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600 dark:bg-emerald-500" />
              </span>
              <span className="font-mono text-xs font-black tracking-widest text-emerald-700 dark:text-emerald-400 uppercase">
                LIVE SYNC
              </span>
            </div>

            {/* Light / Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors shadow-sm flex items-center justify-center cursor-pointer flex-shrink-0"
            >
              {mounted && theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform duration-200" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-200" />
              )}
            </button>

            {/* GitHub Repository Link Button */}
            <a
              href="https://github.com/VaYNC0DE/f1-live-tracking"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source code on GitHub"
              title="View GitHub Repository"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm flex items-center justify-center cursor-pointer flex-shrink-0"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
