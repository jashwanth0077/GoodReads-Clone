import React, { useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const Navbar = () => {
  const navigate = useNavigate();
  const [browseOpen, setBrowseOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("book"); // "book" or "author"
  const [searchResults, setSearchResults] = useState([]);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      const res = await fetch(`${apiUrl}/search-suggestions?query=${encodeURIComponent(searchTerm)}&type=${searchType}`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.books.slice(0, 4));
      } else {
        console.error("Failed to fetch search results");
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  return (
    <nav className="navbar">
      <button onClick={() => navigate("/dashboard")}>Home</button>
      <button onClick={() => navigate("/bookshelf")}>My Books</button>

      <button onClick={() => setBrowseOpen(!browseOpen)}>
        Browse {browseOpen ? "▲" : "▼"}
      </button>
      {browseOpen && (
        <div>
          <button onClick={() => { navigate("/genres"); setBrowseOpen(false); }}>
            Genres
          </button>
          <button onClick={() => { navigate("/new-releases"); setBrowseOpen(false); }}>
            New Releases
          </button>
          <button onClick={() => { navigate("/choice-awards"); setBrowseOpen(false); }}>
            Choice Awards
          </button>
        </div>
      )}

      <form onSubmit={handleSearchSubmit} style={{ position: "relative" }}>
        <input
          type="text"
          placeholder={`Search by ${searchType}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="book">Book</option>
          <option value="author">Author</option>
        </select>
        <button type="submit">Search</button>

        {searchResults.length > 0 && (
          <ul style={{ position: "absolute", backgroundColor: "white", border: "1px solid #ccc", zIndex: 10, listStyle: "none", margin: 0, padding: 0, width: "100%" }}>
            {searchResults.map((book) => (
              <li
                key={book.book_id}
                onClick={() => {
                  navigate(`/book/${book.book_id}`);
                  setSearchTerm("");
                  setSearchResults([]);
                }}
                style={{ cursor: "pointer", padding: "8px", borderBottom: "1px solid #eee" }}
              >
                {book.title} by {book.author_name}
              </li>
            ))}
          </ul>
        )}
      </form>

      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
