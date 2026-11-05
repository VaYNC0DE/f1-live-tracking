'use client';

import React, { useEffect, useState } from 'react';
import { Session } from '../lib/types';
import { Radio, Flag, Clock } from 'lucide-react';

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
    <header className="w-full bg-zinc-950 border-b border-slate-800 shadow-xl backdrop-blur-md sticky top-0 z-50">
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
                <h1 className="text-base sm:text-lg font-black tracking-tight text-zinc-100 uppercase font-sans">
                  {sessionTitle}
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-zinc-900 border border-slate-700 text-zinc-300 uppercase">
                  {sessionType}
                </span>

                {/* Season Year Dropdown */}
                <select
                  value={selectedYear}
                  onChange={(e) => onSelectYear?.(Number(e.target.value))}
                  aria-label="Select F1 Season Year"
                  className="bg-zinc-900 border border-slate-700 hover:border-red-500/70 text-zinc-100 text-xs font-mono font-bold rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors cursor-pointer shadow-sm"
                >
                  {[2026, 2025, 2024, 2023].map((yr) => (
                    <option key={yr} value={yr} className="bg-zinc-950 text-zinc-100 font-mono py-1">
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
                    className="bg-zinc-900 border border-slate-700 hover:border-slate-500 text-zinc-200 text-xs font-mono font-semibold rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors cursor-pointer max-w-[210px] sm:max-w-[280px] truncate shadow-sm"
                  >
                    {availableSessions.map((s) => {
                      const label = `${s.year} ${s.country_name || s.circuit_short_name} - ${s.session_name}`;
                      return (
                        <option
                          key={s.session_key}
                          value={s.session_key}
                          className="bg-zinc-950 text-zinc-100 py-1"
                        >
                          {label}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-zinc-400 mt-0.5 font-medium">
                <Flag className="w-3.5 h-3.5 text-zinc-500" />
                <span>{circuitName}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">{sessionInfo?.location || 'Singapore'}</span>
              </div>
            </div>
          </div>

          {/* Right section: Lap/Time Counter & Green Pulsing LIVE SYNC badge */}
          <div className="flex items-center justify-between md:justify-end space-x-3 sm:space-x-4">
            {/* Lap / Time Counter */}
            <div className="flex items-center space-x-3 bg-zinc-900/90 border border-slate-800 px-3.5 py-1.5 rounded-lg shadow-inner">
              <div className="flex items-center space-x-2 border-r border-slate-800 pr-3">
                <Clock className="w-4 h-4 text-zinc-400" />
                <div>
                  <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 leading-none">
                    LAP
                  </div>
                  <div className="text-xs sm:text-sm font-mono font-black text-zinc-100 leading-tight">
                    {currentLap} / {totalLaps}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 leading-none">
                  SESSION CLOCK
                </div>
                <div className="text-xs sm:text-sm font-mono font-black text-zinc-100 leading-tight">
                  {mounted ? clockTime : '--:--:-- UTC'}
                </div>
              </div>
            </div>

            {/* Green pulsing "LIVE SYNC" badge */}
            <div
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)] flex-shrink-0"
              title={isLive ? 'Live OpenF1 Telemetry Connected' : 'Synchronized Playback Telemetry'}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-mono text-xs font-black tracking-widest text-emerald-400 uppercase">
                LIVE SYNC
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
