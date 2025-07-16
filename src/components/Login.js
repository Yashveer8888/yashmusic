import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginWithGoogle, auth } from "../firebaseConfig";
import "../style/Login.css";

const Login = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        navigate("/home");
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [navigate, setUser]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const userCred = await loginWithGoogle();
      console.log(userCred)
      setUser(userCred);
      navigate("/home");

    } catch (error) {
      console.error("Login Error:", error);
      
      if (error.code === "auth/unauthorized-domain") {
        alert("This domain is not authorized. Please contact support.");
      } else if (error.code === "auth/popup-blocked") {
        alert("Popup was blocked. Please allow popups for this site.");
      } else if (error.code === "auth/cancelled-popup-request") {
        // User cancelled the popup, no need to show error
      } else {
        alert(`Login failed: ${error.message || "Please try again"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!authChecked) {
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