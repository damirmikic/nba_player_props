const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const { sport, eventId, markets, regions, oddsFormat } = event.queryStringParameters;
  
  const apiKeysString = process.env.API_KEYS;
  if (!apiKeysString) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "API_KEYS environment variable not set." }),
    };
  }

  const apiKeys = apiKeysString.split(',');
  
  // Select a random key from the array for each invocation
  const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)].trim();

  const apiUrl = `https://api.the-odds-api.com/v4/sports/${sport}/events/${eventId}/odds?apiKey=${apiKey}&regions=${regions}&markets=${markets}&oddsFormat=${oddsFormat}`;

  try {
    const response = await fetch(apiUrl);
     if (!response.ok) {
        const errorData = await response.json();
        return {
            statusCode: response.status,
            body: JSON.stringify(errorData),
        }
    }
    
    // Extract usage headers
    const requestsRemaining = response.headers.get('x-requests-remaining');
    const requestsUsed = response.headers.get('x-requests-used');
    
    const data = await response.json();
    
    // Return both the data and the usage info
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: data, // The original data
        usageInfo: {
          keyUsed: apiKey.substring(0, 4) + '...', // Obfuscated key
          remaining: requestsRemaining,
          used: requestsUsed
        }
      }),
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to fetch odds from The Odds API', error: error.message }),
    };
  }
};
