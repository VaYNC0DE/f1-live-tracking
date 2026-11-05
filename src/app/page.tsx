'use client';

import React from 'react';
import { useTimingTower } from '../lib/useTimingTower';
import { Header } from '../components/Header';
import { TimingTower } from '../components/TimingTower';
import { CircuitCard } from '../components/CircuitCard';
import { formatLapTime } from '../lib/utils';
import { Zap, Award, Activity, RotateCcw } from 'lucide-react';

export default function Home() {
  const {
    drivers,
    sessionInfo,
    isLoading,
    error,
    isLive,
    isUpcoming,
    raceControlStatus,
    selectedYear,
    setSelectedYear,
    selectedSessionKey,
    setSelectedSessionKey,
    availableSessions,
  } = useTimingTower(5000);

  // Find overall fastest lap driver
  const fastestLapDriver = drivers.find((d) => d.isFastestLap);

  // Derive lap counter metrics
  const currentMaxLap = Math.max(
    ...drivers.map((d) => d.tyreAgeLaps || 0),
    drivers.length > 0 ? (sessionInfo?.circuit_short_name === 'Singapore' ? 62 : 71) : 0
  );
  const totalLaps = sessionInfo?.circuit_short_name === 'Singapore' ? 62 : 71;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased">
      {/* Header */}
      <Header
        sessionInfo={sessionInfo}
        isLive={isLive}
        currentLap={isUpcoming ? 0 : currentMaxLap}
        totalLaps={isUpcoming ? 0 : totalLaps}
        availableSessions={availableSessions}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        selectedSessionKey={selectedSessionKey}
        onSelectSession={setSelectedSessionKey}
      />

      {/* Main Broadcast Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 flex flex-col gap-4">
        {/* Sub-Header Broadcast Bar: Fastest Lap & Telemetry Feed Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Fastest Lap Card */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/70 border border-slate-800 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-md bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-400 fill-purple-400" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
                  FASTEST LAP
                </div>
                <div className="text-xs sm:text-sm font-black font-mono text-zinc-100">
                  {fastestLapDriver ? (
                    <>
                      <span className="text-zinc-200 mr-1.5">{fastestLapDriver.nameAcronym}</span>
                      <span className="text-purple-400">
                        {formatLapTime(fastestLapDriver.lastLapTime)}
                      </span>
                    </>
                  ) : (
                    <span className="text-zinc-500">AWAITING CLASSIFICATION</span>
                  )}
                </div>
              </div>
            </div>
            {fastestLapDriver && (
              <div
                className="w-2 h-7 rounded-sm shadow-sm"
                style={{ backgroundColor: fastestLapDriver.teamColor }}
                title={fastestLapDriver.teamName}
              />
            )}
          </div>

          {/* Leader Status Card */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/70 border border-slate-800 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  RACE LEADER
                </div>
                <div className="text-xs sm:text-sm font-black font-mono text-zinc-100">
                  {drivers[0] ? (
                    <>
                      <span className="mr-1.5">{drivers[0].nameAcronym}</span>
                      <span className="text-xs text-zinc-400 font-sans font-normal">
                        ({drivers[0].teamName})
                      </span>
                    </>
                  ) : (
                    <span className="text-zinc-500">P1 INITIALIZING</span>
                  )}
                </div>
              </div>
            </div>
            {drivers[0] && (
              <div
                className="w-2 h-7 rounded-sm shadow-sm"
                style={{ backgroundColor: drivers[0].teamColor }}
                title={drivers[0].teamName}
              />
            )}
          </div>

          {/* Telemetry Stream Status */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/70 border border-slate-800 rounded-lg shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  TELEMETRY ENGINE
                </div>
                <div className="text-xs sm:text-sm font-semibold text-zinc-200">
                  {isLive ? 'Live Circuit Trackside Stream' : 'Historical Session Playback'}
                </div>
              </div>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-1 rounded border border-slate-800">
              5s POLLING
            </div>
          </div>
        </div>

        {/* Main Content Layout: Timing Tower (Left) & Circuit Map + Live Race Control (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Timing Tower (7 cols on lg, 8 on xl) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            <TimingTower
              drivers={drivers}
              isLoading={isLoading}
              error={error}
              isUpcoming={isUpcoming}
              sessionScheduledTime={sessionInfo?.date_start}
              sessionTitle={
                sessionInfo
                  ? `${sessionInfo.year} ${sessionInfo.country_name || sessionInfo.location} Grand Prix - ${sessionInfo.session_name}`
                  : null
              }
            />
          </div>

          {/* Circuit Map & Live Race Control Status (5 cols on lg, 4 on xl) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 lg:sticky lg:top-20">
            <CircuitCard
              sessionInfo={sessionInfo}
              raceControlStatus={raceControlStatus}
              totalLaps={totalLaps}
            />
          </div>
        </div>

        {/* Broadcast Graphic Legend Footer */}
        <div className="mt-2 py-3 px-4 bg-zinc-900/40 border border-slate-800/80 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
          {/* Tyre compounds */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Compounds:
            </span>
            <div className="flex items-center space-x-1">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500/20 border border-red-500 text-red-400 text-[9px] font-black flex items-center justify-center">
                S
              </span>
              <span className="text-[11px]">Soft</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/20 border border-yellow-400 text-yellow-400 text-[9px] font-black flex items-center justify-center">
                M
              </span>
              <span className="text-[11px]">Medium</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-3.5 h-3.5 rounded-full bg-zinc-200/20 border border-zinc-200 text-zinc-100 text-[9px] font-black flex items-center justify-center">
                H
              </span>
              <span className="text-[11px]">Hard</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-[9px] font-black flex items-center justify-center">
                I
              </span>
              <span className="text-[11px]">Inter</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-500/20 border border-blue-500 text-blue-400 text-[9px] font-black flex items-center justify-center">
                W
              </span>
              <span className="text-[11px]">Wet</span>
            </div>
          </div>

          {/* Lap Time Legend */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.6)]" />
              <span className="text-purple-300 font-mono text-[11px] font-medium">
                Fastest Session Lap
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              <span className="text-emerald-300 font-mono text-[11px] font-medium">
                Personal Best
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
