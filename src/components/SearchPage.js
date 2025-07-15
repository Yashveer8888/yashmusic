import { useContext, useEffect, useState } from 'react';
import { PlusCircle, Search, Play, Pause } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import "../style/SearchPage.css";

const YOUTUBE_API_KEY = 'AIzaSyAgQ7Q4TwivG014awUMNokxMjsotxL54Qc';

const SearchPage = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    isPlaying, 
    currentTrack,
    playTrack,
    setSong
  } = useContext(AuthContext);
  
  const [youtubeResults, setYoutubeResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchYoutubeResults = async () => {
      if (!searchQuery.trim()) {
        setYoutubeResults([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const searchResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?` + 
          new URLSearchParams({
            part: 'snippet',
            q: `${searchQuery}`,
            type: 'video',
            videoCategoryId: '10',
            maxResults: 50,
            order: 'relevance',
            safeSearch: 'strict',
            key: YOUTUBE_API_KEY
          })
        );
        
        if (!searchResponse.ok) throw new Error('Failed to fetch from YouTube API');
        
        const searchData = await searchResponse.json();
        
        if (searchData.items?.length > 0) {
          const videoIds = searchData.items.map(item => item.id.videoId).join(',');
          const detailsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?` +
            new URLSearchParams({
              part: 'contentDetails,statistics',
              id: videoIds,
              key: YOUTUBE_API_KEY 
            })
          );
          
          if (!detailsResponse.ok) throw new Error('Failed to fetch video details');
          
          const detailsData = await detailsResponse.json();
          
          const results = searchData.items.map((item, index) => {
            const videoDetails = detailsData.items?.find(detail => detail.id === item.id.videoId);
            const duration = videoDetails?.contentDetails?.duration || 'PT0S';
            const viewCount = videoDetails?.statistics?.viewCount || '0';
            
            return {
              id: item.id.videoId,
              title: cleanTitle(item.snippet.title),
              artist: item.snippet.channelTitle,
              image: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
              duration: formatDuration(duration),
              viewCount: formatViewCount(viewCount),
              youtubeUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
              embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
            };
          });

          setYoutubeResults(results.filter(item => isMusicContent(item.title, item.artist)));
        } else {
          setYoutubeResults([]);
        }
      } catch (error) {
        console.error('Error fetching from YouTube:', error);
        setError(error.message);
        setYoutubeResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchYoutubeResults, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const cleanTitle = (title) => title.replace(/\[.*?\]|\(.*?\)|official\s+(video|audio|music\s+video)/gi, '').trim();
  
  const isMusicContent = (title, artist) => {
    const nonMusicKeywords = ['tutorial', 'how to', 'review', 'reaction', 'live stream', 'news'];
    return !nonMusicKeywords.some(keyword => title.toLowerCase().includes(keyword));
  };

  const formatDuration = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';
    
    const hours = parseInt(match[1]?.replace('H', '') || '0');
    const minutes = parseInt(match[2]?.replace('M', '') || '0');
    const seconds = parseInt(match[3]?.replace('S', '') || '0');
    
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count) => {
    const num = parseInt(count) || 0;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  const handleAddToPlaylist = (track) => {
    setSong(track);
  };

  const genres = [
    { name: 'Bollywood', color: 'orange-red', emoji: '🎬' },
    { name: 'Punjabi', color: 'yellow-orange', emoji: '🎤' },
    { name: 'Pop', color: 'pink-rose', emoji: '🎵' },
    { name: 'Hip Hop', color: 'purple-pink', emoji: '🎪' },
    { name: 'Rock', color: 'red-pink', emoji: '🎸' },
    { name: 'Classical', color: 'blue-indigo', emoji: '🎼' },
    { name: 'EDM', color: 'cyan-blue', emoji: '🎛️' },
    { name: 'Romantic', color: 'rose-pink', emoji: '💕' }
  ];

  const popularSearches = [
    'Arijit Singh', 'Bollywood 2024', 'Punjabi hits',
    'Ed Sheeran', 'Taylor Swift', 'AR Rahman',
    'Romantic songs', 'Pop songs'
  ];

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-header">
          <h1>🎵 Yash Music Search</h1>
          <div className="search-input-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search songs, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="error-message">Error: {error}</div>}

        {searchQuery ? (
          <div className="search-results">
            <h2>{loading ? '🔍 Searching...' : `🎶 Results for "${searchQuery}"`}</h2>
            
            {loading ? (
              <div className="loading-spinner"></div>
            ) : youtubeResults.length > 0 ? (
              <div className="track-list">
                {youtubeResults.map((track, index) => (
                  <div 
                    key={`${track.id}-${index}`}
                    className={`track-item ${currentTrack?.id === track.id ? 'active' : ''}`}
                  >
                    <div className="track-number"
                      onClick={() => playTrack(track, youtubeResults)}>
                      <span>{index + 1}</span>
                      <div className="play-button-overlay">
                        {currentTrack?.id === track.id && isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      </div>
                    </div>
                    
                    <div className="track-image-container"
                      onClick={() => playTrack(track, youtubeResults)}>
                      <img src={track.image} alt={track.title} loading="lazy" />
                    </div>
                    
                    <div className="track-info"
                      onClick={() => playTrack(track, youtubeResults)}>
                      <h3>{track.title}</h3>
                      <div className="artist-views">
                        <p>{track.artist} | {track.viewCount} views | {track.duration}</p>
                      </div>
                    </div>
                    
                    <Link
                      to="/playlists"
                      className="add-to-playlist"
                      onClick={(e) => handleAddToPlaylist(track)}
                    >
                      <PlusCircle size={16} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No music found. Try these:</p>
                <div className="suggestions">
                  {popularSearches.slice(0, 4).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="browse-section">
            <h2>🎭 Browse Genres</h2>
            <div className="genre-grid">
              {genres.map((genre, index) => (
                <div
                  key={index}
                  className={`genre-card ${genre.color}`}
                  onClick={() => setSearchQuery(genre.name)}
                >
                  <h3>{genre.name}</h3>
                  <div className="genre-emoji">{genre.emoji}</div>
                </div>
              ))}
            </div>
            
            <div className="popular-section">
              <h2>🔥 Popular Searches</h2>
              <div className="popular-list">
                {popularSearches.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;