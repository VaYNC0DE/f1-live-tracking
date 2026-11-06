'use client';

import React from 'react';
import { DriverCockpitTelemetry, DriverTimingRow } from '../lib/types';
import { cn } from '../lib/utils';
import { Gauge, Zap, Activity, AlertCircle, ChevronRight } from 'lucide-react';

interface CockpitTelemetryCardProps {
  telemetry: DriverCockpitTelemetry | null;
  drivers: DriverTimingRow[];
  selectedDriverNumber: number | null;
  onSelectDriver: (driverNumber: number) => void;
}

export const CockpitTelemetryCard: React.FC<CockpitTelemetryCardProps> = ({
  telemetry,
  drivers,
  selectedDriverNumber,
  onSelectDriver,
}) => {
  // Compute RPM rev-counter LED lights (15 segments like an F1 steering wheel)
  const maxRpm = 12500;
  const currentRpm = telemetry?.rpm ?? 0;
  const filledLedCount = Math.min(15, Math.max(0, Math.round((currentRpm / maxRpm) * 15)));

  return (
    <div className="w-full bg-zinc-950/90 border border-slate-800 rounded-lg shadow-xl backdrop-blur-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/95 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-md bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
              Cockpit & DRS Wing Telemetry
            </h3>
            <p className="text-[10px] font-mono text-zinc-500">
              Single-Car High Frequency Feed
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/30">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-90" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
            </span>
            <span>ONBOARD</span>
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3.5">
        {/* Selected Driver Banner */}
        {telemetry ? (
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-slate-800">
            <div className="flex items-center space-x-3 min-w-0">
              {/* Team color bar */}
              <div
                className="w-1.5 h-9 rounded-full flex-shrink-0"
                style={{ backgroundColor: telemetry.teamColor }}
              />

              {/* Headshot / avatar */}
              <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-900 border border-slate-700 flex items-center justify-center flex-shrink-0">
                {telemetry.headshotUrl ? (
                  <img
                    src={telemetry.headshotUrl}
                    alt={telemetry.nameAcronym}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                ) : (
                  <span className="font-mono text-xs font-bold text-zinc-300">
                    {telemetry.nameAcronym}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-sm font-black font-mono text-zinc-100">
                    {telemetry.nameAcronym}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    #{telemetry.driverNumber}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  {telemetry.teamName}
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-[9px] font-mono uppercase text-zinc-500">Status</div>
              <div className="text-xs font-mono font-bold text-emerald-400">TRACKSIDE</div>
            </div>
          </div>
        ) : (
          <div className="p-3 text-center rounded-lg bg-zinc-900/40 border border-slate-800 text-xs text-zinc-400 font-mono">
            Select a driver below to activate live cockpit feed
          </div>
        )}

        {/* Hero DRS Rear Wing Flap Status Display */}
        {telemetry && (
          <div
            className={`p-3.5 rounded-lg border transition-all duration-300 ${
              telemetry.isDrsOpen
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse'
                : telemetry.isDrsArmed
                ? 'bg-amber-950/30 border-amber-500/60 text-amber-300'
                : 'bg-zinc-900/80 border-slate-800 text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <Zap
                  className={`w-4 h-4 ${
                    telemetry.isDrsOpen
                      ? 'text-emerald-400 fill-emerald-400'
                      : telemetry.isDrsArmed
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-zinc-500'
                  }`}
                />
                <span className="text-xs font-mono font-black uppercase tracking-wider">
                  {telemetry.isDrsOpen
                    ? 'DRS REAR WING FLAP: OPEN'
                    : telemetry.isDrsArmed
                    ? 'DRS FLAP: ARMED (IN DETECTION ZONE)'
                    : 'DRS REAR WING FLAP: CLOSED'}
                </span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                  telemetry.isDrsOpen
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60'
                    : telemetry.isDrsArmed
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/60'
                    : 'bg-zinc-800 text-zinc-500 border-slate-700'
                }`}
              >
                {telemetry.isDrsOpen ? 'WING DEPLOYED' : telemetry.isDrsArmed ? 'ARMED' : 'HIGH DOWNFORCE'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400">
              {telemetry.isDrsOpen
                ? 'Physical rear wing flap opened down straight — Aerodynamic drag minimized for overtaking.'
                : telemetry.isDrsArmed
                ? 'Within 1.000s detection range. System armed and ready for driver button press.'
                : 'Flap closed in standard cornering / high downforce configuration.'}
            </p>
          </div>
        )}

        {/* Speedometer, Gear Readout & Steering Rev Bar */}
        {telemetry && (
          <div className="grid grid-cols-2 gap-2.5">
            {/* Speed & Gear */}
            <div className="p-3 rounded-lg bg-zinc-900/70 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[9px] font-mono font-bold uppercase text-zinc-500">SPEED</div>
                <div className="text-2xl font-black font-mono text-zinc-100 tracking-tight">
                  {telemetry.speed} <span className="text-xs font-normal text-zinc-500">KM/H</span>
                </div>
              </div>

              {/* F1 Gear Box */}
              <div className="w-12 h-12 rounded-lg bg-zinc-950 border border-slate-700 flex flex-col items-center justify-center shadow-inner">
                <span className="text-[8px] font-mono uppercase text-zinc-500 leading-none">GEAR</span>
                <span className="text-lg font-black font-mono text-amber-400 leading-none mt-0.5">
                  {telemetry.gear === 0 ? 'N' : telemetry.gear}
                </span>
              </div>
            </div>

            {/* RPM Rev Lights */}
            <div className="p-3 rounded-lg bg-zinc-900/70 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">REV COUNTER</span>
                <span className="text-xs font-mono font-bold text-zinc-300">
                  {telemetry.rpm.toLocaleString()} <span className="text-[9px] text-zinc-500">RPM</span>
                </span>
              </div>

              {/* 15-LED Shift Light Bar */}
              <div className="flex items-center space-x-1 mt-2">
                {Array.from({ length: 15 }).map((_, i) => {
                  const isFilled = i < filledLedCount;
                  let color = 'bg-emerald-500';
                  if (i >= 5 && i < 10) color = 'bg-amber-400';
                  if (i >= 10 && i < 13) color = 'bg-red-500';
                  if (i >= 13) color = 'bg-purple-500 animate-pulse';

                  return (
                    <div
                      key={i}
                      className={`h-4 flex-1 rounded-sm transition-colors duration-150 ${
                        isFilled ? color : 'bg-zinc-800'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Throttle & Brake Pedals Telemetry */}
        {telemetry && (
          <div className="p-3 rounded-lg bg-zinc-900/70 border border-slate-800 flex flex-col gap-2.5">
            {/* Throttle Bar */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                <span className="text-emerald-400 uppercase">THROTTLE</span>
                <span className="text-zinc-200">{telemetry.throttle}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-950 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-200 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  style={{ width: `${Math.min(100, Math.max(0, telemetry.throttle))}%` }}
                />
              </div>
            </div>

            {/* Brake Bar */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                <span className="text-red-400 uppercase">BRAKE</span>
                <span className="text-zinc-200">{telemetry.brake}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-950 border border-slate-800 overflow-hidden">
                <div
                  className={`h-full bg-red-500 rounded-full transition-all duration-200 ${
                    telemetry.brake > 0 ? 'shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-pulse' : ''
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, telemetry.brake))}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick Driver Selection Switcher Bar */}
        <div>
          <div className="text-[10px] font-mono uppercase text-zinc-500 mb-1.5 flex items-center justify-between">
            <span>Switch Driver Cockpit:</span>
            <span className="text-[9px] text-zinc-500">Click any car to tune in</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {drivers.map((d) => {
              const isSelected = selectedDriverNumber === d.driverNumber;
              return (
                <button
                  key={d.driverNumber}
                  type="button"
                  onClick={() => onSelectDriver(d.driverNumber)}
                  className={cn(
                    'px-2 py-1 rounded text-[11px] font-mono font-bold border transition-all cursor-pointer inline-flex items-center space-x-1.5',
                    isSelected
                      ? 'border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                      : 'bg-zinc-900/90 text-zinc-400 border-slate-800 hover:bg-zinc-800 hover:text-zinc-200'
                  )}
                  style={
                    isSelected
                      ? {
                          backgroundColor: `${d.teamColor}33`,
                          borderColor: d.teamColor,
                        }
                      : undefined
                  }
                >
                  <span
                    className="inline-block w-1.5 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: d.teamColor }}
                  />
                  <span>{d.nameAcronym}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
