// ============================================
// LIVE SCORES + AUTO-UPDATE
// Fetches live matches from football-data.org across major
// competitions, then writes hscore/ascore/minute/status back
// to any matching Firestore /matches doc — UNLESS that doc has
// scoreSource === 'manual' (admin override always wins).
// ============================================

const FOOTBALL_DATA_KEY = 'ae94b936902e463b9cd2ca4963dfdb09';
const FIRESTORE_PROJECT_ID = 'instantlivefootball';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents`;

const COMPETITIONS = ['PL', 'CL', 'PD', 'BL1', 'SA', 'FL1'];

const cache = { data: null, time: 0 };
const CACHE_TIME = 60 * 1000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (cache.data && Date.now() - cache.time < CACHE_TIME) {
    return res.status(200).json(cache.data);
  }

  try {
    const liveMatches = await fetchAllLiveMatches();

    syncToFirestore(liveMatches).catch((e) => {
      console.error('Firestore sync error:', e);
    });

    const payload = { response: liveMatches };
    cache.data = payload;
    cache.time = Date.now();

    res.status(200).json(payload);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch live scores' });
  }
}

async function fetchAllLiveMatches() {
  const results = await Promise.all(
    COMPETITIONS.map(async (code) => {
      try {
        const r = await fetch(
          `https://api.football-data.org/v4/competitions/${code}/matches?status=LIVE`,
          { headers: { 'X-Auth-Token': FOOTBALL_DATA_KEY } }
        );
        if (!r.ok) return [];
        const data = await r.json();
        return data.matches || [];
      } catch (e) {
        return [];
      }
    })
  );
  return results.flat();
}

function normalize(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\bfc\b/g, '')
    .replace(/\bcf\b/g, '')
    .replace(/\bafc\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function namesMatch(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

async function syncToFirestore(liveMatches) {
  if (!liveMatches.length) return;

  const ourLiveMatches = await getLiveMatchesFromFirestore();

  for (const ourMatch of ourLiveMatches) {
    if (ourMatch.scoreSource === 'manual') continue;

    const apiMatch = liveMatches.find(
      (m) =>
        namesMatch(m.homeTeam?.name, ourMatch.home) &&
        namesMatch(m.awayTeam?.name, ourMatch.away)
    );

    if (!apiMatch) continue;

    const hscore = apiMatch.score?.fullTime?.home ?? apiMatch.score?.halfTime?.home ?? 0;
    const ascore = apiMatch.score?.fullTime?.away ?? apiMatch.score?.halfTime?.away ?? 0;
    const minute = apiMatch.minute || null;
    const isFinished = apiMatch.status === 'FINISHED';

    const updateFields = {
      hscore: { integerValue: hscore },
      ascore: { integerValue: ascore },
      scoreSource: { stringValue: 'auto' },
    };
    if (minute) updateFields.minute = { integerValue: minute };
    if (isFinished) updateFields.status = { stringValue: 'finished' };

    await updateFirestoreDoc(ourMatch.id, updateFields);
  }
}

async function getLiveMatchesFromFirestore() {
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'matches' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'status' },
          op: 'EQUAL',
          value: { stringValue: 'live' },
        },
      },
    },
  };

  const r = await fetch(`${FIRESTORE_BASE}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!r.ok) return [];

  const rows = await r.json();
  return rows
    .filter((row) => row.document)
    .map((row) => {
      const doc = row.document;
      const id = doc.name.split('/').pop();
      const fields = doc.fields || {};
      return {
        id,
        home: fields.home?.stringValue || '',
        away: fields.away?.stringValue || '',
        scoreSource: fields.scoreSource?.stringValue || null,
      };
    });
}

async function updateFirestoreDoc(docId, fields) {
  const fieldPaths = Object.keys(fields)
    .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join('&');

  const url = `${FIRESTORE_BASE}/matches/${docId}?${fieldPaths}`;

  await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
}
