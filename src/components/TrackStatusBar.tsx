'use client';

import React from 'react';
import { ActiveRaceControlStatus, TrackState } from '../lib/types';
import {
  AlertTriangle,
  Shield,
  Thermometer,
  Wind,
  Droplets,
  Zap,
  Flag,
} from 'lucide-react';

interface TrackStatusBarProps {
  trackState: TrackState;
  raceControlStatus: ActiveRaceControlStatus;
}

export const TrackStatusBar: React.FC<TrackStatusBarProps> = ({
  trackState,
  raceControlStatus,
}) => {
  const isSafetyCarOnTrack =
    trackState.safetyCarStatus === 'DEPLOYED' ||
    raceControlStatus.type === 'SAFETY CAR';

  const isVscOnTrack =
    trackState.safetyCarStatus === 'VSC' ||
    raceControlStatus.type === 'VIRTUAL SAFETY CAR';

  const isSafetyCarEnding = trackState.safetyCarStatus === 'IN_THIS_LAP';

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* 1. High-Priority Safety Car Active Banner (Shown whenever SC / VSC is out on track) */}
      {isSafetyCarOnTrack && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-amber-500/20 border border-amber-500/80 shadow-[0_0_24px_rgba(245,158,11,0.35)] animate-pulse text-amber-200">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-90" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
            <AlertTriangle className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            <div>
              <span className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
                SAFETY CAR OUT ON TRACK
              </span>
              <span className="hidden sm:inline font-mono text-xs text-amber-400/80 ml-2">
                • No Overtaking • Speed Governed by Delta Time
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-400/60 shadow-sm">
            SC ACTIVE
          </span>
        </div>
      )}

      {isVscOnTrack && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-yellow-500/20 border border-yellow-500/80 shadow-[0_0_24px_rgba(234,179,8,0.35)] animate-pulse text-yellow-200">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-90" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500" />
            </span>
            <AlertTriangle className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
            <div>
              <span className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-yellow-300">
                VIRTUAL SAFETY CAR (VSC) ACTIVE
              </span>
              <span className="hidden sm:inline font-mono text-xs text-yellow-400/80 ml-2">
                • Maintain Positive Delta • Track Surface Neutralized
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-yellow-500/30 text-yellow-300 border border-yellow-400/60 shadow-sm">
            VSC ACTIVE
          </span>
        </div>
      )}

      {isSafetyCarEnding && (
        <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-amber-500/15 border border-amber-400/60 shadow-sm text-amber-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider">
              SAFETY CAR IN THIS LAP • PREPARE FOR RESTART
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/30 text-amber-300">
            SC ENDING
          </span>
        </div>
      )}

      {/* 2. Comprehensive Track State & Environmental Telemetry Strip */}
      <div className="px-3.5 py-2.5 bg-zinc-900/70 border border-slate-800 rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Side: Safety Car Status, Track Condition, DRS System State */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Safety Car Status Badge */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border font-mono text-[11px] font-bold ${
              isSafetyCarOnTrack || isVscOnTrack
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {isSafetyCarOnTrack ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>SAFETY CAR ON TRACK</span>
              </>
            ) : isVscOnTrack ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                <span>VSC ON TRACK</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>SAFETY CAR: OFF</span>
              </>
            )}
          </div>

          {/* Track Surface Condition: DRY vs WET */}
          <div
            className={`flex items-center space-x-1.5 px-2 py-1 rounded-md border font-mono text-[11px] font-bold ${
              trackState.condition === 'WET'
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)] animate-pulse'
                : 'bg-zinc-900 border-slate-700 text-zinc-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                trackState.condition === 'WET' ? 'bg-blue-400' : 'bg-emerald-400'
              }`}
            />
            <span>{trackState.condition === 'WET' ? 'TRACK: WET / RAIN' : 'TRACK: DRY'}</span>
          </div>

          {/* DRS System State */}
          <div
            className={`flex items-center space-x-1.5 px-2 py-1 rounded-md border font-mono text-[11px] font-bold ${
              trackState.drsStatus === 'ENABLED'
                ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                : 'bg-zinc-900 border-slate-800 text-zinc-500'
            }`}
          >
            <Zap
              className={`w-3.5 h-3.5 ${
                trackState.drsStatus === 'ENABLED'
                  ? 'text-cyan-400 fill-cyan-400'
                  : 'text-zinc-500'
              }`}
            />
            <span>DRS {trackState.drsStatus}</span>
          </div>
        </div>

        {/* Right Side: Track Temp, Air Temp, Humidity, Wind */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-4 font-mono text-[11px] text-zinc-400">
          {/* Track Temperature */}
          <div className="flex items-center space-x-1">
            <Thermometer className="w-3.5 h-3.5 text-red-400" />
            <span className="text-zinc-500">Track:</span>
            <span className="text-zinc-200 font-bold">
              {trackState.trackTemp !== null ? `${trackState.trackTemp.toFixed(1)}°C` : '38.0°C'}
            </span>
          </div>

          {/* Air Temperature */}
          <div className="flex items-center space-x-1">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-500">Air:</span>
            <span className="text-zinc-200 font-bold">
              {trackState.airTemp !== null ? `${trackState.airTemp.toFixed(1)}°C` : '28.0°C'}
            </span>
          </div>

          {/* Humidity */}
          <div className="flex items-center space-x-1 hidden sm:flex">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-500">Hum:</span>
            <span className="text-zinc-200 font-semibold">
              {trackState.humidity !== null ? `${trackState.humidity}%` : '60%'}
            </span>
          </div>

          {/* Wind Speed */}
          <div className="flex items-center space-x-1 hidden sm:flex">
            <Wind className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500">Wind:</span>
            <span className="text-zinc-200 font-semibold">
              {trackState.windSpeed !== null ? `${trackState.windSpeed.toFixed(1)} m/s` : '2.1 m/s'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
