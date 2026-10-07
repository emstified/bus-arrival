/**
 * GET /api/health
 * Health check endpoint to monitor API status and LTA DataMall configuration.
 * Optional query param: ?verifyUpstream=true to test upstream LTA DataMall connectivity.
 */
export default async function handler(req, res) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const accountKey = process.env.LTA_ACCOUNT_KEY;
  const hasAccountKey = Boolean(accountKey && accountKey.trim().length > 0);
  const verifyUpstream = req.query?.verifyUpstream === 'true';

  let upstreamCheck = {
    checked: false,
    reachable: null,
    httpStatus: null,
    latencyMs: null,
    message: hasAccountKey
      ? 'LTA_ACCOUNT_KEY is configured.'
      : 'LTA_ACCOUNT_KEY is not configured yet in environment variables.',
  };

  if (verifyUpstream && hasAccountKey) {
    const start = Date.now();
    try {
      const response = await fetch(
        'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121',
        {
          method: 'GET',
          headers: {
            AccountKey: accountKey.trim(),
            Accept: 'application/json',
          },
        }
      );
      const latencyMs = Date.now() - start;
      upstreamCheck = {
        checked: true,
        reachable: response.ok,
        httpStatus: response.status,
        latencyMs,
        message: response.ok
          ? 'Successfully connected to LTA DataMall v3 BusArrival endpoint.'
          : `LTA DataMall returned HTTP ${response.status}.`,
      };
    } catch (err) {
      upstreamCheck = {
        checked: true,
        reachable: false,
        httpStatus: null,
        latencyMs: Date.now() - start,
        message: err instanceof Error ? err.message : 'Upstream connection failed',
      };
    }
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.status(200).json({
    status: 'ok',
    service: 'sg-transit-pulse-api',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    endpoints: {
      health: '/api/health',
      busArrival: '/api/bus-arrival?BusStopCode=04121&ServiceNo=7',
    },
    ltaDataMall: {
      configured: hasAccountKey,
      endpoint: 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival',
      refreshIntervalSeconds: 20,
      upstreamCheck,
    },
  });
}
