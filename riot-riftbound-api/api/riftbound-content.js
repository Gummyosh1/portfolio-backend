let cachedContent = null;
let cachedAt = 0;
const CACHE_TIME_MS = 1000 * 60 * 15;

export default async function handler(req, res) {
  const allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://gummyosh1.github.io"
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: "Forbidden origin", origin });
  }

  const RIOT_API_KEY = process.env.RIOT_API_KEY;

  if (!RIOT_API_KEY) {
    return res.status(500).json({ error: "Missing Riot API key in Vercel" });
  }

  const forceRefresh = req.query.refresh === "true";
  const cacheIsFresh = cachedContent && Date.now() - cachedAt < CACHE_TIME_MS;

  if (!forceRefresh && cacheIsFresh) {
    return res.status(200).json(cachedContent);
  }

  try {
    const riotUrl = "https://americas.api.riotgames.com/riftbound/content/v1/contents?locale=en";

    const riotResponse = await fetch(riotUrl, {
      headers: {
        "X-Riot-Token": RIOT_API_KEY,
        "Accept": "application/json"
      }
    });

    const data = await riotResponse.json();

    if (!riotResponse.ok) {
      return res.status(riotResponse.status).json(data);
    }

    cachedContent = data;
    cachedAt = Date.now();

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
