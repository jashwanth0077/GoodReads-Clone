import React, { useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const Navbar = () => {
  const navigate = useNavigate();
  const [browseOpen, setBrowseOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
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

      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search by author or book"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;

