import React from 'react';
import { DriverTimingRow } from '../lib/types';
import { DriverRow } from './DriverRow';
import { Loader2, AlertCircle, Flag, CalendarClock } from 'lucide-react';

interface TimingTowerProps {
  drivers: DriverTimingRow[];
  isLoading: boolean;
  error: string | null;
  isUpcoming?: boolean;
  sessionScheduledTime?: string | null;
  sessionTitle?: string | null;
  selectedCockpitDriverNumber?: number | null;
  onSelectCockpitDriver?: (driverNumber: number) => void;
}

export const TimingTower: React.FC<TimingTowerProps> = ({
  drivers,
  isLoading,
  error,
  isUpcoming = false,
  sessionScheduledTime,
  sessionTitle,
  selectedCockpitDriverNumber,
  onSelectCockpitDriver,
}) => {
  return (
    <div className="w-full bg-zinc-950/90 border border-slate-800 rounded-lg shadow-2xl backdrop-blur-sm flex flex-col overflow-hidden">
      {/* Table Column Headers */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-zinc-900/95 border-b border-slate-700/80 text-[11px] font-mono font-bold tracking-wider text-zinc-400 uppercase select-none sticky top-0 z-10">
        <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0 flex-1">
          <span className="w-6 sm:w-7 text-center">POS</span>
          <span className="w-1.5" />
          <span>DRIVER</span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 mr-2 sm:mr-4">
          <span className="w-14 text-center">TYRE</span>
        </div>

        <div className="flex items-center justify-end space-x-3 sm:space-x-6 flex-shrink-0 text-right">
          <span className="w-14 sm:w-20">INTERVAL</span>
          <span className="w-16 sm:w-24">GAP</span>
          <span className="w-20 sm:w-28">LAST LAP</span>
        </div>
      </div>

      {/* Content: Loading Skeleton, Standby State, Error State, or Driver Rows (Dynamic 20-22 cars) */}
      <div className="overflow-y-auto max-h-[820px] divide-y divide-slate-800/60">
        {isLoading && drivers.length === 0 ? (
          <div>
            {Array.from({ length: 22 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 animate-pulse bg-zinc-900/20 border-b border-slate-800/40"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-zinc-800 rounded" />
                  <div className="w-1.5 h-6 bg-zinc-800 rounded-full" />
                  <div className="w-6 h-6 bg-zinc-800 rounded-full" />
                  <div className="w-14 h-4 bg-zinc-800 rounded" />
                  <div className="w-20 h-3 bg-zinc-800/60 rounded hidden md:block" />
                </div>
                <div className="w-12 h-5 bg-zinc-800 rounded-full" />
                <div className="flex space-x-6">
                  <div className="w-14 h-4 bg-zinc-800 rounded" />
                  <div className="w-16 h-4 bg-zinc-800 rounded" />
                  <div className="w-20 h-4 bg-zinc-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : isUpcoming ? (
        <div className="py-20 px-6 text-center bg-zinc-950/70">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <Flag className="w-6 h-6 text-emerald-400" />
          </div>
          {sessionTitle && (
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-1">
              {sessionTitle}
            </div>
          )}
          <h3 className="text-lg sm:text-xl font-bold font-sans text-zinc-100 tracking-tight mb-2">
            Session Scheduled — Waiting for Green Flag & Live Telemetry
          </h3>
          <p className="text-sm font-mono text-zinc-400 max-w-lg mx-auto">
            {sessionScheduledTime
              ? `Scheduled Start: ${new Date(sessionScheduledTime).toUTCString()}`
              : 'Official timing telemetry feed will activate as cars exit the pit lane.'}
          </p>
          <div className="mt-5 inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-slate-800 text-xs font-mono text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Live Circuit Standby • Scanning OpenF1 Telemetry every 5s</span>
          </div>
        </div>
      ) : error && drivers.length === 0 ? (
        <div className="py-16 px-4 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-200 mb-1">
            Unable to Load Timing Telemetry
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-4">{error}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60">
          {drivers.map((driver, index) => (
            <DriverRow
              key={driver.driverNumber}
              driver={driver}
              index={index}
              isSelectedForCockpit={selectedCockpitDriverNumber === driver.driverNumber}
              onSelectCockpit={() => onSelectCockpitDriver?.(driver.driverNumber)}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
