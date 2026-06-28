export default async function handler(req, res) {
  const { search } = req.query;
  const url = `https://api.football-data.org/v4/teams?search=${encodeURIComponent(search)}`;
  try {
    const response = await fetch(url, {
      headers: { 'X-Auth-Token': 'ae94b936902e463b9cd2ca4963dfdb09' }
    });
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
}
