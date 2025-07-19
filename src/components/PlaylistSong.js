import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, 
  Play, 
  MoreHorizontal,
  Music,
  RefreshCw
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import '../style/PlaylistSong.css';

const PlaylistSong = () => {
  const {
    user,
    playlistname,
    isPlaying,
    currentTrack,
    setPlaylist,
    playTrack,
    setSong
  } = useContext(AuthContext);

  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // const API_BASE_URL = 'http://localhost:5000';
  const API_BASE_URL = 'https://yashmusic-backend.onrender.com';

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Format duration helper
  const formatDuration = useCallback((duration) => {
    if (!duration) return '0:00';
    if (typeof duration === 'string' && duration.includes(':')) return duration;
    
    const totalSeconds = typeof duration === 'number' ? duration : parseInt(duration);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Calculate total duration
  const getTotalDuration = useCallback(() => {
    const totalSeconds = songs.reduce((acc, song) => {
      const dur = song.duration;
      if (typeof dur === 'string') {
        const [m, s] = dur.split(':').map(Number);
        return acc + (m * 60 + s);
      }
      return acc + (dur || 0);
    }, 0);
    
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return h > 0 ? `${h} hr ${m} min` : `${m} min`;
  }, [songs]);

  // Fetch playlist songs
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchPlaylistSongs = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user || !playlistname) {
          setError("User or playlist not found.");
          setLoading(false);
          return;
        }

        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await axios.get(
          `${API_BASE_URL}/api/music/playlist/${user?.email}/${playlistname}`,
          {
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        clearTimeout(timeoutId);

        const { data } = response;

        setPlaylistInfo({
          name: data.playlistName || playlistname,
          usermail: data.usermail || user.email,
          size: data.size || data.songs?.length || 0,
          description: data.description || '',
          coverImage: data.coverImage || null,
        });

        const songsArray = data.songs || [];
        const formattedSongs = Array.isArray(songsArray) ? 
          songsArray.map((song, index) => ({
            id: song.id || `song-${index}`, // Ensure unique ID
            title: song.title || 'Unknown Track',
            artist: song.artist || song.performers || 'Unknown Artist',
            image: song.image || song.albumArt || '/placeholder-image.png',
            duration: song.duration || song.length || 180,
            youtubeUrl: song.youtubeUrl,
            embedUrl: song.embedUrl,
            viewCount: song.viewCount
          })) : [];
        
        setSongs(formattedSongs);
        setPlaylist(formattedSongs);
      } catch (error) {
        if (error.name === 'AbortError') {
          setError('Request timed out. Please try again.');
        } else if (error.response) {
          setError(error.response.data.message || `Server error: ${error.response.status}`);
        } else {
          setError(error.message || 'Failed to load playlist');
        }
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && playlistname) {
      fetchPlaylistSongs();
    }

    return () => {
      controller.abort();
    };
  }, [user, playlistname, setPlaylist]);

  // Event handlers
  const handlePlaySong = useCallback((song, index, e) => {
    e?.stopPropagation();
    playTrack(song, songs);
  }, [playTrack, songs]);

  const handlePlayAll = useCallback((e) => {
    e?.stopPropagation();
    if (songs.length > 0) {
      playTrack(songs[0], songs);
    }
  }, [playTrack, songs]);

  const handleBackToLibrary = useCallback(() => {
    navigate('/library');
  }, [navigate]);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const handelupdatesong = useCallback((song) => {
      return (e) => {
        e.stopPropagation();
        setSong(song);
        navigate("/updatesong");
      };
    }, [navigate,setSong]);



  // Loading state
  if (loading) {
    return (
      <div className="playlist-page loading">
        <div className="loading-spinner">
          <RefreshCw className="spinner-icon" size={32} />
        </div>
        <p>Loading your songs...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="playlist-page error">
        <h2>Error Loading Playlist</h2>
        <p className="error-message">{error}</p>
        <button onClick={handleRetry} className="retry-button">
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="playlist-page">
      {/* Playlist Header */}
      <div className="playlist-header">
        <button 
          onClick={handleBackToLibrary} 
          className="back-btn"
          aria-label="Back to library"
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="playlist-hero">
          <div className="playlist-cover">
            {playlistInfo?.coverImage ? (
              <img 
                src={playlistInfo.coverImage} 
                alt={`${playlistInfo.name} cover`} 
                onError={(e) => {
                  e.target.src = '/placeholder-image.png';
                }}
              />
            ) : (
              <div className="playlist-cover-placeholder">
                <Music size={64} />
              </div>
            )}
          </div>
          
          <div className="playlist-info">
            <span className="playlist-type">Playlist</span>
            <h1>{playlistInfo?.name || 'Untitled Playlist'}</h1>
            <div className="playlist-meta">
              <span>{user?.displayName || 'Unknown user'}</span> •{' '}
              <span>{songs.length} {songs.length === 1 ? 'song' : 'songs'}</span> •{' '}
              <span>{getTotalDuration()}</span>
            </div>
          </div>
        </div>
        
        <div className="playlist-actions">
          <button 
            onClick={handlePlayAll} 
            className="play-button"
            disabled={songs.length === 0}
          >
            <Play size={20} /> Play
          </button>
        </div>
      </div>

      {/* Song List */}
      <div className="song-list">
        {songs.length === 0 ? (
          <div className="empty-playlist">
            <Music size={48} />
            <p>This playlist is empty</p>
          </div>
        ) : (
          songs.map((song, index) => (
            <div 
              key={song.id} 
              className={`song-item ${currentTrack?.id === song.id && isPlaying ? 'active' : ''}`}
              onClick={(e) => handlePlaySong(song, index, e)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handlePlaySong(song, index, e)}
            >
              <div className="song-image-container">
                <img 
                  src={song.image} 
                  alt={song.title} 
                  className="song-image" 
                  onError={(e) => {
                    e.target.src = '/placeholder-image.png';
                  }}
                />
                {currentTrack?.id === song.id && isPlaying && (
                  <div className="playing-indicator">
                    <div className="playing-bar"></div>
                    <div className="playing-bar"></div>
                    <div className="playing-bar"></div>
                  </div>
                )}
              </div>
              
              <div className="song-info">
                <h4 className={currentTrack?.id === song.id && isPlaying ? 'active' : ''}>
                  {song.title}
                </h4>
                <p>{song.artist} | {formatDuration(song.duration)}</p>
              </div>
              
              <div className="song-actions">
                <button 
                  onClick={handelupdatesong(song)}
                  className="menu-button"
                  aria-label="Song options"
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlaylistSong;