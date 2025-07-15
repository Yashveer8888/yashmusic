import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
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
  Clock
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import "../style/LibraryPage.css";

const LibraryPage = () => {
  // Context and state
  const { user, setPlaylistname } = useContext(AuthContext);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // Default to grid view
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  // Constants
  // const API_BASE_URL = 'http://localhost:5000';
  const API_BASE_URL = 'https://yashmusic-backend.onrender.com';
  const DEFAULT_PLAYLIST_IMAGE = '/default-playlist-cover.jpg';
  const MAX_RETRY_ATTEMPTS = 3;

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Data fetching
  const fetchPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userEmail = user?.email || user?.uid;
      if (!userEmail) {
        setError('User email not found');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(
        `${API_BASE_URL}/api/music/playlists/${encodeURIComponent(userEmail)}`
      );

      if (response.data.success) {
        setMyPlaylists(response.data.playlists.map(playlist => ({
          id: playlist._id,
          name: playlist.name,
          songCount: playlist.totalSongs || 0,
          image: playlist.image || DEFAULT_PLAYLIST_IMAGE,
          createdAt: playlist.createdAt,
          updatedAt: playlist.updatedAt,
        })));
        setRetryCount(0);
      } else {
        setError(response.data.message || 'No playlists found');
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch playlists');
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        setTimeout(fetchPlaylists, 2000);
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  }, [user, retryCount]);

  // Playlist actions
  const handlePlaylistClick = useCallback((playlistName) => {
    if (!playlistName || !setPlaylistname) return;
    setPlaylistname(playlistName);
    navigate('/playlist-songs');
  }, [setPlaylistname, navigate]);


  // Filter and sort playlists
  const filteredAndSortedPlaylists = useMemo(() => {
    let filtered = [...myPlaylists];
    
    if (searchTerm) {
      filtered = filtered.filter(playlist =>
        playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'songCount': return b.songCount - a.songCount;
        case 'createdAt': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'updatedAt': return new Date(b.updatedAt) - new Date(a.updatedAt);
        default: return 0;
      }
    });
  }, [myPlaylists, searchTerm, sortBy]);

  // Fetch data on mount and when user changes
  useEffect(() => {
    if (user) fetchPlaylists();
  }, [user, fetchPlaylists]);

  const handelupdateplaylist = (playlistname) => {
    console.log(playlistname)
    return (e) => {
      e.stopPropagation();
      setPlaylistname(playlistname);
      navigate("/updateplaylist");
    };
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
              loading="lazy"
            />
            <button 
              className="play-button" 
              onClick={(e) => {
                e.stopPropagation();
                handlePlaylistClick(playlist.name);
              }}
              aria-label={`Play ${playlist.name}`}
            >
              <Play size={24} fill="currentColor" />
            </button>
          </div>
          <div className="card-info">
            <h3>{playlist.name}</h3>
            <p>{playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}</p>
          </div>
          <button onClick={handelupdateplaylist(playlist.name)}>
            <MoreHorizontal size={20}/>
          </button>
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
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handlePlaylistClick(playlist.name)}
        >
          <div className="item-index"
            onClick={() => handlePlaylistClick(playlist.name)}>{index + 1}</div>
          <div className="item-info"
            onClick={() => handlePlaylistClick(playlist.name)}>
            <img
              src={playlist.image}
              alt={`${playlist.name} cover`}
              loading="lazy"
            />
            <span>{playlist.name}</span>
          </div>
          <div className="item-count"
            onClick={() => handlePlaylistClick(playlist.name)}>{playlist.songCount}</div>
          <div className="item-updated"
            onClick={() => handlePlaylistClick(playlist.name)}>
            {playlist.updatedAt ? new Date(playlist.updatedAt).toLocaleDateString() : '--'}
          </div>
          <button onClick={handelupdateplaylist(playlist.name)}>
            <MoreHorizontal size={20}/>
          </button>
        </div>
      ))}
    </div>
  );

  const LoadingView = () => (
    <div className="loading-view">
      <div className="loading-spinner"></div>
      <p>Loading your playlists...</p>
    </div>
  );

  const ErrorView = () => (
    <div className="error-view">
      <Music size={64} />
      <h2>Something went wrong</h2>
      <p>{error}</p>
      <div className="error-actions">
        <button 
          onClick={fetchPlaylists} 
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
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort playlists by"
        >
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
              onClick={() => setViewMode(prev => prev === 'list' ? 'grid' : 'list')}
              aria-label={`Switch to ${viewMode === 'list' ? 'grid' : 'list'} view`}
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