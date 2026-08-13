// routes/scores.js - handles saving a score and returning the leaderboard.
//
// DESIGN CHOICE: we persist to a local JSON file (data/scores.json) instead of
// MongoDB. The brief explicitly allows this ("MongoDB or simple local JSON/
// in-memory store"). A JSON file is enough for a take-home assignment and
// avoids the extra setup time of installing/configuring a database - a
// reasonable tradeoff to be ready to explain in review: "MongoDB would scale
// better and support concurrent writes safely, but for this scope a flat
// file is simpler and sufficient."

import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();

// __dirname isn't available by default in ES modules, so we reconstruct it.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCORES_FILE = path.join(__dirname, "..", "data", "scores.json");

// Small helper to read the current scores array from disk.
async function readScores() {
  try {
    const raw = await fs.readFile(SCORES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    // If the file doesn't exist yet, treat it as an empty leaderboard
    // instead of crashing the server.
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeScores(scores) {
  await fs.writeFile(SCORES_FILE, JSON.stringify(scores, null, 2));
}

// POST /api/scores
// Body: { username, score, country }
// Saves a new score entry to the JSON file.
router.post("/scores", async (req, res) => {
  const { username, score, country } = req.body;

  // Basic validation - we don't trust data coming from the client.
  if (!username || typeof score !== "number" || !country) {
    return res.status(400).json({
      error: "Request must include username (string), score (number), and country (string).",
    });
  }

  const scores = await readScores();
  scores.push({ username, score, country, date: new Date().toISOString() });
  await writeScores(scores);

  res.status(201).json({ message: "Score saved." });
});

// GET /api/leaderboard
// Returns the top scores, highest first.
router.get("/leaderboard", async (req, res) => {
  const scores = await readScores();

  // Sort descending by score. We sort on every request rather than on write,
  // since the leaderboard is read far less often than it's written for a
  // small app like this - keeping writes fast and simple.
  const sorted = [...scores].sort((a, b) => b.score - a.score);

  const LIMIT = 10;
  res.json(sorted.slice(0, LIMIT));
});

export default router;
