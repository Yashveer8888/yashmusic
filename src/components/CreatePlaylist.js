import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../style/CreatePlaylist.css'; // Ensure you have this CSS file for styling

const AddPlaylist = () => {
  const navigate = useNavigate();
  const { user, playlistname, setPlaylistname } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddPlaylist = async () => {
    if (!playlistname || playlistname.trim() === '') {
      setError('Please enter a valid playlist name.');
      setSuccess('');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/music/create-playlist',
        {
          usermail: user,
          playlistName: playlistname,
        }
        // Add auth headers if needed
      );

      setSuccess(response.data.message);
      setError('');
      setPlaylistname('');
      
      setTimeout(() => {
        navigate('/library');
      }, 1000); // Delay to show success briefly
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
      setSuccess('');
    }
  };

  return (
    <div className="add-playlist-container">
      <h2>Add Playlist</h2>

      <input
        type="text"
        placeholder="Enter playlist name"
        value={playlistname}
        onChange={(e) => setPlaylistname(e.target.value)}
      />

      <button onClick={handleAddPlaylist}>Create Playlist</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default AddPlaylist;
