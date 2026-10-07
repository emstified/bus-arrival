import {
  BusArrivalTiming,
  BusServiceArrival,
  CrowdLevel,
} from '../data/singaporeTransit';

export interface LtaBusTimingRaw {
  OriginCode: string;
  DestinationCode: string;
  EstimatedArrival: string;
  Monitored: number;
  Latitude: string;
  Longitude: string;
  VisitNumber: string;
  Load: 'SEA' | 'SDA' | 'LSD' | string;
  Feature: 'WAB' | string;
  Type: 'SD' | 'DD' | 'BD' | string;
}

export interface LtaServiceRaw {
  ServiceNo: string;
  Operator: 'SBST' | 'SMRT' | 'TTS' | 'GAS' | string;
  NextBus: LtaBusTimingRaw;
  NextBus2: LtaBusTimingRaw;
  NextBus3: LtaBusTimingRaw;
}

export interface LtaBusArrivalResponse {
  'odata.metadata'?: string;
  BusStopCode: string;
  Services: LtaServiceRaw[];
  _meta?: {
    source: 'lta-datamall-v3' | 'fallback-simulation';
    configuredAccountKey: boolean;
    refreshIntervalSeconds: number;
    fetchedAt: string;
    notice?: string;
  };
}

export interface ApiHealthResponse {
  status: string;
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  endpoints: {
    health: string;
    busArrival: string;
  };
  ltaDataMall: {
    configured: boolean;
    endpoint: string;
    refreshIntervalSeconds: number;
    upstreamCheck?: {
      checked: boolean;
      reachable: boolean | null;
      httpStatus: number | null;
      latencyMs: number | null;
      message: string;
    };
  };
}

const DESTINATION_CODE_NAMES: Record<string, string> = {
  '17009': 'Clementi Int',
  '10009': 'Choa Chu Kang / Bukit Merah Int',
  '82009': 'Eunos Int (Loop)',
  '80009': 'Geylang Lor 1 Ter',
  '22009': 'Boon Lay Int',
  '14009': 'Bukit Merah / HarbourFront Int',
  '09048': 'Changi Airport PTB1/2/3',
  '03218': 'Marina Bay / Soon Lee Depot',
  '11009': 'Ghim Moh Ter (Loop)',
  '03239': 'Shenton Way / Ang Mo Kio Int',
  '02099': 'Marina Centre Ter',
};

function mapLtaLoadToCrowd(load?: string): CrowdLevel {
  if (load === 'LSD') return 'crowded';
  if (load === 'SDA') return 'standing';
  return 'seats'; // Default SEA = Seats Available
}

function mapLtaTypeToDeck(type?: string): 'SD' | 'DD' | 'BD' {
  if (type === 'DD') return 'DD';
  if (type === 'BD') return 'BD';
  return 'SD';
}

function parseLtaBusTiming(
  raw: LtaBusTimingRaw | undefined,
  fallbackSeconds: number
): BusArrivalTiming {
  if (!raw || !raw.EstimatedArrival) {
    return {
      secondsAway: fallbackSeconds,
      crowd: 'seats',
      deck: 'SD',
      wheelchair: true,
      lat: 1.3001,
      lng: 103.8401,
    };
  }

  const arrivalMs = Date.parse(raw.EstimatedArrival);
  const diffSeconds = Number.isNaN(arrivalMs)
    ? fallbackSeconds
    : Math.max(0, Math.round((arrivalMs - Date.now()) / 1000));

  return {
    secondsAway: diffSeconds,
    crowd: mapLtaLoadToCrowd(raw.Load),
    deck: mapLtaTypeToDeck(raw.Type),
    wheelchair: raw.Feature === 'WAB',
    lat: parseFloat(raw.Latitude) || 1.3001,
    lng: parseFloat(raw.Longitude) || 103.8401,
  };
}

export function mapLtaServicesToAppServices(
  ltaServices: LtaServiceRaw[],
  existingServices: BusServiceArrival[] = []
): BusServiceArrival[] {
  return ltaServices.map((raw) => {
    const existing = existingServices.find(
      (s) => s.serviceNo.toLowerCase() === raw.ServiceNo.toLowerCase()
    );

    const destCode = raw.NextBus?.DestinationCode || '';
    const destination =
      existing?.destination ||
      DESTINATION_CODE_NAMES[destCode] ||
      (destCode ? `Interchange (${destCode})` : 'Terminal');

    return {
      serviceNo: raw.ServiceNo,
      operator: (raw.Operator as BusServiceArrival['operator']) || 'SBST',
      destination,
      category: existing?.category || 'Trunk',
      routeCoords: existing?.routeCoords || [
        [355, 385],
        [495, 430],
        [645, 395],
      ],
      arrivals: [
        parseLtaBusTiming(raw.NextBus, 60),
        parseLtaBusTiming(raw.NextBus2, 420),
        parseLtaBusTiming(raw.NextBus3, 840),
      ],
    };
  });
}

export async function fetchLtaBusArrivals(
  busStopCode: string,
  serviceNo?: string
): Promise<LtaBusArrivalResponse> {
  const params = new URLSearchParams({ BusStopCode: busStopCode.trim() });
  if (serviceNo && serviceNo.trim()) {
    params.set('ServiceNo', serviceNo.trim());
  }

  const res = await fetch(`/api/bus-arrival?${params.toString()}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(
      errBody.error || `Failed to fetch bus arrivals (HTTP ${res.status})`
    );
  }
  return res.json();
}

export async function fetchApiHealth(
  verifyUpstream = false
): Promise<ApiHealthResponse> {
  const url = verifyUpstream
    ? '/api/health?verifyUpstream=true'
    : '/api/health';
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Health check failed (HTTP ${res.status})`);
  }
  return res.json();
}
