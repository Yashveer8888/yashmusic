import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, ArrowLeft, Play, Pause, MoreHorizontal } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import '../style/library.css';

const PlaylistSong = () => {
  const { user, playlistName } = useContext(AuthContext);
  const [songs, setSongs] = useState([]);
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPlayingSong, setCurrentPlayingSong] = useState(null);
  const navigate = useNavigate();

  // Debug: Log the context values
  console.log('Debug - user:', user);
  console.log('Debug - playlistName:', playlistName);

  useEffect(() => {
    const fetchPlaylistSongs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Enhanced validation with detailed error messages
        if (!user) {
          setError("User not found in context. Please log in again.");
          setLoading(false);
          return;
        }

        if (!playlistName) {
          setError("Playlist name not found. Please select a playlist from library.");
          setLoading(false);
          return;
        }

        console.log('Making API call with:', { user, playlistName });

        // Fixed: Use correct API endpoint structure
        const response = await axios.get(
          `http://localhost:5000/api/music/${encodeURIComponent(user)}/${encodeURIComponent(playlistName)}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('API Response:', response.data);

        if (response.data) {
          // Set playlist info
          setPlaylistInfo({
            name: response.data.playlistName,
            usermail: response.data.usermail,
            size: response.data.size || 0
          });

          // Set songs array
          setSongs(response.data.songs || []);
        } else {
          console.warn('Unexpected response structure:', response.data);
          setSongs([]);
        }
      } catch (error) {
        console.error('Error fetching playlist songs:', error);
        setError(
          error.response?.data?.message || 
          error.message || 
          'Failed to fetch playlist songs'
        );
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have both user and playlistName
    if (user && playlistName) {
      fetchPlaylistSongs();
    } else {
      setLoading(false);
      if (!user) {
        setError("User not found in context");
      } else if (!playlistName) {
        setError("Playlist name not found in context");
      }
    }
  }, [user, playlistName]); // Fixed: Added proper dependencies

  const handlePlaySong = (song, index) => {
    if (currentPlayingSong === index) {
      setCurrentPlayingSong(null); // Pause if already playing
    } else {
      setCurrentPlayingSong(index); // Play song
    }
  };

  const handleBackToLibrary = () => {
    navigate('/library');
  };

  // Loading state
  if (loading) {
    return (
      <div className="playlist-page">
        <div className="playlist-header">
          <button onClick={handleBackToLibrary} className="back-btn">
            <ArrowLeft size={24} />
          </button>
          <h1>Loading...</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading playlist songs...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="playlist-page">
        <div className="playlist-header">
          <button onClick={handleBackToLibrary} className="back-btn">
            <ArrowLeft size={24} />
          </button>
          <h1>Error</h1>
        </div>
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="playlist-page">
      {/* Playlist Header */}
      <div className="playlist-header">
        <button onClick={handleBackToLibrary} className="back-btn">
          <ArrowLeft size={24} />
        </button>
        <div className="playlist-info-header">
          <h1>{playlistInfo?.name || playlistName}</h1>
          <p className="playlist-meta">
            {playlistInfo?.size || songs.length} song{(playlistInfo?.size || songs.length) !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/addplaylist" className="add-btn">
          <Plus size={22} />
        </Link>
      </div>

      {/* Playlist Content */}
      {songs.length === 0 ? (
        <div className="empty-playlist">
          <div className="empty-icon">
            <Play size={64} />
          </div>
          <h2>No songs in this playlist</h2>
          <p>Start adding songs to make it yours!</p>
          <Link to="/search" className="add-songs-btn">
            Find Songs
          </Link>
        </div>
      ) : (
        <div className="songs-section">
          <div className="songs-header">
            <span className="song-number">#</span>
            <span className="song-title">Title</span>
            <span className="song-duration">Duration</span>
            <span className="song-actions"></span>
          </div>
          
          <div className="songs-list">
            {songs.map((song, index) => (
              <div 
                className={`song-item ${currentPlayingSong === index ? 'playing' : ''}`}
                key={`${song.title}-${index}`}
              >
                <div className="song-number-col">
                  {currentPlayingSong === index ? (
                    <button 
                      className="play-pause-btn"
                      onClick={() => handlePlaySong(song, index)}
                    >
                      <Pause size={16} />
                    </button>
                  ) : (
                    <div className="song-index-container">
                      <span className="song-index">{index + 1}</span>
                      <button 
                        className="play-pause-btn"
                        onClick={() => handlePlaySong(song, index)}
                      >
                        <Play size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="song-info">
                  <div className="song-cover">
                    <img 
                      src={song.image || '/default-song-cover.jpg'} 
                      alt={song.title}
                      onError={(e) => {
                        e.target.src = '/default-song-cover.jpg';
                      }}
                    />
                  </div>
                  <div className="song-details">
                    <h3 className="song-title">{song.title || 'Unknown Title'}</h3>
                    <p className="song-artist">{song.artist || 'Unknown Artist'}</p>
                  </div>
                </div>
                
                <div className="song-duration">
                  {song.duration || '0:00'}
                </div>
                
                <div className="song-actions">
                  <button className="more-btn">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistSong;