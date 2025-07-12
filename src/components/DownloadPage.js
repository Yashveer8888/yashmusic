import React, { useState, useEffect, useContext } from 'react';
import { Music, ListMusic, Download, Trash2, Play, Pause } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import '../style/DownloadPage.css';

const DownloadPage = () => {
  const { downloadedSongs, deleteDownloadedSong, playDownloadedSong, isPlaying, currentTrack } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('songs');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter downloaded songs based on search query
  const filteredSongs = downloadedSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group songs by playlist if available
  const playlists = {};
  downloadedSongs.forEach(song => {
    if (song.playlist) {
      if (!playlists[song.playlist]) {
        playlists[song.playlist] = [];
      }
      playlists[song.playlist].push(song);
    }
  });

  const handlePlaySong = (song) => {
    playDownloadedSong(song);
  };

  const handleDeleteSong = (songId) => {
    if (window.confirm('Are you sure you want to delete this downloaded song?')) {
      deleteDownloadedSong(songId);
    }
  };

  return (
    <div className="download-page">
      <div className="download-header">
        <h1><Download size={24} /> Your Library</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search in downloads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="download-tabs">
        <button
          className={activeTab === 'songs' ? 'active' : ''}
          onClick={() => setActiveTab('songs')}
        >
          <Music size={16} /> Songs
        </button>
        <button
          className={activeTab === 'playlists' ? 'active' : ''}
          onClick={() => setActiveTab('playlists')}
        >
          <ListMusic size={16} /> Playlists
        </button>
      </div>

      <div className="download-content">
        {activeTab === 'songs' ? (
          <div className="songs-list">
            {filteredSongs.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Artist</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSongs.map((song, index) => (
                    <tr
                      key={song.id}
                      className={currentTrack?.id === song.id ? 'active-song' : ''}
                    >
                      <td>
                        {currentTrack?.id === song.id && isPlaying ? (
                          <Pause size={16} />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </td>
                      <td>
                        <div className="song-info">
                          <img
                            src={song.image || '/placeholder-music.png'}
                            alt={song.title}
                            className="song-thumbnail"
                            onError={(e) => {
                              e.target.src = '/placeholder-music.png';
                            }}
                          />
                          <span>{song.title}</span>
                        </div>
                      </td>
                      <td>{song.artist}</td>
                      <td>
                        <div className="song-actions">
                          <button onClick={() => handlePlaySong(song)}>
                            {currentTrack?.id === song.id && isPlaying ? (
                              <Pause size={16} />
                            ) : (
                              <Play size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteSong(song.id)}
                            className="delete-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <Download size={48} />
                <h3>No downloaded songs</h3>
                <p>Download songs to listen offline</p>
              </div>
            )}
          </div>
        ) : (
          <div className="playlists-grid">
            {Object.keys(playlists).length > 0 ? (
              Object.entries(playlists).map(([playlistName, songs]) => (
                <div key={playlistName} className="playlist-card">
                  <div className="playlist-image">
                    {songs.slice(0, 4).map((song, index) => (
                      <img
                        key={index}
                        src={song.image || '/placeholder-music.png'}
                        alt={song.title}
                        style={{
                          position: 'absolute',
                          top: index < 2 ? '0' : '50%',
                          left: index % 2 === 0 ? '0' : '50%',
                          width: '50%',
                          height: '50%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.src = '/placeholder-music.png';
                        }}
                      />
                    ))}
                  </div>
                  <div className="playlist-info">
                    <h4>{playlistName}</h4>
                    <p>{songs.length} songs</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <ListMusic size={48} />
                <h3>No downloaded playlists</h3>
                <p>Download playlists to listen offline</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadPage;