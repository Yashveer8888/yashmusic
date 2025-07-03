import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SearchPage from './components/SearchPage';
import LibraryPage from './components/LibraryPage';
import NowPlayingBar from './components/NowPlayingBar';
import Sidebar from './components/Sidebar';
// import Login from './components/Login';
import CreatePlaylist from './components/CreatePlaylist';
import Profile from './components/Profile';
import ListOfPlaylist from './components/ListOfPlaylist';
import PlaylistSongs from './components/PlaylistSong';


function App() {
  return (
    <BrowserRouter>
      <div >
        <div >
          <Routes>
            {/* <Route path="/login" element={<Login />} /> */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/create-playlist" element={<CreatePlaylist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/playlists" element={<ListOfPlaylist />} />
            <Route path="/playlist-songs" element={<PlaylistSongs />} />
          </Routes>
        </div>
        <div>
        <NowPlayingBar />
        </div>
        <div>
        <Sidebar />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;