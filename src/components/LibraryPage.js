import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Music, User } from 'lucide-react';
import '../style/library.css'; 
import { AuthContext } from '../context/AuthContext';

const LibraryPage = () => {
  const { setPlaylistname } = useContext(AuthContext);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = "yash9@gmail.com";

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!user) {
          setError("Missing user email");
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/music/getplaylist/${user}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Handle backend response properly
        if (response.data && Array.isArray(response.data.playlists)) {
          const formattedPlaylists = response.data.playlists.map((playlist) => ({
            name: playlist.name,
            songCount: playlist.songCount || 0,
            size: playlist.size || 0,
            image: '/default-playlist-cover.jpg', // Default image
          }));

          setMyPlaylists(formattedPlaylists);
        } else {
          console.warn('Unexpected response structure:', response.data);
          setMyPlaylists([]);
        }
      } catch (error) {
        console.error('Error fetching playlists:', error);
        setError(error.response?.data?.message || error.message || 'Failed to fetch playlists');
        setMyPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPlaylists();
    } else {
      setError('User email not found');
      setLoading(false);
    }
  }, [user]);

  // Handle playlist click to navigate to playlist details
  const handlePlaylistClick = (playlistName) => {
    setPlaylistname(playlistName);
    navigate("/playlistsongs");
  };

  // Loading state
  if (loading) {
    return (
      <div className="library-page">
        <div className="library-header">
          <div className="header-left">
            <User size={24} />
            <h1>Your Library</h1>
          </div>
          <Link to="/addplaylist" className="add-btn" title="Create Playlist">
            <Plus size={22} />
          </Link>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your playlists...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="library-page">
        <div className="library-header">
          <div className="header-left">
            <User size={24} />
            <h1>Your Library</h1>
          </div>
          <Link to="/addplaylist" className="add-btn" title="Create Playlist">
            <Plus size={22} />
          </Link>
        </div>
        <div className="error-container">
          <div className="error-icon">
            <Music size={64} />
          </div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="library-page">
      <div className="library-header">
        <div className="header-left">
          <User size={24} />
          <h1>Your Library</h1>
        </div>
        <Link to="/addplaylist" className="add-btn" title="Create Playlist">
          <Plus size={22} />
        </Link>
      </div>

      {/* Fixed: Check array length instead of songCount property */}
      {myPlaylists.length === 0 ? (
        <div className="empty-library">
          <div className="empty-icon">
            <Music size={64} />
          </div>
          <h2>Create your first playlist</h2>
          <p>It's easy, we'll help you</p>
          <Link to="/addplaylist" className="create-playlist-btn">
            Create Playlist
          </Link>
        </div>
      ) : (
        <div className="playlist-section">
          <div className="section-header">
            <span className="playlist-count">
              {/* Fixed: Use array length for playlist count */}
              {myPlaylists.length} playlist{myPlaylists.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="playlist-grid">
            {myPlaylists.map((playlist) => (
              <div 
                className="playlist-card" 
                key={`${playlist.name}`} // Fixed: Use name + index as key since no id
                onClick={() => handlePlaylistClick(playlist.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePlaylistClick(playlist.name);
                  }
                }}
              >
                <div className="playlist-cover-container">
                  <img 
                    src={playlist.image} 
                    alt={`${playlist.name} cover`} 
                    className="playlist-cover"
                    onError={(e) => {
                      e.target.src = '/default-playlist-cover.jpg';
                    }}
                  />
                  <div className="play-overlay">
                    <div className="play-btn">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="playlist-info">
                  <h3 className="playlist-title">{playlist.name}</h3>
                  <p className="playlist-description">
                    {playlist.songCount > 0 
                      ? `${playlist.songCount} song${playlist.songCount !== 1 ? 's' : ''}`
                      : 'No songs yet'
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;