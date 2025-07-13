import { useContext, useState, useEffect } from 'react';
import { Download, Check, Music, PlusCircle, Play, Pause } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import "../style/DownloadPage.css";

const DownloadPage = () => {
  const { 
    currentTrack,
    isPlaying,
    playTrack,
    downloadedSongs,
    setDownloadedSongs
  } = useContext(AuthContext);
  
  const [downloadingId, setDownloadingId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  // Load recently played songs from storage
  useEffect(() => {
    const storedRecent = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
    setRecentlyPlayed(storedRecent);
  }, []);

  // Actual download function (simplified version)
  const downloadSong = async (track) => {
    setDownloadingId(track.id);
    setProgress(0);
    setError(null);

    try {
      // In a real app, you would:
      // 1. Fetch audio stream from YouTube
      // 2. Save to device storage
      // Here's a mock implementation:
      
      // Simulate download progress
      const updateProgress = () => {
        return new Promise(resolve => {
          const interval = setInterval(() => {
            setProgress(prev => {
              if (prev >= 100) {
                clearInterval(interval);
                resolve();
                return 100;
              }
              return prev + 10;
            });
          }, 300);
        });
      };

      await updateProgress();

      // Create the downloaded song object
      const newDownload = {
        ...track,
        offlineUri: `file://downloaded/${track.id}.mp3`,
        downloadedAt: new Date().toISOString(),
        fileSize: '3.2 MB' // Mock value
      };

      // Update context and local storage
      setDownloadedSongs(prev => {
        const updated = [...prev, newDownload];
        localStorage.setItem('downloadedSongs', JSON.stringify(updated));
        return updated;
      });

    } catch (err) {
      setError('Download failed. Please check your connection.');
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
      setProgress(0);
    }
  };

  // Delete downloaded song
  const deleteDownload = (id) => {
    setDownloadedSongs(prev => {
      const updated = prev.filter(song => song.id !== id);
      localStorage.setItem('downloadedSongs', JSON.stringify(updated));
      return updated;
    });
  };

  // Check download status
  const isDownloaded = (id) => downloadedSongs.some(song => song.id === id);

  return (
    <div className="download-page">
      <div className="download-header">
        <h1><Music size={24} /> Offline Music</h1>
        <p>Download songs to listen without internet</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="download-sections">
        {/* Current Track Section */}
        {currentTrack && (
          <section className="current-track-section">
            <h2>Now Playing</h2>
            <div className={`track-card ${isPlaying && 'playing'}`}>
              <img src={currentTrack.image} alt={currentTrack.title} />
              <div className="track-info">
                <h3>{currentTrack.title}</h3>
                <p>{currentTrack.artist}</p>
                <div className="track-actions">
                  <button 
                    className="play-button"
                    onClick={() => playTrack(currentTrack, downloadedSongs)}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  {!isDownloaded(currentTrack.id) ? (
                    <button
                      className="download-button"
                      onClick={() => downloadSong(currentTrack)}
                      disabled={downloadingId === currentTrack.id}
                    >
                      {downloadingId === currentTrack.id ? (
                        `Downloading... ${progress}%`
                      ) : (
                        <>
                          <Download size={16} /> Download
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="downloaded-badge">
                      <Check size={16} /> Downloaded
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Downloaded Songs Section */}
        <section className="downloaded-songs-section">
          <h2>Your Library ({downloadedSongs.length})</h2>
          
          {downloadedSongs.length > 0 ? (
            <div className="songs-grid">
              {downloadedSongs.map(song => (
                <div 
                  key={song.id} 
                  className={`song-card ${currentTrack?.id === song.id ? 'active' : ''}`}
                >
                  <div className="card-image" onClick={() => playTrack(song, downloadedSongs)}>
                    <img src={song.image} alt={song.title} />
                    <div className="play-overlay">
                      {currentTrack?.id === song.id && isPlaying ? (
                        <Pause size={20} />
                      ) : (
                        <Play size={20} />
                      )}
                    </div>
                  </div>
                  <div className="card-details">
                    <h3>{song.title}</h3>
                    <p>{song.artist}</p>
                    <div className="card-meta">
                      <span>{song.fileSize}</span>
                      <div className="card-actions">
                        <button 
                          className="delete-button"
                          onClick={() => deleteDownload(song.id)}
                        >
                          Delete
                        </button>
                        <button className="add-button">
                          <PlusCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No songs downloaded yet</p>
              <p>Play a song and tap the download button to save it offline</p>
            </div>
          )}
        </section>

        {/* Recently Played Section */}
        {recentlyPlayed.length > 0 && (
          <section className="recently-played-section">
            <h2>Recently Played</h2>
            <div className="songs-list">
              {recentlyPlayed.map(song => (
                <div 
                  key={song.id} 
                  className="recent-song"
                  onClick={() => playTrack(song, downloadedSongs)}
                >
                  <img src={song.image} alt={song.title} />
                  <div className="song-info">
                    <h3>{song.title}</h3>
                    <p>{song.artist}</p>
                  </div>
                  {isDownloaded(song.id) ? (
                    <span className="downloaded-badge">
                      <Check size={16} /> Downloaded
                    </span>
                  ) : (
                    <button 
                      className="download-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSong(song);
                      }}
                    >
                      <Download size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default DownloadPage;