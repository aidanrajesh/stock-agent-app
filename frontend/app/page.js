"use client";

import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [ticker, setTicker] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [watchlist, setWatchlist] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);

  const baseUrl = "/api";

  const analyzeTicker = async () => {
    if (!ticker.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${baseUrl}/analyze/${ticker.trim().toUpperCase()}`
      );
      const data = await response.json();
      setResult(data);
    } catch {
      setResult({ error: "Could not connect to backend." });
    } finally {
      setLoading(false);
    }
  };

  const loadWatchlist = useCallback(async () => {
  setWatchlistLoading(true);

  try {
    const response = await fetch(`${baseUrl}/watchlist`);
    const data = await response.json();

    console.log("watchlist api response:", data);

    setWatchlist(Array.isArray(data) ? data : data.watchlist || []);
  } catch {
    setWatchlist([{ error: "Could not load watchlist." }]);
  } finally {
    setWatchlistLoading(false);
  }
}, [baseUrl]);

  useEffect(() => {
    const run = async () => {
      await loadWatchlist();
    };

    run();
  }, [loadWatchlist]);

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Stock Agent</h1>
        <p className="text-gray-600 mb-8">
          Analyze a stock and scan a small watchlist for trade signals.
        </p>

        <div className="border rounded p-6 shadow-sm mb-10">
          <h2 className="text-2xl font-semibold mb-4">Analyze One Stock</h2>

          <div className="flex gap-3 mb-6">
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Enter ticker, e.g. AAPL"
              className="border rounded px-4 py-3 w-full"
            />
            <button
              onClick={analyzeTicker}
              className="bg-black text-white rounded px-5 py-3"
            >
              Analyze
            </button>
          </div>

          {loading && <p className="mb-4">Analyzing...</p>}

          {result?.error && (
            <div className="border rounded p-5 bg-red-50">
              <p>{result.error}</p>
            </div>
          )}

          {result && !result.error && (
            <div className="border rounded p-6 bg-gray-50 space-y-2">
              <h3 className="text-xl font-semibold">{result.ticker}</h3>
              <p><strong>Signal:</strong> {result.signal}</p>
              <p><strong>Current Price:</strong> ${result.currentPrice?.toFixed(2)}</p>
              <p><strong>SMA 20:</strong> {result.sma20?.toFixed(2)}</p>
              <p><strong>SMA 50:</strong> {result.sma50?.toFixed(2)}</p>
              <p><strong>RSI:</strong> {result.rsi?.toFixed(2)}</p>
              <p><strong>Reason:</strong> {result.reason}</p>
            </div>
          )}
        </div>

        <div className="border rounded p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Watchlist</h2>
            <button
              onClick={loadWatchlist}
              className="border rounded px-4 py-2"
            >
              Refresh
            </button>
          </div>

          {watchlistLoading && <p>Loading watchlist...</p>}

          {!watchlistLoading && watchlist.length === 0 && (
            <p>No watchlist data found.</p>
          )}

          <div className="space-y-4">
            {(Array.isArray(watchlist) ? watchlist : []).map((stock, index) => (
              <div key={index} className="border rounded p-4 bg-gray-50">
                {stock.error ? (
                  <>
                    <h3 className="text-lg font-semibold">
                      {stock.ticker || "Unknown"}
                    </h3>
                    <p>{stock.error}</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold">{stock.ticker}</h3>
                    <p><strong>Signal:</strong> {stock.signal}</p>
                    <p><strong>Current Price:</strong> ${stock.currentPrice?.toFixed(2)}</p>
                    <p><strong>SMA 20:</strong> {stock.sma20?.toFixed(2)}</p>
                    <p><strong>SMA 50:</strong> {stock.sma50?.toFixed(2)}</p>
                    <p><strong>RSI:</strong> {stock.rsi?.toFixed(2)}</p>
                    <p><strong>Reason:</strong> {stock.reason}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}