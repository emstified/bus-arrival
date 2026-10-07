import React, { useCallback, useEffect, useState } from 'react';
import {
  Bus,
  CreditCard,
  LayoutGrid,
  Map,
  Navigation,
  TrainFront,
} from 'lucide-react';
import {
  BusServiceArrival,
  BusStop,
  INITIAL_BUS_STOPS,
  MRT_STATION_HUBS,
  MRTLineId,
  MRTStationHub,
  PLANNED_ROUTES,
  PlannedRouteOption,
} from './data/singaporeTransit';
import {
  ApiHealthResponse,
  fetchApiHealth,
  fetchLtaBusArrivals,
  mapLtaServicesToAppServices,
} from './services/ltaClient';
import { SingaporeTransitMap } from './components/SingaporeTransitMap';
import {
  MRTStationBoardScreen,
  NearbyBusArrivalsScreen,
  NetworkStatusAndWalletScreen,
  RoutePlannerScreen,
} from './components/TransitScreens';

type ActiveTab = 'nearby' | 'station' | 'planner' | 'network';
type LayoutMode = 'split' | 'showcase';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('nearby');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split');

  const [busStops, setBusStops] = useState<BusStop[]>(INITIAL_BUS_STOPS);
  const [stations, setStations] = useState<MRTStationHub[]>(MRT_STATION_HUBS);

  const [selectedStopCode, setSelectedStopCode] = useState<string>('04121');
  const [selectedStationId, setSelectedStationId] = useState<string>('orchard');
  const [activeBusService, setActiveBusService] =
    useState<BusServiceArrival | null>(INITIAL_BUS_STOPS[0].services[0]);
  const [activePlannedRoute, setActivePlannedRoute] =
    useState<PlannedRouteOption | null>(null);
  const [selectedLineFilter, setSelectedLineFilter] = useState<
    MRTLineId | 'ALL'
  >('ALL');
  const [pinnedServices, setPinnedServices] = useState<string[]>([
    '04121:7',
    '09048:190',
  ]);
  const [lastUpdatedSecondsAgo, setLastUpdatedSecondsAgo] = useState<number>(0);
  const [isFetchingLta, setIsFetchingLta] = useState<boolean>(false);
  const [ltaSourceLabel, setLtaSourceLabel] = useState<string>(
    'LTA DataMall v3 (20s)'
  );
  const [apiHealth, setApiHealth] = useState<ApiHealthResponse | null>(null);

  const checkHealth = useCallback(async (verifyUpstream = false) => {
    try {
      const health = await fetchApiHealth(verifyUpstream);
      setApiHealth(health);
    } catch {
      // Ignore transient health errors
    }
  }, []);

  const syncBusStopWithLtaApi = useCallback(
    async (stopCodeToFetch: string, serviceNo?: string) => {
      const cleanStopCode = stopCodeToFetch.trim() || '04121';
      setIsFetchingLta(true);
      try {
        const data = await fetchLtaBusArrivals(cleanStopCode, serviceNo);
        setLastUpdatedSecondsAgo(0);

        if (data._meta?.configuredAccountKey) {
          setLtaSourceLabel('LTA DataMall v3 Live (20s)');
        } else {
          setLtaSourceLabel('LTA v3 Endpoint Ready (20s)');
        }

        setBusStops((prevStops) => {
          const existingStop = prevStops.find((s) => s.code === cleanStopCode);
          const mappedServices = mapLtaServicesToAppServices(
            data.Services || [],
            existingStop?.services || []
          );

          if (existingStop) {
            return prevStops.map((stop) =>
              stop.code === cleanStopCode
                ? {
                    ...stop,
                    services:
                      mappedServices.length > 0
                        ? mappedServices
                        : stop.services,
                  }
                : stop
            );
          }

          // Dynamically add custom queried BusStopCode to the top of the list
          const newStop: BusStop = {
            code: cleanStopCode,
            name: `Bus Stop ${cleanStopCode}`,
            road: 'LTA DataMall Live Stop',
            distanceMeters: 120,
            walkMinutes: 2,
            nearestMrtBadges: [{ line: 'EWL', code: 'EW12' }],
            mapPos: { x: 580, y: 445 },
            services: mappedServices,
          };
          return [newStop, ...prevStops];
        });
      } catch {
        // Keep current timings if offline
      } finally {
        setIsFetchingLta(false);
      }
    },
    []
  );

  // Initial API health check & initial LTA BusArrival fetch for 04121
  useEffect(() => {
    checkHealth(false);
    syncBusStopWithLtaApi('04121');
  }, [checkHealth, syncBusStopWithLtaApi]);

  // Poll LTA BusArrival API every 20 seconds (matching LTA DataMall 20s refresh cadence)
  // Plus 1-second local countdown interpolation between 20s refreshes
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedSecondsAgo((prev) => {
        if (prev >= 19) {
          syncBusStopWithLtaApi(selectedStopCode);
          return 0;
        }
        return prev + 1;
      });

      setBusStops((prevStops) =>
        prevStops.map((stop) => ({
          ...stop,
          services: stop.services.map((svc) => ({
            ...svc,
            arrivals: svc.arrivals.map((arr) => ({
              ...arr,
              secondsAway:
                arr.secondsAway <= 2 ? 0 : arr.secondsAway - 1,
            })) as BusServiceArrival['arrivals'],
          })),
        }))
      );

      setStations((prevStations) =>
        prevStations.map((st) => ({
          ...st,
          platforms: st.platforms.map((pf) => ({
            ...pf,
            firstArrivalSec:
              pf.firstArrivalSec <= 5 ? 185 : pf.firstArrivalSec - 1,
            secondArrivalSec:
              pf.secondArrivalSec <= 65 ? 360 : pf.secondArrivalSec - 1,
            thirdArrivalSec:
              pf.thirdArrivalSec <= 180 ? 540 : pf.thirdArrivalSec - 1,
          })),
        }))
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedStopCode, syncBusStopWithLtaApi]);

  const handleRefreshArrivals = (stopCode?: string, serviceNo?: string) => {
    const targetCode = stopCode || selectedStopCode || '04121';
    syncBusStopWithLtaApi(targetCode, serviceNo);
  };

  const handleTogglePinService = (key: string) => {
    setPinnedServices((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectStationFromMapOrList = (stationId: string) => {
    setSelectedStationId(stationId);
    setActiveTab('station');
  };

  const handleSelectBusStopFromMapOrList = (code: string) => {
    setSelectedStopCode(code);
    syncBusStopWithLtaApi(code);
    if (activeTab !== 'nearby') {
      setActiveTab('nearby');
    }
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'planner') {
      setActivePlannedRoute(PLANNED_ROUTES[0]);
      setActiveBusService(null);
    } else {
      setActivePlannedRoute(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f2f7] text-[#1d1d1f]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="h-[56px] px-4 lg:px-6 bg-white/90 backdrop-blur-md border-b border-[#e5e5ea] flex items-center justify-between sticky top-0 z-30 shrink-0">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleTabChange('nearby');
          }}
          className="text-[18px] font-bold tracking-[-0.018em] text-[#1d1d1f] whitespace-nowrap"
        >
          SG Transit
        </a>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-[14px] font-medium text-[#86868b]">
          <button
            type="button"
            onClick={() => handleTabChange('nearby')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'nearby' && layoutMode === 'split'
                ? 'text-[#0071e3] font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-[#1d1d1f]'
            }`}
          >
            Nearby Stops
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('station')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'station' && layoutMode === 'split'
                ? 'text-[#0071e3] font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-[#1d1d1f]'
            }`}
          >
            Station Board
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('planner')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'planner' && layoutMode === 'split'
                ? 'text-[#0071e3] font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-[#1d1d1f]'
            }`}
          >
            Route Planner
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('network')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'network' && layoutMode === 'split'
                ? 'text-[#0071e3] font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-[#1d1d1f]'
            }`}
          >
            Network & Card
          </button>
        </nav>

        {/* Zone 3: Primary Action (Switch between Interactive Split Map & All-Screens Gallery) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setLayoutMode((m) => (m === 'split' ? 'showcase' : 'split'))
            }
            className="px-3.5 py-1.5 rounded-[12px] bg-[#0071e3] text-white text-[13px] font-semibold hover:bg-[#0059b5] active:scale-98 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            {layoutMode === 'split' ? (
              <>
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>All 4 Screens View</span>
              </>
            ) : (
              <>
                <Map className="w-3.5 h-3.5" />
                <span>Interactive Map Split</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT WORKSPACE */}
      {layoutMode === 'split' ? (
        /* DESKTOP / TABLET / MOBILE ADAPTIVE SPLIT WORKSPACE */
        <main className="flex-1 flex flex-col md:flex-row relative overflow-hidden md:h-[calc(100vh-56px)]">
          {/* Left / Floating 420px Transit Inspector Rail */}
          <section className="w-full md:w-[390px] lg:w-[420px] md:h-full overflow-y-auto bg-[#f2f2f7] border-r border-[#e5e5ea] p-4 flex flex-col gap-4 z-10 order-2 md:order-1 pb-24 md:pb-6">
            {/* Segmented Mode Switcher inside Inspector Rail */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#e5e5ea]/80 rounded-[12px] shrink-0">
              {(
                [
                  { id: 'nearby', label: 'Nearby' },
                  { id: 'station', label: 'MRT Hub' },
                  { id: 'planner', label: 'Planner' },
                  { id: 'network', label: 'Lines' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabChange(item.id)}
                  className={`py-1.5 px-2 rounded-[9px] text-[12px] font-semibold transition-all whitespace-nowrap ${
                    activeTab === item.id
                      ? 'bg-white text-[#1d1d1f] shadow-xs'
                      : 'text-[#86868b] hover:text-[#1d1d1f]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Active Screen View */}
            {activeTab === 'nearby' && (
              <NearbyBusArrivalsScreen
                busStops={busStops}
                selectedStopCode={selectedStopCode}
                onSelectBusStop={handleSelectBusStopFromMapOrList}
                activeBusService={activeBusService}
                onSelectBusService={(svc, code) => {
                  setActiveBusService(svc);
                  setSelectedStopCode(code);
                  setActivePlannedRoute(null);
                }}
                pinnedServices={pinnedServices}
                onTogglePinService={handleTogglePinService}
                onOpenStationHub={handleSelectStationFromMapOrList}
                onRefreshArrivals={handleRefreshArrivals}
                lastUpdatedSecondsAgo={lastUpdatedSecondsAgo}
                isFetchingLta={isFetchingLta}
                ltaSourceLabel={ltaSourceLabel}
              />
            )}

            {activeTab === 'station' && (
              <MRTStationBoardScreen
                stations={stations}
                selectedStationId={selectedStationId}
                onSelectStation={setSelectedStationId}
                onJumpToBusStop={(stopCode) => {
                  handleSelectBusStopFromMapOrList(stopCode);
                }}
              />
            )}

            {activeTab === 'planner' && (
              <RoutePlannerScreen
                routes={PLANNED_ROUTES}
                selectedRouteId={
                  activePlannedRoute?.id || PLANNED_ROUTES[0].id
                }
                onSelectRoute={(route) => {
                  setActivePlannedRoute(route);
                  setActiveBusService(null);
                }}
              />
            )}

            {activeTab === 'network' && (
              <NetworkStatusAndWalletScreen
                selectedLineFilter={selectedLineFilter}
                onSelectLineFilter={setSelectedLineFilter}
                apiHealth={apiHealth}
                onCheckApiHealth={checkHealth}
              />
            )}
          </section>

          {/* Right Interactive Singapore Map Canvas */}
          <section className="w-full h-[340px] md:h-full flex-1 relative order-1 md:order-2">
            <SingaporeTransitMap
              busStops={busStops}
              selectedStopCode={selectedStopCode}
              onSelectBusStop={handleSelectBusStopFromMapOrList}
              selectedStationId={selectedStationId}
              onSelectStation={handleSelectStationFromMapOrList}
              activeBusService={activeBusService}
              activePlannedRoute={activePlannedRoute}
              selectedLineFilter={selectedLineFilter}
              onSelectLineFilter={setSelectedLineFilter}
              stations={stations}
            />
          </section>
        </main>
      ) : (
        /* MULTI-SCREEN SHOWCASE MODE: ALL 4 SCREENS SIDE BY SIDE */
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.02em] text-[#1d1d1f]">
                Singapore Transit System — Multi-Screen Suite
              </h1>
              <p className="text-[15px] text-[#86868b]">
                Live LTA DataMall v3 BusArrival integration (20s refresh), MRT Platform & Carriage Load, Multimodal Route Planning, and API Health.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[13px] text-[#86868b] tnum">
              <span>Seats (#34c759)</span>
              <span>·</span>
              <span>Standing (#ff9500)</span>
              <span>·</span>
              <span>Crowded (#ff3b30)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
            {/* Screen Frame 1: Nearby Bus Arrivals */}
            <div className="bg-[#f2f2f7] rounded-[28px] border border-black/8 shadow-sm overflow-hidden flex flex-col">
              <div className="h-[150px] relative border-b border-[#e5e5ea]">
                <SingaporeTransitMap
                  busStops={busStops}
                  selectedStopCode={selectedStopCode}
                  onSelectBusStop={handleSelectBusStopFromMapOrList}
                  selectedStationId={selectedStationId}
                  onSelectStation={setSelectedStationId}
                  activeBusService={activeBusService}
                  activePlannedRoute={null}
                  selectedLineFilter="ALL"
                  onSelectLineFilter={setSelectedLineFilter}
                  stations={stations}
                  compactMode
                />
              </div>
              <div className="p-3.5 flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[12px] font-semibold text-[#86868b]">
                    01. Live Bus & Nearby Stops
                  </span>
                  <span className="text-[11px] font-semibold text-[#0071e3]">
                    Stop {selectedStopCode}
                  </span>
                </div>
                <NearbyBusArrivalsScreen
                  busStops={busStops.slice(0, 2)}
                  selectedStopCode={selectedStopCode}
                  onSelectBusStop={handleSelectBusStopFromMapOrList}
                  activeBusService={activeBusService}
                  onSelectBusService={(svc, code) => {
                    setActiveBusService(svc);
                    setSelectedStopCode(code);
                  }}
                  pinnedServices={pinnedServices}
                  onTogglePinService={handleTogglePinService}
                  onOpenStationHub={(id) => {
                    setSelectedStationId(id);
                  }}
                  onRefreshArrivals={handleRefreshArrivals}
                  lastUpdatedSecondsAgo={lastUpdatedSecondsAgo}
                  isFetchingLta={isFetchingLta}
                  ltaSourceLabel={ltaSourceLabel}
                />
              </div>
            </div>

            {/* Screen Frame 2: MRT Station Live Board */}
            <div className="bg-[#f2f2f7] rounded-[28px] border border-black/8 shadow-sm overflow-hidden flex flex-col p-3.5 gap-3">
              <div className="flex items-center justify-between px-1 pt-1">
                <span className="text-[12px] font-semibold text-[#86868b]">
                  02. MRT Hub & Carriage Load
                </span>
                <span className="text-[11px] font-semibold text-[#34c759]">
                  Weight Sensors Live
                </span>
              </div>
              <MRTStationBoardScreen
                stations={stations}
                selectedStationId={selectedStationId}
                onSelectStation={setSelectedStationId}
                onJumpToBusStop={(stopCode) =>
                  handleSelectBusStopFromMapOrList(stopCode)
                }
              />
            </div>

            {/* Screen Frame 3: Multimodal Route Planner */}
            <div className="bg-[#f2f2f7] rounded-[28px] border border-black/8 shadow-sm overflow-hidden flex flex-col p-3.5 gap-3">
              <div className="flex items-center justify-between px-1 pt-1">
                <span className="text-[12px] font-semibold text-[#86868b]">
                  03. Multimodal Trip Planner
                </span>
                <span className="text-[11px] font-semibold text-[#0071e3]">
                  SimplyGo Fares
                </span>
              </div>
              <RoutePlannerScreen
                routes={PLANNED_ROUTES}
                selectedRouteId={
                  activePlannedRoute?.id || PLANNED_ROUTES[0].id
                }
                onSelectRoute={setActivePlannedRoute}
              />
            </div>

            {/* Screen Frame 4: MRT Line Status & SimplyGo Wallet */}
            <div className="bg-[#f2f2f7] rounded-[28px] border border-black/8 shadow-sm overflow-hidden flex flex-col p-3.5 gap-3">
              <div className="flex items-center justify-between px-1 pt-1">
                <span className="text-[12px] font-semibold text-[#86868b]">
                  04. Network Status & Card
                </span>
                <span className="text-[11px] font-semibold text-[#1d1d1f]">
                  6 MRT Lines
                </span>
              </div>
              <NetworkStatusAndWalletScreen
                selectedLineFilter={selectedLineFilter}
                onSelectLineFilter={setSelectedLineFilter}
                apiHealth={apiHealth}
                onCheckApiHealth={checkHealth}
              />
            </div>
          </div>
        </main>
      )}

      {/* Mobile Fixed Bottom Tab Bar (< 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-[#e5e5ea] grid grid-cols-4 items-center h-14 px-2">
        <button
          type="button"
          onClick={() => {
            setLayoutMode('split');
            handleTabChange('nearby');
          }}
          className={`flex flex-col items-center justify-center h-full ${
            activeTab === 'nearby' ? 'text-[#0071e3]' : 'text-[#86868b]'
          }`}
        >
          <Bus className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Nearby</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setLayoutMode('split');
            handleTabChange('station');
          }}
          className={`flex flex-col items-center justify-center h-full ${
            activeTab === 'station' ? 'text-[#0071e3]' : 'text-[#86868b]'
          }`}
        >
          <TrainFront className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Station</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setLayoutMode('split');
            handleTabChange('planner');
          }}
          className={`flex flex-col items-center justify-center h-full ${
            activeTab === 'planner' ? 'text-[#0071e3]' : 'text-[#86868b]'
          }`}
        >
          <Navigation className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Planner</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setLayoutMode('split');
            handleTabChange('network');
          }}
          className={`flex flex-col items-center justify-center h-full ${
            activeTab === 'network' ? 'text-[#0071e3]' : 'text-[#86868b]'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Network</span>
        </button>
      </nav>
    </div>
  );
}
