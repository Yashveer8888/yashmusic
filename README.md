# 🎵 YashMusic - Full-Stack Music Streaming Application

A comprehensive, Spotify-like music streaming application built with React, Node.js, and Firebase. Features a sleek dark UI, real-time music playback, playlist management, and social features.

## ✨ Features

### 🎧 Music Streaming
- **Global Music Player**: Fixed bottom player with full playback controls
- **Real-time Playback**: Play/pause, skip, seek, shuffle, repeat modes
- **Volume Control**: Adjustable volume with mute/unmute
- **Progress Tracking**: Real-time progress bar with seek functionality
- **Queue Management**: Add/remove songs, reorder playlist
- **Now Playing Screen**: Expanded view with lyrics support

### 🔐 Authentication & User Management
- **Firebase Authentication**: Google OAuth and email/password login
- **Secure Routes**: Protected routes with authentication middleware
- **User Profiles**: Customizable profiles with bio, location, website
- **Password Reset**: Email-based password recovery
- **Account Management**: Update profile, delete account

### 🎵 Music Library
- **Song Management**: Upload, edit, delete songs (admin only)
- **Search & Filter**: Real-time search by title, artist, album, genre
- **Categories**: Featured playlists, trending songs, new releases
- **Liked Songs**: Like/unlike songs with persistent storage
- **Listening History**: Track and manage listening history

### 📝 Playlist Management
- **Create Playlists**: Public and private playlists
- **Add/Remove Songs**: Drag-and-drop song management
- **Playlist Sharing**: Share public playlists with other users
- **Duplicate Playlists**: Copy existing playlists
- **Playlist Analytics**: View playlist statistics

### 🎨 User Interface
- **Responsive Design**: Mobile-first responsive layout
- **Dark Theme**: Sleek dark UI with accent colors
- **Animations**: Smooth transitions and micro-interactions
- **Loading States**: Skeleton loaders and loading indicators
- **Toast Notifications**: User feedback and error handling

### 🔄 Real-time Features
- **Socket.IO Integration**: Real-time updates across devices
- **Live Sync**: Playback synchronization between devices
- **Real-time Updates**: Instant playlist and like updates
- **Live Notifications**: Real-time user notifications

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern React with hooks and functional components
- **TailwindCSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **React Router**: Client-side routing
- **Framer Motion**: Animation library
- **React Hot Toast**: Toast notifications
- **Lucide React**: Icon library

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **Firebase Admin**: Backend Firebase integration
- **Socket.IO**: Real-time bidirectional communication
- **Multer**: File upload handling
- **Cloudinary**: Cloud media management
- **Express Validator**: Input validation
- **Helmet**: Security middleware

### Database & Storage
- **Firebase Firestore**: NoSQL cloud database
- **Firebase Authentication**: User authentication
- **Cloudinary**: Audio and image storage
- **Firebase Storage**: Alternative file storage

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Nodemon**: Development server
- **PostCSS**: CSS processing

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project
- Cloudinary account (optional)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/yashmusic.git
cd yashmusic
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your configuration
nano .env

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:5000`

### 4. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Google and Email/Password)
3. Create a Firestore database
4. Generate a service account key
5. Update your `.env` file with Firebase credentials

### 5. Environment Variables

#### Frontend (.env)
```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_URL=http://localhost:5000/api
```

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 📁 Project Structure

```
yashmusic/
├── public/                 # Static files
├── src/                   # Frontend source code
│   ├── components/        # React components
│   ├── context/          # React context providers
│   ├── store/            # Zustand stores
│   ├── firebaseConfig.js # Firebase configuration
│   ├── App.js           # Main app component
│   └── index.js         # App entry point
├── backend/              # Backend source code
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── config/          # Configuration files
│   └── server.js        # Express server
├── package.json         # Frontend dependencies
└── README.md           # Project documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `DELETE /api/auth/account` - Delete user account

### Songs
- `GET /api/songs` - Get all songs with pagination
- `GET /api/songs/:id` - Get song by ID
- `POST /api/songs` - Upload new song (admin only)
- `PUT /api/songs/:id` - Update song (admin only)
- `DELETE /api/songs/:id` - Delete song (admin only)
- `POST /api/songs/:id/like` - Like/unlike song
- `GET /api/songs/trending/trending` - Get trending songs
- `GET /api/songs/genre/:genre` - Get songs by genre

### Playlists
- `GET /api/playlists` - Get user's playlists
- `GET /api/playlists/:id` - Get playlist by ID
- `POST /api/playlists` - Create new playlist
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:id/songs` - Add song to playlist
- `DELETE /api/playlists/:id/songs/:songId` - Remove song from playlist
- `PUT /api/playlists/:id/reorder` - Reorder playlist songs
- `POST /api/playlists/:id/like` - Like/unlike playlist
- `GET /api/playlists/public/explore` - Get public playlists
- `POST /api/playlists/:id/duplicate` - Duplicate playlist

### Users
- `GET /api/users/liked-songs` - Get user's liked songs
- `GET /api/users/playlists` - Get user's playlists
- `GET /api/users/history` - Get listening history
- `POST /api/users/history` - Add song to history
- `DELETE /api/users/history` - Clear listening history
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/favorite-genres` - Get favorite genres
- `GET /api/users/favorite-artists` - Get favorite artists
- `GET /api/users/recommendations` - Get personalized recommendations
- `PUT /api/users/preferences` - Update user preferences
- `GET /api/users/preferences` - Get user preferences

## 🎨 Customization

### Styling
The app uses TailwindCSS with custom CSS variables. You can customize the theme by modifying:

- `src/index.css` - Global styles and CSS variables
- `tailwind.config.js` - TailwindCSS configuration
- Component-specific styles in individual components

### Adding New Features
1. Create new components in `src/components/`
2. Add routes in `src/App.js`
3. Create API endpoints in `backend/routes/`
4. Update Zustand store if needed
5. Add Firebase security rules

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables
4. Deploy

### Environment Variables for Production
- Update `FRONTEND_URL` to your production domain
- Set `NODE_ENV=production`
- Configure production Firebase project
- Set up Cloudinary for production

## 🔒 Security Features

- **Authentication Middleware**: Protected API routes
- **Input Validation**: Express-validator for all inputs
- **Rate Limiting**: Prevent abuse with express-rate-limit
- **CORS Configuration**: Secure cross-origin requests
- **Helmet**: Security headers
- **File Upload Validation**: Secure file uploads
- **Firebase Security Rules**: Database-level security

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🧪 Testing

```bash
# Frontend tests
npm test

# Backend tests (when implemented)
cd backend && npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) for backend services
- [TailwindCSS](https://tailwindcss.com/) for styling
- [React](https://reactjs.org/) for the frontend framework
- [Express.js](https://expressjs.com/) for the backend framework
- [Socket.IO](https://socket.io/) for real-time features

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

---

**Made with ❤️ by the YashMusic Team**
