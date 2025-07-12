import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Music, User, Play, RefreshCw, Clock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import '../style/ListofPlaylist.css';

const ListOfPlaylist = () => {
  // Context and state management
  const { user, setPlaylistname, addSongToPlaylist, song } = useContext(AuthContext);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const DEFAULT_PLAYLIST_IMAGE = '/default-playlist-cover.jpg';

  // Authentication check
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Data fetching
  const fetchPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_BASE_URL}/api/music/playlists/${encodeURIComponent(user?.email)}`,
        {
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const data = response.data;

      if (data.success && Array.isArray(data.playlists)) {
        const formattedPlaylists = data.playlists.map((playlist) => ({
          id: playlist._id || Math.random().toString(36).substr(2, 9),
          name: playlist.name?.trim() || 'Untitled Playlist',
          songCount: playlist.songCount || playlist.totalSongs || 0,
          image: playlist.image || DEFAULT_PLAYLIST_IMAGE,
          createdAt: playlist.createdAt,
          updatedAt: playlist.updatedAt,
        }));
        setMyPlaylists(formattedPlaylists);
      } else {
        setError(data.message || 'Unexpected response format');
        setMyPlaylists([]);
      }
    } catch (err) {
      console.error('Error fetching playlists:', err);
      handleApiError(err);
      setMyPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [user, API_BASE_URL]);

  // Error handling
  const handleApiError = (err) => {
    if (err.response) {
      const { status, data } = err.response;
      const message = data?.message || err.response.statusText;

      switch (status) {
        case 404: setError('User not found or no playlists available'); break;
        case 401: setError('Authentication required. Please log in again.'); break;
        case 500: setError('Server error. Please try again later.'); break;
        default: setError(`Server error (${status}): ${message}`);
      }
    } else if (err.request) {
      setError('No response from server. Check your internet connection.');
    } else if (err.code === 'ECONNABORTED') {
      setError('Request timed out. Please try again.');
    } else {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  // Helper functions
  const handleRetry = useCallback(() => {
    setError(null);
    fetchPlaylists();
  }, [fetchPlaylists]);

  const handleImageError = (e) => {
    e.currentTarget.src = DEFAULT_PLAYLIST_IMAGE;
  };

  const handleAddSong = (playlistName) => {
    if (!user || !playlistName || !song) return;
    setPlaylistname(playlistName);
    addSongToPlaylist(user?.email, playlistName, song);
    navigate("/library");
  };

  // Component initialization
  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [fetchPlaylists, user]);

  // View Components
  const ListView = () => (
    <div className="playlist-list">
      <div className="playlist-list__header">
        <div className="playlist-list__header-index">#</div>
        <div className="playlist-list__header-title">TITLE</div>
        <div className="playlist-list__header-count">
          <Clock size={16} />
        </div>
      </div>
      
      {myPlaylists.map((playlist, index) => (
        <div
          className="playlist-list__item"
          key={playlist.id}
          onClick={() => handleAddSong(playlist.name)}
          role="button"
          tabIndex={0}
        >
          <div className="playlist-list__item-index">{index + 1}</div>
          <div className="playlist-list__item-main">
            <div className="playlist-list__item-image-container">
              <img
                src={playlist.image}
                alt={`${playlist.name} cover`}
                className="playlist-list__item-image"
                onError={handleImageError}
                loading="lazy"
              />
            </div>
            <div className="playlist-list__item-info">
              <div className="playlist-list__item-name">{playlist.name}</div>
              <div className="playlist-list__item-type">Playlist</div>
            </div>
          </div>
          <div className="playlist-list__item-count">
            {playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}
          </div>
          <div className="playlist-list__item-duration">
            <button className="playlist-list__play-button" aria-label="Play playlist">
              <Play size={18} fill="currentColor" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const LoadingView = () => (
    <div className="loading">
      <div className="loading__spinner"></div>
      <p className="loading__text">Loading your playlists...</p>
    </div>
  );

  const ErrorView = () => (
    <div className="error">
      <div className="error__icon">
        <Music size={64} />
      </div>
      <h2 className="error__title">Something went wrong</h2>
      <p className="error__message">{error}</p>
      <button onClick={handleRetry} className="error__retry-btn">
        <RefreshCw size={18} />
        Try Again
      </button>
    </div>
  );

  const EmptyView = () => (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Music size={64} />
      </div>
      <h2 className="empty-state__title">Create your first playlist</h2>
      <p className="empty-state__message">It's easy, we'll help you</p>
      <Link to="/create-playlist" className="empty-state__create-btn">
        <Plus size={18} />
        Create Playlist
      </Link>
    </div>
  );

  // Main render
  return (
    <div className="library">
      <div className="library__header">
        <div className="library__header-left">
          <User size={24} />
          <h1 className="library__title">Your Library</h1>
        </div>
        <Link 
          to="/create-playlist" 
          className="library__add-btn" 
          title="Create Playlist"
          aria-label="Create new playlist"
        >
          <Plus size={22} />
        </Link>
      </div>

      <div className="library__content">
        {loading ? (
          <LoadingView />
        ) : error ? (
          <ErrorView />
        ) : myPlaylists.length === 0 ? (
          <EmptyView />
        ) : (
          <div className="library__playlist-section">
            <div className="library__section-header">
              <h2 className="library__section-title">Playlists</h2>
              <span className="library__playlist-count">
                {myPlaylists.length} playlist{myPlaylists.length !== 1 ? 's' : ''}
              </span>
            </div>
            <ListView />
          </div>
        )}
      </div>
    </div>
  );
};

export default ListOfPlaylist;