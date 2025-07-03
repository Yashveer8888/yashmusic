import React from 'react';
import { Play } from 'lucide-react';
import { Playlist } from '@/types/music';
import { useMusic } from '@/context/MusicContext';
import { Button } from '@/components/ui/button';
import './PlaylistCard.css';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick?: () => void;
}

export function PlaylistCard({ playlist, onClick }: PlaylistCardProps) {
  const { playSong } = useMusic();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className="playlist-card" onClick={handleClick}>
      <div className="playlist-card-image-container">
        <img
          src={playlist.image}
          alt={playlist.name}
          className="playlist-card-image"
        />
        <div className="playlist-card-overlay">
          <Button
            size="sm"
            onClick={handlePlay}
            className="playlist-card-play-button"
          >
            <Play size={20} />
          </Button>
        </div>
      </div>
      
      <div className="playlist-card-content">
        <h3 className="playlist-card-title">{playlist.name}</h3>
        <p className="playlist-card-description">{playlist.description}</p>
        <p className="playlist-card-count">{playlist.songs.length} songs</p>
      </div>
    </div>
  );
}