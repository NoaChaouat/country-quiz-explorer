import { useEffect, useState } from "react";

const API_URL = "https://country-quiz-explorer.onrender.com/api";

// Leaderboard receives lastScore and lastCountry from App.jsx after a quiz ends.
// If those props exist, we show a "submit your score" form pre-filled with the real score.
export default function Leaderboard({ lastScore, lastCountry, onPlayAgain }) {
  const [scores, setScores] = useState([]);
  const [username, setUsername] = useState("");
  // submitted tracks whether the user already saved this score, to avoid duplicates.
  const [submitted, setSubmitted] = useState(false);

  async function loadLeaderboard() {
    const res = await fetch(`${API_URL}/leaderboard`);
    const data = await res.json();
    setScores(data);
  }

  // Load the leaderboard as soon as this component appears on screen.
  useEffect(() => { loadLeaderboard(); }, []);

  async function submitScore(e) {
    e.preventDefault(); // prevents the page from refreshing (default browser behavior for forms)
    if (!username) return;
    await fetch(`${API_URL}/scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Send the real score and country from the quiz, not a random number.
      body: JSON.stringify({
        username,
        score: lastScore,
        country: lastCountry?.name?.common ?? "Unknown",
      }),
    });
    setSubmitted(true);
    setUsername("");
    loadLeaderboard(); // refresh the board so the user sees themselves immediately
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <section className="leaderboard-section">
      <h2>🏆 LEADERBOARD</h2>

      {/* Only show the submit form if the user just finished a quiz and hasn't submitted yet. */}
      {lastScore !== null && !submitted && (
        <div className="score-submit">
          <p>
            🎉 Great job! You scored{" "}
            <strong>{lastScore}</strong> on{" "}
            <em>{lastCountry?.name?.common}</em>!
          </p>
          <form onSubmit={submitScore}>
            <input
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <button type="submit">💾 SAVE SCORE</button>
          </form>
        </div>
      )}

      {submitted && (
        <p className="score-saved-msg">✅ Score saved! You're on the leaderboard!</p>
      )}

      <div>
        <h3 style={{ fontSize: "1.8rem", color: "#fff", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "1.25rem" }}>
          Top Scores
        </h3>
        {scores.length === 0 ? (
          <p style={{ color: "#ffdd00", textAlign: "center", fontSize: "1.2rem" }}>
            ❓ No scores yet. Be the first!
          </p>
        ) : (
          <ol className="leaderboard-list">
            {scores.map((s, i) => (
              <li key={i} className="lb-row">
                <span className="lb-rank">{medals[i] ?? i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div className="lb-name">{s.username}</div>
                  <div className="lb-country">{s.country}</div>
                </div>
                <span className="lb-score">{s.score}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <button className="play-again-btn" onClick={onPlayAgain}>
        🎮 TAKE ANOTHER QUIZ
      </button>
    </section>
  );
}
