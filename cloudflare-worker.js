// FullTime Football API Proxy Worker
// Deploy this FREE at: workers.cloudflare.com
// 1. Sign up at cloudflare.com (free)
// 2. Go to Workers & Pages → Create Worker
// 3. Paste this entire code → Deploy
// 4. Your worker URL will be: https://your-name.workers.dev

const FOOTBALL_DATA_KEY = '6e26ab7db1044d37bd7b0a94a6c06f1c'; // Free tier key
const ALLOWED_ORIGIN = 'https://instantlivefootball.com.ng';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    let apiUrl = '';
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
    const league = url.searchParams.get('league') || 'PL';
    const season = url.searchParams.get('season') || '2024';

    // Route requests
    if (path === '/matches' || path === '/fixtures') {
      apiUrl = `https://api.football-data.org/v4/matches?dateFrom=${date}&dateTo=${date}`;
    } else if (path === '/standings') {
      const leagueMap = {
        'PL': 2021, 'PD': 2014, 'SA': 2019, 'BL1': 2002,
        'FL1': 2015, 'CL': 2001, 'EL': 2146, 'DED': 2003,
        'PPL': 2017, 'ELC': 2016
      };
      const id = leagueMap[league] || 2021;
      apiUrl = `https://api.football-data.org/v4/competitions/${league}/standings?season=${season}`;
    } else if (path === '/live') {
      apiUrl = `https://api.football-data.org/v4/matches?status=IN_PLAY,PAUSED`;
    } else if (path === '/today') {
      const today = new Date().toISOString().split('T')[0];
      apiUrl = `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${today}`;
    } else {
      return new Response(JSON.stringify({ error: 'Unknown endpoint' }), {
        status: 404, headers: CORS_HEADERS
      });
    }

    const res = await fetch(apiUrl, {
      headers: {
        'X-Auth-Token': FOOTBALL_DATA_KEY,
        'Accept': 'application/json'
      }
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: CORS_HEADERS
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: CORS_HEADERS
    });
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
