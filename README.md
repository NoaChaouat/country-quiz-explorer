# Country Quiz Explorer

A gamified tourism web app: browse and search countries, take a 10-question multiple-choice trivia quiz with a 15-second visual timer per question, and submit your score to a global leaderboard.

## Project structure

```
country-quiz-explorer/
  backend/    Node.js + Express API — leaderboard, scores, questions
  frontend/   React app (Vite)
```

## Setup

### Backend

```bash
cd backend
npm install
npm start        # runs on http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # runs on http://localhost:5173
```

No `.env` or API keys are required — questions are served from a static JSON file and scores are persisted to a local `data/scores.json` file.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/countries` | All countries (name, flag, region) |
| `GET` | `/api/questions/:cca3` | 10 trivia questions for the given country code |
| `POST` | `/api/scores` | Save a score `{ username, score, country }` |
| `GET` | `/api/leaderboard` | Top 10 scores, sorted descending |

## AI Usage Summary

Claude (claude.ai) was used throughout this project to accelerate development. Two key challenges it helped solve:

1. **Question generation at scale** — Writing 10 unique geography trivia questions (with plausible wrong answers) for all ~250 countries by hand would have taken days. Claude generated a Node.js script that iterated the `world-countries` npm package and produced 10 varied question types per country (capital, language, currency, borders, area, calling code, UN membership, etc.), outputting a complete `questions.json` in one pass.

2. **React timer cleanup logic** — The 15-second countdown required a `useEffect` that creates a `setInterval` and cleans it up correctly on every question change and answer selection. Claude explained why the cleanup function (`return () => clearInterval(id)`) is essential to prevent interval stacking across re-renders, and why `selected` needed to be added to the dependency array so the timer stops the moment a user picks an answer.
