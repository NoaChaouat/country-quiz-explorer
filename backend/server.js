// server.js - entry point of the backend.
// We use Express because it gives us simple routing (GET/POST) on top of Node's
// built-in http module, without writing raw request-parsing code ourselves.

import express from "express";
import cors from "cors";
import scoresRouter from "./routes/scores.js";
import questionsRouter from "./routes/questions.js";
// world-countries is a local npm package - no external API call needed for country data.
// createRequire lets ES Modules load CommonJS packages (world-countries uses CJS format).
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const allCountries = require("world-countries");

const app = express();
const PORT = process.env.PORT || 4000;

// cors() lets our React app (running on a different port, e.g. 5173) call this
// API from the browser. Without it, the browser blocks the request by default
// (same-origin policy).
app.use(cors());

// express.json() parses incoming JSON request bodies (e.g. the score object
// the frontend POSTs) into req.body, so we don't have to parse raw text ourselves.
app.use(express.json());

// All routes related to scores/leaderboard live in routes/scores.js.
// Mounting it under /api keeps server.js short and keeps route logic organized
// by feature, which makes the codebase easier to explain in review.
app.use("/api", scoresRouter);
app.use("/api", questionsRouter);

// GET /api/countries - returns all countries from the local world-countries package.
// We build flag URLs using flagcdn.com (free CDN) with the 2-letter country code.
// This avoids any external API dependency that could change or require a key.
app.get("/api/countries", (req, res) => {
  const countries = allCountries.map((c) => ({
    cca3: c.cca3,
    name: { common: c.name.common },
    region: c.region,
    // flagcdn.com provides free SVG flags by 2-letter code (cca2), lowercased.
    flags: { svg: `https://flagcdn.com/${c.cca2.toLowerCase()}.svg` },
  }));
  res.json(countries);
});

// Simple health check - useful to confirm the server is up before wiring the frontend.
app.get("/", (req, res) => {
  res.send("Country Quiz Explorer API is running.");
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
