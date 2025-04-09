import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";

// Static star display (used for average and other users' ratings)
const StarRating = ({ rating, size = "1rem" }) => {
  const pct = Math.max(0, Math.min(rating, 5)) / 5 * 100;
  return (
    <span style={{ position: "relative", display: "inline-block", fontSize: size, lineHeight: 1 }}>
      <span style={{ color: "#ddd", display: "inline-block", whiteSpace: "nowrap" }}>★★★★★</span>
      <span style={{
        position: "absolute", top: 0, left: 0,
        overflow: "hidden", whiteSpace: "nowrap",
        width: `${pct}%`, color: "gold"
      }}>★★★★★</span>
    </span>
  );
};

// Interactive input for user's rating
const InteractiveStarRating = ({ value, onChange, size = "1.5rem" }) => {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ display: "inline-flex", gap: "4px", cursor: "pointer" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(star)}
          style={{
            fontSize: size,
            color: (hovered || value) >= star ? "gold" : "#ddd",
            transition: "color 0.2s",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const BookDetail = () => {
  const navigate = useNavigate();
  const { bookId } = useParams();

  const [book, setBook] = useState(null);
  const [author, setAuthor] = useState(null);
  const [hasRated, setHasRated] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewMessage, setReviewMessage] = useState("");
  const [averageRating, setAverageRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        const res = await fetch(`${apiUrl}/book/${bookId}`, {
          method: "GET",
          credentials: "include"
        });
        if (!res.ok) {
          const txt = await res.text();
          setError(`Failed to fetch: ${res.status} ${txt}`);
          return;
        }
        const data = await res.json();
        setBook(data.book);
        setAuthor(data.author);
        setHasRated(data.hasRated);
        setUserRating(data.userRating ?? 5);
        setReviewMessage(data.reviewMessage);
        setAverageRating(typeof data.averageRating === "number" ? data.averageRating : null);
        setReviewCount(data.reviewCount);
        setReviews(data.reviews);

        // Fetch image from Google Books API
        const gRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(data.book.title)}&maxResults=1`);
        const gData = await gRes.json();
        const imageUrl = gData.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
        if (imageUrl) {
          setThumbnailUrl(imageUrl);
        }

      } catch (err) {
        console.error("Fetch error:", err);
        setError("Network or server error");
      }
    };

    if (bookId) {
      fetchBookDetail();
    } else {
      setError("Invalid book ID");
    }
  }, [bookId]);

  const handleSubmitRating = async () => {
    try {
      const res = await fetch(`${apiUrl}/book/${bookId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating: userRating, message: reviewMessage })
      });
      const result = await res.json();

      if (res.ok) {
        setHasRated(true);
        setUserRating(result.userRating);
        setReviewMessage(result.reviewMessage);
        setAverageRating(typeof result.averageRating === "number" ? result.averageRating : null);
        setReviewCount(result.reviewCount);
        setReviews(result.reviews);
      } else {
        alert(result.message || "Error submitting rating");
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
      top: 0, left: 0, right: 0, bottom: 0,
      display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "white", padding: "20px",
        borderRadius: "4px", maxWidth: "700px", width: "100%", display: "flex", gap: "20px"
      }}>
        {thumbnailUrl && (
          <img src={thumbnailUrl} alt="Book Cover" style={{ height: "180px", borderRadius: "4px" }} />
        )}
        <div style={{ flex: 1 }}>
          <h1>{book.title}</h1>
          <p>
            <a
              href={`https://www.google.com/search?tbm=bks&q=${encodeURIComponent(book.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "0.9rem", color: "#007bff", textDecoration: "underline" }}
            >
              View on Google Books
            </a>
          </p>
          <p><strong>Author:</strong> {author.name}</p>
          <p><strong>Published Year:</strong> {book.publication_year}</p>
          <p><strong>ISBN:</strong> {book.isbn}</p>
          <p>
            <strong>Average Rating:</strong>{" "}
            {typeof averageRating === "number" ? (
              <>
                {averageRating.toFixed(2)}{" "}
                <StarRating rating={averageRating} size="1.2rem" />
              </>
            ) : "Unrated"}
            {" "}({reviewCount} ratings)
          </p>

          {hasRated ? (
            <p>
              You have already rated this book:{" "}
              <StarRating rating={userRating} /> ({userRating})
              {reviewMessage && <><br />Review: {reviewMessage}</>}
            </p>
          ) : (
            <div>
              <div>
                <label>Rate this book:</label><br />
                <InteractiveStarRating value={userRating} onChange={setUserRating} />
                <span style={{ marginLeft: "10px" }}>{userRating} / 5</span>
              </div>
              <div style={{ marginTop: "10px" }}>
                <label>Your Review:</label><br />
                <textarea
                  value={reviewMessage}
                  onChange={e => setReviewMessage(e.target.value)}
                  placeholder="Enter your review here..."
                  style={{ width: "100%", height: "100px" }}
                />
              </div>
              <button onClick={handleSubmitRating} style={{ marginTop: "10px" }}>
                Submit Rating
              </button>
            </div>
          )}

          <hr />
          <h3>Community Reviews</h3>
          {reviews.length > 0 ? (
            <ul>
              {reviews.map(rev => (
                <li key={rev.review_id}>
                  <StarRating rating={rev.rating} /> ({rev.rating}) by {rev.username}
                  {rev.message && <> — {rev.message}</>}
                </li>
              ))}
            </ul>
          ) : (
            <p>No reviews available.</p>
          )}

          <button onClick={() => navigate(-1)}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
