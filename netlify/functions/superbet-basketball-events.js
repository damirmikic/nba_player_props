const fetch = require('node-fetch');

const SUPERBET_PREMATCH_URL =
  'https://production-superbet-offer-rs.freetls.fastly.net/sb-rs/api/v3/subscription/sr-Latn-RS/prematch';

const BASKETBALL_SPORT_ID = 4;
const UPCOMING_DAYS = 3;

function topOfHour(date) {
  const rounded = new Date(date);
  rounded.setUTCMinutes(0, 0, 0);
  return rounded;
}

function parseSseData(payload) {
  const items = [];

  for (const line of payload.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) continue;

    const json = trimmed.slice(5).trim();
    if (!json) continue;

    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        items.push(...parsed);
      } else {
        items.push(parsed);
      }
    } catch (error) {
      // Superbet streams can be cut mid-chunk by our snapshot timeout.
    }
  }

  return items;
}

function collectStreamSample(stream, maxWaitMs = 5000) {
  return new Promise((resolve, reject) => {
    let body = '';
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      if (typeof stream.destroy === 'function') stream.destroy();
      resolve(body);
    };

    const timer = setTimeout(finish, maxWaitMs);

    stream.on('data', (chunk) => {
      body += chunk.toString('utf8');
    });

    stream.on('end', () => {
      clearTimeout(timer);
      finish();
    });

    stream.on('error', (error) => {
      clearTimeout(timer);
      if (settled && body) return;
      settled = true;
      reject(error);
    });
  });
}

function splitEventName(eventName) {
  const [homeTeam = '', awayTeam = ''] = (eventName || '').split('·');
  return {
    homeTeam: homeTeam.trim(),
    awayTeam: awayTeam.trim(),
  };
}

function getReportedMarketCount(event) {
  const metadataCount = event.inplay_stats_metadata && event.inplay_stats_metadata.market_count;
  const activeCount =
    event.inplay_stats_metadata &&
    event.inplay_stats_metadata.counts &&
    event.inplay_stats_metadata.counts.markets &&
    event.inplay_stats_metadata.counts.markets['1'];
  const streamedCount = Array.isArray(event.markets) ? event.markets.length : 0;

  return Math.max(metadataCount || 0, activeCount || 0, streamedCount);
}

function deriveEvents(rawEvents, leagueId) {
  const byEventId = new Map();

  for (const event of rawEvents) {
    const fixture = event.fixture;
    if (
      !fixture ||
      fixture.sport_id !== BASKETBALL_SPORT_ID ||
      fixture.tournament_id !== leagueId ||
      !fixture.utc_date
    ) {
      continue;
    }

    const teams = splitEventName(fixture.event_name);
    if (!teams.homeTeam && !teams.awayTeam) continue;

    const existing = byEventId.get(event.event_id);
    const marketCount = getReportedMarketCount(event);

    if (existing) {
      existing.marketCount = Math.max(existing.marketCount, marketCount);
    } else {
      byEventId.set(event.event_id, {
        id: event.event_id,
        leagueId,
        name: fixture.event_name || `${teams.homeTeam} - ${teams.awayTeam}`,
        homeTeam: teams.homeTeam,
        awayTeam: teams.awayTeam,
        startTime: fixture.utc_date,
        marketCount,
        rawEvent: event,
      });
    }
  }

  return Array.from(byEventId.values()).sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}

exports.handler = async function (event) {
  const leagueId = Number(event.queryStringParameters && event.queryStringParameters.leagueId);

  if (!Number.isFinite(leagueId)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'leagueId query parameter is required' }),
    };
  }

  const startDate = topOfHour(new Date());
  const endDate = topOfHour(new Date(Date.now() + UPCOMING_DAYS * 24 * 60 * 60 * 1000));
  const params = new URLSearchParams({
    sports: String(BASKETBALL_SPORT_ID),
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  try {
    const response = await fetch(`${SUPERBET_PREMATCH_URL}?${params.toString()}`, {
      headers: {
        accept: 'text/event-stream, application/json, text/plain, */*',
        origin: 'https://superbet.rs',
        referer: 'https://superbet.rs/',
      },
      timeout: 12000,
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: 'Failed to fetch Superbet events', error: body }),
      };
    }

    const streamText = await collectStreamSample(response.body);
    const events = deriveEvents(parseSseData(streamText), leagueId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=120',
      },
      body: JSON.stringify({ events }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to fetch Superbet basketball events',
        error: error.message,
      }),
    };
  }
};
