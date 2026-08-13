import { useEffect, useState } from "react";

// CountryList: fetches all countries once, then filters them client-side.
//
// DESIGN CHOICE: we fetch the full list once on mount and filter in the
// browser (useMemo-free simple filter here) rather than re-fetching from the
// API on every keystroke. This is faster for the user and avoids hammering
// the external API - a reasonable tradeoff since the country list doesn't
// change during a session.
export default function CountryList({ onSelectCountry }) {
  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // useEffect with an empty dependency array [] runs once, right after the
    // component first renders - the right place for a one-time data fetch.
    async function fetchCountries() {
      try {
        // Fetching via our own backend instead of directly from restcountries.com.
        // Our backend proxies the request - see server.js GET /api/countries.
        const res = await fetch("https://country-quiz-explorer.onrender.com/api/countries");
        if (!res.ok) throw new Error("Failed to fetch countries");
        const data = await res.json();
        setCountries(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCountries();
  }, []);

  // Derived value, recomputed on every render - fine here since the list
  // size (~250 countries) is small. For a much larger dataset we'd reach
  // for useMemo to avoid re-filtering on unrelated re-renders.
  const filtered = countries.filter((c) => {
    const matchesSearch = c.name.common
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesRegion = region === "All" || c.region === region;
    return matchesSearch && matchesRegion;
  });

  const regions = ["All", "Africa", "Americas", "Asia", "Europe", "Oceania"];

  if (loading) return <p>Loading countries...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search countries..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={region} onChange={(e) => setRegion(e.target.value)}>
        {regions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <div className="country-grid">
        {filtered.map((country) => (
          // Using <button> instead of <div> makes the card keyboard-accessible
          // and lets the browser handle click events reliably.
          <button
            key={country.cca3}
            className="country-card"
            onClick={() => onSelectCountry(country)}
          >
            <img src={country.flags.svg} alt={country.name.common} width="60" />
            <p>{country.name.common}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
