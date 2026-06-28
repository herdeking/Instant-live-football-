export default async function handler(req, res) {
  const { search } = req.query;
  const url = `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(search)}`;
  try {
    const response = await fetch(url, {
      headers: { 'x-apisports-key': '14fc22d6286abe7f65bd37725b8fb926' }
    });
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
}
