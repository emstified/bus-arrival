import React from 'react';
import {
  CROWD_META,
  CrowdLevel,
  LineBadge,
  MRT_LINES,
  MRTLineId,
} from '../data/singaporeTransit';

export function formatArrivalMinutes(seconds: number): {
  primary: string;
  unit: string;
  isArriving: boolean;
} {
  if (seconds <= 60) {
    return { primary: 'Arr', unit: 'Now', isArriving: true };
  }
  const mins = Math.max(1, Math.round(seconds / 60));
  return { primary: `${mins}`, unit: 'min', isArriving: false };
}

/**
 * Official Singapore MRT Line Code Pill Badge (e.g. [NS22], [TE14])
 * Positive letter spacing (+0.04em) strictly on uppercase code badges
 */
export const MRTLineCodePill: React.FC<{
  badge: LineBadge;
  size?: 'sm' | 'md';
}> = ({ badge, size = 'md' }) => {
  const line = MRT_LINES[badge.line];
  return (
    <span
      style={{ backgroundColor: line.color }}
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white tnum select-none shrink-0 ${
        size === 'sm'
          ? 'px-2 py-0.5 text-[11px] leading-[14px] tracking-[0.04em]'
          : 'px-2.5 py-0.5 text-[12px] leading-[16px] tracking-[0.04em]'
      }`}
    >
      {badge.code}
    </span>
  );
};

/**
 * Multi-line MRT Station Cap Badge (e.g. [NS22 | TE14])
 */
export const MRTStationBadgeGroup: React.FC<{
  badges: LineBadge[];
  size?: 'sm' | 'md';
}> = ({ badges, size = 'md' }) => {
  return (
    <div className="inline-flex items-center gap-1 shrink-0">
      {badges.map((b) => (
        <MRTLineCodePill key={b.code} badge={b} size={size} />
      ))}
    </div>
  );
};

/**
 * Three-level Crowd & Seat Occupancy Visual Gauge
 * Green (#34c759): "Seats"
 * Amber (#ff9500): "Standing"
 * Red (#ff3b30): "Crowded"
 */
export const CrowdGauge: React.FC<{
  crowd: CrowdLevel;
  showLabel?: boolean;
  compact?: boolean;
}> = ({ crowd, showLabel = true, compact = false }) => {
  const meta = CROWD_META[crowd];

  return (
    <div
      className="inline-flex items-center gap-1.5 shrink-0"
      title={meta.label}
      aria-label={`Occupancy: ${meta.label}`}
    >
      <div className="inline-flex items-end gap-[2.5px] h-3">
        {[1, 2, 3].map((barIndex) => {
          const active = barIndex <= meta.bars;
          const heightClass =
            barIndex === 1 ? 'h-1.5' : barIndex === 2 ? 'h-2.5' : 'h-3';
          return (
            <span
              key={barIndex}
              style={{
                backgroundColor: active ? meta.color : '#e5e5ea',
              }}
              className={`w-[3px] rounded-full transition-colors duration-200 ${heightClass}`}
            />
          );
        })}
      </div>
      {showLabel && (
        <span
          style={{ color: meta.color }}
          className={`font-semibold tracking-[0.01em] whitespace-nowrap ${
            compact ? 'text-[11px] leading-[14px]' : 'text-[12px] leading-[16px]'
          }`}
        >
          {meta.shortLabel}
        </span>
      )}
    </div>
  );
};

/**
 * Bus Service Badge: Clean light gray container (#f5f5f7) with bold charcoal typography (17px, bold)
 */
export const BusServiceBadge: React.FC<{
  serviceNo: string;
  crowd: CrowdLevel;
  active?: boolean;
}> = ({ serviceNo, crowd, active = false }) => {
  const meta = CROWD_META[crowd];
  return (
    <div
      className={`relative flex flex-col items-center justify-center min-w-[58px] h-[44px] px-2.5 rounded-[12px] transition-all duration-150 shrink-0 ${
        active
          ? 'bg-[#0071e3] text-white shadow-sm'
          : 'bg-[#f5f5f7] text-[#1d1d1f]'
      }`}
    >
      <span className="text-[17px] font-bold leading-[20px] tracking-[-0.015em] tnum">
        {serviceNo}
      </span>
      <div className="flex items-center gap-1 mt-0.5">
        {[1, 2, 3].map((dot) => (
          <span
            key={dot}
            style={{
              backgroundColor:
                dot <= meta.bars
                  ? active
                    ? '#ffffff'
                    : meta.color
                  : active
                  ? 'rgba(255,255,255,0.3)'
                  : '#d2d2d7',
            }}
            className="w-1 h-1 rounded-full"
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Train Car-by-Car Occupancy Load Indicator
 */
export const TrainCarLoadStrip: React.FC<{
  carLoads: CrowdLevel[];
  lineColor?: string;
}> = ({ carLoads }) => {
  const bestCarIdx = carLoads.findIndex((c) => c === 'seats');
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px] text-[#86868b]">
        <span>Carriage Load (Car 1 → {carLoads.length})</span>
        {bestCarIdx !== -1 && (
          <span className="text-[#34c759] font-semibold">
            Best boarding: Car {bestCarIdx + 1}
          </span>
        )}
      </div>
      <div className="grid grid-flow-col auto-cols-fr gap-1">
        {carLoads.map((load, idx) => {
          const meta = CROWD_META[load];
          return (
            <div
              key={idx}
              className="flex flex-col items-center gap-1 py-1 px-1.5 rounded-[6px] bg-[#f5f5f7]"
              title={`Car ${idx + 1}: ${meta.label}`}
            >
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-[#e5e5ea]">
                <div
                  style={{ backgroundColor: meta.color }}
                  className="h-full w-full rounded-full"
                />
              </div>
              <span className="text-[10px] font-semibold text-[#86868b] tnum">
                C{idx + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * MRT Line Dot & Code Tag
 */
export const MRTLineMiniTag: React.FC<{ lineId: MRTLineId }> = ({ lineId }) => {
  const line = MRT_LINES[lineId];
  return (
    <span
      style={{ backgroundColor: line.color }}
      className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-semibold text-white tracking-[0.04em] shrink-0"
    >
      {line.id}
    </span>
  );
};
