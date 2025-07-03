import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Music, User, Grid, List, Play, MoreHorizontal } from 'lucide-react';
import '../style/LibraryPage.css';
import { AuthContext } from '../context/AuthContext';

const LibraryPage = () => {
  const { user, setPlaylistname } = useContext(AuthContext);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!user || user.trim() === '') {
        setError('Please log in to view your playlists');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `http://localhost:5000/api/music/playlists/${user}`
        );
        const data = response.data;

        if (data.success && Array.isArray(data.playlists)) {
          const formattedPlaylists = data.playlists.map((playlist) => ({
            name: playlist.name?.trim(),
            songCount: playlist.songCount || playlist.totalSongs || 0,
            image: playlist.image || '/default-playlist-cover.jpg',
          }));
          setMyPlaylists(formattedPlaylists);
        } else {
          setError(data.message || 'Unexpected response format');
          setMyPlaylists([]);
        }
      } catch (error) {
        console.error('Error fetching playlists:', error);
        if (error.response) {
          const { status, data } = error.response;
          const message = data?.message || error.response.statusText;
          if (status === 404) setError('User not found or no playlists available');
          else if (status === 401) setError('Authentication required. Please log in again.');
          else if (status === 500) setError('Server error. Please try again later.');
          else setError(`Server error (${status}): ${message}`);
        } else if (error.request) {
          setError('No response from server. Check your internet or server.');
        } else {
          setError(error.message || 'An unexpected error occurred');
        }
        setMyPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [user]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  const handlePlaylistClick = (playlistName) => {
    console.log('Playlist clicked:', playlistName);
    
    if (setPlaylistname && typeof setPlaylistname === 'function') {
      setPlaylistname(playlistName);
      console.log('Playlist name set to:', playlistName);
      
      setTimeout(() => {
        navigate('/playlist-songs');
      }, 100);
    } else {
      console.error('setPlaylistname function is not available');
    }
  };

  // Grid View Component
  const GridView = () => (
    <div className="playlist-grid fade-in">
      {myPlaylists.map((playlist, index) => (
        <div
          className="playlist-card"
          key={`${playlist.name}-${index}`}
          onClick={() => handlePlaylistClick(playlist.name)}
        >
          <div className="playlist-cover-container">
            <img
              src={playlist.image}
              alt={`${playlist.name} cover`}
              className="playlist-cover"
              onError={(e) => {
                e.currentTarget.src = '/default-playlist-cover.jpg';
              }}
            />
            <div className="play-overlay">
              <div className="play-btn">
                <Play size={24} fill="currentColor" />
              </div>
            </div>
          </div>
          <div className="playlist-info">
            <h3 className="playlist-title">{playlist.name}</h3>
            <p className="playlist-description">
              {playlist.songCount > 0
                ? `${playlist.songCount} song${playlist.songCount !== 1 ? 's' : ''}`
                : 'No songs yet'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  // List View Component
  const ListView = () => (
    <div className="playlist-list fade-in">
      {myPlaylists.map((playlist, index) => (
        <div
          className="playlist-list-item slide-in"
          key={`${playlist.name}-${index}`}
          onClick={() => handlePlaylistClick(playlist.name)}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="list-cover-container">
            <img
              src={playlist.image}
              alt={`${playlist.name} cover`}
              className="list-cover"
              onError={(e) => {
                e.currentTarget.src = '/default-playlist-cover.jpg';
              }}
            />
            <div className="list-play-btn">
              <Play size={16} fill="currentColor" />
            </div>
          </div>
          <div className="list-playlist-info">
            <h3 className="list-playlist-title">{playlist.name}</h3>
            <p className="list-playlist-description">
              {playlist.songCount > 0
                ? `${playlist.songCount} song${playlist.songCount !== 1 ? 's' : ''}`
                : 'No songs yet'}
            </p>
          </div>
          <div className="list-playlist-actions">
            <button className="action-btn" title="More options">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="library-page">
      <div className="library-header">
        <div className="header-left">
          <User size={24} />
          <h1>Your Library</h1>
        </div>
        <Link to="/create-playlist" className="add-btn" title="Create Playlist">
          <Plus size={22} />
        </Link>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your playlists...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-icon">
            <Music size={64} />
          </div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-btn">
            Try Again
          </button>
        </div>
      ) : myPlaylists.length === 0 ? (
        <div className="empty-library">
          <div className="empty-icon">
            <Music size={64} />
          </div>
          <h2>Create your first playlist</h2>
          <p>It's easy, we'll help you</p>
          <Link to="/create-playlist" className="create-playlist-btn">
            Create Playlist
          </Link>
        </div>
      ) : (
        <div className="playlist-section">
          <div className="section-header">
            <span className="playlist-count">
              {myPlaylists.length} playlist{myPlaylists.length !== 1 ? 's' : ''}
            </span>
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <Grid size={18} />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
          
          {viewMode === 'grid' ? <GridView /> : <ListView />}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;