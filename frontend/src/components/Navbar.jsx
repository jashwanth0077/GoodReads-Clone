import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const Navbar = () => {
  const navigate = useNavigate();
  const [browseOpen, setBrowseOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("book");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const searchRef = useRef();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${apiUrl}/search-suggestions?query=${encodeURIComponent(searchTerm)}&type=${searchType}`,
          { method: "GET", credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.books.slice(0, 5));
        }
      } catch (err) {
        console.error("Suggestion fetch error:", err);
      }
    }, 300);
    setDebounceTimer(timer);
  }, [searchTerm, searchType]);

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="navbar" style={{ display: "flex", gap: "10px", alignItems: "center", padding: "10px" }}>
      <h1>VibeSync</h1>
      <button onClick={() => navigate("/dashboard")}>Home</button>
      <button onClick={() => navigate("/bookshelf")}>My Books</button>

      {/* Browse dropdown */}
      <div
        style={{ position: "relative" }}
        onMouseEnter={() => setBrowseOpen(true)}
        onMouseLeave={() => setBrowseOpen(false)}
      >
        <button>Browse ▾</button>
        {browseOpen && (
          <div style={{
            position: "absolute",
            top: "100%", left: 0,
            display: "flex", flexDirection: "column",
            backgroundColor: "white", border: "1px solid #ccc",
            zIndex: 1000, minWidth: "150px"
          }}>
            <button onClick={() => navigate("/genres")}>Genres</button>
            <button onClick={() => navigate("/new-releases")}>New Releases</button>
            <button onClick={() => navigate("/choice-awards")}>Choice Awards</button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div ref={searchRef} style={{ position: "relative" }}>
        <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: "5px" }}>
          <input
            type="text"
            value={searchTerm}
            placeholder={`Search by ${searchType}`}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            style={{ padding: "6px" }}
          />
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="book">Book</option>
            <option value="author">Author</option>
          </select>
        </form>

        {/* Suggestion dropdown */}
        {showSuggestions && searchResults.length > 0 && (
          <ul style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            backgroundColor: "white",
            border: "1px solid #ccc",
            listStyle: "none",
            margin: 0,
            padding: 0,
            zIndex: 1000
          }}>
            {searchResults.map((book) => (
              <li
                key={book.book_id}
                onClick={() => {
                  navigate(`/book/${book.book_id}`);
                  setSearchTerm("");
                  setShowSuggestions(false);
                }}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee"
                }}
              >
                {book.title} by {book.author_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
