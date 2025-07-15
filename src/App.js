import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SearchPage from './components/SearchPage';
import LibraryPage from './components/LibraryPage';
import NowPlayingBar from './components/NowPlayingBar';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import CreatePlaylist from './components/CreatePlaylist';
import Profile from './components/Profile';
import ListOfPlaylist from './components/ListOfPlaylist';
import PlaylistSongs from './components/PlaylistSong';
import DownloadPage from './components/DownloadPage';
import UpdatePlaylist from './components/UpdatePlaylist';
import './App.css'; // Import the CSS file

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="app-top-section">
          <div className="app-main-content">
            <div className="route-container">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/create-playlist" element={<CreatePlaylist />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/playlists" element={<ListOfPlaylist />} />
                <Route path="/playlist-songs" element={<PlaylistSongs />} />
                <Route path="/download" element={<DownloadPage />} />
                <Route path="/updateplaylist" element={<UpdatePlaylist />} />
              </Routes>
            </div>
          </div>
        </div>
        
        <div className="app-now-playing">
          <NowPlayingBar />
        </div>
        <div className="app-sidebar">
          <Sidebar />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;