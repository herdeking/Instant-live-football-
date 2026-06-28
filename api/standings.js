export default async function handler(req, res) {
  const { league, season } = req.query;
  const url = `https://api.football-data.org/v4/competitions/${league}/standings?season=${season || 2025}`;
  try {
    const response = await fetch(url, {
      headers: { 'X-Auth-Token': 'ae94b936902e463b9cd2ca4963dfdb09' }
    });
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
}
