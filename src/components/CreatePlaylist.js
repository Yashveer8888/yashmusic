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

  const handleAddPlaylist = async () => {
    const trimmedName = playlistName.trim();

    if (!user || !trimmedName) {
      setError('Please provide a valid playlist name.');
      setSuccess('');
      return;
    }

    try {
      const response = await axios.post('https://yashmusic-backend.onrender.com/api/music/create-playlist', {
        usermail: user?.email,
        playlistName: trimmedName,
      });

      setSuccess(response.data.message);
      setError('');
      setPlaylistName('');

      setTimeout(() => {
        navigate('/library');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
      setSuccess('');
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
