export default async function handler(req, res) {
  const allowedOrigins = [
    "http://127.0.0.1:5500",
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

  const RIOT_API_KEY = process.env.RIOT_API_KEY;

  if (!RIOT_API_KEY) {
    return res.status(500).json({ error: "Missing Riot API key" });
  }

  try {
    const riotUrl =
      "https://na1.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5";

    const riotResponse = await fetch(riotUrl, {
      headers: {
        "X-Riot-Token": RIOT_API_KEY
      }
    });

    const data = await riotResponse.json();

    return res.status(riotResponse.status).json(data);
  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}