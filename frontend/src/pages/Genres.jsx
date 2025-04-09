import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";

const Genre = () => {
  const navigate = useNavigate();
  const [genreQuery, setGenreQuery] = useState("");
  const [genres, setGenres] = useState([]);
  const [booksByGenre, setBooksByGenre] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const suggestionsRef = useRef();

  // Fetch default genres
  useEffect(() => {
    const fetchDefaultGenres = async () => {
      try {
        const res = await fetch(`${apiUrl}/default-genres`, {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setGenres(data.genres);
          setBooksByGenre(data.books_by_genre);
        }
      } catch (error) {
        console.error("Error fetching default genres:", error);
      }
    };
    fetchDefaultGenres();
  }, []);

  // Suggestion fetch
  useEffect(() => {
    if (!genreQuery.trim()) {
      setSuggestions([]);
      return;
    }

    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${apiUrl}/genre-suggestions?query=${encodeURIComponent(genreQuery)}`, {
          method: "GET",
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.error("Error fetching genre suggestions:", err);
      }
    }, 300);

    setDebounceTimer(timer);
  }, [genreQuery]);

  // Hide suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchGenreBooks = async (genreName) => {
    try {
      const res = await fetch(`${apiUrl}/search-genre?query=${encodeURIComponent(genreName)}`, {
        method: "GET",
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setGenres([data.genre]);
        setBooksByGenre({ [data.genre.genre_name]: data.books });
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error searching genre:", error);
    }
  };

  const handleGenreSearch = (e) => {
    e.preventDefault();
    if (genreQuery) {
      fetchGenreBooks(genreQuery);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Browse by Genre</h1>

      <form onSubmit={handleGenreSearch} style={{ position: "relative", maxWidth: "400px" }} ref={suggestionsRef}>
        <input
          type="text"
          placeholder="Search genres by name"
          value={genreQuery}
          onChange={(e) => setGenreQuery(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
        <button type="submit" style={{ marginTop: "10px" }}>Search</button>

        {suggestions.length > 0 && (
          <ul
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 10,
              background: "white",
              border: "1px solid #ccc",
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                onClick={() => {
                  setGenreQuery(suggestion);
                  fetchGenreBooks(suggestion);
                }}
                style={{
                  padding: "8px",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer"
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </form>

      {Object.keys(booksByGenre).length === 0 ? (
        <p>No genres/books found.</p>
      ) : (
        Object.entries(booksByGenre).map(([genreName, books]) => (
          <div key={genreName} style={{ marginTop: "2rem" }}>
            <h2>{genreName}</h2>
            <ul>
              {books.map((book) => (
                <li key={book.book_id}>
                  <strong
                    style={{ cursor: "pointer", color: "blue" }}
                    onClick={() => navigate(`/book/${book.book_id}`)}
                  >
                    {book.title}
                  </strong>{" "}
                  ({book.publication_year})
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default Genre;
