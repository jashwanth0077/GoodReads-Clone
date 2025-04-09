import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/Notfound";
import Bookshelf from "./pages/Bookshelf";
import Genres from "./pages/Genres";
import NewReleases from "./pages/NewReleases";
import ChoiceAwards from "./pages/ChoiceAwards";
import BookDetails from "./pages/BookDetails";

function App() {
  const location = useLocation();

  // Hide Navbar on these routes
  const hideNavbarRoutes = ["/", "/login", "/signup"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);
  return (
  //  <Router>
  <>
  {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bookshelf" element={<Bookshelf />} />
        <Route path="/genres" element={<Genres />} />
        <Route path="/new-releases" element={<NewReleases />} />
        <Route path="/choice-awards" element={<ChoiceAwards />} />
        <Route path="/book-details" element={<BookDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
  </>
  );
}

export default App;
