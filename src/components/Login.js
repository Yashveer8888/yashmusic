// Login.js
import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginWithGoogle } from "../firebaseConfig";
import "../style/Login.css";

const Login = () => {
  const { setUser, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const userData = await loginWithGoogle(); // ✅ renamed to avoid shadowing
      console.log(user)
      setUser(userData);
      navigate("/home");
    } catch (error) {
      console.error("Google Login Error:", error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Welcome to Yash Music</h2>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );
};

export default Login;
