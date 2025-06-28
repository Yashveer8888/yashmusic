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
    setCurrentTrack, 
    setIsPlaying, 
    isPlaying, 
    currentTrack,
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
        // Search for music videos
        const searchResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?` + 
          new URLSearchParams({
            part: 'snippet',
            q: `${searchQuery} music song audio`,
            type: 'video',
            videoCategoryId: '10', // Music category
            maxResults: 5,
            order: 'relevance',
            safeSearch: 'strict',
            key: YOUTUBE_API_KEY
          })
        );
        
        if (!searchResponse.ok) {
          throw new Error('Failed to fetch from YouTube API');
        }
        
        const searchData = await searchResponse.json();
        
        if (searchData.items && searchData.items.length > 0) {
          // Get video details including duration
          const videoIds = searchData.items.map(item => item.id.videoId).join(',');
          const detailsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?` +
            new URLSearchParams({
              part: 'contentDetails,statistics',
              id: videoIds,
              key: YOUTUBE_API_KEY 
            })
          );
          
          if (!detailsResponse.ok) {
            throw new Error('Failed to fetch video details');
          }
          
          const detailsData = await detailsResponse.json();
          
          // Combine search results with video details
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
              publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
              youtubeUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
              embedUrl: `https://www.youtube.com/embed/${item.id.videoId}?autoplay=1&controls=1&rel=0`
            };
          });

          // Filter out likely non-music content
          const musicResults = results.filter(item => 
            isMusicContent(item.title, item.artist)
          );

          setYoutubeResults(musicResults);
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

  const cleanTitle = (title) => {
    if (!title) return '';
    return title
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?(official|audio|video|lyric|music).*?\)/gi, '')
      .replace(/official\s+(video|audio|music\s+video)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const isMusicContent = (title, artist) => {
    if (!title || !artist) return false;
    
    const musicKeywords = ['song', 'music', 'audio', 'track', 'single', 'album', 'cover', 'remix'];
    const nonMusicKeywords = ['tutorial', 'how to', 'review', 'reaction', 'live stream', 'news'];
    
    const titleLower = title.toLowerCase();
    const artistLower = artist.toLowerCase();
    
    const hasMusicKeywords = musicKeywords.some(keyword => 
      titleLower.includes(keyword) || artistLower.includes(keyword)
    );
    
    const hasNonMusicKeywords = nonMusicKeywords.some(keyword => 
      titleLower.includes(keyword)
    );
    
    return !hasNonMusicKeywords && (hasMusicKeywords || titleLower.length < 50);
  };

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';
    
    const hours = parseInt(match[1]?.replace('H', '') || '0');
    const minutes = parseInt(match[2]?.replace('M', '') || '0');
    const seconds = parseInt(match[3]?.replace('S', '') || '0');
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count) => {
    const num = parseInt(count) || 0;
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const playTrack = (track) => {
    if (!track) return;
    
    const formattedTrack = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      image: track.image,
      duration: track.duration,
      youtubeUrl: track.youtubeUrl,
      embedUrl: track.embedUrl,
      viewCount: track.viewCount
    };
    
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(formattedTrack);
      setIsPlaying(true);
    }
  };

  const genres = [
    { name: 'Bollywood Music', color: 'orange-red', emoji: '🎬' },
    { name: 'Punjabi Songs', color: 'yellow-orange', emoji: '🎤' },
    { name: 'Pop Music', color: 'pink-rose', emoji: '🎵' },
    { name: 'Hip Hop Rap', color: 'purple-pink', emoji: '🎪' },
    { name: 'Rock Music', color: 'red-pink', emoji: '🎸' },
    { name: 'Classical Music', color: 'blue-indigo', emoji: '🎼' },
    { name: 'Electronic Dance', color: 'cyan-blue', emoji: '🎛️' },
    { name: 'Love Songs', color: 'rose-pink', emoji: '💕' }
  ];

  const popularSearches = [
    'Arijit Singh songs', 'Bollywood hits 2024', 'Punjabi latest songs',
    'Ed Sheeran', 'Taylor Swift', 'AR Rahman music',
    'Hindi romantic songs', 'English pop songs'
  ];

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-header">
          <h1 className="search-title">🎵 Music Search</h1>
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search for songs, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              aria-label="Search for music"
            />
          </div>
        </div>

        {error && (
          <div className="error-message">
            Error: {error}. Please try again later.
          </div>
        )}

        {searchQuery ? (
          <div className="search-results">
            <h2 className="results-title">
              {loading ? '🔍 Searching...' : `🎶 Results for "${searchQuery}"`}
            </h2>
            
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Finding the best music for you...</p>
              </div>
            ) : (
              <div className="track-list">
                {youtubeResults.length > 0 ? (
                  youtubeResults.map((track, index) => (
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
                  ))
                ) : (
                  <div className="no-results">
                    <div className="no-results-emoji">😞</div>
                    <h3 className="no-results-title">No music found</h3>
                    <p className="no-results-text">Try searching for different artists, songs, or genres.</p>
                    <div className="suggestions">
                      <p className="suggestions-title">Try these popular searches:</p>
                      <div className="suggestions-list">
                        {popularSearches.slice(0, 4).map((suggestion, index) => (
                          <button
                            key={index}
                            className="suggestion-button"
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
            )}
          </div>
        ) : (
          <div className="browse-section">
            <h2 className="section-title">🎭 Browse by Genre</h2>
            <div className="genre-grid">
              {genres.map((genre, index) => (
                <div
                  key={index}
                  className={`genre-card ${genre.color}`}
                  onClick={() => setSearchQuery(genre.name)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(genre.name)}
                >
                  <h3 className="genre-name">{genre.name}</h3>
                  <div className="genre-emoji">
                    {genre.emoji}
                  </div>
                  <div className="genre-overlay"></div>
                </div>
              ))}
            </div>
            
            <div className="popular-section">
              <h2 className="section-title">🔥 Popular Searches</h2>
              <div className="popular-list">
                {popularSearches.map((suggestion, index) => (
                  <button
                    key={index}
                    className="popular-button"
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