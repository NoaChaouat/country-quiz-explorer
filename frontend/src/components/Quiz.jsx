import { useEffect, useState } from "react";

const QUESTION_TIME = 15; // seconds per question

// Quiz: shows one question at a time with a 15s countdown.
// When the quiz ends it calls onFinish(finalScore) so the parent (App.jsx)
// can route to the leaderboard and know what score to submit.
export default function Quiz({ country, onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [ready, setReady] = useState(false); // show ready screen before first question
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selected, setSelected] = useState(null);
  // error holds a message string if the backend returned no questions for this country.
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetches real questions from our backend for this specific country.
    // country.cca3 is the 3-letter country code (e.g. "ISR" for Israel, "FRA" for France).
    async function fetchQuestions() {
      try {
        const res = await fetch(
          `https://country-quiz-explorer.onrender.com/api/questions/${country.cca3}`
        );
        if (!res.ok) throw new Error("No questions found for this country");
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        // If the country has no questions in our database, show a friendly message
        // instead of crashing the app.
        setQuestions([]);
        setError(err.message);
      }
    }
    fetchQuestions();
  }, [country]);

  // Countdown timer effect. Runs a 1-second interval and ticks timeLeft down.
  // The cleanup function (the `return () => clearInterval(id)` below) is
  // essential: without it, every re-render of this effect (e.g. when
  // `current` changes for the next question) would start a NEW interval on
  // top of the old one, causing the timer to speed up and leak intervals.
  // We also stop the timer immediately once the user has picked an answer
  // (`selected !== null`) so the countdown doesn't keep running in the background.
  useEffect(() => {
    if (!ready) return; // don't start until user clicks Ready
    if (selected !== null) return; // answer already chosen — don't start another tick
    if (timeLeft <= 0) {
      handleAnswer(null); // time's up - counts as wrong, same as a wrong click
      return;
    }
    const id = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [timeLeft, selected, ready]);

  // Reset the timer whenever we move to a new question.
  useEffect(() => {
    setTimeLeft(QUESTION_TIME);
    setSelected(null);
  }, [current]);

  function handleAnswer(option) {
    if (selected) return; // prevent double-answering the same question
    setSelected(option);

    const isCorrect = option === questions[current]?.answer;
    if (isCorrect) setScore((s) => s + 1);

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent((c) => c + 1);
      } else {
        onFinish(score + (isCorrect ? 1 : 0));
      }
    }, 800); // brief pause so the user sees which answer was correct
  }

  // Show error if backend has no questions for this country yet.
  if (error) return <p className="error-text">⚠️ {error}</p>;
  // Show loading spinner while fetch is in progress.
  if (questions.length === 0) return <p className="loading-text">Loading questions...</p>;

  // Ready screen — shown after questions load but before the quiz starts.
  if (!ready) {
    return (
      <div className="ready-screen">
        <img src={country.flags.svg} alt={country.name.common} />
        <h2>{country.name.common}</h2>
        <p>10 questions · 15 seconds each<br />Good luck!</p>
        <button className="ready-btn" onClick={() => setReady(true)}>
          🟢 Ready — Start!
        </button>
      </div>
    );
  }

  const q = questions[current];
  const progressPct = (timeLeft / QUESTION_TIME) * 100;
  const timerClass =
    timeLeft <= 5 ? "timer-fill danger" :
    timeLeft <= 9 ? "timer-fill warning" :
    "timer-fill";

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>🌍 {country.name.common}</h2>
      </div>
      <p className="quiz-meta">
        Question {current + 1} / {questions.length} &nbsp;·&nbsp; Score: {score}
      </p>

      <div className="timer-bar">
        <div className={timerClass} style={{ width: `${progressPct}%` }} />
      </div>
      <p className="timer-label">{timeLeft}s remaining</p>

      <p className="question-text">{q.question}</p>

      <div className="options-grid">
        {q.options.map((opt) => {
          let cls = "option-btn";
          if (selected !== null) {
            if (opt === q.answer) cls += " correct";
            else if (opt === selected) cls += " wrong";
          }
          return (
            <button
              key={opt}
              className={cls}
              onClick={() => handleAnswer(opt)}
              disabled={selected !== null}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
