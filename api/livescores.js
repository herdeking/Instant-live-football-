const cache = { data: null, time: 0 };

export default async function handler(req, res) {
  // Cache for 60 seconds
  if(cache.data && Date.now() - cache.time < 60000) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(cache.data);
  }
  try {
    const response = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: { 'x-apisports-key': '14fc22d6286abe7f65bd37725b8fb926' }
    });
    const data = await response.json();
    cache.data = data;
    cache.time = Date.now();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: 'Failed to fetch live scores' });
  }
}
