import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../style/CreatePlaylist.css';

const UpdatePlaylistName = () => {
  const navigate = useNavigate();
  const { user, playlistName } = useContext(AuthContext); 
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePlaylistName = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newPlaylistName || newPlaylistName.trim().length === 0) {
      setError('Please provide a valid playlist name.');
      return;
    }

    if (!user?.email) {
      setError('User not authenticated.');
      return;
    }

    if (!playlistName) {
      setError('No playlist selected for renaming.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/music/update-playlist', {
        usermail: user.email,
        oldPlaylistName: playlistName,
        newPlaylistName: newPlaylistName.trim(),
      });

      setSuccess(response.data.message);
      setNewPlaylistName('');

      setTimeout(() => {
        navigate('/library');
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to update playlist name';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-playlist-container">
      <h2>Rename Playlist: {playlistName}</h2>
      
      <form onSubmit={handleUpdatePlaylistName}>
        <input
          type="text"
          placeholder="Enter new playlist name"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          required
          minLength="1"
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Playlist'}
        </button>
      </form>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}
    </div>
  );
};

export default UpdatePlaylistName;