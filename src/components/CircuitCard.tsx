'use client';

import React, { useState } from 'react';
import { Session, ActiveRaceControlStatus } from '../lib/types';
import { getCircuitData, CircuitTurn } from '../lib/circuitData';
import { cn } from '../lib/utils';
import { Flag, AlertTriangle, ShieldAlert, Zap, Compass, Gauge, Layers } from 'lucide-react';

interface CircuitCardProps {
  sessionInfo: Session | null;
  raceControlStatus: ActiveRaceControlStatus;
  totalLaps?: number;
}

export const CircuitCard: React.FC<CircuitCardProps> = ({
  sessionInfo,
  raceControlStatus,
  totalLaps = 71,
}) => {
  const [hoveredTurn, setHoveredTurn] = useState<CircuitTurn | null>(null);

  // Derive circuit data from sessionInfo
  const circuitQuery = sessionInfo
    ? `${sessionInfo.circuit_short_name} ${sessionInfo.country_name || ''} ${sessionInfo.location || ''}`
    : 'Brazil Interlagos';
  const circuit = getCircuitData(circuitQuery);

  // Dynamic Flag Banner styling
  const flagType = raceControlStatus.type;

  let flagBg = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400';
  let flagIcon = <Flag className="w-4 h-4 text-emerald-400" />;
  let flagGlow = 'shadow-[0_0_12px_rgba(16,185,129,0.15)]';

  if (flagType === 'RED') {
    flagBg = 'bg-red-950/80 border-red-500 text-red-200 animate-pulse';
    flagIcon = <ShieldAlert className="w-4 h-4 text-red-400 fill-red-400/20" />;
    flagGlow = 'shadow-[0_0_20px_rgba(239,68,68,0.35)]';
  } else if (flagType === 'SAFETY CAR' || flagType === 'VIRTUAL SAFETY CAR') {
    flagBg = 'bg-amber-950/80 border-amber-400 text-amber-200 animate-pulse';
    flagIcon = <AlertTriangle className="w-4 h-4 text-amber-400 fill-amber-400/20" />;
    flagGlow = 'shadow-[0_0_20px_rgba(251,191,36,0.3)]';
  } else if (flagType === 'YELLOW') {
    flagBg = 'bg-amber-950/60 border-amber-500/80 text-amber-300';
    flagIcon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
    flagGlow = 'shadow-[0_0_15px_rgba(245,158,11,0.2)]';
  }

  return (
    <div className="w-full bg-zinc-950/90 border border-slate-800 rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm flex flex-col">
      {/* Header Bar: Circuit Title, Country, and Dynamic Flag Banner */}
      <div className="px-4 py-3 bg-zinc-900/90 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-red-500" />
            <h2 className="text-sm sm:text-base font-black font-sans tracking-tight text-zinc-100 uppercase">
              {circuit.circuitName}
            </h2>
            <span className="text-xs font-mono font-semibold text-zinc-400">
              ({circuit.country})
            </span>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
            {circuit.shortName} Layout • {sessionInfo?.session_name || 'Grand Prix Session'}
          </div>
        </div>

        {/* Dynamic Race Control Flag Banner */}
        <div
          className={cn(
            'flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-black tracking-wider uppercase shadow-md transition-all duration-300',
            flagBg,
            flagGlow
          )}
        >
          {flagIcon}
          <span>{raceControlStatus.label}</span>
          {raceControlStatus.type === 'GREEN' && (
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
        </div>
      </div>

      {/* Circuit Telemetry Metric Strips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-800/60 border-b border-slate-800">
        <div className="bg-zinc-950 px-3.5 py-2">
          <div className="text-[9px] font-mono font-bold uppercase text-zinc-400">TRACK LENGTH</div>
          <div className="text-xs sm:text-sm font-mono font-black text-zinc-100">
            {circuit.lapLengthKm.toFixed(3)} km
          </div>
        </div>
        <div className="bg-zinc-950 px-3.5 py-2">
          <div className="text-[9px] font-mono font-bold uppercase text-zinc-400">TOTAL CORNERS</div>
          <div className="text-xs sm:text-sm font-mono font-black text-zinc-100">
            {circuit.totalTurns} Turns
          </div>
        </div>
        <div className="bg-zinc-950 px-3.5 py-2">
          <div className="text-[9px] font-mono font-bold uppercase text-cyan-400">DRS ZONES</div>
          <div className="text-xs sm:text-sm font-mono font-black text-cyan-300 flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            <span>{circuit.drsZones} Zones</span>
          </div>
        </div>
        <div className="bg-zinc-950 px-3.5 py-2">
          <div className="text-[9px] font-mono font-bold uppercase text-zinc-400">SESSION LAPS</div>
          <div className="text-xs sm:text-sm font-mono font-black text-zinc-100">
            {totalLaps} Laps
          </div>
        </div>
      </div>

      {/* SVG Interactive Circuit Layout & Corner Tooltip */}
      <div className="relative p-4 sm:p-6 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[300px]">
        {/* Floating Interactive Hover Tooltip */}
        {hoveredTurn && (
          <div className="absolute top-3 left-4 z-20 bg-zinc-900/95 border border-slate-700 px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-mono font-black text-white">
                {hoveredTurn.turnNumber}
              </span>
              <span className="text-xs font-bold text-zinc-100 font-sans">
                {hoveredTurn.name || `Turn ${hoveredTurn.turnNumber}`}
              </span>
              {hoveredTurn.isDrs && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-500/40">
                  DRS ZONE
                </span>
              )}
            </div>
          </div>
        )}

        <svg
          viewBox={circuit.viewBox}
          className="w-full max-w-[560px] h-auto drop-shadow-[0_0_20px_rgba(239,68,68,0.15)] select-none"
        >
          <defs>
            {/* Glow Filter for Circuit Path */}
            <filter id="track-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* DRS Zone Cyan Gradient */}
            <linearGradient id="drs-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          {/* Underlay Shadow Track */}
          <path
            d={circuit.svgPath}
            fill="none"
            stroke="#18181b"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Outer Border Stroke */}
          <path
            d={circuit.svgPath}
            fill="none"
            stroke="#27272a"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Neon Active Track Path */}
          <path
            d={circuit.svgPath}
            fill="none"
            stroke="#e4e4e7"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#track-glow)"
          />

          {/* Start / Finish Grid Checkered Accent */}
          <circle cx="120" cy="70" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />

          {/* Interactive Turn Coordinate Markers */}
          {circuit.turns.map((turn) => {
            const isHovered = hoveredTurn?.turnNumber === turn.turnNumber;
            return (
              <g
                key={turn.turnNumber}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredTurn(turn)}
                onMouseLeave={() => setHoveredTurn(null)}
              >
                {/* Invisible larger hover hit-target area */}
                <circle cx={turn.x} cy={turn.y} r="14" fill="transparent" />

                {/* Outer Ring on Hover or DRS */}
                {turn.isDrs ? (
                  <circle
                    cx={turn.x}
                    cy={turn.y}
                    r={isHovered ? '9' : '7'}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    className="animate-spin-slow opacity-80"
                  />
                ) : null}

                {/* Inner Turn Marker */}
                <circle
                  cx={turn.x}
                  cy={turn.y}
                  r={isHovered ? '5.5' : '3.5'}
                  fill={isHovered ? '#ef4444' : turn.isDrs ? '#22d3ee' : '#a1a1aa'}
                  stroke="#09090b"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />

                {/* Turn Number Tag */}
                <text
                  x={turn.x + 6}
                  y={turn.y - 6}
                  fill={isHovered ? '#ffffff' : '#71717a'}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  className="pointer-events-none transition-colors duration-150"
                >
                  T{turn.turnNumber}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Footer Hint */}
        <div className="mt-2 text-[11px] font-mono text-zinc-400 flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>DRS Zone Corner</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Start / Finish</span>
          </div>
          <span className="hidden sm:inline text-zinc-600">• Hover corners for telemetry names</span>
        </div>
      </div>
    </div>
  );
};
