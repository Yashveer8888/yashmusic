import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../style/CreatePlaylist.css'; // Optional: Make sure it's defined

const AddPlaylist = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); 
  const [playlistName, setPlaylistName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // const API_BASE_URL = 'http://localhost:5000';
  const API_BASE_URL = 'https://yashmusic-backend.onrender.com';

  const handleAddPlaylist = async () => {
    const trimmedName = playlistName.trim();

    // Frontend validation to match backend
    if (!user?.email || !trimmedName) {
      setError('Please provide a valid playlist name and ensure you are logged in.');
      setSuccess('');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/music/create-playlist`, {
        usermail: user.email.trim(), // Ensure email is trimmed like backend expects
        playlistName: trimmedName,  // Already trimmed
      });

      if (response.data.success) {
        setSuccess(`Playlist "${trimmedName}" created successfully!`);
        setError('');
        setPlaylistName('');

        // Navigate after showing success message
        setTimeout(() => {
          navigate('/library');
        }, 1500);
      } else {
        // Handle cases where backend returns success: false
        setError(response.data.message || 'Playlist creation failed');
        setSuccess('');
      }
    } catch (err) {
      // Enhanced error handling to match backend responses
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to create playlist';
      setError(errorMessage);
      setSuccess('');
      
      // Special case for duplicate playlists
      if (errorMessage.includes('already exists')) {
        setPlaylistName(''); // Clear the input to encourage a new name
      }
    }
  };

  return (
    <div className="add-playlist-container">
      <h2>Create a New Playlist</h2>

      <input
        type="text"
        placeholder="Enter playlist name"
        value={playlistName}
        onChange={(e) => setPlaylistName(e.target.value)}
      />

      <button onClick={handleAddPlaylist}>Create Playlist</button>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}
    </div>
  );
};

export default AddPlaylist;
