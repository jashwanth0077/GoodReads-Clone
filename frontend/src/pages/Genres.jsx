import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";

const Genre = () => {
  const [genreQuery, setGenreQuery] = useState("");
  const [genres, setGenres] = useState([]);
  const [booksByGenre, setBooksByGenre] = useState([]);

  // Fetch some default genres on load
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

  // Search genres by name (pattern match)
  const handleGenreSearch = async (e) => {
    e.preventDefault();
    if (!genreQuery) return;
    try {
      const res = await fetch(`${apiUrl}/search-genre?query=${encodeURIComponent(genreQuery)}`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setGenres([data.genre]);
        setBooksByGenre({ [data.genre.genre_name]: data.books });
      }
    } catch (error) {
      console.error("Error searching genre:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <h1>Browse by Genre</h1>

      <form onSubmit={handleGenreSearch}>
        <input
          type="text"
          placeholder="Search genres by name"
          value={genreQuery}
          onChange={(e) => setGenreQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {Object.keys(booksByGenre).length === 0 ? (
        <p>No genres/books found.</p>
      ) : (
        Object.entries(booksByGenre).map(([genreName, books]) => (
          <div key={genreName}>
            <h2>{genreName}</h2>
            <ul>
              {books.map((book) => (
                <li key={book.book_id}>
                  <strong
                  style={{ cursor: "pointer", color: "blue" }}
  onClick={() => navigate(`/book/${book.book_id}`)}>{book.title}</strong> ({book.publication_year})
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
