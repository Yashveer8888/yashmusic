// Profile.js
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { logout } from "../firebaseConfig";
import "../style/Profile.css";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // Remove user parameter as it's not needed
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  // // Format date properly
  // const formatDate = (dateString) => {
  //   if (!dateString) return "Not available";
  //   return new Date(dateString).toLocaleString();
  // };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="profile-image" />
          ) : (
            <div className="profile-placeholder">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
          )}
        </div>
        <h2 className="profile-title">
          Welcome, {user?.displayName || user?.email || "Guest"}!
        </h2>
      </div>

      <div className="profile-details">
        <h3 className="profile-subtitle">Your Profile Information</h3>
        
        <div className="profile-info-grid">
          <div className="info-item">
            <span className="info-label">Display Name:</span>
            <span className="info-value">{user?.displayName || "Not set"}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{user?.email || "Not available"}</span>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;