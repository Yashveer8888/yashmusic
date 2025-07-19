import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, 
  Volume2, VolumeX, Shuffle, Repeat, Repeat1, Heart
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
  } = useContext(AuthContext);

  // State management
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  
  // Refs
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const playerContainerRef = useRef(null);
  const apiLoadedRef = useRef(false);
  const currentTrackIdRef = useRef(null);
  const isPlayerReadyRef = useRef(false);

  useEffect(() => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      registration.sync.register('playback-sync');
    });
  }
}, [isPlaying]);

  // Format time display (MM:SS)
  const formatTime = useCallback((timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, []);

  // Player control functions
  const stopTimeTracking = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const startTimeTracking = useCallback(() => {
    stopTimeTracking();
    intervalRef.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const newTime = playerRef.current.getCurrentTime();
        if (!isNaN(newTime)) setCurrentTime(newTime);
      }
    }, 1000);
  }, [stopTimeTracking]);

  const destroyPlayer = useCallback(() => {
    stopTimeTracking();
    if (playerRef.current?.destroy) playerRef.current.destroy();
    playerRef.current = null;
    isPlayerReadyRef.current = false;
    setCurrentTime(0);
    setDuration(0);
  }, [stopTimeTracking]);

  const safePlayerCall = (method, ...args) => {
    if (playerRef.current && isPlayerReadyRef.current && typeof playerRef.current[method] === 'function') {
      return playerRef.current[method](...args);
    }
    return null;
  };

  // Event handlers
  const onPlayerError = useCallback((event) => {
    const errorMessages = {
      2: 'Invalid video ID',
      5: 'HTML5 player error',
      100: 'Video not found',
      101: 'Embedding not allowed',
      150: 'Embedding not allowed'
    };
    setError(errorMessages[event.data] || "Playback error");
    setIsLoading(false);
  }, []);

  const onPlayerReady = useCallback((event) => {
    isPlayerReadyRef.current = true;
    setIsLoading(false);
    
    const videoDuration = event.target.getDuration();
    if (videoDuration > 0) setDuration(videoDuration);
    
    if (isMuted) {
      safePlayerCall('mute');
    } else {
      safePlayerCall('unMute');
    }
    
    if (isPlaying) {
      const playPromise = safePlayerCall('playVideo');
      if (playPromise && playPromise.catch) {
        playPromise.catch(err => {
          console.error('Playback failed:', err);
          setIsPlaying(false);
        });
      }
    }
  }, [isMuted, isPlaying, setIsPlaying]);

  const handleTrackEnded = useCallback(() => {
    if (repeatMode === 'one') {
      safePlayerCall('seekTo', 0);
      safePlayerCall('playVideo');
    } else {
      setTimeout(() => {
        handleTrackEnd?.() || playNextTrack?.();
      }, 500);
    }
  }, [repeatMode, handleTrackEnd, playNextTrack]);

  const onPlayerStateChange = useCallback((event) => {
    switch (event.data) {
      case window.YT.PlayerState.PLAYING:
        setIsPlaying(true);
        setIsLoading(false);
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
        handleTrackEnded();
        break;
      case window.YT.PlayerState.BUFFERING:
      case window.YT.PlayerState.CUED:
        setIsLoading(true);
        break;
      default:
        break;
    }
  }, [setIsPlaying, startTimeTracking, stopTimeTracking, handleTrackEnded]);

  // Setup Media Session API
  const setupMediaSession = useCallback(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title || 'Unknown Track',
      artist: currentTrack.artist || 'Unknown Artist',
      album: '',
      artwork: [
        { src: currentTrack.image || '/placeholder-music.png', sizes: '96x96', type: 'image/png' },
      ]
    });

    navigator.mediaSession.setActionHandler('play', togglePlayPause);
    navigator.mediaSession.setActionHandler('pause', togglePlayPause);
    navigator.mediaSession.setActionHandler('previoustrack', playPreviousTrack);
    navigator.mediaSession.setActionHandler('nexttrack', playNextTrack);
    navigator.mediaSession.setActionHandler('seekbackward', () => {
      safePlayerCall('seekTo', Math.max(0, currentTime - 10), true);
    });
    navigator.mediaSession.setActionHandler('seekforward', () => {
      safePlayerCall('seekTo', Math.min(duration, currentTime + 10), true);
    });

    return () => {
      navigator.mediaSession.metadata = null;
      ['play', 'pause', 'previoustrack', 'nexttrack', 'seekbackward', 'seekforward'].forEach(
        action => navigator.mediaSession.setActionHandler(action, null)
      );
    };
  }, [currentTrack, currentTime, duration, playNextTrack, playPreviousTrack, togglePlayPause]);

  // Player initialization
  const setupPlayer = useCallback((videoId) => {
    if (!playerContainerRef.current || !apiLoadedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (playerRef.current) {
        destroyPlayer();
      }

      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        height: '0',
        width: '0',
        videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          origin: window.location.origin,
          enablejsapi: 1,
          playsinline: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      });
    } catch (err) {
      console.error('Player setup error:', err);
      setError("Player initialization failed");
      setIsLoading(false);
    }
  }, [destroyPlayer, isPlaying, onPlayerError, onPlayerReady, onPlayerStateChange]);

  // YouTube API loader
  useEffect(() => {
    if (window.YT?.Player) {
      apiLoadedRef.current = true;
      return;
    }

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existingScript) {
      apiLoadedRef.current = true;
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    
    window.onYouTubeIframeAPIReady = () => {
      apiLoadedRef.current = true;
      if (currentTrack?.id) {
        setupPlayer(currentTrack.id);
      }
    };

    document.head.appendChild(tag);

    return () => {
      destroyPlayer();
      clearInterval(intervalRef.current);
    };
  }, [currentTrack?.id, destroyPlayer, setupPlayer]);

  // Track change handler
  useEffect(() => {
    if (!currentTrack?.id) {
      destroyPlayer();
      currentTrackIdRef.current = null;
      return;
    }

    if (currentTrackIdRef.current !== currentTrack.id && apiLoadedRef.current) {
      currentTrackIdRef.current = currentTrack.id;
      setupPlayer(currentTrack.id);
    }
  }, [currentTrack?.id, destroyPlayer, setupPlayer]);

  // Play/pause sync
  useEffect(() => {
    if (!isPlayerReadyRef.current) return;
    
    if (isPlaying) {
      const playPromise = safePlayerCall('playVideo');
      if (playPromise && playPromise.catch) {
        playPromise.catch(err => {
          console.error('Playback failed:', err);
          setIsPlaying(false);
        });
      }
    } else {
      safePlayerCall('pauseVideo');
    }
  }, [isPlaying, setIsPlaying]);

  // Media session setup
  useEffect(() => {
    if (!currentTrack) return;
    
    const cleanup = setupMediaSession();
    return () => {
      cleanup?.();
    };
  }, [currentTrack, setupMediaSession]);

  // Update playback state for media session
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // UI handlers
  const handleSeek = useCallback((e) => {
    const newTime = parseFloat(e.target.value);
    if (!isNaN(newTime)) {
      safePlayerCall('seekTo', newTime, true);
      setCurrentTime(newTime);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (newMuted) {
        safePlayerCall('mute');
      } else {
        safePlayerCall('unMute');
      }
      return newMuted;
    });
  }, []);

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

  const toggleLike = useCallback(() => {
    setIsLiked(prev => !prev);
    
  }, []);

  if (!currentTrack) return null;

  return (
    <div className="nowPlayingBar">
      <div ref={playerContainerRef} className="nowPlayingBar__hiddenPlayer" />

      {error && (
        <div className="nowPlayingBar__error">
          {error}
        </div>
      )}

      <div className="nowPlayingBar__trackInfo">
        <img
          src={currentTrack.image || '/placeholder-music.png'}
          alt={currentTrack.title || 'Track'}
          className="nowPlayingBar__thumbnail"
          onError={(e) => e.target.src = '/placeholder-music.png'}
        />
        <div className="nowPlayingBar__trackMeta">
          <div className="nowPlayingBar__title">
            {currentTrack.title || 'Unknown Track'}
          </div>
          <div className="nowPlayingBar__artist">
            {currentTrack.artist || 'Unknown Artist'}
          </div>
        </div>
      </div>

      <div className="nowPlayingBar__playerControls">
        <div className="nowPlayingBar__transportControls">
          <button 
            onClick={toggleLike}
            className={`nowPlayingBar__controlButton ${isLiked ? 'nowPlayingBar__controlButton--active' : ''}`}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={toggleShuffle} 
            className={`nowPlayingBar__controlButton ${shuffleMode ? 'nowPlayingBar__controlButton--active' : ''}`}
            disabled={isLoading}
            aria-label={shuffleMode ? 'Disable shuffle' : 'Enable shuffle'}
          >
            <Shuffle size={16} />
          </button>
          <button 
            onClick={playPreviousTrack} 
            className="nowPlayingBar__controlButton"
            disabled={isLoading || !playlist?.length}
            aria-label="Previous track"
          >
            <SkipBack size={20} />
          </button>
          <button 
            onClick={togglePlayPause} 
            disabled={isLoading} 
            className="nowPlayingBar__playButton"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <button 
            onClick={playNextTrack} 
            className="nowPlayingBar__controlButton"
            disabled={isLoading || !playlist?.length}
            aria-label="Next track"
          >
            <SkipForward size={20} />
          </button>
          <button 
            onClick={toggleRepeat} 
            className={`nowPlayingBar__controlButton ${repeatMode !== 'off' ? 'nowPlayingBar__controlButton--active' : ''}`}
            disabled={isLoading}
            aria-label={`Repeat ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        </div>
        <div className="nowPlayingBar__progressContainer">
          <span className="nowPlayingBar__timeDisplay">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 1}
            value={currentTime}
            onChange={handleSeek}
            disabled={isLoading}
            className="nowPlayingBar__progressBar"
            aria-label="Track progress"
          />
          <span className="nowPlayingBar__timeDisplay">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="nowPlayingBar__utilityControls">
        <button 
          onClick={toggleMute} 
          className="nowPlayingBar__volumeButton"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </div>
  );
};

export default NowPlayingBar;