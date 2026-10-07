export type CrowdLevel = 'seats' | 'standing' | 'crowded';

export type MRTLineId = 'NSL' | 'EWL' | 'NEL' | 'CCL' | 'DTL' | 'TEL';

export interface MRTLineInfo {
  id: MRTLineId;
  code: string;
  name: string;
  color: string;
  termini: [string, string];
  status: 'Normal Service' | 'Minor Delay' | 'Scheduled Maintenance';
  frequencyPeak: string;
  totalStations: number;
  statusDetail: string;
}

export interface LineBadge {
  line: MRTLineId;
  code: string;
}

export interface BusArrivalTiming {
  secondsAway: number; // 0-60 = Arr
  crowd: CrowdLevel;
  deck: 'SD' | 'DD' | 'BD'; // Single Deck, Double Deck, Bendy
  wheelchair: boolean;
  lat: number;
  lng: number;
}

export interface BusServiceArrival {
  serviceNo: string;
  operator: 'SBST' | 'SMRT' | 'TTS' | 'GAS';
  destination: string;
  category: 'Trunk' | 'Express' | 'City Direct';
  routeCoords: [number, number][];
  arrivals: [BusArrivalTiming, BusArrivalTiming, BusArrivalTiming];
}

export interface BusStop {
  code: string;
  name: string;
  road: string;
  distanceMeters: number;
  walkMinutes: number;
  nearestMrtBadges: LineBadge[];
  mapPos: { x: number; y: number }; // 0-1000 SVG space
  services: BusServiceArrival[];
}

export interface TrainPlatformArrival {
  id: string;
  line: MRTLineId;
  platform: string;
  towards: string;
  towardsCode: string;
  firstArrivalSec: number;
  secondArrivalSec: number;
  thirdArrivalSec: number;
  carLoads: CrowdLevel[]; // 4 or 6 cars
}

export interface StationExit {
  code: string;
  landmarks: string;
  accessible: boolean;
  busStopCode?: string;
}

export interface MRTStationHub {
  id: string;
  name: string;
  badges: LineBadge[];
  zone: string;
  mapPos: { x: number; y: number };
  walkMinutes: number;
  distanceMeters: number;
  liftStatus: 'All Lifts Operational' | 'Exit B Lift Maintenance';
  firstTrain: string;
  lastTrain: string;
  platforms: TrainPlatformArrival[];
  exits: StationExit[];
  crowdByHour: { hour: string; load: number }[];
}

export interface RouteStep {
  type: 'walk' | 'mrt' | 'bus';
  lineOrService?: string;
  lineId?: MRTLineId;
  from: string;
  fromCode?: string;
  to: string;
  toCode?: string;
  durationMin: number;
  stopsCount?: number;
  platform?: string;
  crowd?: CrowdLevel;
  detail: string;
}

export interface PlannedRouteOption {
  id: string;
  originId: string;
  destinationId: string;
  tag: 'Fastest' | 'Fewest Transfers' | 'Sheltered Walk' | 'Lowest Crowd';
  totalMinutes: number;
  arrivalTimeStr: string;
  fareAdultSgd: number;
  fareConcessionSgd: number;
  walkMinutes: number;
  crowdSummary: CrowdLevel;
  steps: RouteStep[];
  svgPath: [number, number][];
}

export const MRT_LINES: Record<MRTLineId, MRTLineInfo> = {
  NSL: {
    id: 'NSL',
    code: 'NS',
    name: 'North-South Line',
    color: '#d42e12',
    termini: ['Jurong East', 'Marina South Pier'],
    status: 'Normal Service',
    frequencyPeak: '2.0 min',
    totalStations: 27,
    statusDetail: 'Trains operating at 2-minute intervals across all 27 stations.',
  },
  EWL: {
    id: 'EWL',
    code: 'EW',
    name: 'East-West Line',
    color: '#009645',
    termini: ['Tuas Link', 'Pasir Ris / Changi Airport'],
    status: 'Normal Service',
    frequencyPeak: '2.2 min',
    totalStations: 35,
    statusDetail: 'Smooth service between Pasir Ris, Changi Airport, and Tuas Link.',
  },
  NEL: {
    id: 'NEL',
    code: 'NE',
    name: 'North East Line',
    color: '#8f4199',
    termini: ['HarbourFront', 'Punggol Coast'],
    status: 'Normal Service',
    frequencyPeak: '1.9 min',
    totalStations: 17,
    statusDetail: 'Automated 6-car trains running on schedule.',
  },
  CCL: {
    id: 'CCL',
    code: 'CC',
    name: 'Circle Line',
    color: '#f99d1c',
    termini: ['Dhoby Ghaut / Marina Bay', 'HarbourFront'],
    status: 'Minor Delay',
    frequencyPeak: '3.0 min',
    totalStations: 30,
    statusDetail: 'Additional 2 min travel time between Botanic Gardens and Bishan due to track inspection.',
  },
  DTL: {
    id: 'DTL',
    code: 'DT',
    name: 'Downtown Line',
    color: '#005ec4',
    termini: ['Bukit Panjang', 'Expo'],
    status: 'Normal Service',
    frequencyPeak: '2.1 min',
    totalStations: 35,
    statusDetail: 'High-frequency service across central downtown corridor.',
  },
  TEL: {
    id: 'TEL',
    code: 'TE',
    name: 'Thomson-East Coast Line',
    color: '#9d5b25',
    termini: ['Woodlands North', 'Bayshore'],
    status: 'Normal Service',
    frequencyPeak: '2.5 min',
    totalStations: 27,
    statusDetail: 'East Coast Stage 4 stations operating normally.',
  },
};

export const CROWD_META: Record<
  CrowdLevel,
  { label: string; shortLabel: string; color: string; bgTint: string; bars: 1 | 2 | 3 }
> = {
  seats: {
    label: 'Seats Available',
    shortLabel: 'Seats',
    color: '#34c759',
    bgTint: 'rgba(52, 199, 89, 0.12)',
    bars: 1,
  },
  standing: {
    label: 'Standing Available',
    shortLabel: 'Standing',
    color: '#ff9500',
    bgTint: 'rgba(255, 149, 0, 0.12)',
    bars: 2,
  },
  crowded: {
    label: 'Limited Standing',
    shortLabel: 'Crowded',
    color: '#ff3b30',
    bgTint: 'rgba(255, 59, 48, 0.12)',
    bars: 3,
  },
};

export const INITIAL_BUS_STOPS: BusStop[] = [
  {
    code: '04121',
    name: "St. Joseph's Ch",
    road: 'Victoria St',
    distanceMeters: 45,
    walkMinutes: 1,
    nearestMrtBadges: [
      { line: 'EWL', code: 'EW12' },
      { line: 'DTL', code: 'DT14' },
    ],
    mapPos: { x: 615, y: 425 },
    services: [
      {
        serviceNo: '7',
        operator: 'SBST',
        destination: 'Clementi Int',
        category: 'Trunk',
        routeCoords: [
          [780, 310],
          [645, 395],
          [615, 425],
          [495, 430],
          [320, 425],
        ],
        arrivals: [
          { secondsAway: 42, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.2976, lng: 103.8532 },
          { secondsAway: 460, crowd: 'seats', deck: 'SD', wheelchair: true, lat: 1.2991, lng: 103.8548 },
          { secondsAway: 910, crowd: 'standing', deck: 'DD', wheelchair: true, lat: 1.3012, lng: 103.8565 },
        ],
      },
      {
        serviceNo: '12',
        operator: 'GAS',
        destination: 'New Bridge Rd Ter',
        category: 'Trunk',
        routeCoords: [
          [760, 380],
          [645, 395],
          [615, 425],
          [555, 505],
          [455, 570],
        ],
        arrivals: [
          { secondsAway: 130, crowd: 'standing', deck: 'DD', wheelchair: true, lat: 1.2984, lng: 103.8541 },
          { secondsAway: 520, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.3005, lng: 103.8572 },
          { secondsAway: 960, crowd: 'seats', deck: 'SD', wheelchair: true, lat: 1.3031, lng: 103.8601 },
        ],
      },
      {
        serviceNo: '175',
        operator: 'SBST',
        destination: 'Clementi Int',
        category: 'Trunk',
        routeCoords: [
          [740, 290],
          [615, 425],
          [470, 525],
          [320, 580],
        ],
        arrivals: [
          { secondsAway: 85, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.2979, lng: 103.8536 },
          { secondsAway: 490, crowd: 'seats', deck: 'SD', wheelchair: true, lat: 1.3001, lng: 103.8559 },
          { secondsAway: 890, crowd: 'standing', deck: 'DD', wheelchair: true, lat: 1.3025, lng: 103.8588 },
        ],
      },
      {
        serviceNo: '197',
        operator: 'SBST',
        destination: 'Jurong East Int',
        category: 'Trunk',
        routeCoords: [
          [750, 350],
          [615, 425],
          [555, 505],
          [405, 605],
        ],
        arrivals: [
          { secondsAway: 310, crowd: 'crowded', deck: 'DD', wheelchair: true, lat: 1.2991, lng: 103.855 },
          { secondsAway: 740, crowd: 'standing', deck: 'DD', wheelchair: true, lat: 1.3018, lng: 103.8579 },
          { secondsAway: 1180, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.3045, lng: 103.8612 },
        ],
      },
      {
        serviceNo: '851',
        operator: 'SMRT',
        destination: 'Bukit Merah Int',
        category: 'Trunk',
        routeCoords: [
          [560, 210],
          [615, 425],
          [455, 570],
          [405, 605],
        ],
        arrivals: [
          { secondsAway: 55, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.2977, lng: 103.8533 },
          { secondsAway: 410, crowd: 'standing', deck: 'BD', wheelchair: true, lat: 1.3008, lng: 103.8549 },
          { secondsAway: 830, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.3039, lng: 103.8562 },
        ],
      },
    ],
  },
  {
    code: '09048',
    name: 'Orchard Stn / Tang Plaza',
    road: 'Orchard Rd',
    distanceMeters: 65,
    walkMinutes: 1,
    nearestMrtBadges: [
      { line: 'NSL', code: 'NS22' },
      { line: 'TEL', code: 'TE14' },
    ],
    mapPos: { x: 355, y: 385 },
    services: [
      {
        serviceNo: '190',
        operator: 'SMRT',
        destination: 'Choa Chu Kang Int',
        category: 'Trunk',
        routeCoords: [
          [260, 180],
          [310, 260],
          [355, 385],
          [430, 420],
          [535, 455],
        ],
        arrivals: [
          { secondsAway: 35, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.3042, lng: 103.8318 },
          { secondsAway: 390, crowd: 'standing', deck: 'DD', wheelchair: true, lat: 1.3112, lng: 103.826 },
          { secondsAway: 780, crowd: 'seats', deck: 'BD', wheelchair: true, lat: 1.325, lng: 103.819 },
        ],
      },
      {
        serviceNo: '14',
        operator: 'SBST',
        destination: 'Bedok Int',
        category: 'Trunk',
        routeCoords: [
          [220, 430],
          [355, 385],
          [495, 430],
          [605, 460],
          [780, 410],
        ],
        arrivals: [
          { secondsAway: 140, crowd: 'standing', deck: 'DD', wheelchair: true, lat: 1.3038, lng: 103.8301 },
          { secondsAway: 520, crowd: 'seats', deck: 'SD', wheelchair: true, lat: 1.301, lng: 103.821 },
          { secondsAway: 940, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.298, lng: 103.811 },
        ],
      },
      {
        serviceNo: '36',
        operator: 'GAS',
        destination: 'Changi Airport PTB1/2/3',
        category: 'Trunk',
        routeCoords: [
          [295, 370],
          [355, 385],
          [500, 440],
          [660, 520],
          [850, 490],
        ],
        arrivals: [
          { secondsAway: 260, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.305, lng: 103.829 },
          { secondsAway: 680, crowd: 'standing', deck: 'DD', wheelchair: true, lat: 1.308, lng: 103.823 },
          { secondsAway: 1120, crowd: 'seats', deck: 'SD', wheelchair: true, lat: 1.312, lng: 103.818 },
        ],
      },
      {
        serviceNo: '174',
        operator: 'SBST',
        destination: 'Boon Lay Int',
        category: 'Trunk',
        routeCoords: [
          [160, 390],
          [280, 380],
          [355, 385],
          [495, 430],
          [570, 520],
        ],
        arrivals: [
          { secondsAway: 420, crowd: 'crowded', deck: 'DD', wheelchair: true, lat: 1.302, lng: 103.835 },
          { secondsAway: 840, crowd: 'standing', deck: 'SD', wheelchair: true, lat: 1.299, lng: 103.842 },
          { secondsAway: 1320, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.295, lng: 103.849 },
        ],
      },
      {
        serviceNo: '502',
        operator: 'SBST',
        destination: 'Soon Lee Depot (Express)',
        category: 'Express',
        routeCoords: [
          [140, 470],
          [270, 420],
          [355, 385],
          [540, 540],
          [635, 605],
        ],
        arrivals: [
          { secondsAway: 195, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.304, lng: 103.831 },
          { secondsAway: 740, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.297, lng: 103.841 },
          { secondsAway: 1480, crowd: 'standing', deck: 'DD', wheelchair: true, lat: 1.291, lng: 103.855 },
        ],
      },
    ],
  },
  {
    code: '09022',
    name: 'Bef Orchard Blvd',
    road: 'Paterson Rd',
    distanceMeters: 180,
    walkMinutes: 3,
    nearestMrtBadges: [
      { line: 'TEL', code: 'TE13' },
      { line: 'NSL', code: 'NS22' },
    ],
    mapPos: { x: 320, y: 425 },
    services: [
      {
        serviceNo: '7',
        operator: 'SBST',
        destination: 'Clementi Int',
        category: 'Trunk',
        routeCoords: [
          [170, 360],
          [260, 400],
          [320, 425],
          [495, 430],
          [645, 395],
        ],
        arrivals: [
          { secondsAway: 48, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.3021, lng: 103.8312 },
          { secondsAway: 460, crowd: 'seats', deck: 'SD', wheelchair: true, lat: 1.301, lng: 103.839 },
          { secondsAway: 910, crowd: 'standing', deck: 'DD', wheelchair: true, lat: 1.299, lng: 103.848 },
        ],
      },
      {
        serviceNo: '111',
        operator: 'SBST',
        destination: 'Ghim Moh Ter (Loop)',
        category: 'Trunk',
        routeCoords: [
          [200, 415],
          [320, 425],
          [495, 430],
          [615, 515],
        ],
        arrivals: [
          { secondsAway: 210, crowd: 'standing', deck: 'SD', wheelchair: true, lat: 1.3015, lng: 103.8305 },
          { secondsAway: 590, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.298, lng: 103.838 },
          { secondsAway: 1050, crowd: 'seats', deck: 'SD', wheelchair: true, lat: 1.295, lng: 103.845 },
        ],
      },
      {
        serviceNo: '106',
        operator: 'TTS',
        destination: 'Shenton Way Ter',
        category: 'Trunk',
        routeCoords: [
          [190, 250],
          [280, 350],
          [320, 425],
          [495, 430],
          [580, 620],
        ],
        arrivals: [
          { secondsAway: 330, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.303, lng: 103.829 },
          { secondsAway: 720, crowd: 'crowded', deck: 'DD', wheelchair: true, lat: 1.309, lng: 103.822 },
          { secondsAway: 1180, crowd: 'standing', deck: 'SD', wheelchair: true, lat: 1.315, lng: 103.815 },
        ],
      },
    ],
  },
  {
    code: '08057',
    name: 'Dhoby Ghaut Stn',
    road: 'Orchard Rd',
    distanceMeters: 620,
    walkMinutes: 8,
    nearestMrtBadges: [
      { line: 'NSL', code: 'NS24' },
      { line: 'NEL', code: 'NE6' },
      { line: 'CCL', code: 'CC1' },
    ],
    mapPos: { x: 495, y: 430 },
    services: [
      {
        serviceNo: '65',
        operator: 'SBST',
        destination: 'Tampines Int',
        category: 'Trunk',
        routeCoords: [
          [340, 680],
          [440, 530],
          [495, 430],
          [585, 345],
          [730, 290],
        ],
        arrivals: [
          { secondsAway: 25, crowd: 'standing', deck: 'DD', wheelchair: true, lat: 1.2993, lng: 103.8455 },
          { secondsAway: 380, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.294, lng: 103.841 },
          { secondsAway: 820, crowd: 'seats', deck: 'SD', wheelchair: true, lat: 1.288, lng: 103.835 },
        ],
      },
      {
        serviceNo: '131',
        operator: 'SBST',
        destination: 'St. Michael’s Ter',
        category: 'Trunk',
        routeCoords: [
          [340, 680],
          [495, 430],
          [520, 310],
          [560, 210],
        ],
        arrivals: [
          { secondsAway: 175, crowd: 'seats', deck: 'SD', wheelchair: true, lat: 1.2988, lng: 103.8461 },
          { secondsAway: 540, crowd: 'standing', deck: 'DD', wheelchair: true, lat: 1.292, lng: 103.843 },
          { secondsAway: 960, crowd: 'seats', deck: 'SD', wheelchair: true, lat: 1.286, lng: 103.839 },
        ],
      },
    ],
  },
  {
    code: '03019',
    name: 'Raffles Place Stn Exit F',
    road: 'Robinson Rd',
    distanceMeters: 1450,
    walkMinutes: 16,
    nearestMrtBadges: [
      { line: 'NSL', code: 'NS26' },
      { line: 'EWL', code: 'EW14' },
    ],
    mapPos: { x: 565, y: 585 },
    services: [
      {
        serviceNo: '97',
        operator: 'TTS',
        destination: 'Marina Centre Ter',
        category: 'Trunk',
        routeCoords: [
          [180, 490],
          [340, 680],
          [565, 585],
          [640, 555],
        ],
        arrivals: [
          { secondsAway: 52, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.2839, lng: 103.8514 },
          { secondsAway: 310, crowd: 'standing', deck: 'DD', wheelchair: true, lat: 1.279, lng: 103.846 },
          { secondsAway: 690, crowd: 'crowded', deck: 'BD', wheelchair: true, lat: 1.274, lng: 103.839 },
        ],
      },
      {
        serviceNo: '133',
        operator: 'SBST',
        destination: 'Ang Mo Kio Int',
        category: 'Trunk',
        routeCoords: [
          [580, 620],
          [565, 585],
          [605, 460],
          [645, 395],
          [590, 210],
        ],
        arrivals: [
          { secondsAway: 130, crowd: 'seats', deck: 'DD', wheelchair: true, lat: 1.2842, lng: 103.8519 },
          { secondsAway: 495, crowd: 'seats', deck: 'SD', wheelchair: true, lat: 1.281, lng: 103.849 },
          { secondsAway: 890, crowd: 'standing', deck: 'DD', wheelchair: true, lat: 1.278, lng: 103.847 },
        ],
      },
    ],
  },
];

export const MRT_STATION_HUBS: MRTStationHub[] = [
  {
    id: 'orchard',
    name: 'Orchard',
    badges: [
      { line: 'NSL', code: 'NS22' },
      { line: 'TEL', code: 'TE14' },
    ],
    zone: 'Orchard Planning Area · Underground Interchange',
    mapPos: { x: 355, y: 385 },
    walkMinutes: 1,
    distanceMeters: 65,
    liftStatus: 'All Lifts Operational',
    firstTrain: '05:49 AM',
    lastTrain: '11:58 PM',
    platforms: [
      {
        id: 'orchard-nsl-a',
        line: 'NSL',
        platform: 'Platform A',
        towards: 'Jurong East via Woodlands',
        towardsCode: 'NS1',
        firstArrivalSec: 95,
        secondArrivalSec: 275,
        thirdArrivalSec: 480,
        carLoads: ['seats', 'standing', 'standing', 'crowded', 'standing', 'seats'],
      },
      {
        id: 'orchard-nsl-b',
        line: 'NSL',
        platform: 'Platform B',
        towards: 'Marina South Pier',
        towardsCode: 'NS28',
        firstArrivalSec: 40,
        secondArrivalSec: 195,
        thirdArrivalSec: 390,
        carLoads: ['seats', 'seats', 'standing', 'standing', 'seats', 'seats'],
      },
      {
        id: 'orchard-tel-c',
        line: 'TEL',
        platform: 'Platform C',
        towards: 'Bayshore',
        towardsCode: 'TE29',
        firstArrivalSec: 135,
        secondArrivalSec: 340,
        thirdArrivalSec: 590,
        carLoads: ['seats', 'seats', 'standing', 'seats'],
      },
      {
        id: 'orchard-tel-d',
        line: 'TEL',
        platform: 'Platform D',
        towards: 'Woodlands North',
        towardsCode: 'TE1',
        firstArrivalSec: 210,
        secondArrivalSec: 450,
        thirdArrivalSec: 690,
        carLoads: ['seats', 'standing', 'seats', 'seats'],
      },
    ],
    exits: [
      { code: 'Exit 1', landmarks: 'ION Orchard, Wisma Atria, Tang Plaza', accessible: true, busStopCode: '09048' },
      { code: 'Exit 2', landmarks: 'Wheelock Place, Shaw House, Liat Towers', accessible: true },
      { code: 'Exit 3', landmarks: 'Paragon, Ngee Ann City, Takashimaya', accessible: true },
      { code: 'Exit 11', landmarks: 'Orchard Boulevard, Camden Medical Centre', accessible: true, busStopCode: '09022' },
    ],
    crowdByHour: [
      { hour: '6a', load: 18 },
      { hour: '8a', load: 68 },
      { hour: '10a', load: 54 },
      { hour: '12p', load: 76 },
      { hour: '2p', load: 64 },
      { hour: '4p', load: 72 },
      { hour: '6p', load: 92 },
      { hour: '8p', load: 81 },
      { hour: '10p', load: 45 },
    ],
  },
  {
    id: 'dhoby-ghaut',
    name: 'Dhoby Ghaut',
    badges: [
      { line: 'NSL', code: 'NS24' },
      { line: 'NEL', code: 'NE6' },
      { line: 'CCL', code: 'CC1' },
    ],
    zone: 'Museum Planning Area · Triple-Line Interchange',
    mapPos: { x: 495, y: 430 },
    walkMinutes: 8,
    distanceMeters: 620,
    liftStatus: 'All Lifts Operational',
    firstTrain: '05:44 AM',
    lastTrain: '12:03 AM',
    platforms: [
      {
        id: 'dg-nsl-a',
        line: 'NSL',
        platform: 'Platform A',
        towards: 'Jurong East via Woodlands',
        towardsCode: 'NS1',
        firstArrivalSec: 110,
        secondArrivalSec: 290,
        thirdArrivalSec: 510,
        carLoads: ['standing', 'standing', 'crowded', 'crowded', 'standing', 'seats'],
      },
      {
        id: 'dg-nel-c',
        line: 'NEL',
        platform: 'Platform C',
        towards: 'Punggol Coast',
        towardsCode: 'NE18',
        firstArrivalSec: 32,
        secondArrivalSec: 180,
        thirdArrivalSec: 360,
        carLoads: ['seats', 'standing', 'standing', 'standing', 'seats', 'seats'],
      },
      {
        id: 'dg-nel-d',
        line: 'NEL',
        platform: 'Platform D',
        towards: 'HarbourFront',
        towardsCode: 'NE1',
        firstArrivalSec: 145,
        secondArrivalSec: 310,
        thirdArrivalSec: 495,
        carLoads: ['seats', 'seats', 'standing', 'standing', 'seats', 'seats'],
      },
      {
        id: 'dg-ccl-e',
        line: 'CCL',
        platform: 'Platform E',
        towards: 'HarbourFront via Bishan',
        towardsCode: 'CC29',
        firstArrivalSec: 190,
        secondArrivalSec: 430,
        thirdArrivalSec: 670,
        carLoads: ['standing', 'crowded', 'standing'],
      },
    ],
    exits: [
      { code: 'Exit A', landmarks: 'The Cathay, SMU, Handy Road', accessible: true },
      { code: 'Exit B', landmarks: 'Plaza Singapura, Istana Park', accessible: true, busStopCode: '08057' },
      { code: 'Exit E', landmarks: 'Atrium@Orchard, Temasek Shophouse', accessible: true },
    ],
    crowdByHour: [
      { hour: '6a', load: 24 },
      { hour: '8a', load: 88 },
      { hour: '10a', load: 62 },
      { hour: '12p', load: 79 },
      { hour: '2p', load: 66 },
      { hour: '4p', load: 74 },
      { hour: '6p', load: 95 },
      { hour: '8p', load: 74 },
      { hour: '10p', load: 42 },
    ],
  },
  {
    id: 'city-hall',
    name: 'City Hall',
    badges: [
      { line: 'NSL', code: 'NS25' },
      { line: 'EWL', code: 'EW13' },
    ],
    zone: 'Civic District · Cross-Platform Interchange',
    mapPos: { x: 555, y: 505 },
    walkMinutes: 12,
    distanceMeters: 980,
    liftStatus: 'All Lifts Operational',
    firstTrain: '05:52 AM',
    lastTrain: '12:05 AM',
    platforms: [
      {
        id: 'ch-ewl-a',
        line: 'EWL',
        platform: 'Platform A',
        towards: 'Pasir Ris / Changi Airport',
        towardsCode: 'EW1',
        firstArrivalSec: 50,
        secondArrivalSec: 210,
        thirdArrivalSec: 390,
        carLoads: ['seats', 'standing', 'standing', 'crowded', 'standing', 'seats'],
      },
      {
        id: 'ch-nsl-b',
        line: 'NSL',
        platform: 'Platform B',
        towards: 'Marina South Pier',
        towardsCode: 'NS28',
        firstArrivalSec: 125,
        secondArrivalSec: 310,
        thirdArrivalSec: 500,
        carLoads: ['seats', 'seats', 'standing', 'seats', 'seats', 'seats'],
      },
      {
        id: 'ch-ewl-c',
        line: 'EWL',
        platform: 'Platform C',
        towards: 'Tuas Link',
        towardsCode: 'EW33',
        firstArrivalSec: 85,
        secondArrivalSec: 260,
        thirdArrivalSec: 445,
        carLoads: ['standing', 'standing', 'crowded', 'standing', 'standing', 'seats'],
      },
      {
        id: 'ch-nsl-d',
        line: 'NSL',
        platform: 'Platform D',
        towards: 'Jurong East via Woodlands',
        towardsCode: 'NS1',
        firstArrivalSec: 165,
        secondArrivalSec: 350,
        thirdArrivalSec: 540,
        carLoads: ['seats', 'standing', 'standing', 'standing', 'seats', 'seats'],
      },
    ],
    exits: [
      { code: 'Exit A', landmarks: 'Raffles City Shopping Centre, Swissôtel The Stamford', accessible: true },
      { code: 'Exit B', landmarks: 'National Gallery Singapore, Padang, St. Andrew’s Cathedral', accessible: true },
      { code: 'Exit C', landmarks: 'CityLink Mall, Esplanade Theatres on the Bay', accessible: true },
      { code: 'Exit D', landmarks: 'Capitol Singapore, Funan Digitalife Mall', accessible: true },
    ],
    crowdByHour: [
      { hour: '6a', load: 22 },
      { hour: '8a', load: 86 },
      { hour: '10a', load: 58 },
      { hour: '12p', load: 74 },
      { hour: '2p', load: 61 },
      { hour: '4p', load: 69 },
      { hour: '6p', load: 91 },
      { hour: '8p', load: 73 },
      { hour: '10p', load: 39 },
    ],
  },
  {
    id: 'raffles-place',
    name: 'Raffles Place',
    badges: [
      { line: 'NSL', code: 'NS26' },
      { line: 'EWL', code: 'EW14' },
    ],
    zone: 'Central Business District · Financial Hub',
    mapPos: { x: 565, y: 585 },
    walkMinutes: 16,
    distanceMeters: 1450,
    liftStatus: 'All Lifts Operational',
    firstTrain: '05:53 AM',
    lastTrain: '12:06 AM',
    platforms: [
      {
        id: 'rp-ewl-a',
        line: 'EWL',
        platform: 'Platform A',
        towards: 'Pasir Ris / Changi Airport',
        towardsCode: 'EW1',
        firstArrivalSec: 45,
        secondArrivalSec: 185,
        thirdArrivalSec: 355,
        carLoads: ['standing', 'crowded', 'crowded', 'standing', 'standing', 'seats'],
      },
      {
        id: 'rp-nsl-b',
        line: 'NSL',
        platform: 'Platform B',
        towards: 'Jurong East via Orchard',
        towardsCode: 'NS1',
        firstArrivalSec: 70,
        secondArrivalSec: 225,
        thirdArrivalSec: 410,
        carLoads: ['standing', 'standing', 'crowded', 'standing', 'seats', 'seats'],
      },
      {
        id: 'rp-ewl-c',
        line: 'EWL',
        platform: 'Platform C',
        towards: 'Tuas Link',
        towardsCode: 'EW33',
        firstArrivalSec: 115,
        secondArrivalSec: 295,
        thirdArrivalSec: 470,
        carLoads: ['seats', 'standing', 'standing', 'standing', 'seats', 'seats'],
      },
    ],
    exits: [
      { code: 'Exit A', landmarks: 'Change Alley Mall, One Raffles Place, Republic Plaza', accessible: true },
      { code: 'Exit B', landmarks: 'OCBC Centre, UOB Plaza, Boat Quay', accessible: true },
      { code: 'Exit F', landmarks: 'Capital Square, Lau Pa Sat, Robinson Road', accessible: true, busStopCode: '03019' },
    ],
    crowdByHour: [
      { hour: '6a', load: 30 },
      { hour: '8a', load: 96 },
      { hour: '10a', load: 64 },
      { hour: '12p', load: 82 },
      { hour: '2p', load: 55 },
      { hour: '4p', load: 62 },
      { hour: '6p', load: 98 },
      { hour: '8p', load: 52 },
      { hour: '10p', load: 24 },
    ],
  },
  {
    id: 'marina-bay',
    name: 'Marina Bay',
    badges: [
      { line: 'NSL', code: 'NS27' },
      { line: 'CCL', code: 'CE2' },
      { line: 'TEL', code: 'TE20' },
    ],
    zone: 'Marina South · Triple-Line Interchange',
    mapPos: { x: 605, y: 655 },
    walkMinutes: 19,
    distanceMeters: 1750,
    liftStatus: 'All Lifts Operational',
    firstTrain: '05:55 AM',
    lastTrain: '11:59 PM',
    platforms: [
      {
        id: 'mb-nsl-a',
        line: 'NSL',
        platform: 'Platform A',
        towards: 'Jurong East via Orchard',
        towardsCode: 'NS1',
        firstArrivalSec: 90,
        secondArrivalSec: 270,
        thirdArrivalSec: 450,
        carLoads: ['seats', 'seats', 'standing', 'seats', 'seats', 'seats'],
      },
      {
        id: 'mb-tel-c',
        line: 'TEL',
        platform: 'Platform C',
        towards: 'Gardens by the Bay / Bayshore',
        towardsCode: 'TE29',
        firstArrivalSec: 55,
        secondArrivalSec: 235,
        thirdArrivalSec: 440,
        carLoads: ['seats', 'standing', 'seats', 'seats'],
      },
      {
        id: 'mb-ccl-e',
        line: 'CCL',
        platform: 'Platform E',
        towards: 'Stadium / Dhoby Ghaut',
        towardsCode: 'CC1',
        firstArrivalSec: 160,
        secondArrivalSec: 390,
        thirdArrivalSec: 610,
        carLoads: ['seats', 'standing', 'seats'],
      },
    ],
    exits: [
      { code: 'Exit 1', landmarks: 'Marina One, Marina Bay Financial Centre Tower 3', accessible: true },
      { code: 'Exit 2', landmarks: 'Gardens by the Bay (West), Marina Barrage Bus Shuttle', accessible: true },
    ],
    crowdByHour: [
      { hour: '6a', load: 16 },
      { hour: '8a', load: 74 },
      { hour: '10a', load: 50 },
      { hour: '12p', load: 68 },
      { hour: '2p', load: 52 },
      { hour: '4p', load: 60 },
      { hour: '6p', load: 84 },
      { hour: '8p', load: 58 },
      { hour: '10p', load: 31 },
    ],
  },
  {
    id: 'bugis',
    name: 'Bugis',
    badges: [
      { line: 'EWL', code: 'EW12' },
      { line: 'DTL', code: 'DT14' },
    ],
    zone: 'Rochor & Kampong Glam · Cultural District',
    mapPos: { x: 645, y: 395 },
    walkMinutes: 14,
    distanceMeters: 1220,
    liftStatus: 'All Lifts Operational',
    firstTrain: '05:50 AM',
    lastTrain: '12:02 AM',
    platforms: [
      {
        id: 'bg-dtl-a',
        line: 'DTL',
        platform: 'Platform A',
        towards: 'Expo',
        towardsCode: 'DT35',
        firstArrivalSec: 60,
        secondArrivalSec: 220,
        thirdArrivalSec: 400,
        carLoads: ['seats', 'standing', 'standing'],
      },
      {
        id: 'bg-dtl-b',
        line: 'DTL',
        platform: 'Platform B',
        towards: 'Bukit Panjang',
        towardsCode: 'DT1',
        firstArrivalSec: 115,
        secondArrivalSec: 280,
        thirdArrivalSec: 460,
        carLoads: ['seats', 'seats', 'standing'],
      },
      {
        id: 'bg-ewl-c',
        line: 'EWL',
        platform: 'Platform C',
        towards: 'Tuas Link',
        towardsCode: 'EW33',
        firstArrivalSec: 38,
        secondArrivalSec: 195,
        thirdArrivalSec: 375,
        carLoads: ['seats', 'standing', 'crowded', 'standing', 'seats', 'seats'],
      },
    ],
    exits: [
      { code: 'Exit A', landmarks: 'Bugis Junction, Victoria Street, National Library', accessible: true },
      { code: 'Exit C', landmarks: 'Bugis+, Bugis Street Market, Albert Complex', accessible: true },
      { code: 'Exit D', landmarks: 'DUO Tower, Andaz Singapore, Kampong Glam / Haji Lane', accessible: true },
    ],
    crowdByHour: [
      { hour: '6a', load: 20 },
      { hour: '8a', load: 79 },
      { hour: '10a', load: 57 },
      { hour: '12p', load: 77 },
      { hour: '2p', load: 71 },
      { hour: '4p', load: 78 },
      { hour: '6p', load: 90 },
      { hour: '8p', load: 82 },
      { hour: '10p', load: 49 },
    ],
  },
];

export const PLANNED_ROUTES: PlannedRouteOption[] = [
  {
    id: 'route-1',
    originId: 'orchard',
    destinationId: 'marina-bay',
    tag: 'Fastest',
    totalMinutes: 11,
    arrivalTimeStr: '9:46 PM',
    fareAdultSgd: 1.19,
    fareConcessionSgd: 0.63,
    walkMinutes: 2,
    crowdSummary: 'seats',
    steps: [
      {
        type: 'walk',
        from: 'Orchard Road (Tang Plaza)',
        to: 'Orchard MRT (TE14 Platform C)',
        durationMin: 2,
        detail: 'Enter via Exit 1 underground concourse · Escalator to B3',
      },
      {
        type: 'mrt',
        lineOrService: 'TE14 → TE20',
        lineId: 'TEL',
        from: 'Orchard',
        fromCode: 'TE14',
        to: 'Marina Bay',
        toCode: 'TE20',
        durationMin: 9,
        stopsCount: 6,
        platform: 'Platform C (Towards Bayshore)',
        crowd: 'seats',
        detail: 'Direct train · Pass Great World, Havelock, Outram Park, Maxwell, Shenton Way',
      },
    ],
    svgPath: [
      [355, 385],
      [365, 475],
      [405, 550],
      [445, 610],
      [510, 625],
      [555, 640],
      [605, 655],
    ],
  },
  {
    id: 'route-2',
    originId: 'orchard',
    destinationId: 'marina-bay',
    tag: 'Fewest Transfers',
    totalMinutes: 13,
    arrivalTimeStr: '9:48 PM',
    fareAdultSgd: 1.19,
    fareConcessionSgd: 0.63,
    walkMinutes: 2,
    crowdSummary: 'standing',
    steps: [
      {
        type: 'walk',
        from: 'Orchard Road (ION Orchard)',
        to: 'Orchard MRT (NS22 Platform B)',
        durationMin: 2,
        detail: 'Direct B2 linkway via ION Paterson entrance',
      },
      {
        type: 'mrt',
        lineOrService: 'NS22 → NS27',
        lineId: 'NSL',
        from: 'Orchard',
        fromCode: 'NS22',
        to: 'Marina Bay',
        toCode: 'NS27',
        durationMin: 11,
        stopsCount: 5,
        platform: 'Platform B (Towards Marina South Pier)',
        crowd: 'standing',
        detail: 'Direct North-South Line · Pass Somerset, Dhoby Ghaut, City Hall, Raffles Place',
      },
    ],
    svgPath: [
      [355, 385],
      [425, 410],
      [495, 430],
      [555, 505],
      [565, 585],
      [605, 655],
    ],
  },
  {
    id: 'route-3',
    originId: 'orchard',
    destinationId: 'marina-bay',
    tag: 'Sheltered Walk',
    totalMinutes: 18,
    arrivalTimeStr: '9:53 PM',
    fareAdultSgd: 1.29,
    fareConcessionSgd: 0.68,
    walkMinutes: 3,
    crowdSummary: 'seats',
    steps: [
      {
        type: 'bus',
        lineOrService: 'Bus 502',
        from: 'Orchard Stn / Tang Plaza (09048)',
        to: 'Bayfront Stn Exit B',
        durationMin: 15,
        stopsCount: 5,
        crowd: 'seats',
        detail: 'Express sector along Orchard Blvd & Central Blvd · Double Deck',
      },
      {
        type: 'walk',
        from: 'Bayfront Stn Exit B',
        to: 'Marina Bay Link Mall',
        durationMin: 3,
        detail: 'Fully air-conditioned underground Marina Bay Link Mall walkway',
      },
    ],
    svgPath: [
      [355, 385],
      [430, 420],
      [540, 540],
      [655, 610],
      [605, 655],
    ],
  },
];

export interface MapNode {
  id: string;
  name: string;
  x: number;
  y: number;
  lines: MRTLineId[];
  codes: LineBadge[];
  isInterchange?: boolean;
  hubId?: string;
}

export const MAP_STATIONS: MapNode[] = [
  { id: 'stevens', name: 'Stevens', x: 295, y: 275, lines: ['DTL', 'TEL'], codes: [{ line: 'DTL', code: 'DT10' }, { line: 'TEL', code: 'TE11' }], isInterchange: true },
  { id: 'newton', name: 'Newton', x: 405, y: 285, lines: ['NSL', 'DTL'], codes: [{ line: 'NSL', code: 'NS21' }, { line: 'DTL', code: 'DT11' }], isInterchange: true },
  { id: 'orchard', name: 'Orchard', x: 355, y: 385, lines: ['NSL', 'TEL'], codes: [{ line: 'NSL', code: 'NS22' }, { line: 'TEL', code: 'TE14' }], isInterchange: true, hubId: 'orchard' },
  { id: 'somerset', name: 'Somerset', x: 425, y: 410, lines: ['NSL'], codes: [{ line: 'NSL', code: 'NS23' }] },
  { id: 'dhoby-ghaut', name: 'Dhoby Ghaut', x: 495, y: 430, lines: ['NSL', 'NEL', 'CCL'], codes: [{ line: 'NSL', code: 'NS24' }, { line: 'NEL', code: 'NE6' }, { line: 'CCL', code: 'CC1' }], isInterchange: true, hubId: 'dhoby-ghaut' },
  { id: 'little-india', name: 'Little India', x: 530, y: 325, lines: ['NEL', 'DTL'], codes: [{ line: 'NEL', code: 'NE7' }, { line: 'DTL', code: 'DT12' }], isInterchange: true },
  { id: 'bugis', name: 'Bugis', x: 645, y: 395, lines: ['EWL', 'DTL'], codes: [{ line: 'EWL', code: 'EW12' }, { line: 'DTL', code: 'DT14' }], isInterchange: true, hubId: 'bugis' },
  { id: 'city-hall', name: 'City Hall', x: 555, y: 505, lines: ['NSL', 'EWL'], codes: [{ line: 'NSL', code: 'NS25' }, { line: 'EWL', code: 'EW13' }], isInterchange: true, hubId: 'city-hall' },
  { id: 'esplanade', name: 'Esplanade', x: 615, y: 515, lines: ['CCL'], codes: [{ line: 'CCL', code: 'CC3' }] },
  { id: 'promenade', name: 'Promenade', x: 685, y: 510, lines: ['CCL', 'DTL'], codes: [{ line: 'CCL', code: 'CC4' }, { line: 'DTL', code: 'DT15' }], isInterchange: true },
  { id: 'clarke-quay', name: 'Clarke Quay', x: 470, y: 525, lines: ['NEL'], codes: [{ line: 'NEL', code: 'NE5' }] },
  { id: 'chinatown', name: 'Chinatown', x: 455, y: 570, lines: ['NEL', 'DTL'], codes: [{ line: 'NEL', code: 'NE4' }, { line: 'DTL', code: 'DT19' }], isInterchange: true },
  { id: 'outram-park', name: 'Outram Park', x: 405, y: 605, lines: ['EWL', 'NEL', 'TEL'], codes: [{ line: 'EWL', code: 'EW16' }, { line: 'NEL', code: 'NE3' }, { line: 'TEL', code: 'TE17' }], isInterchange: true },
  { id: 'raffles-place', name: 'Raffles Place', x: 565, y: 585, lines: ['NSL', 'EWL'], codes: [{ line: 'NSL', code: 'NS26' }, { line: 'EWL', code: 'EW14' }], isInterchange: true, hubId: 'raffles-place' },
  { id: 'bayfront', name: 'Bayfront', x: 655, y: 610, lines: ['CCL', 'DTL'], codes: [{ line: 'CCL', code: 'CE1' }, { line: 'DTL', code: 'DT16' }], isInterchange: true },
  { id: 'marina-bay', name: 'Marina Bay', x: 605, y: 655, lines: ['NSL', 'CCL', 'TEL'], codes: [{ line: 'NSL', code: 'NS27' }, { line: 'CCL', code: 'CE2' }, { line: 'TEL', code: 'TE20' }], isInterchange: true, hubId: 'marina-bay' },
  { id: 'harbourfront', name: 'HarbourFront', x: 295, y: 695, lines: ['NEL', 'CCL'], codes: [{ line: 'NEL', code: 'NE1' }, { line: 'CCL', code: 'CC29' }], isInterchange: true },
  { id: 'gardens-by-the-bay', name: 'Gardens by the Bay', x: 720, y: 675, lines: ['TEL'], codes: [{ line: 'TEL', code: 'TE22' }] },
];

export const MAP_TRACK_PATHS: { line: MRTLineId; d: string }[] = [
  {
    line: 'NSL',
    d: 'M 405 180 L 405 285 L 355 385 L 425 410 L 495 430 L 555 505 L 565 585 L 605 655 L 615 730',
  },
  {
    line: 'EWL',
    d: 'M 180 605 L 405 605 L 495 605 L 565 585 L 555 505 L 645 395 L 780 310',
  },
  {
    line: 'NEL',
    d: 'M 295 695 L 405 605 L 455 570 L 470 525 L 495 430 L 530 325 L 610 210',
  },
  {
    line: 'CCL',
    d: 'M 295 695 L 210 560 L 240 310 L 420 210 L 580 280 L 685 510 L 655 610 L 605 655 M 495 430 L 615 515 L 685 510',
  },
  {
    line: 'DTL',
    d: 'M 180 220 L 295 275 L 405 285 L 530 325 L 645 395 L 685 510 L 655 610 L 520 620 L 455 570 L 560 440 L 790 380',
  },
  {
    line: 'TEL',
    d: 'M 260 175 L 295 275 L 355 385 L 365 485 L 405 605 L 525 635 L 605 655 L 720 675 L 860 620',
  },
];
