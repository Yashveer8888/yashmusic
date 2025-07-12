import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Play, MoreHorizontal,
  Music
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
    playTrack
  } = useContext(AuthContext);

  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchPlaylistSongs = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user || !playlistname) {
          setError("User or playlist not found.");
          setLoading(false);
          return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await axios.get(
          `http://localhost:5000/api/music/playlist/${user?.email}/${playlistname}`,
          {
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        clearTimeout(timeoutId);

        const data = response.data;

        setPlaylistInfo({
          name: data.playlistName || playlistname,
          usermail: data.usermail || user.email,
          size: data.size || data.songs?.length || 0,
          description: data.description || '',
          coverImage: data.coverImage || null,
        });

        const songsArray = data.songs || [];
        const formattedSongs = Array.isArray(songsArray) ? 
          songsArray.map(song => ({
            id: song.id,
            title: song.title,
            artist: song.artist || song.performers,
            image: song.image || song.albumArt,
            duration: song.duration || song.length || 180, // Default duration if missing
            youtubeUrl: song.youtubeUrl,
            embedUrl: song.embedUrl,
            viewCount: song.viewCount
          })) : [];
        
        setSongs(formattedSongs);
        setPlaylist(formattedSongs); // Update the global playlist in context
      } catch (error) {
        if (error.name === 'AbortError') {
          setError('Request timed out.');
        } else if (error.response) {
          setError(`Server error: ${error.response.statusText}`);
        } else {
          setError(error.message);
        }
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && playlistname) {
      fetchPlaylistSongs();
    }
  }, [user, playlistname, setPlaylist]);

  const handlePlaySong = (song, index, e) => {
    e?.stopPropagation();
    playTrack(song, songs); // Use the context's playTrack function
  };

  const handlePlayAll = (e) => {
    e?.stopPropagation();
    if (songs.length > 0) {
      playTrack(songs[0], songs); // Play first song with full playlist
    }
  };

  const handleBackToLibrary = () => {
    navigate('/library');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const toggleMenu = (songId, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === songId ? null : songId);
  };

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    if (typeof duration === 'string' && duration.includes(':')) return duration;
    
    const totalSeconds = typeof duration === 'number' ? duration : parseInt(duration);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
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
  };

  if (loading) {
    return (
      <div className="playlist-page">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="playlist-page">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleRetry}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="playlist-page">
      <div className="playlist-header">
        <button onClick={handleBackToLibrary} className="back-btn">
          <ArrowLeft size={24} />
        </button>
        <div className="playlist-hero">
          <div className="playlist-cover">
            {playlistInfo?.coverImage ? (
              <img src={playlistInfo.coverImage} alt="cover" />
            ) : (
              <div className="playlist-cover-placeholder">
                <Music size={64} />
              </div>
            )}
          </div>
          <div className="playlist-info">
            <span className="playlist-type">Playlist</span>
            <h1>{playlistInfo?.name}</h1>
            {playlistInfo?.description && <p>{playlistInfo.description}</p>}
            <div>
              <span>{playlistInfo?.usermail}</span> •{" "}
              <span>{songs.length} songs</span> •{" "}
              <span>{getTotalDuration()}</span>
            </div>
          </div>
        </div>
        <div className="playlist-actions">
          <button onClick={handlePlayAll}>
            <Play size={20} /> Play
          </button>
        </div>
      </div>

      {/* Song List */}
      <div className="song-list">
        {songs.map((song, index) => (
          <div 
            key={song.id || index} 
            className={`song-item ${currentTrack?.id === song.id ? 'active' : ''}`}
            onClick={(e) => handlePlaySong(song, index, e)}
          >
            <div className="song-image-container">
              <img 
                src={song.image || '/placeholder-image.png'} 
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
              <h4 className={currentTrack?.id === song.id ? 'active' : ''}>
                {song.title}
              </h4>
              <p>{song.artist}</p>
            </div>
            <div className="song-actions">
              <span>{formatDuration(song.duration)}</span>
              <button onClick={(e) => toggleMenu(song.id, e)}>
                <MoreHorizontal size={20} />
              </button>
              {openMenuId === song.id && (
                <div className="dropdown-menu">
                  <button>Add to Queue</button>
                  <button>Remove from Playlist</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistSong;