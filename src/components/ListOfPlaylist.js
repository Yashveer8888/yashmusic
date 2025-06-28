import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Music, User } from 'lucide-react';
import '../style/library.css'; 
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ListOfPlaylist = () => {
  const navigate = useNavigate(); // Fixed: use 'navigate' instead of 'navigator'
  const { setPlaylistname } = useContext(AuthContext); 
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get usermail from localStorage, context, or props
  const usermail = "yash9@gmail.com";

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!usermail) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fixed: Correct API endpoint to match your backend route
        const response = await axios.get(`http://localhost:5000/api/music/getplaylist/${usermail}`, {
          headers: {
            'Content-Type': 'application/json',
            // Authorization: `Bearer ${token}`, // Uncomment when using auth
          },
        });

        console.log('API Response:', response.data);

        // Fixed: Handle the backend response structure correctly
        if (response.data && Array.isArray(response.data.playlists)) {
          const formattedPlaylists = response.data.playlists.map((playlist, index) => ({
            id: `${playlist.name}-${index}`, // Generate unique ID
            name: playlist.name,
            songCount: playlist.songCount || 0,
            size: playlist.size || 0,
            image: '/default-playlist-cover.jpg', // Default image since backend doesn't provide images
          }));

          setMyPlaylists(formattedPlaylists);
        } else {
          console.warn('Unexpected response structure:', response.data);
          setMyPlaylists([]);
        }
      } catch (error) {
        console.error('Error fetching playlists:', error);
        setError('Failed to load playlists');
        setMyPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [usermail]);

  // Fixed: Return a function that can be used as event handler
  const handlePlaylistClick = (playlistName) => () => {
    setPlaylistname(playlistName);
    navigate("/playlists");
  };

  if (loading) {
    return (
      <div className="library-page">
        <div className="library-header">
          <div className="header-left">
            <User size={24} />
            <h1>Your Library</h1>
          </div>
        </div>
        <div className="loading-container">
          <p>Loading playlists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="library-page">
        <div className="library-header">
          <div className="header-left">
            <User size={24} />
            <h1>Your Library</h1>
          </div>
        </div>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
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
            <h2>Recently Created</h2>
            <span className="playlist-count">
              {myPlaylists.length} playlist{myPlaylists.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="playlist-grid">
            {myPlaylists.map((playlist) => (
              <div 
                className="playlist-card" 
                key={playlist.id}
                onClick={handlePlaylistClick(playlist.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handlePlaylistClick(playlist.name)()}
              >
                <div className="playlist-cover-container">
                  <img 
                    src={playlist.image} 
                    alt={playlist.name} 
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

export default ListOfPlaylist;