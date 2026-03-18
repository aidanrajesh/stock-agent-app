import { analyzeStock, fetchDailySeries } from "../../_lib/stockAnalysis";

export async function GET(request, { params }) {
  try {
    const ticker = params.ticker.toUpperCase();
    const closes = await fetchDailySeries(ticker);
    const analysis = analyzeStock(closes);

    return Response.json({
      ticker,
      ...analysis,
    });
  } catch (error) {
    console.error("Analyze route error:", error);

    return Response.json(
      { error: error?.message || "Server error." },
      { status: 400 }
    );
  }
}