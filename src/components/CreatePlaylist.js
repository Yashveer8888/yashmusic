import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AddPlaylist = () => {
  const { usermail, setPlaylistname,palylistname } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddPlaylist = async () => {
    if (!palylistname.trim()) {
      setError('Please enter a valid playlist name.');
      return;
    }

    try {
      // const token = await usermail.getIdToken();

      const response = await axios.post(
        'http://localhost:5000/api/music/create-playlist',
        {
          usermail: usermail,
          playlistName: palylistname.trim(),
        },
        {
          headers: {
            // Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(response.data.message);
      setPlaylistname(''); 
      navigator("/library"); 
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="add-playlist-container">
      <h2>Add Playlist</h2>

      <input
        type="text"
        placeholder="Enter playlist name"
        value={palylistname}
        onChange={(e) => setPlaylistname(e.target.value)}
      />

      <button onClick={handleAddPlaylist}>Create Playlist</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default AddPlaylist;
