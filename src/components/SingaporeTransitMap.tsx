import React, { useState } from 'react';
import {
  Bus,
  Compass,
  Layers,
  LocateFixed,
  Minus,
  Navigation,
  Plus,
  TrainFront,
} from 'lucide-react';
import {
  BusServiceArrival,
  BusStop,
  MAP_STATIONS,
  MAP_TRACK_PATHS,
  MRT_LINES,
  MRTLineId,
  MRTStationHub,
  PlannedRouteOption,
} from '../data/singaporeTransit';
import { MRTLineCodePill } from './TransitPrimitives';

interface SingaporeTransitMapProps {
  busStops: BusStop[];
  selectedStopCode: string;
  onSelectBusStop: (code: string) => void;
  selectedStationId: string;
  onSelectStation: (stationId: string) => void;
  activeBusService: BusServiceArrival | null;
  activePlannedRoute: PlannedRouteOption | null;
  selectedLineFilter: MRTLineId | 'ALL';
  onSelectLineFilter: (line: MRTLineId | 'ALL') => void;
  stations: MRTStationHub[];
  compactMode?: boolean;
}

export const SingaporeTransitMap: React.FC<SingaporeTransitMapProps> = ({
  busStops,
  selectedStopCode,
  onSelectBusStop,
  selectedStationId,
  onSelectStation,
  activeBusService,
  activePlannedRoute,
  selectedLineFilter,
  onSelectLineFilter,
  compactMode = false,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showBusStopsLayer, setShowBusStopsLayer] = useState<boolean>(true);
  const [showLiveVehicles, setShowLiveVehicles] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as HTMLElement).closest('[data-interactive-pin="true"]')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setPan({
      x: Math.max(-240, Math.min(240, e.clientX - dragStart.x)),
      y: Math.max(-200, Math.min(200, e.clientY - dragStart.y)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRecenter = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const activeBusRoutePoints = activeBusService
    ? activeBusService.routeCoords.map((pt) => pt.join(',')).join(' ')
    : null;

  const activePlannedRoutePoints = activePlannedRoute
    ? activePlannedRoute.svgPath.map((pt) => pt.join(',')).join(' ')
    : null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#eef1f5] select-none">
      {/* Interactive SVG Vector Transit Map of Central Singapore */}
      <svg
        viewBox="120 140 740 600"
        className={`w-full h-full transition-transform duration-150 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <pattern
            id="sg-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(0, 0, 0, 0.025)"
              strokeWidth="1"
            />
          </pattern>
          <filter id="pin-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.14" />
          </filter>
          <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{ transformOrigin: '490px 440px' }}
        >
          {/* Base Cartography Grid */}
          <rect x="0" y="0" width="1000" height="900" fill="#f3f4f7" />
          <rect x="0" y="0" width="1000" height="900" fill="url(#sg-grid)" />

          {/* Green Parks: Botanic Gardens, Fort Canning, Istana, Gardens by the Bay */}
          <path
            d="M 160 240 Q 220 210 270 250 Q 285 310 220 330 Q 150 310 160 240 Z"
            fill="#e4f0e2"
          />
          <text
            x="215"
            y="282"
            fontSize="9"
            fontWeight="600"
            fill="#6c9169"
            textAnchor="middle"
            letterSpacing="0.04em"
          >
            BOTANIC GARDENS
          </text>

          <path
            d="M 445 450 Q 495 440 520 475 Q 505 510 465 505 Q 435 485 445 450 Z"
            fill="#e4f0e2"
          />
          <text
            x="480"
            y="482"
            fontSize="8"
            fontWeight="600"
            fill="#6c9169"
            textAnchor="middle"
            letterSpacing="0.03em"
          >
            FORT CANNING
          </text>

          <path
            d="M 675 615 Q 765 600 815 665 Q 785 725 695 705 Q 655 665 675 615 Z"
            fill="#e1efe0"
          />
          <text
            x="742"
            y="658"
            fontSize="9"
            fontWeight="600"
            fill="#5e875b"
            textAnchor="middle"
            letterSpacing="0.04em"
          >
            GARDENS BY THE BAY
          </text>

          {/* Singapore River & Marina Bay Reservoir Water Bodies */}
          <path
            d="M 330 565 Q 410 560 470 530 Q 525 515 585 555 L 605 570 Q 535 535 472 545 Q 410 575 330 580 Z"
            fill="#d6e6f5"
          />
          <path
            d="M 580 555 Q 640 530 695 555 Q 750 595 850 585 L 880 760 L 240 760 L 240 705 Q 420 690 545 670 Q 590 610 580 555 Z"
            fill="#d4e5f7"
          />
          <text
            x="640"
            y="584"
            fontSize="9.5"
            fontWeight="600"
            fill="#5c87b2"
            textAnchor="middle"
            letterSpacing="0.06em"
          >
            MARINA BAY
          </text>

          {/* Major Road Corridors (Orchard Rd, CTE, ECP, Nicoll Hwy) */}
          <g stroke="#e2e4ea" strokeWidth="5" fill="none" strokeLinecap="round">
            <path d="M 220 350 L 355 385 L 495 430 L 555 505 L 565 585" />
            <path d="M 405 160 L 440 340 L 470 525 L 420 670" />
            <path d="M 300 685 L 550 650 L 840 560" />
            <path d="M 530 325 L 645 395 L 685 510" />
          </g>

          {/* MRT Track Network Lines */}
          {MAP_TRACK_PATHS.map((track) => {
            const lineInfo = MRT_LINES[track.line];
            const isDimmed =
              selectedLineFilter !== 'ALL' && selectedLineFilter !== track.line;
            return (
              <g
                key={track.line}
                className="transition-opacity duration-300"
                style={{ opacity: isDimmed ? 0.18 : 0.92 }}
              >
                {/* White Casing */}
                <path
                  d={track.d}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="7.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Colored MRT Track */}
                <path
                  d={track.d}
                  fill="none"
                  stroke={lineInfo.color}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* Highlighted Active Bus Service Route Path */}
          {activeBusRoutePoints && (
            <g>
              <polyline
                points={activeBusRoutePoints}
                fill="none"
                stroke="#ffffff"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={activeBusRoutePoints}
                fill="none"
                stroke="#0071e3"
                strokeWidth="5.5"
                strokeDasharray="10 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* Highlighted Planned Journey Route Path */}
          {activePlannedRoutePoints && (
            <g filter="url(#route-glow)">
              <polyline
                points={activePlannedRoutePoints}
                fill="none"
                stroke="#ffffff"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={activePlannedRoutePoints}
                fill="none"
                stroke="#0071e3"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* Live Moving Trains & Buses Layer */}
          {showLiveVehicles && (
            <g>
              {/* Live Bus on Orchard Corridor */}
              <g transform="translate(390, 400)">
                <rect
                  x="-18"
                  y="-10"
                  width="36"
                  height="20"
                  rx="10"
                  fill="#0071e3"
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="url(#pin-shadow)"
                />
                <text
                  x="0"
                  y="3.5"
                  fontSize="9"
                  fontWeight="700"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  {activeBusService ? activeBusService.serviceNo : '190'}
                </text>
              </g>

              {/* Live Bus near Raffles Place */}
              <g transform="translate(532, 468)">
                <rect
                  x="-16"
                  y="-9"
                  width="32"
                  height="18"
                  rx="9"
                  fill="#1d1d1f"
                  stroke="#ffffff"
                  strokeWidth="1.75"
                  filter="url(#pin-shadow)"
                />
                <text
                  x="0"
                  y="3"
                  fontSize="8.5"
                  fontWeight="700"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  14
                </text>
              </g>

              {/* Live NSL Train */}
              <g transform="translate(382, 332)">
                <circle
                  r="8"
                  fill="#d42e12"
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="url(#pin-shadow)"
                />
                <text
                  x="0"
                  y="3"
                  fontSize="7"
                  fontWeight="700"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  NS
                </text>
              </g>

              {/* Live TEL Train */}
              <g transform="translate(470, 622)">
                <circle
                  r="8"
                  fill="#9d5b25"
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="url(#pin-shadow)"
                />
                <text
                  x="0"
                  y="3"
                  fontSize="7"
                  fontWeight="700"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  TE
                </text>
              </g>
            </g>
          )}

          {/* MRT Station Nodes & Interchange Pills */}
          {MAP_STATIONS.map((station) => {
            const isSelected = station.hubId === selectedStationId;
            const isDimmed =
              selectedLineFilter !== 'ALL' &&
              !station.lines.includes(selectedLineFilter);

            return (
              <g
                key={station.id}
                data-interactive-pin="true"
                transform={`translate(${station.x}, ${station.y})`}
                onClick={() => {
                  if (station.hubId) {
                    onSelectStation(station.hubId);
                  }
                }}
                style={{ opacity: isDimmed ? 0.28 : 1 }}
                className={station.hubId ? 'cursor-pointer group' : ' opacity-85'}
              >
                {isSelected && (
                  <circle
                    r="18"
                    fill="rgba(0, 113, 227, 0.16)"
                    className="animate-ping"
                  />
                )}

                {/* Station Ring */}
                {station.isInterchange ? (
                  <rect
                    x="-11"
                    y="-7"
                    width="22"
                    height="14"
                    rx="7"
                    fill="#ffffff"
                    stroke={isSelected ? '#0071e3' : '#1d1d1f'}
                    strokeWidth={isSelected ? '3' : '2.2'}
                    filter="url(#pin-shadow)"
                  />
                ) : (
                  <circle
                    r="5.5"
                    fill="#ffffff"
                    stroke={MRT_LINES[station.lines[0]].color}
                    strokeWidth="2.5"
                  />
                )}

                {/* Color dots inside interchange pill */}
                {station.isInterchange && (
                  <g>
                    {station.lines.slice(0, 3).map((l, idx) => {
                      const offset =
                        station.lines.length === 2
                          ? idx === 0
                            ? -4
                            : 4
                          : idx === 0
                          ? -5.5
                          : idx === 1
                          ? 0
                          : 5.5;
                      return (
                        <circle
                          key={l}
                          cx={offset}
                          cy="0"
                          r="2.6"
                          fill={MRT_LINES[l].color}
                        />
                      );
                    })}
                  </g>
                )}

                {/* Station Name Label */}
                <g transform="translate(0, -13)">
                  <rect
                    x={-(station.name.length * 3.1 + 6)}
                    y="-9"
                    width={station.name.length * 6.2 + 12}
                    height="14"
                    rx="4"
                    fill={isSelected ? '#1d1d1f' : 'rgba(255, 255, 255, 0.88)'}
                  />
                  <text
                    x="0"
                    y="1"
                    fontSize="9.5"
                    fontWeight={isSelected ? '700' : '600'}
                    fill={isSelected ? '#ffffff' : '#1d1d1f'}
                    textAnchor="middle"
                  >
                    {station.name}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Interactive Bus Stop Pins */}
          {showBusStopsLayer &&
            busStops.map((stop) => {
              const isSelected = stop.code === selectedStopCode;
              return (
                <g
                  key={stop.code}
                  data-interactive-pin="true"
                  transform={`translate(${stop.mapPos.x + 22}, ${stop.mapPos.y - 18})`}
                  onClick={() => onSelectBusStop(stop.code)}
                  className="cursor-pointer"
                >
                  <rect
                    x="-24"
                    y="-11"
                    width="48"
                    height="22"
                    rx="11"
                    fill={isSelected ? '#0071e3' : '#ffffff'}
                    stroke={isSelected ? '#ffffff' : '#0071e3'}
                    strokeWidth="2"
                    filter="url(#pin-shadow)"
                  />
                  <text
                    x="0"
                    y="3.5"
                    fontSize="9.5"
                    fontWeight="700"
                    fill={isSelected ? '#ffffff' : '#0071e3'}
                    textAnchor="middle"
                    className="tnum"
                  >
                    {stop.code}
                  </text>
                </g>
              );
            })}

          {/* Current User GPS Location Blue Dot at Orchard */}
          <g transform="translate(344, 396)">
            <circle r="18" fill="rgba(0, 113, 227, 0.18)" />
            <circle
              r="7"
              fill="#0071e3"
              stroke="#ffffff"
              strokeWidth="2.5"
              filter="url(#pin-shadow)"
            />
          </g>
        </g>
      </svg>

      {/* Top Floating MRT Line Filter Bar */}
      {!compactMode && (
        <div className="absolute top-4 left-4 right-16 z-10 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectLineFilter('ALL')}
            className={`h-8 px-3 rounded-full text-[12px] font-semibold tracking-[0.01em] transition-all whitespace-nowrap shrink-0 ${
              selectedLineFilter === 'ALL'
                ? 'bg-[#1d1d1f] text-white shadow-sm'
                : 'frosted-glass text-[#1d1d1f] hover:bg-white'
            }`}
          >
            All Lines (6)
          </button>
          {(Object.keys(MRT_LINES) as MRTLineId[]).map((lineId) => {
            const line = MRT_LINES[lineId];
            const active = selectedLineFilter === lineId;
            return (
              <button
                key={lineId}
                type="button"
                onClick={() =>
                  onSelectLineFilter(active ? 'ALL' : lineId)
                }
                style={{
                  backgroundColor: active ? line.color : undefined,
                }}
                className={`h-8 px-3 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  active
                    ? 'text-white shadow-sm'
                    : 'frosted-glass text-[#1d1d1f] hover:bg-white'
                }`}
              >
                <span
                  style={{
                    backgroundColor: active ? '#ffffff' : line.color,
                  }}
                  className="w-2 h-2 rounded-full"
                />
                <span>{line.id}</span>
                {line.status !== 'Normal Service' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff9500]" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Right Floating Apple Maps Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="frosted-glass rounded-[14px] flex flex-col overflow-hidden">
          <button
            type="button"
            onClick={handleRecenter}
            title="Recenter on Orchard GPS"
            className="w-10 h-10 flex items-center justify-center text-[#0071e3] hover:bg-black/5 active:scale-95 transition-all border-b border-[#e5e5ea]"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowBusStopsLayer((v) => !v)}
            title="Toggle Bus Stops Layer"
            className={`w-10 h-10 flex items-center justify-center transition-all border-b border-[#e5e5ea] ${
              showBusStopsLayer ? 'text-[#0071e3] bg-[#0071e3]/10' : 'text-[#86868b]'
            }`}
          >
            <Bus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowLiveVehicles((v) => !v)}
            title="Toggle Live Vehicles"
            className={`w-10 h-10 flex items-center justify-center transition-all ${
              showLiveVehicles ? 'text-[#0071e3] bg-[#0071e3]/10' : 'text-[#86868b]'
            }`}
          >
            <TrainFront className="w-4 h-4" />
          </button>
        </div>

        <div className="frosted-glass rounded-[14px] flex flex-col overflow-hidden">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.15).toFixed(2)))}
            title="Zoom In"
            className="w-10 h-10 flex items-center justify-center text-[#1d1d1f] hover:bg-black/5 border-b border-[#e5e5ea]"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.75, +(z - 0.15).toFixed(2)))}
            title="Zoom Out"
            className="w-10 h-10 flex items-center justify-center text-[#1d1d1f] hover:bg-black/5"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Map Context Pill */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="frosted-glass rounded-full px-3.5 py-1.5 flex items-center gap-2 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-[#34c759]" />
          <span className="text-[12px] font-semibold text-[#1d1d1f]">
            LTA DataMall Live Feed
          </span>
          <span className="text-[#86868b] text-[12px]">·</span>
          <span className="text-[12px] text-[#86868b] tnum">
            Orchard Sector (GPS ±5m)
          </span>
        </div>

        {activeBusService && (
          <div className="frosted-glass rounded-full px-3.5 py-1.5 flex items-center gap-2 pointer-events-auto">
            <Navigation className="w-3.5 h-3.5 text-[#0071e3]" />
            <span className="text-[12px] font-semibold text-[#1d1d1f]">
              Tracking Bus {activeBusService.serviceNo} → {activeBusService.destination}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
