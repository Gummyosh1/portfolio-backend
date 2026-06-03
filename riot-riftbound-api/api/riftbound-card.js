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

  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: "Forbidden origin", origin });
  }

  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Missing card name" });
  }

  const RIOT_API_KEY = process.env.RIOT_API_KEY;

  if (!RIOT_API_KEY) {
    return res.status(500).json({ error: "Missing Riot API key" });
  }

  try {
    const riotUrl =
      "https://americas.api.riotgames.com/riftbound/content/v1/contents?locale=en";

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

    const search = name.toLowerCase();

    const cards = data.cards || data.Cards || [];

    const matches = cards.filter(card => {
      const cardName =
        card.name ||
        card.Name ||
        card.title ||
        card.Title ||
        "";

      return cardName.toLowerCase().includes(search);
    });

    return res.status(200).json(matches);
  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}