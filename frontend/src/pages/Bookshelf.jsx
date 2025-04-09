import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";

const Bookshelves = () => {
  const navigate = useNavigate();
  const [shelves, setShelves] = useState([]);
  const [newShelfName, setNewShelfName] = useState("");
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [booksInShelf, setBooksInShelf] = useState([]);

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
          if (data.bookshelves.length > 0 && !selectedShelf) {
            setSelectedShelf(data.bookshelves[0].bookshelf_id);
          }
        }
      } catch (error) {
        console.error("Error fetching bookshelves:", error);
      }
    };
    fetchBookshelves();
  }, [selectedShelf]);

  useEffect(() => {
    const fetchBooksInShelf = async () => {
      if (!selectedShelf) return;
      try {
        const res = await fetch(`${apiUrl}/bookshelves/${selectedShelf}/books`, {
          method: "GET",
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setBooksInShelf(data.books.map(book => book.book_id));
        }
      } catch (err) {
        console.error("Error fetching books in shelf:", err);
      }
    };
    fetchBooksInShelf();
  }, [selectedShelf]);

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

  const handleSearchBooks = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    try {
      const response = await fetch(
        `${apiUrl}/search-books?query=${encodeURIComponent(searchTerm)}`,
        { method: "GET", credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.books);
      }
    } catch (error) {
      console.error("Error searching books:", error);
    }
  };

  const handleAddBook = async (bookId) => {
    if (!selectedShelf) return;
    try {
      const response = await fetch(
        `${apiUrl}/bookshelves/${selectedShelf}/books`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ book_id: bookId })
        }
      );
      if (response.ok) {
        alert("Book added successfully");
        setBooksInShelf([...booksInShelf, bookId]);
      }
    } catch (error) {
      console.error("Error adding book to bookshelf:", error);
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
        <h2>Your Bookshelves</h2>
        <select
          value={selectedShelf || ""}
          onChange={(e) => setSelectedShelf(e.target.value)}
        >
          {shelves.map((shelf) => (
            <option key={shelf.bookshelf_id} value={shelf.bookshelf_id}>
              {shelf.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2>Search Books</h2>
        <form onSubmit={handleSearchBooks}>
          <input
            type="text"
            placeholder="Search books by title or author"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <ul>
          {searchResults.map((book) => {
            const alreadyAdded = booksInShelf.includes(book.book_id);
            return (
              <li key={book.book_id}>
                <strong
                style={{ cursor: "pointer", color: "blue" }}
  onClick={() => navigate(`/book/${book.book_id}`)}>{book.title}</strong> ({book.publication_year})
                <button
                  onClick={() => handleAddBook(book.book_id)}
                  disabled={alreadyAdded}
                >
                  {alreadyAdded ? "Already in Shelf" : "Add to Shelf"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Bookshelves;