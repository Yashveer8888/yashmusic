import React from 'react';
import { Play, Pause } from 'lucide-react';
import { Song } from '@/types/music';
import { useMusic } from '@/context/MusicContext';
import { Button } from '@/components/ui/button';
import './SongCard.css';



export function SongCard({ song, playlist, showPlayButton = true, size = 'medium' }) {
  const { state, playSong, togglePlayPause } = useMusic();
  const isCurrentSong = state.currentSong?.id === song.id;
  const isPlaying = isCurrentSong && state.isPlaying;

  const handlePlay = () => {
    if (isCurrentSong) {
      togglePlayPause();
    } else {
      playSong(song, playlist);
    }
  };

  const cardClass = `song-card song-card-${size} ${isCurrentSong ? 'song-card-active' : ''}`;

  return (
    <div 
      key={`${track.id}-${index}`}
      className={`track-item ${currentTrack?.id === track.id ? 'active' : ''}`}
      onClick={() => playTrack(track)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && playTrack(track)}
    >
      <div className="track-number">
        <span className="track-index">{index + 1}</span>
        <div className="play-button-overlay">
          {currentTrack?.id === track.id && isPlaying ? (
            <Pause className="play-icon" size={20} />
          ) : (
            <Play className="play-icon" size={20} />
          )}
        </div>
      </div>
      
      <div className="track-image-container">
        <img 
          src={track.image} 
          alt={track.title} 
          className="track-image"
          loading="lazy"
        />
        <div className="image-overlay">
          {currentTrack?.id === track.id && isPlaying ? (
            <Pause className="overlay-icon" size={20} />
          ) : (
            <Play className="overlay-icon" size={20} />
          )}
        </div>
      </div>
      
      <div className="track-info">
        <h3 className="track-title" title={track.title}>
          {track.title}
        </h3>
        <p className="track-artist" title={track.artist}>
          {track.artist}
        </p>
        <span className="track-views">{track.viewCount} views</span>
      </div>
      
      <div className="track-duration">
        {track.duration}
      </div>
      
      <div className="track-actions">
        <button 
          className="action-button heart-button"
          onClick={setSong(track)}
          title="Add to playlist"
          aria-label="Add to playlist"
        >
        <PlusCircle size={16} />
        </button>
      </div>
    </div>
  );
}
