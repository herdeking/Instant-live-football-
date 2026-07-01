export default async function handler(req, res) {
  const url = `https://newsapi.org/v2/everything?q=football&language=en&pageSize=10&sortBy=publishedAt&apiKey=adf1b30fb4cd4c2abbedbf1985a97929`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}
