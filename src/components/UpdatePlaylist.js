import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../style/UpdatePlaylist.css';

const UpdatePlaylist = () => {
  const navigate = useNavigate();
  const { user, playlistName } = useContext(AuthContext);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleRenamePlaylist = async (e) => {
    e.preventDefault();
    const trimmedName = newPlaylistName.trim();

    if (!trimmedName) {
      setError('Please provide a valid playlist name.');
      return;
    }

    if (trimmedName === playlistName) {
      setError('New playlist name must be different from current name.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put('https://yashmusic-backend.onrender.com/api/music/update-playlist', {
        usermail: user.email,
        oldPlaylistName: playlistName,
        newPlaylistName: trimmedName,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSuccess(response.data.message);
      setNewPlaylistName('');

      setTimeout(() => {
        navigate('/library', { state: { refreshPlaylists: true } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to rename playlist. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${playlistName}"?`)) {
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.delete('https://yashmusic-backend.onrender.com/api/music/delete-playlist', {
        data: {
          usermail: user.email,
          playlistName: playlistName
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSuccess(response.data.message);

      setTimeout(() => {
        navigate('/library', { state: { refreshPlaylists: true } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete playlist. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="update-playlist-container">
      <h2 className="update-playlist-title">Edit Playlist: {playlistName}</h2>
      
      <form onSubmit={handleRenamePlaylist} className="update-playlist-form">
        <div className="update-playlist-input-group">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="New playlist name"
            className="update-playlist-input"
            disabled={isProcessing}
            maxLength="100"
          />
        </div>

        <div className="update-playlist-actions">
          <button
            type="submit"
            className="update-playlist-button rename-button"
            disabled={!newPlaylistName.trim() || isProcessing || newPlaylistName.trim() === playlistName}
          >
            {isProcessing ? 'Processing...' : 'Rename'}
          </button>
          OR
          <button
            type="button"
            onClick={handleDeletePlaylist}
            className="update-playlist-button delete-button"
            disabled={isProcessing}
          >
            {isProcessing ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </form>

      {error && <div className="update-playlist-error">{error}</div>}
      {success && <div className="update-playlist-success">{success}</div>}
    </div>
  );
};

export default UpdatePlaylist;