import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Music, User } from 'lucide-react';
// import '../style/ListOfPlaylist.css';
import { AuthContext } from '../context/AuthContext';

const ListOfPlaylist = () => {
  const { user,  addSongToPlaylist, song  } = useContext(AuthContext);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylists = async () => {
      // Check if user exists and is valid
      if (!user || user.trim() === '') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Add timeout and better error handling
        const controller = new AbortController();
        
        const response = await axios.get(
          `http://localhost:5000/api/music//playlists/${user}`,
          {
            signal: controller.signal,
          }
        );
        const data = response.data;

        if (data.success && Array.isArray(data.playlists)) {
          const formattedPlaylists = data.playlists.map((playlist) => ({
            name: playlist.name?.trim(),
            songCount: playlist.songCount || playlist.totalSongs || 0,
            image: playlist.image || '/default-playlist-cover.jpg',
          }));
          setMyPlaylists(formattedPlaylists);
        } else if (data.success && data.playlists.length === 0) {
          // Handle empty playlists case
          setMyPlaylists([]);
        } else {
          console.warn('Unexpected response structure:', data);
          setMyPlaylists([]);
        }
      } catch (error) {
        console.error('Error fetching playlists:', error);
        setMyPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user exists
    if (user) {
      fetchPlaylists();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handlePlaylistClick = (playlistName) => {
    addSongToPlaylist(user, playlistName, song);
    navigate("/search");
  };

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

      {myPlaylists.length === 0 ? (
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
          </div>

          <div className="playlist-grid">
            {myPlaylists.map((playlist, index) => (
              <div
                className="playlist-card"
                key={`${playlist.name}-${index}`}
                onClick={() => handlePlaylistClick(playlist.name)}
                role="button"
                tabIndex={0}
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
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
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
        </div>
      )}
    </div>
  );
};

export default ListOfPlaylist;