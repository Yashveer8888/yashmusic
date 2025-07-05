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
    setSong
  } = useContext(AuthContext);

  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const playerContainerRef = useRef(null);
  const isInitializingRef = useRef(false);
  const currentTrackIdRef = useRef(null);

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
      tag.async = true;
      document.head.appendChild(tag);

      // Set up the callback for when API is ready
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
      if (playerRef.current) {
        destroyPlayer();
      }
    };
  }, []);

  // Separate effect for cleanup on unmount
  useEffect(() => {
    return () => {
      destroyPlayer();
      clearInterval(intervalRef.current);
    };
  }, []);

  // --- Player Setup and Track Changes ---
  useEffect(() => {
    if (currentTrack?.id && apiLoaded && !isInitializingRef.current) {
      // Only setup if track actually changed
      if (currentTrackIdRef.current !== currentTrack.id) {
        currentTrackIdRef.current = currentTrack.id;
        destroyPlayer();
        setupPlayer(currentTrack.id);
      }
    } else if (!currentTrack) {
      currentTrackIdRef.current = null;
      destroyPlayer();
    }
  }, [currentTrack?.id, apiLoaded]);

  // --- Progress Bar Update (moved to separate effect to avoid re-renders) ---
  useEffect(() => {
    const seekSlider = document.querySelector('.seek-slider');
    if (seekSlider && duration > 0) {
      const progressPercentage = (currentTime / duration) * 100;
      seekSlider.style.setProperty('--progress', `${progressPercentage}%`);
    }
  }, [currentTime, duration]);

  const setupPlayer = useCallback((videoId) => {
    if (isInitializingRef.current) return;
    
    isInitializingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    if (!playerContainerRef.current) {
      isInitializingRef.current = false;
      return;
    }

    try {
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
          autoplay: 0, // Don't autoplay initially to avoid state conflicts
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          origin: window.location.origin,
          enablejsapi: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      });
    } catch (err) {
      console.error('Error setting up YouTube player:', err);
      setError("Failed to initialize player");
      setIsLoading(false);
      isInitializingRef.current = false;
    }
  }, []);

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
    isInitializingRef.current = false;
  }, []);

  // --- Player Event Handlers ---
  const onPlayerReady = useCallback((event) => {
    console.log('Player ready');
    setPlayerReady(true);
    setIsLoading(false);
    isInitializingRef.current = false;
    
    try {
      const videoDuration = event.target.getDuration();
      if (videoDuration && videoDuration > 0) {
        setDuration(videoDuration);
      }
      
      // Set mute state
      if (isMuted) {
        event.target.mute();
      } else {
        event.target.unMute();
      }
      
      // Only play if isPlaying is true
      if (isPlaying) {
        event.target.playVideo();
      }
    } catch (err) {
      console.error('Error in onPlayerReady:', err);
    }
  }, [isMuted, isPlaying]);

  const onPlayerStateChange = useCallback((event) => {
    try {
      switch (event.data) {
        case window.YT.PlayerState.PLAYING:
          // Use a timeout to avoid setState during render
          setTimeout(() => {
            setIsPlaying(true);
            setIsLoading(false);
          }, 0);
          
          if (playerRef.current) {
            const dur = playerRef.current.getDuration();
            if (dur && dur > 0) {
              setDuration(dur);
            }
          }
          startTimeTracking();
          break;
          
        case window.YT.PlayerState.PAUSED:
          setTimeout(() => {
            setIsPlaying(false);
          }, 0);
          stopTimeTracking();
          break;
          
        case window.YT.PlayerState.ENDED:
          setTimeout(() => {
            setIsPlaying(false);
          }, 0);
          stopTimeTracking();
          setCurrentTime(0);
          // Use timeout to avoid setState during render
          setTimeout(() => {
            handleLocalTrackEnd();
          }, 0);
          break;
          
        case window.YT.PlayerState.BUFFERING:
          setIsLoading(true);
          break;
          
        case window.YT.PlayerState.CUED:
          setIsLoading(false);
          break;
          
        default:
          setIsLoading(false);
          break;
      }
    } catch (err) {
      console.error('Error in onPlayerStateChange:', err);
    }
  }, []);

  const onPlayerError = useCallback((event) => {
    console.error('YouTube Player Error:', event.data);
    const errorMessages = {
      2: 'Invalid video ID',
      5: 'HTML5 player error',
      100: 'Video not found',
      101: 'Video not allowed to be played in embedded players',
      150: 'Video not allowed to be played in embedded players'
    };
    
    const errorMessage = errorMessages[event.data] || "Failed to load track";
    setError(errorMessage);
    setIsLoading(false);
    isInitializingRef.current = false;
  }, []);

  // --- Play/Pause Sync (separate effect to avoid conflicts) ---
  useEffect(() => {
    if (playerReady && playerRef.current && !isInitializingRef.current) {
      try {
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      } catch (err) {
        console.error('Error controlling playback:', err);
      }
    }
  }, [isPlaying, playerReady]);

  // --- Time Tracking ---
  const startTimeTracking = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const newTime = playerRef.current.getCurrentTime();
          if (newTime !== null && newTime !== undefined && !isNaN(newTime)) {
            setCurrentTime(newTime);
          }
        } catch (err) {
          console.warn('Error getting current time:', err);
        }
      }
    }, 1000);
  }, []);

  const stopTimeTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // --- Local Track End Handler ---
  const handleLocalTrackEnd = useCallback(() => {
    if (repeatMode === 'one') {
      // Repeat current track
      if (playerRef.current) {
        try {
          playerRef.current.seekTo(0, true);
          playerRef.current.playVideo();
          setIsPlaying(true);
        } catch (err) {
          console.error('Error repeating track:', err);
        }
      }
    } else {
      // Use context's handleTrackEnd or playNextTrack
      if (handleTrackEnd) {
        handleTrackEnd();
      } else if (playNextTrack) {
        playNextTrack();
      }
    }
  }, [repeatMode, handleTrackEnd, playNextTrack]);

  // --- UI Handlers ---
  const handleSeek = useCallback((e) => {
    const newTime = parseFloat(e.target.value);
    if (playerReady && playerRef.current && !isNaN(newTime)) {
      try {
        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
        
        // Update progress bar immediately
        if (duration > 0) {
          const progressPercentage = (newTime / duration) * 100;
          e.target.style.setProperty('--progress', `${progressPercentage}%`);
        }
      } catch (err) {
        console.error('Error seeking:', err);
      }
    }
  }, [playerReady, duration]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMutedState = !prev;
      if (playerReady && playerRef.current) {
        try {
          if (newMutedState) {
            playerRef.current.mute();
          } else {
            playerRef.current.unMute();
          }
        } catch (err) {
          console.error('Error toggling mute:', err);
        }
      }
      return newMutedState;
    });
  }, [playerReady]);

  const toggleShuffle = useCallback(() => {
    if (setShuffleMode) {
      setShuffleMode(prev => !prev);
    }
  }, [setShuffleMode]);

  const toggleRepeat = useCallback(() => {
    if (setRepeatMode) {
      setRepeatMode(prev => {
        if (prev === 'off') return 'all';
        if (prev === 'all') return 'one';
        return 'off';
      });
    }
  }, [setRepeatMode]);

  const handleLike = useCallback(async () => {
    if (!currentTrack || !user) return;
    
    try {
      // Set the current track as the song to be added
      if (setSong) {
        setSong(currentTrack);
      }
      
      // Add to playlist using context function
      if (addSongToPlaylist) {
        await addSongToPlaylist(user, "Liked Songs", currentTrack);
        setIsLiked(true);
        console.log('Song added to playlist successfully!');
      }
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      setError('Failed to add song to playlist');
    }
  }, [currentTrack, user, addSongToPlaylist, setSong]);

  const formatTime = useCallback((timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, []);

  // Custom play/pause toggle to avoid conflicts
  const handlePlayPause = useCallback(() => {
    if (togglePlayPause) {
      togglePlayPause();
    } else {
      setIsPlaying(prev => !prev);
    }
  }, [togglePlayPause]);

  const handlePrevious = useCallback(() => {
    if (playPreviousTrack) {
      playPreviousTrack();
    }
  }, [playPreviousTrack]);

  const handleNext = useCallback(() => {
    if (playNextTrack) {
      playNextTrack();
    }
  }, [playNextTrack]);

  if (!currentTrack) {
    return null;
  }

  return (
    <div className="now-playing-bar">
      <div ref={playerContainerRef} style={{ position: 'absolute', top: -9999, left: -9999 }}></div>

      {error && (
        <div className="error-message" style={{ color: 'red', fontSize: '12px', padding: '5px' }}>
          {error}
        </div>
      )}

      <div className="track-info">
        <img
          src={currentTrack.image || '/placeholder-image.png'}
          alt={currentTrack.title || 'Track'}
          className="track-thumbnail"
          onError={(e) => {
            e.target.src = '/placeholder-image.png';
          }}
        />
        <div className="track-details">
          <div className="track-title">{currentTrack.title || 'Unknown Track'}</div>
          <div className="track-artist">{currentTrack.artist || 'Unknown Artist'}</div>
        </div>
        <button onClick={handleLike} className="like-button" disabled={!user}>
          <PlusCircle 
            size={20} 
            fill={isLiked ? 'red' : 'none'} 
            color={isLiked ? 'red' : 'currentColor'} 
          />
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
          <button 
            onClick={handlePrevious} 
            disabled={isLoading || !playlist || playlist.length === 0}
          >
            <SkipBack size={20} />
          </button>
          <button 
            onClick={handlePlayPause} 
            disabled={isLoading || !playerReady} 
            className="play-pause-button"
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <button 
            onClick={handleNext} 
            disabled={isLoading || !playlist || playlist.length === 0}
          >
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
          <button onClick={toggleMute} disabled={!playerReady}>
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingBar;