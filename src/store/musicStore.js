import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useMusicStore = create(
  persist(
    (set, get) => ({
      // Current track and playback state
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.7,
      
      // Playlist management
      playlist: [],
      currentTrackIndex: -1,
      queue: [],
      history: [],
      
      // Playback modes
      shuffleMode: false,
      repeatMode: 'off', // 'off', 'one', 'all'
      
      // User preferences
      likedSongs: [],
      userPlaylists: [],
      
      // UI state
      isSidebarCollapsed: false,
      isNowPlayingExpanded: false,
      searchQuery: '',
      
      // Actions
      setCurrentTrack: (track) => set({ currentTrack: track }),
      
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      
      setCurrentTime: (time) => set({ currentTime: time }),
      
      setDuration: (duration) => set({ duration: duration }),
      
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      
      playTrack: (track, trackList = []) => {
        const { playlist, currentTrackIndex } = get();
        
        if (trackList.length > 0) {
          const trackIndex = trackList.findIndex(t => t.id === track.id);
          set({
            playlist: trackList,
            currentTrackIndex: trackIndex >= 0 ? trackIndex : 0,
            currentTrack: track,
            isPlaying: true
          });
        } else {
          const existingIndex = playlist.findIndex(t => t.id === track.id);
          if (existingIndex >= 0) {
            set({
              currentTrackIndex: existingIndex,
              currentTrack: track,
              isPlaying: true
            });
          } else {
            const newPlaylist = [...playlist, track];
            set({
              playlist: newPlaylist,
              currentTrackIndex: newPlaylist.length - 1,
              currentTrack: track,
              isPlaying: true
            });
          }
        }
      },
      
      playNextTrack: () => {
        const { playlist, currentTrackIndex, shuffleMode, repeatMode } = get();
        
        if (playlist.length === 0) return;
        
        let nextIndex;
        
        if (shuffleMode) {
          const availableIndices = playlist
            .map((_, index) => index)
            .filter(index => index !== currentTrackIndex);
          nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        } else {
          nextIndex = currentTrackIndex + 1;
          
          if (nextIndex >= playlist.length) {
            if (repeatMode === 'all') {
              nextIndex = 0;
            } else {
              return;
            }
          }
        }
        
        if (nextIndex >= 0 && nextIndex < playlist.length) {
          set({
            currentTrackIndex: nextIndex,
            currentTrack: playlist[nextIndex],
            isPlaying: true
          });
        }
      },
      
      playPreviousTrack: () => {
        const { playlist, currentTrackIndex, shuffleMode, repeatMode } = get();
        
        if (playlist.length === 0) return;
        
        let prevIndex;
        
        if (shuffleMode) {
          const availableIndices = playlist
            .map((_, index) => index)
            .filter(index => index !== currentTrackIndex);
          prevIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        } else {
          prevIndex = currentTrackIndex - 1;
          
          if (prevIndex < 0) {
            if (repeatMode === 'all') {
              prevIndex = playlist.length - 1;
            } else {
              return;
            }
          }
        }
        
        if (prevIndex >= 0 && prevIndex < playlist.length) {
          set({
            currentTrackIndex: prevIndex,
            currentTrack: playlist[prevIndex],
            isPlaying: true
          });
        }
      },
      
      togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
      
      toggleShuffle: () => set((state) => ({ shuffleMode: !state.shuffleMode })),
      
      toggleRepeat: () => set((state) => {
        const modes = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(state.repeatMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        return { repeatMode: modes[nextIndex] };
      }),
      
      addToLikedSongs: (track) => set((state) => ({
        likedSongs: state.likedSongs.some(song => song.id === track.id)
          ? state.likedSongs
          : [...state.likedSongs, track]
      })),
      
      removeFromLikedSongs: (trackId) => set((state) => ({
        likedSongs: state.likedSongs.filter(song => song.id !== trackId)
      })),
      
      toggleLikedSong: (track) => {
        const { likedSongs } = get();
        const isLiked = likedSongs.some(song => song.id === track.id);
        
        if (isLiked) {
          get().removeFromLikedSongs(track.id);
        } else {
          get().addToLikedSongs(track);
        }
      },
      
      createPlaylist: (playlist) => set((state) => ({
        userPlaylists: [...state.userPlaylists, playlist]
      })),
      
      addToPlaylist: (playlistId, track) => set((state) => ({
        userPlaylists: state.userPlaylists.map(playlist =>
          playlist.id === playlistId
            ? { ...playlist, tracks: [...playlist.tracks, track] }
            : playlist
        )
      })),
      
      removeFromPlaylist: (playlistId, trackId) => set((state) => ({
        userPlaylists: state.userPlaylists.map(playlist =>
          playlist.id === playlistId
            ? { ...playlist, tracks: playlist.tracks.filter(track => track.id !== trackId) }
            : playlist
        )
      })),
      
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      
      toggleNowPlaying: () => set((state) => ({ isNowPlayingExpanded: !state.isNowPlayingExpanded })),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      clearQueue: () => set({ queue: [] }),
      
      addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
      
      removeFromQueue: (index) => set((state) => ({
        queue: state.queue.filter((_, i) => i !== index)
      })),
      
      resetPlayer: () => set({
        currentTrack: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        currentTrackIndex: -1
      }),
    }),
    {
      name: 'music-store',
      partialize: (state) => ({
        volume: state.volume,
        likedSongs: state.likedSongs,
        userPlaylists: state.userPlaylists,
        isSidebarCollapsed: state.isSidebarCollapsed,
        history: state.history,
      }),
    }
  )
);

export default useMusicStore; 