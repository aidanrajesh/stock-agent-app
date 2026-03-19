import * as stockAnalysis from "../_lib/stockAnalysis";

const tickers = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN"];

export async function GET() {
  const results = [];

  for (const ticker of tickers) {
    try {
      const closes = await stockAnalysis.fetchDailySeries(ticker);
      const analysis = stockAnalysis.analyzeStock(closes);
      results.push({ ticker, ...analysis });
    } catch (error) {
      console.error(`Watchlist failed for ${ticker}:`, error);
      results.push({
        ticker,
        error: error?.message || "Unknown error",
      });
    }
  }

  return Response.json(results);
}