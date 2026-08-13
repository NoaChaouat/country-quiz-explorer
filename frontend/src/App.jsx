import { useState } from "react";
import CountryList from "./components/CountryList.jsx";
import Quiz from "./components/Quiz.jsx";
import Leaderboard from "./components/Leaderboard.jsx";

// App is the "router" of this small app. Instead of pulling in a full
// routing library (react-router) for 3 screens, we keep it simple with a
// single piece of state that tracks which screen we're on. This is a fair
// tradeoff to mention in review: react-router would be worth it if the app
// grew to more real "pages" with URLs, but for 3 in-memory views it's
// unnecessary complexity.
function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [view, setView] = useState("home"); // "home" | "list" | "quiz" | "leaderboard"
  // lastScore holds the final score after a quiz so Leaderboard can pre-fill it.
  const [lastScore, setLastScore] = useState(null);

  return (
    <div>
      <header className="app-header">
        <h1 className="app-title">🌍 TRIVIA</h1>
        <p className="app-subtitle">COUNTRY QUIZ EXPLORER</p>
      </header>

      {/* Home screen — two big coloured nav cards */}
      {view === "home" && (
        <div className="home-cards">
          <button className="home-card home-card-countries" onClick={() => setView("list")}>
            <span className="home-card-emoji">🌍</span>
            <span className="home-card-label">COUNTRIES</span>
            <span className="home-card-sub">Choose a country &amp; play!</span>
          </button>
          <button className="home-card home-card-leaderboard" onClick={() => setView("leaderboard")}>
            <span className="home-card-emoji">🏆</span>
            <span className="home-card-label">LEADERBOARD</span>
            <span className="home-card-sub">Top global scores</span>
          </button>
        </div>
      )}

      {/* Back button shown on all non-home screens */}
      {view !== "home" && (
        <button className="back-btn" onClick={() => setView("home")}>
          ← HOME
        </button>
      )}

      {view === "list" && (
        <CountryList
          onSelectCountry={(country) => {
            setSelectedCountry(country);
            setView("quiz");
          }}
        />
      )}

      {view === "quiz" && selectedCountry && (
        <Quiz
          country={selectedCountry}
          // onFinish receives the final score from Quiz and saves it in state
          // before navigating to the leaderboard screen.
          onFinish={(finalScore) => {
            setLastScore(finalScore);
            setView("leaderboard");
          }}
        />
      )}

      {/* Pass lastScore and selectedCountry so the leaderboard can pre-fill the submit form. */}
      {view === "leaderboard" && (
        <Leaderboard
          lastScore={lastScore}
          lastCountry={selectedCountry}
          onPlayAgain={() => setView("list")}
        />
      )}
    </div>
  );
}

export default App;
