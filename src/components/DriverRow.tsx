import React from 'react';
import { DriverTimingRow, TyreCompound } from '../lib/types';
import { cn, formatLapTime } from '../lib/utils';
import { Timer, Zap, Wrench } from 'lucide-react';

interface DriverRowProps {
  driver: DriverTimingRow;
  index: number;
}

interface CompoundConfig {
  letter: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  ringClass: string;
}

const COMPOUND_CONFIGS: Record<TyreCompound, CompoundConfig> = {
  SOFT: {
    letter: 'S',
    badgeBg: 'bg-red-500/20',
    badgeText: 'text-red-400',
    borderClass: 'border-red-500',
    ringClass: 'ring-red-500/30',
  },
  MEDIUM: {
    letter: 'M',
    badgeBg: 'bg-yellow-500/20',
    badgeText: 'text-yellow-400',
    borderClass: 'border-yellow-400',
    ringClass: 'ring-yellow-400/30',
  },
  HARD: {
    letter: 'H',
    badgeBg: 'bg-zinc-100/20',
    badgeText: 'text-zinc-100',
    borderClass: 'border-zinc-200',
    ringClass: 'ring-zinc-300/30',
  },
  INTERMEDIATE: {
    letter: 'I',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-400',
    borderClass: 'border-emerald-500',
    ringClass: 'ring-emerald-500/30',
  },
  WET: {
    letter: 'W',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-400',
    borderClass: 'border-blue-500',
    ringClass: 'ring-blue-500/30',
  },
  UNKNOWN: {
    letter: '?',
    badgeBg: 'bg-zinc-800',
    badgeText: 'text-zinc-400',
    borderClass: 'border-zinc-700',
    ringClass: 'ring-zinc-600/30',
  },
};

export const DriverRow: React.FC<DriverRowProps> = ({ driver, index }) => {
  const [imageError, setImageError] = React.useState(false);
  const [lapUpdated, setLapUpdated] = React.useState(false);
  const prevLapTimeRef = React.useRef(driver.lastLapTime);

  React.useEffect(() => {
    if (driver.isFastestLap && driver.lastLapTime !== prevLapTimeRef.current) {
      prevLapTimeRef.current = driver.lastLapTime;
      setLapUpdated(true);
      const timer = setTimeout(() => setLapUpdated(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [driver.isFastestLap, driver.lastLapTime]);

  const tyreConfig = COMPOUND_CONFIGS[driver.tyreCompound] || COMPOUND_CONFIGS.UNKNOWN;
  const isP1 = driver.position === 1;
  const isPodium = driver.position <= 3;
  const isTopTen = driver.position <= 10;

  // Lap time coloring logic:
  // Neon Purple (#B138DD) if fastest in session, green if personal best
  let lapTimeClass = 'text-zinc-300 font-mono';
  if (driver.isFastestLap) {
    lapTimeClass = 'text-[#B138DD] font-bold drop-shadow-[0_0_10px_rgba(177,56,221,0.65)]';
  } else if (driver.isPersonalBest) {
    lapTimeClass = 'text-emerald-400 font-semibold drop-shadow-[0_0_6px_rgba(52,211,153,0.35)]';
  }

  return (
    <div
      className={cn(
        'group relative flex items-center justify-between px-3 py-2 border-b border-slate-800/80 transition-all duration-300',
        driver.isFastestLap
          ? 'bg-[#B138DD]/10 border-l-4 border-l-[#B138DD] shadow-[inset_0_0_16px_rgba(177,56,221,0.18)] animate-pulse'
          : index % 2 === 0
          ? 'bg-zinc-950/60'
          : 'bg-zinc-900/30',
        lapUpdated && driver.isFastestLap && 'ring-1 ring-[#B138DD] shadow-[0_0_20px_rgba(177,56,221,0.4)]',
        'hover:bg-zinc-800/50'
      )}
    >
      {/* Left section: Position, Team Color Bar, Driver Info */}
      <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0 flex-1">
        {/* Position badge */}
        <div
          className={cn(
            'w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center font-mono text-xs sm:text-sm font-black border transition-transform flex-shrink-0',
            isP1 && 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
            !isP1 && isPodium && 'bg-zinc-800 border-slate-600 text-zinc-100',
            !isPodium && isTopTen && 'bg-zinc-900 border-slate-700/80 text-zinc-200',
            !isTopTen && 'bg-zinc-950 border-slate-800 text-zinc-400'
          )}
        >
          {driver.position}
        </div>

        {/* Team Color Vertical Bar */}
        <div
          className="w-1 sm:w-1.5 h-6 sm:h-7 rounded-full flex-shrink-0 shadow-sm"
          style={{ backgroundColor: driver.teamColor || '#808080' }}
          title={driver.teamName}
        />

        {/* Driver Headshot Avatar */}
        <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden flex-shrink-0 bg-zinc-900 border border-slate-700/80 shadow-inner flex items-center justify-center">
          {driver.headshotUrl && !imageError ? (
            <img
              src={driver.headshotUrl}
              alt={driver.nameAcronym}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center font-mono text-[10px] font-bold text-zinc-300"
              style={{ backgroundColor: `${driver.teamColor || '#52525b'}33` }}
            >
              {driver.nameAcronym.slice(0, 2)}
            </div>
          )}
        </div>

        {/* Driver 3-letter Acronym + Number + Team */}
        <div className="flex items-baseline space-x-1.5 sm:space-x-2 min-w-0">
          <span className="font-mono font-black text-sm sm:text-base tracking-wider text-zinc-100 uppercase">
            {driver.nameAcronym}
          </span>
          <span className="font-mono text-xs font-semibold text-zinc-500">
            #{driver.driverNumber}
          </span>
          <span className="text-xs text-zinc-400 truncate max-w-[90px] sm:max-w-[130px] hidden md:inline-block">
            {driver.teamName}
          </span>
        </div>

        {/* Sleek Neon Purple Stopwatch Badge for Fastest Lap Holder */}
        {driver.isFastestLap && (
          <span
            title="Fastest Lap of the Session"
            className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-[#B138DD] bg-[#B138DD]/15 border border-[#B138DD]/50 shadow-[0_0_10px_rgba(177,56,221,0.4)] animate-pulse flex-shrink-0"
          >
            <Timer className="w-3.5 h-3.5 text-[#B138DD]" />
            <span className="text-[9px] font-black uppercase tracking-wider hidden sm:inline">FL</span>
          </span>
        )}

        {/* Fastest Pit Stop Badge */}
        {driver.isFastestPitStop && (
          <span
            title={`Session Fastest Pit Stop: ${driver.bestPitStopDuration?.toFixed(2)}s`}
            className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)] flex-shrink-0"
          >
            <Wrench className="w-3 h-3 text-amber-400" />
            <span className="text-[9px] font-black uppercase tracking-wider hidden sm:inline">
              {driver.bestPitStopDuration ? `${driver.bestPitStopDuration.toFixed(1)}s` : 'PIT'}
            </span>
          </span>
        )}

        {/* DRS Detection Zone Eligible Badge (< 1.0s behind car ahead) */}
        {driver.drsState === 'ELIGIBLE' && (
          <span
            title="DRS Eligible: Within 1.000s detection zone of car ahead"
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-black tracking-wider uppercase text-cyan-300 bg-cyan-500/20 border border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.4)] animate-pulse flex-shrink-0"
          >
            DRS
          </span>
        )}

        {/* Red Flashing 'IN PIT' Badge */}
        {driver.inPit && (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-black tracking-wider uppercase bg-red-600 text-white border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-pulse flex-shrink-0">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
            </span>
            <span>IN PIT</span>
          </span>
        )}
      </div>

      {/* Center-Right: Tyre Compound + Lap Age + Pit Stop Count */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 flex-shrink-0 mr-2 sm:mr-4">
        {/* Tyre compound pill */}
        <div
          className="flex items-center space-x-1 sm:space-x-1.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-zinc-900 border border-slate-800/80 shadow-sm"
          title={`${driver.tyreCompound} (${driver.tyreAgeLaps} laps)`}
        >
          <span
            className={cn(
              'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black border leading-none',
              tyreConfig.badgeBg,
              tyreConfig.badgeText,
              tyreConfig.borderClass
            )}
          >
            {tyreConfig.letter}
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 font-medium tracking-tight">
            {driver.tyreAgeLaps}L
          </span>
        </div>

        {/* Pit Stop Count badge */}
        {driver.pitStopCount > 0 && (
          <span
            className={cn(
              'px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors flex-shrink-0',
              driver.isFastestPitStop
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                : 'bg-zinc-900 text-zinc-400 border-slate-800'
            )}
            title={
              driver.isFastestPitStop
                ? `Fastest Pit Stop: ${driver.bestPitStopDuration?.toFixed(2)}s (${driver.pitStopCount} stop${driver.pitStopCount > 1 ? 's' : ''})`
                : `${driver.pitStopCount} pit stop${driver.pitStopCount > 1 ? 's' : ''}`
            }
          >
            {driver.pitStopCount}P
          </span>
        )}
      </div>

      {/* Right section: Interval, Gap to leader, and Last Lap Time */}
      <div className="flex items-center justify-end space-x-3 sm:space-x-6 flex-shrink-0 text-right">
        {/* Interval to car ahead with DRS indicator */}
        <div className="w-14 sm:w-20 font-mono text-xs sm:text-sm flex items-center justify-end space-x-1">
          {driver.drsState === 'ELIGIBLE' && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)] flex-shrink-0"
              title="Within DRS Detection Range (< 1.0s)"
            />
          )}
          <span
            className={
              driver.drsState === 'ELIGIBLE'
                ? 'text-cyan-300 font-semibold'
                : 'text-zinc-300'
            }
          >
            {driver.intervalToAhead === '-' ? (
              <span className="text-zinc-600">-</span>
            ) : (
              driver.intervalToAhead
            )}
          </span>
        </div>

        {/* Gap to leader */}
        <div className="w-16 sm:w-24 font-mono text-xs sm:text-sm">
          {driver.gapToLeader === 'LEADER' ? (
            <span className="text-amber-400 font-bold tracking-tight">LEADER</span>
          ) : driver.gapToLeader === '-' ? (
            <span className="text-zinc-600">-</span>
          ) : (
            <span className="text-zinc-200">{driver.gapToLeader}</span>
          )}
        </div>

        {/* Last lap time with purple / green highlight */}
        <div className="w-20 sm:w-28 flex items-center justify-end space-x-1.5">
          {driver.isFastestLap && (
            <Timer className="w-3.5 h-3.5 text-[#B138DD] animate-pulse flex-shrink-0" />
          )}
          <span className={cn('text-xs sm:text-sm tracking-tight', lapTimeClass)}>
            {formatLapTime(driver.lastLapTime)}
          </span>
        </div>
      </div>
    </div>
  );
};
