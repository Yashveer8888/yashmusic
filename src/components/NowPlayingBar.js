import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, PlusCircle,
  Shuffle, Repeat, Repeat1
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import '../style/NowPlayingBar.css';

const NowPlayingBar = () => {
  const {
    currentTrack,
    isPlaying,
    setIsPlaying,
    playlist,
    shuffleMode,
    setShuffleMode,
    repeatMode,
    setRepeatMode,
    playNextTrack,
    playPreviousTrack,
    togglePlayPause,
    handleTrackEnd,
    user,
    addSongToPlaylist,
    palylistname,
    setSong
  } = useContext(AuthContext);

  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isLiked, setIsLiked] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  setVolume(100); 
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const playerContainerRef = useRef(null);

  // --- YouTube IFrame API Loading ---
  useEffect(() => {
    // Check if the script already exists
    if (window.YT && window.YT.Player) {
      setApiLoaded(true);
      return;
    }

    // If the script is not loaded, create and append it
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);

      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API Ready');
        setApiLoaded(true);
      };
    } else {
      // Script exists but API might not be ready yet
      const checkApiReady = () => {
        if (window.YT && window.YT.Player) {
          setApiLoaded(true);
        } else {
          setTimeout(checkApiReady, 100);
        }
      };
      checkApiReady();
    }

    return () => {
      destroyPlayer();
    };
  }, []);

  // --- Player Setup and Track Changes ---
  useEffect(() => {
    if (currentTrack?.id && apiLoaded) {
      destroyPlayer();
      setupPlayer(currentTrack.id);
    } else if (!currentTrack) {
      destroyPlayer();
    }
  }, [currentTrack, apiLoaded]);

  // --- Progress Bar Update ---
  useEffect(() => {
    const seekSlider = document.querySelector('.seek-slider');
    if (seekSlider && duration > 0) {
      const progressPercentage = (currentTime / duration) * 100;
      seekSlider.style.setProperty('--progress', progressPercentage);
    }
  }, [currentTime, duration]);

  const setupPlayer = useCallback((videoId) => {
    setIsLoading(true);
    setError(null);
    if (!playerContainerRef.current) return;

    playerRef.current = new window.YT.Player(playerContainerRef.current, {
      height: '0',
      width: '0',
      videoId: videoId,
      playerVars: {
        autoplay: isPlaying ? 1 : 0,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        rel: 0,
        fs: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    });
  }, [isPlaying]);

  const destroyPlayer = useCallback(() => {
    stopTimeTracking();
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try {
        playerRef.current.destroy();
      } catch (err) {
        console.warn('Error destroying YouTube player:', err);
      }
    }
    playerRef.current = null;
    setPlayerReady(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  // --- Player Event Handlers ---
  const onPlayerReady = useCallback((event) => {
    setPlayerReady(true);
    setIsLoading(false);
    const videoDuration = event.target.getDuration();
    setDuration(videoDuration);
    
    if (isMuted) {
      event.target.mute();
    } else {
      event.target.unMute();
      event.target.setVolume(volume);
    }
    
    if (isPlaying) {
      event.target.playVideo();
    }
  }, [isPlaying, isMuted, volume]);

  const onPlayerStateChange = useCallback((event) => {
    switch (event.data) {
      case window.YT.PlayerState.PLAYING:
        setIsPlaying(true);
        setIsLoading(false);
        if (playerRef.current) {
          setDuration(playerRef.current.getDuration());
        }
        startTimeTracking();
        break;
      case window.YT.PlayerState.PAUSED:
        setIsPlaying(false);
        stopTimeTracking();
        break;
      case window.YT.PlayerState.ENDED:
        setIsPlaying(false);
        stopTimeTracking();
        setCurrentTime(0);
        handleLocalTrackEnd();
        break;
      case window.YT.PlayerState.BUFFERING:
        setIsLoading(true);
        break;
      default:
        setIsLoading(false);
        break;
    }
  }, [setIsPlaying]);

  const onPlayerError = useCallback((event) => {
    console.error('YouTube Player Error:', event.data);
    setError("Failed to load track");
    setIsLoading(false);
  }, []);

  // --- Play/Pause Sync ---
  useEffect(() => {
    if (playerReady && playerRef.current) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, playerReady]);

  // --- Time Tracking ---
  const startTimeTracking = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const newTime = playerRef.current.getCurrentTime();
        setCurrentTime(newTime);
      }
    }, 1000);
  }, []);

  const stopTimeTracking = useCallback(() => {
    clearInterval(intervalRef.current);
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  // --- Local Track End Handler ---
  const handleLocalTrackEnd = useCallback(() => {
    if (repeatMode === 'one') {
      // Repeat current track
      setIsPlaying(true);
      if (playerRef.current) {
        playerRef.current.seekTo(0, true);
        playerRef.current.playVideo();
      }
    } else {
      // Use context's handleTrackEnd or playNextTrack
      if (handleTrackEnd) {
        handleTrackEnd();
      } else {
        playNextTrack();
      }
    }
  }, [repeatMode, handleTrackEnd, playNextTrack, setIsPlaying]);

  // --- UI Handlers ---
  const handleSeek = useCallback((e) => {
    const newTime = parseFloat(e.target.value);
    if (playerReady && playerRef.current) {
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
      
      // Update progress bar immediately
      const progressPercentage = (newTime / duration) * 100;
      e.target.style.setProperty('--progress', progressPercentage);
    }
  }, [playerReady, duration]);


  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMutedState = !prev;
      if (playerReady && playerRef.current) {
        if (newMutedState) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
        }
      }
      return newMutedState;
    });
  }, [playerReady]);

  const toggleShuffle = useCallback(() => {
    setShuffleMode(prev => !prev);
  }, [setShuffleMode]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, [setRepeatMode]);

  const handleLike = useCallback(async () => {
    if (!currentTrack) return;
    
    try {
      // Set the current track as the song to be added
      setSong(currentTrack);
      
      // Add to playlist using context function
      await addSongToPlaylist(user, "Liked Songs", currentTrack);
      
      // Update UI state
      setIsLiked(true);
      
      console.log('Song added to playlist successfully!');
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      // Optionally show error message to user
    }
  }, [currentTrack, user, palylistname, addSongToPlaylist, setSong]);

  const formatTime = useCallback((timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, []);

  if (!currentTrack) {
    return null;
  }

  return (
    <div className={`now-playing-bar`}>
      <div ref={playerContainerRef} style={{ position: 'absolute', top: -9999, left: -9999 }}></div>

      {error && <div className="error-message">{error}</div>}

      <div className="track-info">
        <img
          src={currentTrack.image}
          alt={currentTrack.title}
          className="track-thumbnail"
          onError={(e) => (e.target.src = '/placeholder-image.png')}
        />
        <div className="track-details">
          <div className="track-title">{currentTrack.title}</div>
          <div className="track-artist">{currentTrack.artist}</div>
        </div>
        <button onClick={setSong(currentTrack)} className="like-button">
          <PlusCircle size={20} fill={isLiked ? 'red' : 'none'} color={isLiked ? 'red' : 'currentColor'} />
        </button>
      </div>

      <div className="player-controls">
        <div className="controls-main">
          <button 
            onClick={toggleShuffle} 
            className={`shuffle-button ${shuffleMode ? 'active' : ''}`}
            disabled={isLoading}
          >
            <Shuffle size={16} />
          </button>
          <button onClick={playPreviousTrack} disabled={isLoading || playlist.length === 0}>
            <SkipBack size={20} />
          </button>
          <button onClick={togglePlayPause} disabled={isLoading || !playerReady} className="play-pause-button">
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <button onClick={playNextTrack} disabled={isLoading || playlist.length === 0}>
            <SkipForward size={20} />
          </button>
          <button 
            onClick={toggleRepeat} 
            className={`repeat-button ${repeatMode !== 'off' ? 'active' : ''}`}
            disabled={isLoading}
          >
            {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        </div>
        <div className="time-control">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            disabled={!playerReady || isLoading}
            className="seek-slider"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="extras">
        <div className="volume-control">
          <button onClick={toggleMute}>
            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingBar;