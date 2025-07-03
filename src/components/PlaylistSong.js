import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, ArrowLeft, Play, Pause, MoreHorizontal } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import '../style/PlaylistSong.css'; // Ensure you have this CSS file for styling

const PlaylistSong = () => {
  const { 
    user,
    playlistname, 
    setCurrentTrack, 
    setIsPlaying, 
    isPlaying, 
    currentTrack,
    setCurrentTrackIndex
  } = useContext(AuthContext);
  const [songs, setSongs] = useState([]);
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylistSongs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Enhanced validation with detailed error messages
        if (!user || user.trim() === '') {
          setError("User not found in context. Please log in again.");
          setLoading(false);
          return;
        }

        if (!playlistname || playlistname.trim() === '') {
          setError("Playlist name not found. Please select a playlist from library.");
          setLoading(false);
          return;
        }

        // Add timeout and better error handling
        const controller = new AbortController();

        // Fixed: Use correct API endpoint structure with proper error handling
        const response = await axios.get(
          `http://localhost:5000/api/music/playlist/${user}/${playlistname}`,
          {
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data) {
          // Handle different possible response structures
          const data = response.data;
          
          // Set playlist info
          setPlaylistInfo({
            name: data.playlistName || playlistname,
            usermail: data.usermail || user,
            size: data.size || data.songs?.length || 0
          });

          // Set songs array - handle different possible structures
          const songsArray = data.songs || data.data || [];
          if (Array.isArray(songsArray)) {
            setSongs(songsArray);
          } else {
            console.warn('Songs data is not an array:', songsArray);
            setSongs([]);
          }
        } else {
          console.warn('No data in response:', response);
          setError('No data received from server');
          setSongs([]);
        }
      } catch (error) {
        console.error('Error fetching playlist songs:', error);
        
        // Handle different types of errors
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          setError('Unable to connect to server. Please check if the server is running on http://localhost:5000');
        } else if (error.name === 'AbortError') {
          setError('Request timed out. Please try again.');
        } else if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const message = error.response.data?.message || error.response.statusText;
          
          if (status === 404) {
            setError('Playlist not found. Please check if the playlist exists.');
          } else if (status === 401) {
            setError('Authentication required. Please log in again.');
          } else if (status === 403) {
            setError('Access denied. You may not have permission to view this playlist.');
          } else if (status === 500) {
            setError('Server error. Please try again later.');
          } else {
            setError(`Server error (${status}): ${message}`);
          }
        } else if (error.request) {
          // Request was made but no response received
          setError('No response from server. Please check your internet connection and server status.');
        } else {
          setError(error.message || 'An unexpected error occurred');
        }
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have both user and playlistName
    if (user && playlistname) {
      fetchPlaylistSongs();
    } else {
      setLoading(false);
      if (!user) {
        setError("User not found in context. Please log in.");
      } else if (!playlistname) {
        setError("Playlist name not found in context. Please select a playlist.");
      }
    }
  }, [user, playlistname]);

  // Combined function to handle song play/pause
  const handlePlaySong = (song, index, e) => {
    // Stop event propagation to prevent conflicts
    if (e) {
      e.stopPropagation();
    }
    
    console.log('Playing song:', song);
    
    // Format track for the global player
    const formattedTrack = {
      id: song.id,
      title: song.title,
      artist: song.artist || song.performers,
      image: song.image || song.albumArt,
      duration: song.duration || song.length,
      youtubeUrl: song.youtubeUrl,
      embedUrl: song.embedUrl,
      viewCount: song.viewCount
    };
    
    // Check if this is the currently playing track
    if (currentTrack?.id === song.id) {
      // Toggle play/pause for the same track
      setIsPlaying(!isPlaying);
      setCurrentTrackIndex(isPlaying ? null : index);
    } else {
      // Play new track
      setCurrentTrack(formattedTrack);
      setIsPlaying(true);
      setCurrentTrackIndex(index);
    }
  };

  const handleBackToLibrary = () => {
    navigate('/library');
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Force re-fetch by reloading or you could call fetchPlaylistSongs directly
    window.location.reload();
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
          <div className="error-actions">
            <button onClick={handleRetry} className="retry-btn">
              Try Again
            </button>
            <button onClick={handleBackToLibrary} className="back-to-library-btn">
              Back to Library
            </button>
          </div>
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
          <h1>{playlistInfo?.name || playlistname}</h1>
          <p className="playlist-meta">
            {playlistInfo?.size || songs.length} song{(playlistInfo?.size || songs.length) !== 1 ? 's' : ''}
            {playlistInfo?.usermail && (
              <span className="playlist-owner"> • by {playlistInfo.usermail}</span>
            )}
          </p>
        </div>
        <Link to="/addplaylist" className="add-btn" title="Create New Playlist">
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
          <div className="empty-actions">
            <Link to="/search" className="add-songs-btn">
              Find Songs
            </Link>
            <button onClick={handleBackToLibrary} className="back-to-library-btn">
              Back to Library
            </button>
          </div>
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
                // Fixed: onclick -> onClick and added proper event handling
                onClick={(e) => handlePlaySong(song, index, e)}
                className={`song-item ${
                  currentTrack?.id === song.id && isPlaying ? 'playing' : ''
                }`}
                key={`${song.id || song.title || 'song'}-${index}`}
                style={{ cursor: 'pointer' }}
              >
                <div className="song-number-col">
                  {currentTrack?.id === song.id && isPlaying ? (
                    <button 
                      className="play-pause-btn active"
                      onClick={(e) => handlePlaySong(song, index, e)}
                      title="Pause"
                    >
                      <Pause size={16} />
                    </button>
                  ) : (
                    <div className="song-index-container">
                      <span className="song-index">{index + 1}</span>
                      <button 
                        className="play-pause-btn"
                        onClick={(e) => handlePlaySong(song, index, e)}
                        title="Play"
                      >
                        <Play size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="song-info">
                  <div className="song-cover">
                    <img 
                      src={song.image || song.albumArt || '/default-song-cover.jpg'} 
                      alt={song.title || 'Song cover'}
                      onError={(e) => {
                        e.target.src = '/default-song-cover.jpg';
                      }}
                    />
                  </div>
                  <div className="song-details">
                    <h3 className="song-title">{song.title || 'Unknown Title'}</h3>
                    <p className="song-artist">{song.artist || song.performers || 'Unknown Artist'}</p>
                  </div>
                </div>
                
                <div className="song-duration">
                  {song.duration || song.length || '0:00'}
                </div>
                
                <div className="song-actions">
                  <button 
                    className="more-btn" 
                    title="More options"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent song from playing when clicking more options
                      // Add your more options logic here
                    }}
                  >
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