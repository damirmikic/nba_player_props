const fetch = require('node-fetch');

const SUPERBET_EVENTS_BASE =
  'https://production-superbet-offer-rs.freetls.fastly.net/sb-rs/api/v3/subscription/sr-Latn-RS/events';

function parseSseData(payload) {
  const items = [];
  for (const line of payload.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) continue;
    const json = trimmed.slice(5).trim();
    if (!json) continue;
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) items.push(...parsed);
      else items.push(parsed);
    } catch {
      // truncated SSE chunk — skip
    }
  }
  return items;
}

function collectStreamSample(stream, maxWaitMs = 6000) {
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

    stream.on('data', (chunk) => { body += chunk.toString('utf8'); });
    stream.on('end', () => { clearTimeout(timer); finish(); });
    stream.on('error', (err) => {
      clearTimeout(timer);
      if (settled && body) return;
      settled = true;
      reject(err);
    });
  });
}

exports.handler = async function (event) {
  const eventIdsParam =
    event.queryStringParameters && event.queryStringParameters.eventIds;

  if (!eventIdsParam) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'eventIds query parameter is required' }),
    };
  }

  // Validate: only allow numeric IDs
  const ids = eventIdsParam.split(',').map((s) => s.trim()).filter((s) => /^\d+$/.test(s));
  if (ids.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'No valid event IDs provided' }),
    };
  }

  const url = `${SUPERBET_EVENTS_BASE}?events=${ids.join(',')}`;

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'text/event-stream, application/json, text/plain, */*',
        origin: 'https://superbet.rs',
        referer: 'https://superbet.rs/',
      },
      timeout: 10000,
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: 'Superbet events API error', error: body }),
      };
    }

    const streamText = await collectStreamSample(response.body);
    const events = parseSseData(streamText);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
      body: JSON.stringify({ events }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to fetch Superbet event props',
        error: error.message,
      }),
    };
  }
};
