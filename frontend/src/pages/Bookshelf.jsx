import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const Bookshelves = () => {
  const navigate = useNavigate();
  const [shelves, setShelves] = useState([]);
  const [expandedShelf, setExpandedShelf] = useState(null);
  const [booksInShelves, setBooksInShelves] = useState({});
  const [newShelfName, setNewShelfName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedShelfForAdd, setSelectedShelfForAdd] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [pastSearches, setPastSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef();

  useEffect(() => {
    const fetchBookshelves = async () => {
      try {
        const response = await fetch(`${apiUrl}/bookshelves`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setShelves(data.bookshelves);
        }
      } catch (error) {
        console.error("Error fetching bookshelves:", error);
      }
    };
    fetchBookshelves();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleShelf = async (shelfId) => {
    if (expandedShelf === shelfId) {
      setExpandedShelf(null);
    } else {
      setExpandedShelf(shelfId);
      if (!booksInShelves[shelfId]) {
        try {
          const res = await fetch(`${apiUrl}/bookshelves/${shelfId}/books`, {
            method: "GET",
            credentials: "include"
          });
          if (res.ok) {
            const data = await res.json();
            setBooksInShelves(prev => ({ ...prev, [shelfId]: data.books }));
          }
        } catch (err) {
          console.error("Error fetching books in shelf:", err);
        }
      }
    }
  };

  const handleCreateShelf = async (e) => {
    e.preventDefault();
    if (!newShelfName) return;
    try {
      const response = await fetch(`${apiUrl}/bookshelves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newShelfName })
      });
      if (response.ok) {
        const data = await response.json();
        setShelves([...shelves, data.bookshelf]);
        setNewShelfName("");
      }
    } catch (error) {
      console.error("Error creating bookshelf:", error);
    }
  };

  const handleAddBook = async (bookId) => {
    if (!selectedShelfForAdd) return;
    try {
      const response = await fetch(`${apiUrl}/bookshelves/${selectedShelfForAdd}/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ book_id: bookId })
      });
      if (response.ok) {
        alert("Book added successfully");
        const res = await fetch(`${apiUrl}/bookshelves/${selectedShelfForAdd}/books`, {
          method: "GET",
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setBooksInShelves(prev => ({ ...prev, [selectedShelfForAdd]: data.books }));
        }
        setSearchResults([]);
        setSearchTerm("");
      }
    } catch (error) {
      console.error("Error adding book to bookshelf:", error);
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${apiUrl}/search-books?query=${encodeURIComponent(searchTerm)}`, {
          method: "GET",
          credentials: "include"
        });
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.books);
        }
      } catch (error) {
        console.error("Error searching books:", error);
      }
    }, 300);
    setDebounceTimer(timer);
  }, [searchTerm]);

  const handleSearchFocus = () => {
    if (pastSearches.length > 0) setShowSuggestions(true);
  };

  const handleSearchSelect = (term) => {
    setSearchTerm(term);
    setShowSuggestions(false);
  };

  const storeSearch = (term) => {
    if (!pastSearches.includes(term)) {
      setPastSearches(prev => [term, ...prev.slice(0, 4)]);
    }
  };

  return (
    <div>
      <h1>My Bookshelves</h1>

      <div>
        <h2>Create a New Bookshelf</h2>
        <form onSubmit={handleCreateShelf}>
          <input
            type="text"
            placeholder="Shelf Name"
            value={newShelfName}
            onChange={(e) => setNewShelfName(e.target.value)}
          />
          <button type="submit">Create Shelf</button>
        </form>
      </div>

      <div>
        <h2>Search Books</h2>
        <div ref={searchRef} style={{ display: "flex", flexDirection: "column", gap: "6px", position: "relative" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Search books by title or author"
              value={searchTerm}
              onFocus={handleSearchFocus}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={selectedShelfForAdd || ""}
              onChange={(e) => setSelectedShelfForAdd(e.target.value)}
            >
              <option value="">Select Shelf</option>
              {shelves.map(shelf => (
                <option key={shelf.bookshelf_id} value={shelf.bookshelf_id}>
                  {shelf.name}
                </option>
              ))}
            </select>
          </div>

          {showSuggestions && pastSearches.length > 0 && (
            <ul style={{
              position: "absolute", top: "100%", left: 0, right: 0,
              background: "white", border: "1px solid #ccc", zIndex: 10,
              margin: 0, padding: 0, listStyle: "none"
            }}>
              {pastSearches.map((s, i) => (
                <li
                  key={i}
                  style={{ padding: "8px", borderBottom: "1px solid #eee", cursor: "pointer" }}
                  onClick={() => handleSearchSelect(s)}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {searchResults.length > 0 && (
          <ul style={{ paddingLeft: "0px" }}>
            {searchResults.map((book) => (
              <li key={book.book_id} style={{ marginBottom: "5px" }}>
                <span
                  style={{ color: "blue", cursor: "pointer" }}
                  onClick={() => {
                    storeSearch(searchTerm);
                    navigate(`/book/${book.book_id}`);
                  }}
                >
                  {book.title}
                </span>{" "}
                ({book.publication_year})
                <button
                  onClick={() => handleAddBook(book.book_id)}
                  style={{ marginLeft: "10px" }}
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2>Your Bookshelves</h2>
        {shelves.map((shelf) => (
          <div key={shelf.bookshelf_id} style={{ marginBottom: "1.5em" }}>
            <button onClick={() => toggleShelf(shelf.bookshelf_id)}>
              {expandedShelf === shelf.bookshelf_id ? "▼" : "▶"} {shelf.name}
            </button>
            {expandedShelf === shelf.bookshelf_id && (
              <ul>
                {(booksInShelves[shelf.bookshelf_id] || []).map((book) => (
                  <li key={book.book_id}>
                    <span
                      style={{ color: "blue", cursor: "pointer" }}
                      onClick={() => navigate(`/book/${book.book_id}`)}
                    >
                      {book.title}
                    </span>{" "}
                    ({book.publication_year})
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bookshelves;