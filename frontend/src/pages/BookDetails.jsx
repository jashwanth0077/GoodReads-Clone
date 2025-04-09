import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";

const BookDetail = () => {
  const navigate = useNavigate();
  const { bookId } = useParams();
  
  const [book, setBook] = useState(null);
  const [author, setAuthor] = useState(null);
  const [hasRated, setHasRated] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewMessage, setReviewMessage] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        console.log("Fetching details for bookId:", bookId);
        const res = await fetch(`${apiUrl}/book/${bookId}`, {
          method: "GET",
          credentials: "include",
        });
        console.log("Response status:", res.status);
        if (!res.ok) {
          const errText = await res.text();
          console.error("Failed to fetch book details:", errText);
          setError(`Failed to fetch: ${res.status} ${errText}`);
          return;
        }
        const data = await res.json();
        console.log("Fetched data:", data);
        setBook(data.book);
        setAuthor(data.author);
        setHasRated(data.hasRated);
        // Set default rating to 5 if not rated; otherwise, show the user's rating.
        setUserRating(data.userRating === "Unrated" ? 5 : data.userRating);
        // Optionally, if your backend returns a review message, set it:
        // setReviewMessage(data.reviewMessage || "");
      } catch (err) {
        console.error("Error fetching book details:", err);
        setError("Network or server error");
      }
    };

    if (bookId) {
      fetchBookDetail();
    } else {
      console.error("bookId is undefined");
      setError("Invalid book ID");
    }
  }, [bookId]);

  const handleSubmitRating = async () => {
    try {
      const res = await fetch(`${apiUrl}/book/${bookId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating: userRating, message: reviewMessage }),
      });
      if (res.ok) {
        alert("Rating submitted!");
        setHasRated(true);
        navigate(-1); // Return to previous page
      } else {
        alert("You have already rated this book.");
      }
    } catch (err) {
      console.error("Rating error:", err);
    }
  };

  if (error) return <div>Error: {error}</div>;
  if (!book || !author) return <div>Loading...</div>;

  return (
    <div style={{
      background: "rgba(0,0,0,0.5)",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "white",
        padding: "20px",
        borderRadius: "4px",
        maxWidth: "500px",
        width: "100%"
      }}>
        <h1>{book.title}</h1>
        <p><strong>Author:</strong> {author.name}</p>
        <p><strong>Published Year:</strong> {book.publication_year}</p>
        <p><strong>ISBN:</strong> {book.isbn}</p>

        {hasRated ? (
          <p>
            You have already rated this book: <strong>{userRating}</strong> ⭐ 
            {reviewMessage && ` (Review: ${reviewMessage})`}
          </p>
        ) : (
          <div>
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
            </div>
            <div style={{ marginTop: "10px" }}>
              <label>Your Review:</label>
              <br />
              <textarea
                value={reviewMessage}
                onChange={(e) => setReviewMessage(e.target.value)}
                placeholder="Enter your review message here..."
                style={{ width: "100%", height: "100px", marginTop: "5px" }} 
              />
            </div>
            <button onClick={handleSubmitRating} style={{ marginTop: "10px" }}>Submit Rating</button>
          </div>
        )}

        <br />
        <button onClick={() => navigate(-1)}>Close</button>
      </div>
    </div>
  );
};

export default BookDetail;
