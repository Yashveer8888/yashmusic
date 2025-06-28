// Profile.js
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate instead of useHistory
import { AuthContext } from "../context/AuthContext";
import { logout } from "../firebaseConfig";

const Profile = () => {
    const { user } = useContext(AuthContext); // Access user state
    const navigate = useNavigate();
  
    const handleLogout = async () => {
      await logout(user);
      navigate("/login"); // Redirect to login after logout
    };
  return (
    <div>
      Profile
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default Profile;
