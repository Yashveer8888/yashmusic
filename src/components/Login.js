import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginWithGoogle } from "../firebaseConfig";

const Login = () => {
  const { setUser, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect user if already logged in
  useEffect(() => {
    if (user) {
      console.log(user)
      navigate("/home");
    }
  }, [user, navigate]);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      setUser(user);
      navigate("/home");
    } catch (error) {
      console.error("Google Login Error:", error.message);
    }
  };

  return (
    <div>
      <h2>Welcome to Yash Music</h2>
      <button onClick={(handleGoogleLogin)}>Login with Google</button>
    </div>
  );
};

export default Login;
