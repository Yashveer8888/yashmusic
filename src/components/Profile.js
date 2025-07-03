// Profile.js
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { logout } from "../firebaseConfig";
import "../style/Profile.css"; // Import the Spotify-style CSS

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout(user);
    navigate("/login");
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">Welcome, {user || "Guest"}</h2>
      <h3 className="profile-subtitle">Your Profile Information</h3>
      <p className="profile-info">Email: {user?.email || "Not available"}</p>
      <p className="profile-info">Last Sign-in: {user?.metadata?.lastSignInTime || "Not available"}</p>
      <button className="logout-btn" onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default Profile;
