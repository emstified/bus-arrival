import React, { useState } from 'react';
import {
  Accessibility,
  AlertTriangle,
  ArrowDownUp,
  ArrowRight,
  Bookmark,
  Bus,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  Footprints,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  Sparkles,
  TrainFront,
  X,
} from 'lucide-react';
import {
  BusServiceArrival,
  BusStop,
  CROWD_META,
  MRT_LINES,
  MRTLineId,
  MRTStationHub,
  PlannedRouteOption,
} from '../data/singaporeTransit';
import {
  BusServiceBadge,
  CrowdGauge,
  formatArrivalMinutes,
  MRTLineCodePill,
  MRTStationBadgeGroup,
  TrainCarLoadStrip,
} from './TransitPrimitives';

/* ============================================================================
 * SCREEN 1: NEARBY BUS & MRT LIVE ARRIVALS
 * ========================================================================== */
interface NearbyBusArrivalsScreenProps {
  busStops: BusStop[];
  selectedStopCode: string;
  onSelectBusStop: (code: string) => void;
  activeBusService: BusServiceArrival | null;
  onSelectBusService: (service: BusServiceArrival | null, stopCode: string) => void;
  pinnedServices: string[];
  onTogglePinService: (key: string) => void;
  onOpenStationHub: (stationId: string) => void;
  onRefreshArrivals: () => void;
  lastUpdatedSecondsAgo: number;
}

export const NearbyBusArrivalsScreen: React.FC<NearbyBusArrivalsScreenProps> = ({
  busStops,
  selectedStopCode,
  onSelectBusStop,
  activeBusService,
  onSelectBusService,
  pinnedServices,
  onTogglePinService,
  onOpenStationHub,
  onRefreshArrivals,
  lastUpdatedSecondsAgo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [crowdFilter, setCrowdFilter] = useState<'ALL' | 'SEATS_ONLY'>('ALL');
  const [expandedStops, setExpandedStops] = useState<Record<string, boolean>>({
    '09048': true,
    '09022': true,
    '08057': false,
    '03019': false,
  });

  const toggleStopExpand = (code: string) => {
    setExpandedStops((prev) => ({ ...prev, [code]: !prev[code] }));
    onSelectBusStop(code);
  };

  const filteredStops = busStops
    .map((stop) => {
      const q = searchQuery.trim().toLowerCase();
      const stopMatches =
        !q ||
        stop.code.toLowerCase().includes(q) ||
        stop.name.toLowerCase().includes(q) ||
        stop.road.toLowerCase().includes(q);

      const filteredServices = stop.services.filter((svc) => {
        const matchesQuery =
          stopMatches ||
          svc.serviceNo.toLowerCase().includes(q) ||
          svc.destination.toLowerCase().includes(q);
        const matchesCrowd =
          crowdFilter === 'ALL' || svc.arrivals[0].crowd === 'seats';
        return matchesQuery && matchesCrowd;
      });

      return {
        ...stop,
        services: filteredServices,
      };
    })
    .filter((stop) => stop.services.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar & Filter Controls */}
      <div className="flex flex-col gap-2.5">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bus stop code, service (e.g. 190, 09048)..."
            className="w-full h-[44px] pl-10 pr-9 bg-[#f2f2f7] text-[15px] text-[#1d1d1f] placeholder-[#86868b] rounded-[12px] border border-transparent focus:border-[#0071e3] focus:bg-white focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="w-7 h-7 flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] absolute right-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sub-bar: Segmented Filter & Live Refresh */}
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center p-0.5 bg-[#f2f2f7] rounded-[10px]">
            <button
              type="button"
              onClick={() => setCrowdFilter('ALL')}
              className={`px-3 py-1 text-[12px] font-semibold rounded-[8px] transition-all whitespace-nowrap ${
                crowdFilter === 'ALL'
                  ? 'bg-white text-[#1d1d1f] shadow-xs'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              All Arrivals
            </button>
            <button
              type="button"
              onClick={() => setCrowdFilter('SEATS_ONLY')}
              className={`px-3 py-1 text-[12px] font-semibold rounded-[8px] transition-all flex items-center gap-1.5 whitespace-nowrap ${
                crowdFilter === 'SEATS_ONLY'
                  ? 'bg-white text-[#1d1d1f] shadow-xs'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#34c759]" />
              <span>Seats Available</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onRefreshArrivals}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-[12px] font-semibold text-[#0071e3] hover:bg-[#0071e3]/8 active:scale-98 transition-all tnum"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>
              {lastUpdatedSecondsAgo === 0
                ? 'Just updated'
                : `${lastUpdatedSecondsAgo}s ago`}
            </span>
          </button>
        </div>
      </div>

      {/* Quick MRT Station Interchange Strip */}
      <div className="apple-card p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <MRTStationBadgeGroup
            badges={[
              { line: 'NSL', code: 'NS22' },
              { line: 'TEL', code: 'TE14' },
            ]}
            size="sm"
          />
          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-[#1d1d1f] truncate">
              Orchard MRT Interchange
            </div>
            <div className="text-[12px] text-[#86868b] truncate">
              Next NSL train in 1 min · TEL in 2 min
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpenStationHub('orchard')}
          className="px-3 py-1.5 rounded-[10px] bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[12px] font-semibold text-[#0071e3] transition-colors whitespace-nowrap shrink-0"
        >
          Station Board
        </button>
      </div>

      {/* Bus Stops Cards List */}
      <div className="flex flex-col gap-3">
        {filteredStops.length === 0 ? (
          <div className="apple-card p-8 text-center flex flex-col items-center gap-2">
            <Bus className="w-7 h-7 text-[#aeaeb2]" />
            <p className="text-[15px] font-semibold text-[#1d1d1f]">
              No matching bus services
            </p>
            <p className="text-[13px] text-[#86868b]">
              Try clearing your search or switching back to All Arrivals.
            </p>
          </div>
        ) : (
          filteredStops.map((stop) => {
            const isExpanded = expandedStops[stop.code] ?? true;
            const isSelectedStop = selectedStopCode === stop.code;

            return (
              <div
                key={stop.code}
                className={`apple-card overflow-hidden transition-all ${
                  isSelectedStop ? 'ring-1 ring-[#0071e3]/35' : ''
                }`}
              >
                {/* Bus Stop Header */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleStopExpand(stop.code)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleStopExpand(stop.code);
                    }
                  }}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#fbfbfd] transition-colors"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.012em] truncate">
                        {stop.name}
                      </span>
                      <MRTStationBadgeGroup
                        badges={stop.nearestMrtBadges}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] text-[#86868b] tnum">
                      <span className="font-semibold text-[#414753]">
                        {stop.code}
                      </span>
                      <span>·</span>
                      <span>{stop.road}</span>
                      <span>·</span>
                      <span>
                        {stop.distanceMeters}m ({stop.walkMinutes} min walk)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[12px] font-semibold text-[#86868b] tnum">
                      {stop.services.length} svcs
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#86868b] transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Hairline Divider & Bus Services List */}
                {isExpanded && (
                  <div className="border-t border-[#e5e5ea] divide-y divide-[#e5e5ea]">
                    {stop.services.map((svc) => {
                      const first = formatArrivalMinutes(
                        svc.arrivals[0].secondsAway
                      );
                      const second = formatArrivalMinutes(
                        svc.arrivals[1].secondsAway
                      );
                      const third = formatArrivalMinutes(
                        svc.arrivals[2].secondsAway
                      );
                      const isSelectedSvc =
                        activeBusService?.serviceNo === svc.serviceNo &&
                        selectedStopCode === stop.code;
                      const pinKey = `${stop.code}:${svc.serviceNo}`;
                      const isPinned = pinnedServices.includes(pinKey);

                      return (
                        <div
                          key={svc.serviceNo}
                          onClick={() =>
                            onSelectBusService(
                              isSelectedSvc ? null : svc,
                              stop.code
                            )
                          }
                          className={`px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                            isSelectedSvc
                              ? 'bg-[#0071e3]/[0.05]'
                              : 'hover:bg-[#fbfbfd]'
                          }`}
                        >
                          {/* Left: Bus Service Number Badge + Destination & Occupancy */}
                          <div className="flex items-center gap-3 min-w-0">
                            <BusServiceBadge
                              serviceNo={svc.serviceNo}
                              crowd={svc.arrivals[0].crowd}
                              active={isSelectedSvc}
                            />

                            <div className="flex flex-col gap-0.5 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[15px] font-semibold text-[#1d1d1f] truncate">
                                  To {svc.destination}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[12px] text-[#86868b]">
                                <CrowdGauge
                                  crowd={svc.arrivals[0].crowd}
                                  compact
                                />
                                <span>·</span>
                                <span>
                                  {svc.arrivals[0].deck === 'DD'
                                    ? 'Double Deck'
                                    : svc.arrivals[0].deck === 'BD'
                                    ? 'Bendy'
                                    : 'Single Deck'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Tabular Arrival Countdown Timers + Bookmark */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex flex-col items-end">
                              <div className="flex items-baseline gap-1 tnum">
                                <span
                                  className={`text-[18px] font-bold leading-[22px] tracking-[-0.015em] ${
                                    first.isArriving
                                      ? 'text-[#34c759]'
                                      : 'text-[#1d1d1f]'
                                  }`}
                                >
                                  {first.primary}
                                </span>
                                {!first.isArriving && (
                                  <span className="text-[12px] font-semibold text-[#1d1d1f]">
                                    {first.unit}
                                  </span>
                                )}
                              </div>
                              {/* Consecutive Arrivals in Secondary Gray */}
                              <div className="flex items-center gap-1.5 text-[12px] text-[#86868b] tnum mt-0.5">
                                <span
                                  style={{
                                    color:
                                      CROWD_META[svc.arrivals[1].crowd].color,
                                  }}
                                  className="font-semibold"
                                >
                                  {second.primary}m
                                </span>
                                <span>·</span>
                                <span>{third.primary}m</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePinService(pinKey);
                              }}
                              aria-label={`Bookmark Bus ${svc.serviceNo}`}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                isPinned
                                  ? 'text-[#0071e3] bg-[#0071e3]/10'
                                  : 'text-[#aeaeb2] hover:text-[#1d1d1f] hover:bg-[#f2f2f7]'
                              }`}
                            >
                              <Bookmark
                                className="w-4 h-4"
                                fill={isPinned ? 'currentColor' : 'none'}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * SCREEN 2: MRT STATION LIVE BOARD & CARRIAGE OCCUPANCY INSPECTOR
 * ========================================================================== */
interface MRTStationBoardScreenProps {
  stations: MRTStationHub[];
  selectedStationId: string;
  onSelectStation: (stationId: string) => void;
  onJumpToBusStop: (stopCode: string) => void;
}

export const MRTStationBoardScreen: React.FC<MRTStationBoardScreenProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  onJumpToBusStop,
}) => {
  const station =
    stations.find((s) => s.id === selectedStationId) || stations[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Station Switcher Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {stations.map((st) => {
          const active = st.id === station.id;
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelectStation(st.id)}
              className={`h-9 px-3 rounded-[12px] text-[13px] font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-[#0071e3] text-white shadow-xs'
                  : 'bg-[#ffffff] text-[#1d1d1f] border border-black/5 hover:bg-[#f5f5f7]'
              }`}
            >
              <span>{st.name}</span>
              <span
                className={`text-[11px] tnum ${
                  active ? 'text-white/85' : 'text-[#86868b]'
                }`}
              >
                {st.badges.map((b) => b.code).join('/')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Station Master Header Card */}
      <div className="apple-card p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <MRTStationBadgeGroup badges={station.badges} size="md" />
              <h2 className="text-[22px] font-semibold text-[#1d1d1f] leading-[28px] tracking-[-0.015em]">
                {station.name}
              </h2>
            </div>
            <p className="text-[13px] text-[#86868b]">{station.zone}</p>
          </div>
          <span className="text-[12px] font-semibold text-[#34c759] flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{station.liftStatus}</span>
          </span>
        </div>

        <div className="pt-2.5 border-t border-[#e5e5ea] flex items-center justify-between text-[12px] text-[#86868b] tnum">
          <div>
            First Train: <strong className="text-[#1d1d1f]">{station.firstTrain}</strong>
          </div>
          <span>·</span>
          <div>
            Last Train: <strong className="text-[#1d1d1f]">{station.lastTrain}</strong>
          </div>
          <span>·</span>
          <div>
            Walk: <strong className="text-[#1d1d1f]">{station.walkMinutes} min</strong>
          </div>
        </div>
      </div>

      {/* Live Platform Arrival Boards */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[13px] font-semibold text-[#86868b]">
            Live Platform Departures & Carriage Load
          </h3>
          <span className="text-[12px] text-[#86868b] tnum">
            Real-time weight sensors
          </span>
        </div>

        {station.platforms.map((pf) => {
          const lineInfo = MRT_LINES[pf.line];
          const first = formatArrivalMinutes(pf.firstArrivalSec);
          const second = formatArrivalMinutes(pf.secondArrivalSec);
          const third = formatArrivalMinutes(pf.thirdArrivalSec);

          return (
            <div
              key={pf.id}
              className="apple-card p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <MRTLineCodePill
                      badge={{ line: pf.line, code: pf.towardsCode }}
                      size="sm"
                    />
                    <span className="text-[12px] font-semibold text-[#86868b]">
                      {pf.platform} · {lineInfo.name}
                    </span>
                  </div>
                  <div className="text-[16px] font-semibold text-[#1d1d1f] tracking-[-0.01em] truncate">
                    Towards {pf.towards}
                  </div>
                </div>

                {/* Primary & Subsequent Train Timings */}
                <div className="flex flex-col items-end shrink-0 tnum">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-[20px] font-bold leading-[24px] ${
                        first.isArriving ? 'text-[#34c759]' : 'text-[#1d1d1f]'
                      }`}
                    >
                      {first.primary}
                    </span>
                    {!first.isArriving && (
                      <span className="text-[12px] font-semibold text-[#1d1d1f]">
                        {first.unit}
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-[#86868b] mt-0.5">
                    Next: {second.primary}m · {third.primary}m
                  </div>
                </div>
              </div>

              {/* Car-by-Car Occupancy Load Bar */}
              <div className="pt-2.5 border-t border-[#e5e5ea]">
                <TrainCarLoadStrip
                  carLoads={pf.carLoads}
                  lineColor={lineInfo.color}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Station Exits & Street Directory */}
      <div className="apple-card overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e5e5ea] flex items-center justify-between">
          <span className="text-[14px] font-semibold text-[#1d1d1f]">
            Station Exits & Connected Bus Stops
          </span>
          <span className="text-[12px] text-[#86868b]">
            {station.exits.length} Exits
          </span>
        </div>
        <div className="divide-y divide-[#e5e5ea]">
          {station.exits.map((ex) => (
            <div
              key={ex.code}
              className="px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="px-2.5 py-1 rounded-[8px] bg-[#f5f5f7] text-[12px] font-bold text-[#1d1d1f] shrink-0">
                  {ex.code}
                </span>
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-[#1d1d1f] truncate">
                    {ex.landmarks}
                  </div>
                  <div className="text-[12px] text-[#86868b] flex items-center gap-1.5">
                    <Accessibility className="w-3.5 h-3.5 text-[#0071e3]" />
                    <span>Barrier-free lift & sheltered linkway</span>
                  </div>
                </div>
              </div>

              {ex.busStopCode && (
                <button
                  type="button"
                  onClick={() => onJumpToBusStop(ex.busStopCode!)}
                  className="px-2.5 py-1.5 rounded-[10px] bg-[#f2f2f7] hover:bg-[#e5e5ea] text-[12px] font-semibold text-[#0071e3] transition-colors shrink-0 tnum"
                >
                  Stop {ex.busStopCode}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Station Crowd Profile */}
      <div className="apple-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-[#1d1d1f]">
            Station Crowd Forecast Today
          </span>
          <span className="text-[12px] text-[#34c759] font-semibold">
            Currently Moderate
          </span>
        </div>
        <div className="grid grid-cols-9 items-end gap-1.5 h-20 pt-2">
          {station.crowdByHour.map((slot) => {
            const barColor =
              slot.load >= 85
                ? '#ff3b30'
                : slot.load >= 65
                ? '#ff9500'
                : '#34c759';
            return (
              <div
                key={slot.hour}
                className="flex flex-col items-center gap-1 h-full justify-end"
              >
                <div className="w-full bg-[#f2f2f7] rounded-full h-14 flex items-end overflow-hidden">
                  <div
                    style={{
                      height: `${slot.load}%`,
                      backgroundColor: barColor,
                    }}
                    className="w-full rounded-full transition-all duration-300"
                  />
                </div>
                <span className="text-[10px] text-[#86868b] tnum">
                  {slot.hour}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * SCREEN 3: MULTIMODAL TRIP & FARE PLANNER
 * ========================================================================== */
interface RoutePlannerScreenProps {
  routes: PlannedRouteOption[];
  selectedRouteId: string;
  onSelectRoute: (route: PlannedRouteOption) => void;
}

export const RoutePlannerScreen: React.FC<RoutePlannerScreenProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
}) => {
  const [originLabel, setOriginLabel] = useState('Orchard (NS22 / TE14)');
  const [destLabel, setDestLabel] = useState('Marina Bay (NS27 / CE2 / TE20)');
  const [fareType, setFareType] = useState<'ADULT' | 'CONCESSION'>('ADULT');
  const [routeFilter, setRouteFilter] = useState<'ALL' | 'MRT_ONLY' | 'BUS'>('ALL');

  const handleSwap = () => {
    setOriginLabel(destLabel);
    setDestLabel(originLabel);
  };

  const displayedRoutes = routes.filter((r) => {
    if (routeFilter === 'MRT_ONLY') {
      return r.steps.every((s) => s.type !== 'bus');
    }
    if (routeFilter === 'BUS') {
      return r.steps.some((s) => s.type === 'bus');
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Origin / Destination Input Card */}
      <div className="apple-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col items-center gap-1 py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
            <span className="w-0.5 h-6 bg-[#e5e5ea]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#34c759]" />
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center bg-[#f2f2f7] rounded-[10px] px-3 h-10">
              <span className="text-[12px] font-semibold text-[#86868b] w-12 shrink-0">
                From
              </span>
              <input
                type="text"
                value={originLabel}
                onChange={(e) => setOriginLabel(e.target.value)}
                className="w-full bg-transparent text-[14px] font-semibold text-[#1d1d1f] focus:outline-none"
              />
            </div>
            <div className="flex items-center bg-[#f2f2f7] rounded-[10px] px-3 h-10">
              <span className="text-[12px] font-semibold text-[#86868b] w-12 shrink-0">
                To
              </span>
              <input
                type="text"
                value={destLabel}
                onChange={(e) => setDestLabel(e.target.value)}
                className="w-full bg-transparent text-[14px] font-semibold text-[#1d1d1f] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap Origin and Destination"
            className="w-10 h-10 rounded-[12px] bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#0071e3] flex items-center justify-center active:scale-95 transition-all shrink-0"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
        </div>

        {/* Mode & Fare Type Controls */}
        <div className="pt-2 border-t border-[#e5e5ea] flex items-center justify-between gap-2 flex-wrap">
          <div className="inline-flex items-center p-0.5 bg-[#f2f2f7] rounded-[10px]">
            {(
              [
                { id: 'ALL', label: 'All Options' },
                { id: 'MRT_ONLY', label: 'MRT Direct' },
                { id: 'BUS', label: 'Bus + Walk' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRouteFilter(tab.id)}
                className={`px-2.5 py-1 text-[12px] font-semibold rounded-[8px] transition-all whitespace-nowrap ${
                  routeFilter === tab.id
                    ? 'bg-white text-[#1d1d1f] shadow-xs'
                    : 'text-[#86868b] hover:text-[#1d1d1f]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setFareType((f) => (f === 'ADULT' ? 'CONCESSION' : 'ADULT'))
            }
            className="text-[12px] font-semibold text-[#0071e3] hover:underline tnum"
          >
            SimplyGo: {fareType === 'ADULT' ? 'Adult Card' : 'Concession'}
          </button>
        </div>
      </div>

      {/* Multimodal Route Cards */}
      <div className="flex flex-col gap-3">
        {displayedRoutes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          const fare =
            fareType === 'ADULT'
              ? route.fareAdultSgd.toFixed(2)
              : route.fareConcessionSgd.toFixed(2);

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route)}
              className={`apple-card p-4 flex flex-col gap-3 cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-[#0071e3] bg-[#ffffff]'
                  : 'hover:bg-[#fbfbfd]'
              }`}
            >
              {/* Route Summary Top Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-[#0071e3]">
                    <span>{route.tag}</span>
                    <span className="text-[#86868b]">·</span>
                    <CrowdGauge crowd={route.crowdSummary} compact />
                  </div>
                  <div className="flex items-baseline gap-2 tnum">
                    <span className="text-[24px] font-bold text-[#1d1d1f] leading-[28px] tracking-[-0.018em]">
                      {route.totalMinutes} min
                    </span>
                    <span className="text-[13px] text-[#86868b]">
                      Arrive {route.arrivalTimeStr}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end tnum">
                  <span className="text-[16px] font-bold text-[#1d1d1f]">
                    ${fare}
                  </span>
                  <span className="text-[12px] text-[#86868b]">
                    {route.walkMinutes} min walk
                  </span>
                </div>
              </div>

              {/* Visual Step Bar */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {route.steps.map((step, idx) => (
                  <React.Fragment key={idx}>
                    {step.type === 'walk' && (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#86868b] bg-[#f5f5f7] px-2.5 py-1 rounded-full tnum">
                        <Footprints className="w-3.5 h-3.5" />
                        <span>{step.durationMin}m</span>
                      </span>
                    )}
                    {step.type === 'mrt' && step.lineId && (
                      <span
                        style={{
                          backgroundColor: MRT_LINES[step.lineId].color,
                        }}
                        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white px-3 py-1 rounded-full tracking-[0.02em] tnum"
                      >
                        <TrainFront className="w-3.5 h-3.5" />
                        <span>{step.lineOrService}</span>
                      </span>
                    )}
                    {step.type === 'bus' && (
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#1d1d1f] bg-[#f5f5f7] px-3 py-1 rounded-full tnum">
                        <Bus className="w-3.5 h-3.5 text-[#0071e3]" />
                        <span>{step.lineOrService}</span>
                      </span>
                    )}
                    {idx < route.steps.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-[#aeaeb2]" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Detailed Step-by-Step Timeline */}
              <div className="pt-3 border-t border-[#e5e5ea] flex flex-col gap-2.5">
                {route.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-[13px]">
                    <div className="w-5 h-5 rounded-full bg-[#f5f5f7] flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold text-[#86868b] tnum">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#1d1d1f]">
                          {step.from} → {step.to}
                        </span>
                        <span className="text-[12px] font-semibold text-[#86868b] tnum shrink-0">
                          {step.durationMin} min
                        </span>
                      </div>
                      <p className="text-[12px] text-[#86868b] mt-0.5">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
 * SCREEN 4: MRT NETWORK STATUS & SIMPLYGO TRANSIT WALLET
 * ========================================================================== */
interface NetworkStatusAndWalletScreenProps {
  selectedLineFilter: MRTLineId | 'ALL';
  onSelectLineFilter: (line: MRTLineId | 'ALL') => void;
}

export const NetworkStatusAndWalletScreen: React.FC<
  NetworkStatusAndWalletScreenProps
> = ({ selectedLineFilter, onSelectLineFilter }) => {
  const [cardBalance, setCardBalance] = useState<number>(28.45);
  const [topUpFeedback, setTopUpFeedback] = useState<string | null>(null);

  const handleQuickTopUp = (amount: number) => {
    setCardBalance((b) => +(b + amount).toFixed(2));
    setTopUpFeedback(`+$${amount.toFixed(2)} added to SimplyGo EZ-Link`);
    setTimeout(() => setTopUpFeedback(null), 2500);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Live Network Status Section */}
      <div className="apple-card overflow-hidden">
        <div className="px-4 py-3.5 border-b border-[#e5e5ea] flex items-center justify-between">
          <div>
            <h3 className="text-[16px] font-semibold text-[#1d1d1f]">
              Singapore MRT Network Status
            </h3>
            <p className="text-[12px] text-[#86868b]">
              Tap any line to isolate its track corridor on the map
            </p>
          </div>
          {selectedLineFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => onSelectLineFilter('ALL')}
              className="text-[12px] font-semibold text-[#0071e3]"
            >
              Show All
            </button>
          )}
        </div>

        <div className="divide-y divide-[#e5e5ea]">
          {(Object.keys(MRT_LINES) as MRTLineId[]).map((lineId) => {
            const line = MRT_LINES[lineId];
            const isSelected = selectedLineFilter === lineId;
            const isDelay = line.status !== 'Normal Service';

            return (
              <div
                key={lineId}
                onClick={() =>
                  onSelectLineFilter(isSelected ? 'ALL' : lineId)
                }
                className={`p-3.5 flex flex-col gap-1.5 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#0071e3]/[0.05]' : 'hover:bg-[#fbfbfd]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      style={{ backgroundColor: line.color }}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white tracking-[0.04em] tnum shrink-0"
                    >
                      {line.id}
                    </span>
                    <span className="text-[15px] font-semibold text-[#1d1d1f] truncate">
                      {line.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isDelay ? 'bg-[#ff9500]' : 'bg-[#34c759]'
                      }`}
                    />
                    <span
                      className={`text-[12px] font-semibold ${
                        isDelay ? 'text-[#ff9500]' : 'text-[#34c759]'
                      }`}
                    >
                      {line.status}
                    </span>
                  </div>
                </div>

                <div className="text-[12px] text-[#86868b] flex items-center justify-between tnum">
                  <span>
                    {line.termini[0]} ↔ {line.termini[1]}
                  </span>
                  <span>Peak every {line.frequencyPeak}</span>
                </div>

                {isDelay && (
                  <div className="mt-1 px-3 py-2 rounded-[10px] bg-[#ff9500]/10 text-[12px] text-[#884d00] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#ff9500] shrink-0 mt-0.5" />
                    <span>{line.statusDetail}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SimplyGo Transit Card Wallet */}
      <div className="apple-card p-4 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#0071e3]" />
            <span className="text-[15px] font-semibold text-[#1d1d1f]">
              SimplyGo Transit Card
            </span>
          </div>
          <span className="text-[12px] text-[#34c759] font-semibold">
            Auto Top-Up Active
          </span>
        </div>

        {/* Sleek Apple Wallet Transit Card */}
        <div className="p-4 rounded-[16px] bg-gradient-to-br from-[#1d1d1f] via-[#2c2c2e] to-[#0059b5] text-white flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-white/70">
                Singapore SimplyGo · Adult
              </div>
              <div className="text-[28px] font-bold tracking-[-0.02em] tnum mt-0.5">
                S${cardBalance.toFixed(2)}
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-semibold tracking-[0.03em]">
              EZ-Link NFC
            </span>
          </div>

          <div className="flex items-center justify-between text-[12px] text-white/80 tnum">
            <span>CAN ID: 1008 4920 8831 0492</span>
            <span>Valid thru 08/29</span>
          </div>
        </div>

        {topUpFeedback && (
          <div className="text-[12px] font-semibold text-[#34c759] text-center py-1 bg-[#34c759]/10 rounded-[8px]">
            {topUpFeedback}
          </div>
        )}

        {/* Instant Top-Up Buttons */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-medium text-[#86868b]">
            Instant Top-Up:
          </span>
          <div className="flex items-center gap-1.5">
            {[10, 20, 50].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickTopUp(amt)}
                className="px-3 py-1.5 rounded-[10px] bg-[#f5f5f7] hover:bg-[#0071e3] hover:text-white text-[12px] font-semibold text-[#1d1d1f] transition-colors tnum"
              >
                +${amt}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Transit Fares */}
        <div className="pt-2.5 border-t border-[#e5e5ea] flex flex-col gap-2">
          <span className="text-[12px] font-semibold text-[#86868b]">
            Recent Journeys
          </span>
          <div className="flex items-center justify-between text-[13px] tnum">
            <div>
              <div className="font-semibold text-[#1d1d1f]">
                TE14 Orchard → TE20 Marina Bay
              </div>
              <div className="text-[11px] text-[#86868b]">
                Today, 8:42 AM · Distance Fare (6.2 km)
              </div>
            </div>
            <span className="font-semibold text-[#1d1d1f]">-S$1.19</span>
          </div>
          <div className="flex items-center justify-between text-[13px] tnum">
            <div>
              <div className="font-semibold text-[#1d1d1f]">
                Bus 190 · Stevens Stn → Orchard Stn
              </div>
              <div className="text-[11px] text-[#86868b]">
                Yesterday, 6:15 PM · Transfer Rebate Applied
              </div>
            </div>
            <span className="font-semibold text-[#1d1d1f]">-S$0.42</span>
          </div>
        </div>
      </div>
    </div>
  );
};
