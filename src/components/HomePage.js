import React, { useContext } from 'react';
import { Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../style/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { setCurrentTrack, setIsPlaying, user, setSearchQuery } = useContext(AuthContext);

  const featuredPlaylists = [
    { id: 1, title: "Today's Top Hits", image: '🎵', description: 'The hottest tracks right now' },
    { id: 2, title: 'Chill Vibes', image: '🌙', description: 'Relax and unwind' },
    { id: 3, title: 'Workout Mix', image: '💪', description: 'High energy beats' },
    { id: 4, title: 'Focus Flow', image: '🧠', description: 'Instrumental focus music' },
  ];

  const recentlyPlayed = [
    { id: 1, title: 'Midnight Dreams', artist: 'Luna Echo', duration: '3:45', image: '🌌' },
    { id: 2, title: 'Electric Pulse', artist: 'Neon Nights', duration: '4:12', image: '⚡' },
    { id: 3, title: 'Ocean Waves', artist: 'Calm Collective', duration: '2:58', image: '🌊' },
    { id: 4, title: 'City Lights', artist: 'Urban Beats', duration: '3:33', image: '🏙️' },
  ];

  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const goToSearch = (query) => {
    setSearchQuery(query);
    navigate('/search');
  };

  // Get appropriate greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-container">
      <div className="profile-icon">
        <Link to="/profile">👤</Link>
      </div>

      <h1 className="page-heading">
        {getGreeting()}, {user?.displayName || user?.email || 'User'}!
      </h1>

      <div className="featured-grid">
        {featuredPlaylists.map(playlist => (
          <div 
            key={playlist.id} 
            className="featured-card group"
            onClick={() => goToSearch(playlist.title)}
          >
            <div className="card-flex">
              <div className="text-4xl">{playlist.image}</div>
              <div className="flex-1">
                <h3 className="card-title">{playlist.title}</h3>
                <p className="card-desc">{playlist.description}</p>
              </div>
              <Play className="play-btn" size={40} />
            </div>
          </div>
        ))}
      </div>

      <section className="section">
        <h2 className="section-title">Recently played</h2>
        <div className="grid-cards">
          {recentlyPlayed.map(track => (
            <div 
              key={track.id} 
              onClick={() => playTrack(track)} 
              className="card group"
            >
              <div className="card-img">{track.image}</div>
              <h3 className="card-track-title">{track.title}</h3>
              <p className="card-artist">{track.artist}</p>
              <Play className="play-btn mt-2" size={32} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;