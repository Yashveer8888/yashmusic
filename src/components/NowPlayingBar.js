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

  const [isMuted, setIsMuted] = useState(false);
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

  // Format time display (MM:SS)
  const formatTime = useCallback((timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, []);

  // --- Player Control Functions ---
  const stopTimeTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimeTracking = useCallback(() => {
    stopTimeTracking();
    intervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const newTime = playerRef.current.getCurrentTime();
          if (!isNaN(newTime)) setCurrentTime(newTime);
        } catch (err) {
          console.warn('Error getting current time:', err);
        }
      }
    }, 1000);
  }, [stopTimeTracking]);

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
  }, [stopTimeTracking]);

  // --- Player Event Handlers ---
  const onPlayerError = useCallback((event) => {
    console.error('YouTube Player Error:', event.data);
    const errorMessages = {
      2: 'Invalid video ID',
      5: 'HTML5 player error',
      100: 'Video not found',
      101: 'Video not allowed to be played in embedded players',
      150: 'Video not allowed to be played in embedded players'
    };
    
    setError(errorMessages[event.data] || "Failed to load track");
    setIsLoading(false);
    isInitializingRef.current = false;
  }, []);

  const onPlayerReady = useCallback((event) => {
    console.log('Player ready for track:', currentTrack?.id);
    setPlayerReady(true);
    setIsLoading(false);
    isInitializingRef.current = false;
    
    try {
      const videoDuration = event.target.getDuration();
      if (videoDuration > 0) setDuration(videoDuration);
      
      if (isMuted) event.target.mute();
      else event.target.unMute();
      
      if (isPlaying) event.target.playVideo();
    } catch (err) {
      console.error('Error in onPlayerReady:', err);
    }
  }, [isMuted, isPlaying, currentTrack?.id]);

  const handleLocalTrackEnd = useCallback(() => {
    console.log('Track ended, handling next track...');
    if (repeatMode === 'one') {
      if (playerRef.current) {
        playerRef.current.seekTo(0, true);
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } else {
      if (handleTrackEnd) {
        handleTrackEnd();
      } else if (playNextTrack) {
        playNextTrack();
      }
    }
  }, [repeatMode, handleTrackEnd, playNextTrack, setIsPlaying]);

  const onPlayerStateChange = useCallback((event) => {
    try {
      switch (event.data) {
        case window.YT.PlayerState.PLAYING:
          setIsPlaying(true);
          setIsLoading(false);
          if (playerRef.current) {
            const dur = playerRef.current.getDuration();
            if (dur > 0) setDuration(dur);
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
          
        case window.YT.PlayerState.CUED:
          setIsLoading(false);
          break;
          
        default:
          break;
      }
    } catch (err) {
      console.error('Error in onPlayerStateChange:', err);
    }
  }, [setIsPlaying, startTimeTracking, stopTimeTracking, handleLocalTrackEnd]);

  // --- Player Initialization ---
  const setupPlayer = useCallback((videoId) => {
    if (isInitializingRef.current || !playerContainerRef.current) return;
    
    isInitializingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
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
  }, [isPlaying, onPlayerError, onPlayerReady, onPlayerStateChange]);

  // --- YouTube API Loader ---
  useEffect(() => {
    if (window.YT?.Player) {
      setApiLoaded(true);
      return;
    }

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);

      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API Ready');
        setApiLoaded(true);
      };
    }

    return () => {
      destroyPlayer();
      clearInterval(intervalRef.current);
    };
  }, [destroyPlayer]);

  // --- Track Change Handler ---
  useEffect(() => {
    if (!apiLoaded) return;

    if (currentTrack?.id) {
      if (currentTrackIdRef.current !== currentTrack.id) {
        console.log('New track detected, initializing player...');
        currentTrackIdRef.current = currentTrack.id;
        destroyPlayer();
        setupPlayer(currentTrack.id);
      }
    } else {
      currentTrackIdRef.current = null;
      destroyPlayer();
    }
  }, [currentTrack?.id, apiLoaded, destroyPlayer, setupPlayer]);

  // --- Play/Pause Sync ---
  useEffect(() => {
    if (!playerReady || !playerRef.current || isInitializingRef.current) return;
    
    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (err) {
      console.error('Error controlling playback:', err);
    }
  }, [isPlaying, playerReady]);

  // --- Progress Bar Update ---
  useEffect(() => {
    const seekSlider = document.querySelector('.seek-slider');
    if (seekSlider && duration > 0) {
      const progressPercentage = (currentTime / duration) * 100;
      seekSlider.style.setProperty('--progress', `${progressPercentage}%`);
    }
  }, [currentTime, duration]);

  // --- UI Handlers ---
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
      if (newMuted) playerRef.current.mute();
      else playerRef.current.unMute();
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
    <div className="now-playing-bar">
      <div ref={playerContainerRef} style={{ position: 'absolute', top: -9999, left: -9999 }}></div>

      {error && (
        <div className="error-message">
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
            onClick={playPreviousTrack} 
            disabled={isLoading || !playlist || playlist.length === 0}
          >
            <SkipBack size={20} />
          </button>
          <button 
            onClick={togglePlayPause} 
            disabled={isLoading || !playerReady} 
            className="play-pause-button"
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <button 
            onClick={playNextTrack} 
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