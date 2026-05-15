import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const STALE_AFTER_MS = 12 * 60 * 60 * 1000; // 12 hours

async function fetchCardPrices() {
  const [sirRes, irRes] = await Promise.all([
    fetch(
      'https://api.pokemontcg.io/v2/cards?q=rarity:"Special Illustration Rare"&pageSize=250&select=id,name,images,tcgplayer,set'
    ),
    fetch(
      'https://api.pokemontcg.io/v2/cards?q=rarity:"Illustration Rare"&pageSize=250&select=id,name,images,tcgplayer,set'
    ),
  ]);

  const [sirData, irData] = await Promise.all([sirRes.json(), irRes.json()]);
  const raw = [...(sirData.data || []), ...(irData.data || [])];

  return raw
    .map((card) => {
      const prices = card.tcgplayer?.prices || {};
      const market = Math.max(
        ...Object.values(prices).map((p) => p.market || 0),
        0
      );
      return {
        id: card.id,
        name: card.name,
        set: card.set?.name || "",
        image: card.images?.small || "",
        imageLarge: card.images?.large || "",
        rarity: card.rarity || "",
        market,
      };
    })
    .filter((c) => c.market > 0);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const [current, previous, lastFetch] = await Promise.all([
      redis.get("prices:current"),
      redis.get("prices:previous"),
      redis.get("prices:lastFetch"),
    ]);

    const isStale = !lastFetch || Date.now() - lastFetch > STALE_AFTER_MS;

    let currentPrices = current;
    let previousPrices = previous;

    if (isStale) {
      const fresh = await fetchCardPrices();
      await Promise.all([
        current ? redis.set("prices:previous", current) : Promise.resolve(),
        redis.set("prices:current", fresh),
        redis.set("prices:lastFetch", Date.now()),
      ]);
      previousPrices = current || fresh;
      currentPrices = fresh;
    }

    const prevMap = {};
    (previousPrices || []).forEach((c) => { prevMap[c.id] = c.market; });

    const withChange = (currentPrices || []).map((card) => {
      const prev = prevMap[card.id];
      const change = prev && prev > 0 ? ((card.market - prev) / prev) * 100 : null;
      return { ...card, prevMarket: prev || null, change };
    });

    const trending = withChange
      .filter((c) => c.change !== null && c.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, 10);

    const fallback = withChange
      .sort((a, b) => b.market - a.market)
      .slice(0, 10)
      .map((c) => ({ ...c, change: null }));

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.json({
      cards: trending.length >= 3 ? trending : fallback,
      hasTrending: trending.length >= 3,
      lastUpdated: lastFetch || Date.now(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch card data" });
  }
}
