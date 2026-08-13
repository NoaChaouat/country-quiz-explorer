import { useEffect, useState } from "react";

const API_URL = "https://country-quiz-explorer.onrender.com/api";

// Leaderboard receives lastScore and lastCountry from App.jsx after a quiz ends.
// If those props exist, we show a "submit your score" form pre-filled with the real score.
export default function Leaderboard({ lastScore, lastCountry }) {
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
  useEffect(() => {
    loadLeaderboard();
  }, []);

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
    <div className="leaderboard-container">
      <h2>🏆 Leaderboard</h2>

      {/* Only show the submit form if the user just finished a quiz (lastScore exists)
          and hasn't submitted yet. */}
      {lastScore !== null && !submitted && (
        <form className="score-submit" onSubmit={submitScore}>
          <p>
            You scored <strong>{lastScore} / 10</strong> on{" "}
            <strong>{lastCountry?.name?.common}</strong>! Enter your name to save it:
          </p>
          <input
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="submit">Save score</button>
        </form>
      )}

      {submitted && (
        <p style={{ color: "#22c55e", marginBottom: "1.5rem" }}>
          ✅ Score saved! See yourself on the board below.
        </p>
      )}

      {scores.length === 0 ? (
        <p className="loading-text">No scores yet — be the first to play!</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Score</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s, i) => (
              <tr key={i}>
                <td>{medals[i] ?? i + 1}</td>
                <td>{s.username}</td>
                <td>{s.score} / 10</td>
                <td>{s.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="play-again-btn" onClick={() => window.location.reload()}>
        ← Play again
      </button>
    </div>
  );
}
