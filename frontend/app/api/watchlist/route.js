import { analyzeStock, fetchDailySeries } from "../_lib/stockAnalysis";

const tickers = ["AAPL"];

export async function GET() {
  try {
    const results = [];

    for (const ticker of tickers) {
      try {
        const closes = await fetchDailySeries(ticker);
        const analysis = analyzeStock(closes);
        results.push({ ticker, ...analysis });
      } catch (error) {
        results.push({
          ticker,
          error: error?.message || "No data returned for this ticker.",
        });
      }
    }

    return Response.json(results);
  } catch (error) {
    console.error("Watchlist route error:", error);

    return Response.json(
      { error: "Could not load watchlist." },
      { status: 500 }
    );
  }
}