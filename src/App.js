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
      <div className="flex min-h-screen">
        <div className="flex-1 flex flex-col">
          <Routes>
            {/* <Route path="/login" element={<Login />} /> */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/createplaylist" element={<CreatePlaylist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/playlists" element={<ListOfPlaylist />} />
            <Route path="/playlistsongs" element={<PlaylistSongs />} />
          </Routes>
          <NowPlayingBar />
        </div>
        <Sidebar />
      </div>
    </BrowserRouter>
  );
}

export default App;
