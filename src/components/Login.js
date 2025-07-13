import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginWithGoogle, handleRedirectResult } from "../firebaseConfig";
import "../style/Login.css";

const Login = () => {
  const { setUser, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for redirect result on mount
    const checkRedirect = async () => {
      const user = await handleRedirectResult();
      if (user) {
        setUser(user);
        navigate("/home");
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
    const userData = await loginWithGoogle();
    if (userData) {
      setUser(userData);
      navigate("/home");
    }
  } catch (error) {
    console.error("Login Error:", error);
    if (error.code === "auth/unauthorized-domain") {
      alert("This domain is not authorized. Please contact support.");
    } else {
      alert(`Login failed: ${error.message || "Please try again"}`);
    }
  }
};

  return (
    <div className="login-container">
      <h2>Welcome to Yash Music</h2>
      <button 
        onClick={handleGoogleLogin}
        className="login-button"
      >
        Login with Google
      </button>
    </div>
  );
};

export default Login;