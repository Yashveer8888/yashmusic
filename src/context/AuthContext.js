// AuthContext.js - Add these properties and functions to your existing context

import React, { createContext, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState("yash9@gmail.com");
  const [playlistname, setPlaylistname] = useState("My5");
  const [song, setSong] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Existing states
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New states for playlist management
  const [playlist, setPlaylist] = useState([]); // Array of tracks
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');

  // Function to play a specific track and update playlist
  const playTrack = (track, trackList = []) => {
    // If trackList is provided, update the playlist
    if (trackList.length > 0) {
      setPlaylist(trackList);
      const trackIndex = trackList.findIndex(t => t.id === track.id);
      setCurrentTrackIndex(trackIndex);
    } else {
      // If no trackList, check if track exists in current playlist  
      const existingIndex = playlist.findIndex(t => t.id === track.id);
      if (existingIndex >= 0) {
        setCurrentTrackIndex(existingIndex);
      } else {
        // Add track to playlist if not exists
        const newPlaylist = [...playlist, track];
        setPlaylist(newPlaylist);
        setCurrentTrackIndex(newPlaylist.length - 1);
      }
    }
    
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  // Function to play next track
  const playNextTrack = () => {
    if (playlist.length === 0) return;

    let nextIndex;
    
    if (shuffleMode) {
      // Random next track (excluding current)
      const availableIndices = playlist
        .map((_, index) => index)
        .filter(index => index !== currentTrackIndex);
      nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else {
      // Sequential next track
      nextIndex = currentTrackIndex + 1;
      
      if (nextIndex >= playlist.length) {
        if (repeatMode === 'all') {
          nextIndex = 0; // Go to first track
        } else {
          return; // No next track available
        }
      }
    }

    if (nextIndex >= 0 && nextIndex < playlist.length) {
      setCurrentTrackIndex(nextIndex);
      setCurrentTrack(playlist[nextIndex]);
      setIsPlaying(true);
    }
  };

  // Function to play previous track
  const playPreviousTrack = () => {
    if (playlist.length === 0) return;

    let prevIndex;
    
    if (shuffleMode) {
      // Random previous track (excluding current)
      const availableIndices = playlist
        .map((_, index) => index)
        .filter(index => index !== currentTrackIndex);
      prevIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else {
      // Sequential previous track
      prevIndex = currentTrackIndex - 1;
      
      if (prevIndex < 0) {
        if (repeatMode === 'all') {
          prevIndex = playlist.length - 1; // Go to last track
        } else {
          return; // No previous track available
        }
      }
    }

    if (prevIndex >= 0 && prevIndex < playlist.length) {
      setCurrentTrackIndex(prevIndex);
      setCurrentTrack(playlist[prevIndex]);
      setIsPlaying(true);
    }
  };

  // Function to toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  // Function to handle track end (auto play next)
  const handleTrackEnd = () => {
    if (repeatMode === 'one') {
      // Repeat current track
      setIsPlaying(true);
    } else {
      // Play next track
      playNextTrack();
    }
  };

  // Example function to add a song to a playlist
  const addSongToPlaylist = async (user, playlistname, song) => {
    try {
      // const token = await usermail.getIdToken();

      const response = await axios.post(
        'http://localhost:5000/api/music/add-song',
        {
          usermail: user,
          playlistName: playlistname,
          song: song
        },
        {
          headers: {
            // Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(response.data.message);
      setPlaylistname(''); 
      setSong(null);
      // navigator("/search"); // Uncomment if you have navigation function
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Something went wrong.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    setUser,
    addSongToPlaylist,
    playlistname,
    setPlaylistname,
    song,
    setSong,
    success,
    setSuccess,
    error,
    setError,
    // Existing values
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    searchQuery,
    setSearchQuery,
    
    // New values
    playlist,
    setPlaylist,
    currentTrackIndex,
    setCurrentTrackIndex,
    shuffleMode,
    setShuffleMode,
    repeatMode,
    setRepeatMode,
    
    // New functions
    playTrack,
    playNextTrack,
    playPreviousTrack,
    togglePlayPause,
    handleTrackEnd
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};