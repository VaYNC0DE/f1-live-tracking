'use client';

import React from 'react';
import { FastestPitStop, PitStopSummary } from '../lib/types';
import { Wrench, Award, Clock, ArrowRight } from 'lucide-react';

interface PitStopCardProps {
  fastestPitStop: FastestPitStop | null;
  pitStops: PitStopSummary[];
  isLoading?: boolean;
}

export const PitStopCard: React.FC<PitStopCardProps> = ({
  fastestPitStop,
  pitStops,
  isLoading = false,
}) => {
  // Top 5 fastest pit stops for the leaderboard
  const topStops = pitStops.slice(0, 5);

  return (
    <div className="w-full bg-zinc-950/90 border border-slate-800 rounded-lg shadow-xl backdrop-blur-sm flex flex-col overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/95 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
              Pit Stops & Strategy
            </h3>
            <p className="text-[10px] font-mono text-zinc-500">
              Stationary Box & Lane Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {pitStops.length > 0 ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30">
              {pitStops.length} {pitStops.length === 1 ? 'STOP' : 'STOPS'}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-slate-800">
              STANDBY
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Fastest Pit Stop Showcase Banner */}
        {fastestPitStop ? (
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-amber-500/15 via-zinc-900/60 to-zinc-900/30 border border-amber-500/40 p-3.5 shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 mb-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400">
                  FASTEST PIT STOP OF SESSION
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                {fastestPitStop.isStationary ? 'Stationary Box' : 'Pit Lane Transit'}
              </span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center space-x-3">
                {/* Team vertical color bar */}
                <div
                  className="w-1.5 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: fastestPitStop.teamColor }}
                />

                {/* Driver avatar / monogram */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-900 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
                  {fastestPitStop.headshotUrl ? (
                    <img
                      src={fastestPitStop.headshotUrl}
                      alt={fastestPitStop.nameAcronym}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  ) : (
                    <span className="font-mono text-xs font-bold text-amber-300">
                      {fastestPitStop.nameAcronym}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-base font-black font-mono text-zinc-100">
                      {fastestPitStop.nameAcronym}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      #{fastestPitStop.driverNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate max-w-[140px] sm:max-w-[200px]">
                    {fastestPitStop.teamName} • Lap {fastestPitStop.lapNumber}
                  </div>
                </div>
              </div>

              {/* Huge Duration display */}
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                  {fastestPitStop.duration.toFixed(2)}s
                </div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                  {fastestPitStop.isStationary ? 'DHL Award Metric' : 'Pit Transit Time'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-zinc-900/40 border border-slate-800/80 p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-slate-800 flex items-center justify-center mx-auto mb-2.5">
              <Wrench className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
              No Pit Stops Recorded Yet
            </div>
            <p className="text-[11px] font-mono text-zinc-500 max-w-xs mx-auto">
              Telemetry will automatically record pit stop times and rank the fastest stop once cars enter the pit lane.
            </p>
          </div>
        )}

        {/* Top 5 Leaderboard Table */}
        {topStops.length > 0 && (
          <div className="mt-1">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 pb-1.5 px-2 border-b border-slate-800">
              <span>Fastest Stops</span>
              <span>Duration</span>
            </div>

            <div className="divide-y divide-slate-800/50">
              {topStops.map((stop, index) => {
                const isFastest = index === 0;
                return (
                  <div
                    key={`${stop.driverNumber}-${stop.lapNumber}-${index}`}
                    className={`flex items-center justify-between py-2 px-2 rounded transition-colors ${
                      isFastest ? 'bg-amber-500/5' : 'hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      {/* Rank */}
                      <span
                        className={`w-4 font-mono text-xs font-bold text-center ${
                          isFastest ? 'text-amber-400' : 'text-zinc-500'
                        }`}
                      >
                        {index + 1}
                      </span>

                      {/* Team stripe */}
                      <div
                        className="w-1 h-5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: stop.teamColor }}
                      />

                      {/* Driver info */}
                      <span className="font-mono text-xs font-bold text-zinc-200">
                        {stop.nameAcronym}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        Lap {stop.lapNumber}
                      </span>
                      <span className="text-[10px] text-zinc-500 truncate max-w-[100px] hidden sm:inline">
                        {stop.teamName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-mono font-bold ${
                          isFastest ? 'text-amber-400' : 'text-zinc-300'
                        }`}
                      >
                        {stop.duration.toFixed(2)}s
                      </span>
                      <span className="text-[9px] font-mono uppercase px-1 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-slate-800">
                        {stop.isStationary ? 'BOX' : 'LANE'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
