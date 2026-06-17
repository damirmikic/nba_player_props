const fetch = require('node-fetch');

const SUPERBET_PREMATCH_URL =
  'https://production-superbet-offer-rs.freetls.fastly.net/sb-rs/api/v3/subscription/sr-Latn-RS/prematch';

const BASKETBALL_SPORT_ID = 4;
const UPCOMING_DAYS = 3;

const KNOWN_TOURNAMENT_NAMES = {
  426: 'Turkey Super League',
  2174: 'WNBA',
  2184: 'Turkey BSL',
  2187: 'ACB (Spain)',
  2200: 'Poland PLK',
  2205: 'Italy Serie A',
  2209: 'Israel Super League',
  2419: 'Germany BBL',
  2423: 'France LNB Pro A',
  2448: 'Argentina Liga Nacional',
  3713: 'PBA (Philippines)',
  29507: 'Uruguay Liga',
  30870: 'Puerto Rico BSN',
  38095: 'New Zealand NBL',
  47113: 'Israel National League',
  52234: 'Venezuela Superliga',
  60568: 'Dominican Republic LNB',
};

const SUPERBET_STRUCTURE_URL =
  'https://production-superbet-offer-rs.freetls.fastly.net/sb-rs/api/subscription/v2/sr-Latn-RS/structure';

async function fetchTournamentNames() {
  try {
    const response = await fetch(SUPERBET_STRUCTURE_URL, {
      headers: {
        accept: 'application/json',
        origin: 'https://superbet.rs',
        referer: 'https://superbet.rs/',
      },
      timeout: 6000,
    });
    if (!response.ok) return KNOWN_TOURNAMENT_NAMES;

    const data = await response.json();
    const names = { ...KNOWN_TOURNAMENT_NAMES };

    const sports = data?.data?.sports ?? data?.sports ?? [];
    for (const sport of sports) {
      if (sport.id !== BASKETBALL_SPORT_ID) continue;
      for (const category of sport.categories ?? sport.leagues ?? []) {
        for (const tournament of category.tournaments ?? []) {
          if (!names[tournament.id]) names[tournament.id] = tournament.name;
        }
      }
    }
    return names;
  } catch {
    return KNOWN_TOURNAMENT_NAMES;
  }
}

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
      // The stream can contain partial chunks when the request is cut short.
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

function deriveLeagues(events, nameMap = KNOWN_TOURNAMENT_NAMES) {
  const byTournament = new Map();

  for (const event of events) {
    const fixture = event.fixture;
    if (!fixture || fixture.sport_id !== BASKETBALL_SPORT_ID || !fixture.tournament_id) {
      continue;
    }

    const tournamentId = fixture.tournament_id;
    const eventTime = fixture.utc_date || null;
    const existing = byTournament.get(tournamentId);

    if (existing) {
      existing.eventIds.add(event.event_id);
      existing.eventCount = existing.eventIds.size;
      if (fixture.category_id) existing.categoryIds.add(fixture.category_id);
      if (eventTime && (!existing.nextEventTime || eventTime < existing.nextEventTime)) {
        existing.nextEventTime = eventTime;
      }
    } else {
      byTournament.set(tournamentId, {
        id: tournamentId,
        name: nameMap[tournamentId] || `Tournament ${tournamentId}`,
        eventCount: 1,
        categoryIds: new Set(fixture.category_id ? [fixture.category_id] : []),
        nextEventTime: eventTime,
        eventIds: new Set([event.event_id]),
      });
    }
  }

  return Array.from(byTournament.values())
    .map((league) => ({
      id: league.id,
      name: league.name,
      eventCount: league.eventCount,
      categoryIds: Array.from(league.categoryIds),
      nextEventTime: league.nextEventTime,
    }))
    .sort((a, b) => {
      if (b.eventCount !== a.eventCount) return b.eventCount - a.eventCount;
      return a.name.localeCompare(b.name);
    });
}

exports.handler = async function () {
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
        body: JSON.stringify({ message: 'Failed to fetch Superbet leagues', error: body }),
      };
    }

    const [streamText, nameMap] = await Promise.all([
      collectStreamSample(response.body),
      fetchTournamentNames(),
    ]);
    const leagues = deriveLeagues(parseSseData(streamText), nameMap);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
      body: JSON.stringify({ leagues }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to fetch Superbet basketball leagues',
        error: error.message,
      }),
    };
  }
};
