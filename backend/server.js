const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

function sma(values, period) {
  if (values.length < period) return null;
  const slice = values.slice(0, period);
  const sum = slice.reduce((total, value) => total + value, 0);
  return sum / period;
}

function rsi(closes, period = 14) {
  if (closes.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  for (let i = 0; i < period; i++) {
    const diff = closes[i] - closes[i + 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function analyzeStock(closes) {
  const currentPrice = closes[0];
  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  const currentRsi = rsi(closes, 14);

  let signal = "HOLD";
  const reasons = [];

  if (sma20 && currentPrice > sma20) reasons.push("Price is above the 20-day moving average");
  if (sma50 && currentPrice > sma50) reasons.push("Price is above the 50-day moving average");
  if (sma20 && sma50 && sma20 > sma50) reasons.push("Short-term trend is stronger than long-term trend");
  if (currentRsi !== null && currentRsi < 70) reasons.push("RSI is below overbought territory");
  if (currentRsi !== null && currentRsi > 45) reasons.push("Momentum is not weak");

  if (
    sma20 &&
    sma50 &&
    currentPrice > sma20 &&
    sma20 > sma50 &&
    currentRsi !== null &&
    currentRsi > 45 &&
    currentRsi < 70
  ) {
    signal = "BUY";
  } else if (
    sma20 &&
    sma50 &&
    currentPrice < sma20 &&
    sma20 < sma50 &&
    currentRsi !== null &&
    currentRsi < 45
  ) {
    signal = "SELL";
  }

  return {
    currentPrice,
    sma20,
    sma50,
    rsi: currentRsi,
    signal,
    reason: reasons.length
      ? reasons.join(". ") + "."
      : "No strong edge detected from the current rules."
  };
}

app.get("/", (req, res) => {
  res.json({ message: "Stock Agent backend is running." });
});

app.get("/analyze/:ticker", async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();

    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;

    const response = await axios.get(url);
    const data = response.data;
    const series = data["Time Series (Daily)"];

    if (!series) {
      return res.status(400).json({
        error: "Could not load stock data. Check ticker or API limit."
      });
    }

    const closes = Object.values(series).map((day) => parseFloat(day["4. close"]));

    if (closes.length < 50) {
      return res.status(400).json({
        error: "Not enough data returned for analysis."
      });
    }

    const analysis = analyzeStock(closes);

    res.json({
      ticker,
      ...analysis
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error." });
  }
});
app.get("/watchlist", async (req, res) => {
  const tickers = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN"];

  try {
    const results = [];

    for (const ticker of tickers) {
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
      const response = await axios.get(url);
      const data = response.data;
      const series = data["Time Series (Daily)"];

      if (!series) {
        results.push({
          ticker,
          error: "No data returned for this ticker. Possibly API limit reached."
        });
        continue;
      }

      const closes = Object.values(series).map((day) =>
        parseFloat(day["4. close"])
      );

      const analysis = analyzeStock(closes);

      results.push({
        ticker,
        ...analysis
      });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Could not load watchlist." });
  }
});
app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on port ${process.env.PORT || 3001}`);
});