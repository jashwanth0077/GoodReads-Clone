import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";

const BookDetail = () => {
  const navigate = useNavigate();
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [author, setAuthor] = useState(null);
  const [hasRated, setHasRated] = useState(false);
  const [userRating, setUserRating] = useState(5);

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        const res = await fetch(`${apiUrl}/book/${bookId}`, {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setBook(data.book);
          setAuthor(data.author);
          setHasRated(data.hasRated);
        }
      } catch (err) {
        console.error("Error fetching book details:", err);
      }
    };

    fetchBookDetail();
  }, [bookId]);

  const handleSubmitRating = async () => {
    try {
      const res = await fetch(`${apiUrl}/book/${bookId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating: userRating }),
      });
      if (res.ok) {
        alert("Rating submitted!");
        setHasRated(true);
        navigate(-1); // 👈 Go back to the previous page
      } else {
        alert("You have already rated this book.");
      }
    } catch (err) {
      console.error("Rating error:", err);
    }
  };

  if (!book || !author) return <div>Loading...</div>;

  return (
    <div>
      <h1>{book.title}</h1>
      <p><strong>Author:</strong> {author.name}</p>
      <p><strong>Published Year:</strong> {book.publication_year}</p>
      <p><strong>ISBN:</strong> {book.isbn}</p>

      {hasRated ? (
        <p>You have already rated this book.</p>
      ) : (
        <div>
          <label>Rate this book: </label>
          <select
            value={userRating}
            onChange={(e) => setUserRating(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <button onClick={handleSubmitRating}>Submit Rating</button>
        </div>
      )}

      <br />
      <button onClick={() => navigate(-1)}>← Back</button>
    </div>
  );
};

export default BookDetail;
