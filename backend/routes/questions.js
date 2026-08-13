// routes/questions.js - serves quiz questions for a given country.
// Reads from the static data/questions.json file (see file for why static
// JSON was chosen over an external trivia API or an LLM call for the MVP).

import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QUESTIONS_FILE = path.join(__dirname, "..", "data", "questions.json");

// GET /api/questions/:countryCode  (e.g. /api/questions/ISR)
router.get("/questions/:countryCode", async (req, res) => {
  const raw = await fs.readFile(QUESTIONS_FILE, "utf-8");
  const allQuestions = JSON.parse(raw);
  const code = req.params.countryCode.toUpperCase();

  const questions = allQuestions[code];
  if (!questions) {
    return res
      .status(404)
      .json({ error: `No questions found for country code ${code}.` });
  }

  res.json(questions);
});

export default router;
