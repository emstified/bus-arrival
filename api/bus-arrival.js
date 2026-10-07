/**
 * GET /api/bus-arrival?BusStopCode=04121&ServiceNo=7
 *
 * Proxies LTA DataMall v3 BusArrival endpoint:
 * GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121
 * Header: AccountKey: process.env.LTA_ACCOUNT_KEY
 *
 * - BusStopCode is the required parameter (5-digit bus stop code, e.g., 04121).
 * - ServiceNo is optional (e.g., &ServiceNo=7 to query one bus service only).
 * - Refreshes every 20 seconds.
 */

const LTA_BUS_ARRIVAL_URL =
  'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival';

/**
 * Generates an ISO timestamp offset by `secondsFromNow` in Singapore Time (+08:00)
 */
function createSgIsoOffset(secondsFromNow) {
  const target = new Date(Date.now() + secondsFromNow * 1000);
  return target.toISOString();
}

/**
 * Fallback LTA v3 BusArrival catalog used only before LTA_ACCOUNT_KEY is set in Vercel env.
 */
function buildFallbackLtaResponse(busStopCode, serviceNo) {
  const stopCatalog = {
    '04121': [
      {
        ServiceNo: '7',
        Operator: 'SBST',
        OriginCode: '70009',
        DestinationCode: '17009',
        offsets: [42, 460, 910],
        loads: ['SEA', 'SEA', 'SDA'],
        types: ['DD', 'SD', 'DD'],
        lat: '1.297615',
        lng: '103.853188',
      },
      {
        ServiceNo: '12',
        Operator: 'GAS',
        OriginCode: '75009',
        DestinationCode: '10009',
        offsets: [130, 520, 960],
        loads: ['SDA', 'SEA', 'SEA'],
        types: ['DD', 'DD', 'SD'],
        lat: '1.298420',
        lng: '103.854120',
      },
      {
        ServiceNo: '63',
        Operator: 'SBST',
        OriginCode: '82009',
        DestinationCode: '82009',
        offsets: [215, 640, 1080],
        loads: ['SEA', 'SDA', 'SEA'],
        types: ['SD', 'DD', 'SD'],
        lat: '1.296890',
        lng: '103.852410',
      },
      {
        ServiceNo: '175',
        Operator: 'SBST',
        OriginCode: '17009',
        DestinationCode: '80009',
        offsets: [85, 490, 890],
        loads: ['SEA', 'SEA', 'SDA'],
        types: ['DD', 'SD', 'DD'],
        lat: '1.297950',
        lng: '103.853600',
      },
      {
        ServiceNo: '197',
        Operator: 'SBST',
        OriginCode: '84009',
        DestinationCode: '22009',
        offsets: [310, 740, 1180],
        loads: ['LSD', 'SDA', 'SEA'],
        types: ['DD', 'DD', 'DD'],
        lat: '1.299100',
        lng: '103.855010',
      },
      {
        ServiceNo: '851',
        Operator: 'SMRT',
        OriginCode: '59009',
        DestinationCode: '14009',
        offsets: [55, 410, 830],
        loads: ['SEA', 'SDA', 'SEA'],
        types: ['DD', 'BD', 'DD'],
        lat: '1.297710',
        lng: '103.853310',
      },
    ],
    '09048': [
      {
        ServiceNo: '190',
        Operator: 'SMRT',
        OriginCode: '44009',
        DestinationCode: '10009',
        offsets: [35, 390, 780],
        loads: ['SEA', 'SDA', 'SEA'],
        types: ['DD', 'DD', 'BD'],
        lat: '1.304200',
        lng: '103.831800',
      },
      {
        ServiceNo: '14',
        Operator: 'SBST',
        OriginCode: '84009',
        DestinationCode: '17009',
        offsets: [140, 520, 940],
        loads: ['SDA', 'SEA', 'SEA'],
        types: ['DD', 'SD', 'DD'],
        lat: '1.303800',
        lng: '103.830100',
      },
      {
        ServiceNo: '36',
        Operator: 'GAS',
        OriginCode: '95029',
        DestinationCode: '09048',
        offsets: [260, 680, 1120],
        loads: ['SEA', 'SDA', 'SEA'],
        types: ['DD', 'DD', 'SD'],
        lat: '1.305000',
        lng: '103.829000',
      },
      {
        ServiceNo: '174',
        Operator: 'SBST',
        OriginCode: '22009',
        DestinationCode: '10009',
        offsets: [420, 840, 1320],
        loads: ['LSD', 'SDA', 'SEA'],
        types: ['DD', 'SD', 'DD'],
        lat: '1.302000',
        lng: '103.835000',
      },
      {
        ServiceNo: '502',
        Operator: 'SBST',
        OriginCode: '22609',
        DestinationCode: '03218',
        offsets: [195, 740, 1480],
        loads: ['SEA', 'SEA', 'SDA'],
        types: ['DD', 'DD', 'DD'],
        lat: '1.304000',
        lng: '103.831000',
      },
    ],
    '09022': [
      {
        ServiceNo: '7',
        Operator: 'SBST',
        OriginCode: '84009',
        DestinationCode: '17009',
        offsets: [48, 460, 910],
        loads: ['SEA', 'SEA', 'SDA'],
        types: ['DD', 'SD', 'DD'],
        lat: '1.302100',
        lng: '103.831200',
      },
      {
        ServiceNo: '111',
        Operator: 'SBST',
        OriginCode: '11009',
        DestinationCode: '11009',
        offsets: [210, 590, 1050],
        loads: ['SDA', 'SEA', 'SEA'],
        types: ['SD', 'DD', 'SD'],
        lat: '1.301500',
        lng: '103.830500',
      },
      {
        ServiceNo: '106',
        Operator: 'TTS',
        OriginCode: '43009',
        DestinationCode: '03239',
        offsets: [330, 720, 1180],
        loads: ['SEA', 'LSD', 'SDA'],
        types: ['DD', 'DD', 'SD'],
        lat: '1.303000',
        lng: '103.829000',
      },
    ],
    '08057': [
      {
        ServiceNo: '65',
        Operator: 'SBST',
        OriginCode: '75009',
        DestinationCode: '14009',
        offsets: [25, 380, 820],
        loads: ['SDA', 'SEA', 'SEA'],
        types: ['DD', 'DD', 'SD'],
        lat: '1.299300',
        lng: '103.845500',
      },
      {
        ServiceNo: '131',
        Operator: 'SBST',
        OriginCode: '52009',
        DestinationCode: '10009',
        offsets: [175, 540, 960],
        loads: ['SEA', 'SDA', 'SEA'],
        types: ['SD', 'DD', 'SD'],
        lat: '1.298800',
        lng: '103.846100',
      },
    ],
    '03019': [
      {
        ServiceNo: '97',
        Operator: 'TTS',
        OriginCode: '28009',
        DestinationCode: '02099',
        offsets: [52, 310, 690],
        loads: ['SEA', 'SDA', 'LSD'],
        types: ['DD', 'DD', 'BD'],
        lat: '1.283900',
        lng: '103.851400',
      },
      {
        ServiceNo: '133',
        Operator: 'SBST',
        OriginCode: '54009',
        DestinationCode: '03239',
        offsets: [130, 495, 890],
        loads: ['SEA', 'SEA', 'SDA'],
        types: ['DD', 'SD', 'DD'],
        lat: '1.284200',
        lng: '103.851900',
      },
    ],
  };

  // Default fallback services for any other 5-digit bus stop code
  const defaultServices = [
    {
      ServiceNo: serviceNo || '7',
      Operator: 'SBST',
      OriginCode: '70009',
      DestinationCode: '17009',
      offsets: [65, 420, 860],
      loads: ['SEA', 'SDA', 'SEA'],
      types: ['DD', 'SD', 'DD'],
      lat: '1.300100',
      lng: '103.840200',
    },
    {
      ServiceNo: '14',
      Operator: 'SBST',
      OriginCode: '84009',
      DestinationCode: '17009',
      offsets: [180, 560, 980],
      loads: ['SEA', 'SEA', 'SDA'],
      types: ['DD', 'DD', 'SD'],
      lat: '1.301200',
      lng: '103.841500',
    },
  ];

  const rawList = stopCatalog[busStopCode] || defaultServices;
  const filtered = serviceNo
    ? rawList.filter(
        (s) => s.ServiceNo.toLowerCase() === String(serviceNo).toLowerCase()
      )
    : rawList;

  const Services = filtered.map((item) => ({
    ServiceNo: item.ServiceNo,
    Operator: item.Operator,
    NextBus: {
      OriginCode: item.OriginCode,
      DestinationCode: item.DestinationCode,
      EstimatedArrival: createSgIsoOffset(item.offsets[0]),
      Monitored: 1,
      Latitude: item.lat,
      Longitude: item.lng,
      VisitNumber: '1',
      Load: item.loads[0],
      Feature: 'WAB',
      Type: item.types[0],
    },
    NextBus2: {
      OriginCode: item.OriginCode,
      DestinationCode: item.DestinationCode,
      EstimatedArrival: createSgIsoOffset(item.offsets[1]),
      Monitored: 1,
      Latitude: item.lat,
      Longitude: item.lng,
      VisitNumber: '1',
      Load: item.loads[1],
      Feature: 'WAB',
      Type: item.types[1],
    },
    NextBus3: {
      OriginCode: item.OriginCode,
      DestinationCode: item.DestinationCode,
      EstimatedArrival: createSgIsoOffset(item.offsets[2]),
      Monitored: 0,
      Latitude: '0.0',
      Longitude: '0.0',
      VisitNumber: '1',
      Load: item.loads[2],
      Feature: 'WAB',
      Type: item.types[2],
    },
  }));

  return {
    'odata.metadata':
      'https://datamall2.mytransport.sg/ltaodataservice/v3/$metadata#BusArrival',
    BusStopCode: busStopCode,
    Services,
  };
}

export default async function handler(req, res) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const busStopCode = String(req.query?.BusStopCode || '04121').trim();
  const serviceNo = req.query?.ServiceNo
    ? String(req.query.ServiceNo).trim()
    : '';

  if (!busStopCode) {
    return res.status(400).json({
      error: 'BusStopCode query parameter is required (e.g. ?BusStopCode=04121)',
    });
  }

  // LTA DataMall BusArrival refreshes every 20 seconds
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=20, stale-while-revalidate=5'
  );

  const accountKey = process.env.LTA_ACCOUNT_KEY;

  if (!accountKey || !accountKey.trim()) {
    const fallbackPayload = buildFallbackLtaResponse(busStopCode, serviceNo);
    return res.status(200).json({
      ...fallbackPayload,
      _meta: {
        source: 'fallback-simulation',
        configuredAccountKey: false,
        refreshIntervalSeconds: 20,
        fetchedAt: new Date().toISOString(),
        notice:
          'LTA_ACCOUNT_KEY is not set in environment variables yet. Returning simulated LTA DataMall v3 BusArrival payload.',
      },
    });
  }

  // Construct LTA DataMall v3 URL
  const queryParams = new URLSearchParams({ BusStopCode: busStopCode });
  if (serviceNo) {
    queryParams.set('ServiceNo', serviceNo);
  }
  const targetUrl = `${LTA_BUS_ARRIVAL_URL}?${queryParams.toString()}`;

  try {
    const ltaResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        AccountKey: accountKey.trim(),
        Accept: 'application/json',
      },
    });

    if (!ltaResponse.ok) {
      const errorText = await ltaResponse.text();
      return res.status(ltaResponse.status).json({
        error: `LTA DataMall API error (${ltaResponse.status})`,
        details: errorText,
        BusStopCode: busStopCode,
      });
    }

    const data = await ltaResponse.json();
    return res.status(200).json({
      ...data,
      _meta: {
        source: 'lta-datamall-v3',
        configuredAccountKey: true,
        refreshIntervalSeconds: 20,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return res.status(502).json({
      error: 'Failed to reach LTA DataMall v3 BusArrival API',
      message: error instanceof Error ? error.message : String(error),
      BusStopCode: busStopCode,
    });
  }
}
