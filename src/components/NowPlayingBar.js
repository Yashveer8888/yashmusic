import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX,
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
  } = useContext(AuthContext);

  // State management
  const [isMuted, setIsMuted] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  
  // Refs
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const playerContainerRef = useRef(null);
  const isInitializingRef = useRef(false);
  const currentTrackIdRef = useRef(null);

  // Format time display (MM:SS)
  const formatTime = useCallback((timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
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
    setPlayerReady(false);
    setCurrentTime(0);
    setDuration(0);
    isInitializingRef.current = false;
  }, [stopTimeTracking]);

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
    isInitializingRef.current = false;
  }, []);

  const onPlayerReady = useCallback((event) => {
    setPlayerReady(true);
    setIsLoading(false);
    isInitializingRef.current = false;
    
    const videoDuration = event.target.getDuration();
    if (videoDuration > 0) setDuration(videoDuration);
    
    isMuted ? event.target.mute() : event.target.unMute();
    if (isPlaying) event.target.playVideo();
  }, [isMuted, isPlaying]);

  const handleTrackEnded = useCallback(() => {
    if (repeatMode === 'one') {
      playerRef.current?.seekTo(0)?.playVideo();
      setIsPlaying(true);
    } else {
      handleTrackEnd?.() || playNextTrack?.();
    }
  }, [repeatMode, handleTrackEnd, playNextTrack, setIsPlaying]);

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
        setIsLoading(true);
        break;
      case window.YT.PlayerState.CUED:
        setIsLoading(false);
        break;
      default:
        break;
    }
  }, [setIsPlaying, startTimeTracking, stopTimeTracking, handleTrackEnded]);

  // Player initialization
  const setupPlayer = useCallback((videoId) => {
    if (isInitializingRef.current || !playerContainerRef.current) return;
    
    isInitializingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
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
      isInitializingRef.current = false;
    }
  }, [isPlaying, onPlayerError, onPlayerReady, onPlayerStateChange]);

  // YouTube API loader
  useEffect(() => {
    if (window.YT?.Player) {
      setApiLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);

      window.onYouTubeIframeAPIReady = () => setApiLoaded(true);
    }

    return () => {
      destroyPlayer();
      clearInterval(intervalRef.current);
    };
  }, [destroyPlayer]);

  // Track change handler
  useEffect(() => {
    if (!apiLoaded) return;

    if (currentTrack?.id) {
      if (currentTrackIdRef.current !== currentTrack.id) {
        currentTrackIdRef.current = currentTrack.id;
        destroyPlayer();
        setupPlayer(currentTrack.id);
      }
    } else {
      currentTrackIdRef.current = null;
      destroyPlayer();
    }
  }, [currentTrack?.id, apiLoaded, destroyPlayer, setupPlayer]);

  // Play/pause sync
  useEffect(() => {
    if (!playerReady || !playerRef.current || isInitializingRef.current) return;
    isPlaying ? playerRef.current.playVideo() : playerRef.current.pauseVideo();
  }, [isPlaying, playerReady]);

  // UI handlers
  const handleSeek = useCallback((e) => {
    const newTime = parseFloat(e.target.value);
    if (playerReady && playerRef.current && !isNaN(newTime)) {
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  }, [playerReady]);

  const toggleMute = useCallback(() => {
    if (!playerReady || !playerRef.current) return;
    setIsMuted(prev => {
      const newMuted = !prev;
      newMuted ? playerRef.current.mute() : playerRef.current.unMute();
      return newMuted;
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
            disabled={isLoading || !playerReady} 
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
            disabled={!playerReady || isLoading}
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
          disabled={!playerReady}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </div>
  );
};

export default NowPlayingBar;