import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginWithGoogle, handleRedirectResult } from "../firebaseConfig";
import "../style/Login.css";

const Login = () => {
  const { setUser, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for redirect result on mount
    const checkRedirect = async () => {
      try {
        const user = await handleRedirectResult();
        if (user) {
          setUser(user);
          navigate("/home");
        }
      } catch (error) {
        console.error("Redirect result error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkRedirect();
  }, [navigate, setUser]);

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const userData = await loginWithGoogle();
      if (userData) {
        setUser(userData);
        navigate("/home");
      }
    } catch (error) {
      console.error("Login Error:", error);
      
      // Handle specific Firebase auth errors
      if (error.code === "auth/unauthorized-domain") {
        alert("This domain is not authorized. Please contact support.");
      } else if (error.code === "auth/popup-closed-by-user") {
        // User closed the popup, don't show error
      } else if (error.code === "auth/popup-blocked") {
        alert("Popup was blocked. Please allow popups for this site and try again.");
      } else if (error.code === "auth/cancelled-popup-request") {
        // Multiple popup requests, ignore
      } else {
        alert(`Login failed: ${error.message || "Please try again"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="login-container">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h2>Welcome to Yash Music</h2>
      <button 
        onClick={handleGoogleLogin}
        className="login-button"
        type="button"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Login with Google"}
      </button>
    </div>
  );
};

export default Login;