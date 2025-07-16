import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../style/UpdateSong.css'

const UpdateSong = () => {
  const navigate = useNavigate();
  const { user, playlistname, song } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Use environment variables for API base URL
  // const API_BASE_URL = 'http://localhost:5000';
  const API_BASE_URL = 'https://yashmusic-backend.onrender.com';
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleAddToPlaylist = (e) => {
    e.preventDefault();
    navigate("/playlists");
  };

  const handleDeleteSong = async () => {
    if (!user?.email || !playlistname || !song?.id) {
      setError('Required information missing');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/music/remove-song`, {
        data: {
          usermail: user.email.trim(),
          playlistName: playlistname.trim(),
          songId: song.id
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setSuccess(response.data.message || 'Song removed successfully');
        
        setTimeout(() => {
          navigate('/playlist-songs', { 
            state: { refresh: true } 
          });
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to remove song');
      }
    } catch (err) {
      console.error('Delete song error:', err);
      setError(err.response?.data?.message || 
               err.message || 
               'Failed to remove song. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="update-song-container">
      <h2 className="update-song-title">Update Song in {playlistname}</h2>
      
      <div className="song-info">
        {song && (
          <>
            <img 
                src={song.image} 
                alt={song.title} 
                className="song-image" 
                onError={(e) => {
                  e.target.src = '/placeholder-image.png';
                }}
              />
            <h3>{song.title}</h3>
            <p>Artist: {song.artist}</p>
          </>
        )}
      </div>

      <div className="update-song-actions">
        <button
          onClick={handleAddToPlaylist}
          className="action-button add-button"
          disabled={isProcessing}
        >
          Add to Another Playlist
        </button>
        
        <button
          onClick={handleDeleteSong}
          className="action-button delete-button"
          disabled={isProcessing}
        >
          {isProcessing ? 'Removing...' : 'Remove from Playlist'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};

export default UpdateSong;