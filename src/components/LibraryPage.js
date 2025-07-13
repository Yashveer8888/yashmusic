import React, { useEffect, useState, useContext, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, 
  Music, 
  User, 
  Grid, 
  List, 
  Play, 
  MoreHorizontal, 
  RefreshCw, 
  Search, 
  Filter,
  Clock,
  Check,
  X
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import "../style/LibraryPage.css";

const LibraryPage = () => {
  // Context and state
  const { user, setPlaylistname } = useContext(AuthContext);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [retryCount, setRetryCount] = useState(0);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editName, setEditName] = useState('');
  const navigate = useNavigate();
  const editInputRef = useRef(null);

  // Constants
  const API_BASE_URL = 'https://yashmusic-backend.onrender.com';
  const DEFAULT_PLAYLIST_IMAGE = '/default-playlist-cover.jpg';
  const MAX_RETRY_ATTEMPTS = 3;

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Helper functions
  const getUserEmail = useCallback(() => {
    return user?.email || user?.uid || null;
  }, [user]);

  // Data fetching
  const fetchPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userEmail = getUserEmail();
      if (!userEmail) {
        setError('User email not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(
        `${API_BASE_URL}/api/music/playlists/${encodeURIComponent(userEmail)}`
      );

      const { data } = response;
      if (data.success && Array.isArray(data.playlists)) {
        const formattedPlaylists = data.playlists.map(playlist => ({
          id: playlist._id || Math.random().toString(36).substring(2, 9),
          name: playlist.name?.trim() || 'Untitled Playlist',
          songCount: playlist.totalSongs || playlist.songCount || 0,
          image: playlist.image || DEFAULT_PLAYLIST_IMAGE,
          createdAt: playlist.createdAt,
          updatedAt: playlist.updatedAt,
          description: playlist.description || '',
        }));
        
        setMyPlaylists(formattedPlaylists);
        setRetryCount(0);
      } else {
        setError(data.message || 'Unexpected response format');
        setMyPlaylists([]);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      handleApiError(error);
      setMyPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [getUserEmail, API_BASE_URL]);

  const handleApiError = (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || error.response.statusText;
      
      switch (status) {
        case 400: setError('Invalid request. Please check your account details.'); break;
        case 404: setError('No playlists found. Create your first playlist!'); break;
        case 401: setError('Authentication required. Please log in again.'); break;
        case 500: setError('Server error. Please try again later.'); break;
        default: setError(`Server error (${status}): ${message}`);
      }
    } else if (error.request) {
      setError('No response from server. Check your internet connection.');
    } else if (error.code === 'ECONNABORTED') {
      setError('Request timed out. Please try again.');
    } else {
      setError(error.message || 'An unexpected error occurred');
    }
  };

  const handleRetry = useCallback(() => {
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      setRetryCount(prev => prev + 1);
      setError(null);
      fetchPlaylists();
    } else {
      setError('Maximum retry attempts reached. Please refresh the page.');
    }
  }, [fetchPlaylists, retryCount]);

  // Playlist actions
  const handlePlaylistClick = useCallback((playlistName) => {
    if (!playlistName || !setPlaylistname) return;
    
    setPlaylistname(playlistName);
    setTimeout(() => navigate('/playlist-songs'), 100);
  }, [setPlaylistname, navigate]);

  const handleImageError = (e) => {
    e.currentTarget.src = DEFAULT_PLAYLIST_IMAGE;
  };

  const handleDeletePlaylist = async (playlistName) => {
    if (window.confirm(`Delete playlist "${playlistName}"?`)) {
      try {
        setLoading(true);
        const userEmail = user?.email;
  
        if (!userEmail) {
          throw new Error("User email not available");
        }
  
        // Ensure endpoint matches your backend route exactly
        const response = await axios.post(
          `${API_BASE_URL}/api/music/delete-playlist`, // Verify this path
          {
            usermail: userEmail,
            playlistName: playlistName.trim(),
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
  
        if (response.data.success) {
          await fetchPlaylists();
          // Optional success notification
          console.log("Playlist deleted successfully:", playlistName);
        } else {
          throw new Error(response.data.message || "Deletion failed");
        }
      } catch (error) {
        console.error("Delete error:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to delete playlist"
        );
        
        // Debugging help
        if (error.response?.status === 404) {
          console.error("Endpoint not found. Verify:", `${API_BASE_URL}/api/music/deletePlaylist`);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const startEditing = (playlist) => {
    setEditingPlaylist(playlist.id);
    setEditName(playlist.name);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const cancelEditing = () => {
    setEditingPlaylist(null);
    setEditName('');
  };

  const savePlaylistName = async () => {
    if (!editName.trim()) {
      alert('Playlist name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const userEmail = getUserEmail();
      
      await axios.put(`${API_BASE_URL}/api/music/playlists/${encodeURIComponent(userEmail)}/${editingPlaylist}`, {
        name: editName.trim()
      });
      
      await fetchPlaylists();
      setEditingPlaylist(null);
      setEditName('');
    } catch (error) {
      console.error('Error renaming playlist:', error);
      setError('Failed to rename playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // View utilities
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'list' ? 'grid' : 'list');
  };

  const filteredAndSortedPlaylists = useMemo(() => {
    let filtered = [...myPlaylists];
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(playlist =>
        playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'songCount': return b.songCount - a.songCount;
        case 'createdAt':
          return (new Date(b.createdAt || 0) - (new Date(a.createdAt || 0)));
        case 'updatedAt':
          return (new Date(b.updatedAt || 0) - (new Date(a.updatedAt || 0)));
        default: return 0;
      }
    });
  }, [myPlaylists, searchTerm, sortBy]);

  // Fetch data on mount
  useEffect(() => {
    if (user) fetchPlaylists();
  }, [fetchPlaylists, user]);

  // Component sub-sections
  const PlaylistActionsMenu = ({ playlist }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="playlist-actions-container" ref={menuRef}>
        <button 
          className="item-more"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          aria-label="Playlist actions"
        >
          <MoreHorizontal size={18} />
        </button>

        {isOpen && (
          <div className="playlist-actions-menu">
            <button 
              className="action-item"
              onClick={(e) => {
                e.stopPropagation();
                startEditing(playlist);
                setIsOpen(false);
              }}
            >
              Rename
            </button>
            <button 
              className="action-item danger"
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePlaylist(playlist);
                setIsOpen(false);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  const GridView = () => (
    <div className="playlist-grid">
      {filteredAndSortedPlaylists.map(playlist => (
        <div 
          className="playlist-card"
          key={playlist.id}
          onClick={() => handlePlaylistClick(playlist.name)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handlePlaylistClick(playlist.name)}
        >
          <div className="card-image-container">
            <img
              src={playlist.image}
              alt={`${playlist.name} cover`}
              onError={handleImageError}
              loading="lazy"
            />
            <button className="play-button" aria-label={`Play ${playlist.name}`}>
              <Play size={24} fill="currentColor" />
            </button>
          </div>
          <div className="card-details">
            {editingPlaylist === playlist.id ? (
              <div className="edit-container">
                <input
                  ref={editInputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') savePlaylistName();
                    if (e.key === 'Escape') cancelEditing();
                  }}
                />
                <div className="edit-actions">
                  <button onClick={savePlaylistName} className="confirm-edit">
                    <Check size={16} />
                  </button>
                  <button onClick={cancelEditing} className="cancel-edit">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <h3 title={playlist.name}>{playlist.name}</h3>
            )}
            <p>{playlist.description || `${playlist.songCount} songs`}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="playlist-list-container">
      <div className="playlist-list-header">
        <div className="header-index">#</div>
        <div className="header-title">TITLE</div>
        <div className="header-count">
          <Music size={16} />
        </div>
        <div className="header-updated">
          <Clock size={16} />
        </div>
      </div>
      
      {filteredAndSortedPlaylists.map((playlist, index) => (
        <div 
          className="playlist-list-item"
          key={playlist.id}
          onClick={() => handlePlaylistClick(playlist.name)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handlePlaylistClick(playlist.name)}
        >
          <div className="item-index">{index + 1}</div>
          <div className="item-info">
            <img
              src={playlist.image}
              alt={`${playlist.name} cover`}
              onError={handleImageError}
              loading="lazy"
            />
            <div>
              {editingPlaylist === playlist.id ? (
                <div className="edit-container">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') savePlaylistName();
                      if (e.key === 'Escape') cancelEditing();
                    }}
                  />
                  <div className="edit-actions">
                    <button onClick={savePlaylistName} className="confirm-edit">
                      <Check size={16} />
                    </button>
                    <button onClick={cancelEditing} className="cancel-edit">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h4>{playlist.name}</h4>
                  <p>{playlist.description || 'Playlist'}</p>
                </>
              )}
            </div>
          </div>
          <div className="item-count">{playlist.songCount}</div>
          <div className="item-updated">
            {playlist.updatedAt ? new Date(playlist.updatedAt).toLocaleDateString() : '--'}
          </div>
          <PlaylistActionsMenu playlist={playlist.name} />
        </div>
      ))}
    </div>
  );

  const LoadingView = () => (
    <div className="loading-view">
      <div className="loading-spinner"></div>
      <p>Loading your playlists...</p>
      {retryCount > 0 && (
        <p className="retry-count">Attempt {retryCount} of {MAX_RETRY_ATTEMPTS}</p>
      )}
    </div>
  );

  const ErrorView = () => (
    <div className="error-view">
      <Music size={64} />
      <h2>Something went wrong</h2>
      <p>{error}</p>
      <div className="error-actions">
        <button 
          onClick={handleRetry} 
          disabled={retryCount >= MAX_RETRY_ATTEMPTS}
        >
          <RefreshCw size={18} />
          {retryCount >= MAX_RETRY_ATTEMPTS ? 'Max Retries' : 'Try Again'}
        </button>
        <button onClick={() => window.location.reload()}>
          Refresh Page
        </button>
      </div>
    </div>
  );

  const EmptyView = () => (
    <div className="empty-view">
      <Music size={64} />
      <h2>Your library is empty</h2>
      <p>Start by creating your first playlist</p>
      <Link to="/create-playlist" className="create-button">
        <Plus size={18} />
        Create Playlist
      </Link>
    </div>
  );

  const SearchAndFilter = () => (
    <div className="search-filter-bar">
      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search playlists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="filter-box">
        <Filter size={16} />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Name</option>
          <option value="songCount">Song Count</option>
          <option value="createdAt">Recently Added</option>
          <option value="updatedAt">Recently Updated</option>
        </select>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="auth-check">
        <div className="spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="library-container">
      <div className="library-header">
        <div className="header-title">
          <User size={24} />
          <h1>Your Library</h1>
        </div>
        <Link to="/create-playlist" className="create-button">
          <Plus size={22} />
        </Link>
      </div>

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorView />
      ) : myPlaylists.length === 0 ? (
        <EmptyView />
      ) : (
        <>
          <div className="library-controls">
            <div className="results-count">
              {filteredAndSortedPlaylists.length} {filteredAndSortedPlaylists.length === 1 ? 'playlist' : 'playlists'}
            </div>
            <button 
              className="view-toggle"
              onClick={toggleViewMode}
              title={`Switch to ${viewMode === 'list' ? 'grid' : 'list'} view`}
            >
              {viewMode === 'list' ? <Grid size={18} /> : <List size={18} />}
            </button>
          </div>

          <SearchAndFilter />
          
          {filteredAndSortedPlaylists.length === 0 ? (
            <div className="no-results">
              <p>No playlists found matching "{searchTerm}"</p>
              <button onClick={() => setSearchTerm('')}>
                Clear Search
              </button>
            </div>
          ) : (
            viewMode === 'grid' ? <GridView /> : <ListView />
          )}
        </>
      )}
    </div>
  );
};

export default LibraryPage;