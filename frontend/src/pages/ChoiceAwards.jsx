import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";

const ChoiceAwards = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchChoiceAwards = async () => {
      try {
        const res = await fetch(`${apiUrl}/choice-awards`, {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setBooks(data.books);
        }
      } catch (error) {
        console.error("Error fetching choice awards:", error);
      }
    };

    fetchChoiceAwards();
  }, []);

  return (
    <div>
      <Navbar />
      <h1>Choice Awards</h1>
      {books.length === 0 ? (
        <p>No award-winning books available yet.</p>
      ) : (
        <ul>
          {books.map((book) => (
            <li key={book.book_id}>
              <strong
              style={{ cursor: "pointer", color: "blue" }}
  onClick={() => navigate(`/book/${book.book_id}`)}>{book.title}</strong> ({book.publication_year})
              <br />Rating: {book.avg_rating.toFixed(2)} ({book.review_count} reviews)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChoiceAwards;