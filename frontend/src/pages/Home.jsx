import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          credentials: "include", // Ensure cookies are sent with the request
        });
        if (response.ok) {
          // User is logged in; navigate to dashboard
          navigate("/dashboard");
        } else {
          // User is not logged in; navigate to login
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        // On error, assume the user is not logged in and navigate to login
        navigate("/login");
      }
    };

    checkLoginStatus();
  }, [navigate]);

  return <div>HomePage</div>;
};

export default Home;
