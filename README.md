# Discord Clone - Full Stack MERN Application

This is a comprehensive Discord clone built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring real-time messaging, server management, and voice channel support.

## 🚀 Features

### Authentication & User Management
- JWT-based authentication
- Google OAuth integration
- Email/password registration and login
- User profiles with avatars
- Online/offline status tracking

### Server & Channel Management
- Create and manage Discord-like servers
- Text and voice channels
- Server templates (Gaming, School, Work, Community, etc.)
- Role-based permissions (Owner, Co-owner, Admin, Mod, NETA ji, Member)
- Server icons and descriptions

### Real-Time Messaging
- Instant messaging with Socket.io
- Message reactions and emoji support
- Message editing and deletion
- Typing indicators
- Message history and pagination
- File upload support (future feature)

### Direct Messages
- Private conversations between users
- User status indicators
- Voice/video call UI (future implementation)

### Voice Features (Planned)
- Voice channel support
- Push-to-talk functionality
- Voice settings and controls

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Passport.js** for Google OAuth
- **bcrypt** for password hashing
- **helmet** and **cors** for security
- **rate-limiting** for API protection

### Frontend
- **React 18** with hooks and functional components
- **Redux Toolkit** for state management
- **React Router** for navigation
- **styled-components** for component styling
- **Socket.io Client** for real-time features
- **axios** for API requests
- **react-hot-toast** for notifications
- **react-hook-form** for form handling
- **react-icons** for UI icons

## 📁 Project Structure

```
DISCORD_CLONE/
├── backend/
│   ├── controllers/          # API route handlers
│   ├── db/                  # Database connection
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routes
│   ├── middleware/          # Custom middleware
│   ├── utils/               # Utility functions
│   └── server.js            # Server entry point
└── frontend/
    ├── public/              # Static files
    ├── src/
    │   ├── components/      # React components
    │   │   ├── auth/        # Authentication components
    │   │   ├── chat/        # Chat and messaging
    │   │   ├── layout/      # Layout components
    │   │   └── modals/      # Modal components
    │   ├── store/           # Redux store and slices
    │   ├── services/        # API and socket services
    │   ├── styles/          # Global styles
    │   └── App.js           # Main app component
    └── package.json
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:3000
```

4. Start the backend server:
```bash
npm run dev
```

The backend server will start on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. Start the frontend development server:
```bash
npm start
```

The frontend application will start on http://localhost:3000

## 🔧 Development Scripts

### Backend Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🎯 Usage

1. **Registration**: Create an account using email/password or Google OAuth
2. **Login**: Sign in to access the main application
3. **Server Creation**: Create a new server using various templates
4. **Channels**: Navigate between text and voice channels
5. **Messaging**: Send messages, add reactions, edit/delete messages
6. **Direct Messages**: Have private conversations with other users
7. **Voice Channels**: Join voice channels (UI ready, WebRTC to be implemented)

## 🔐 Authentication Flow

1. User registers or logs in
2. Server generates JWT token
3. Token stored in localStorage
4. Token sent with API requests via axios interceptors
5. Socket.io connection authenticated with token
6. Real-time features activated for authenticated users

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth

### Servers
- `GET /api/servers` - Get user servers
- `POST /api/servers` - Create new server
- `PUT /api/servers/:id` - Update server
- `DELETE /api/servers/:id` - Delete server

### Channels
- `GET /api/channels/:serverId` - Get server channels
- `POST /api/channels` - Create channel
- `PUT /api/channels/:id` - Update channel
- `DELETE /api/channels/:id` - Delete channel

### Messages
- `GET /api/messages/:channelId` - Get channel messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message

### Direct Messages
- `GET /api/dm/:userId` - Get DM conversation
- `POST /api/dm` - Send direct message

## 🎨 UI/UX Features

- Discord-like dark theme
- Responsive design for mobile and desktop
- Smooth animations and transitions
- Toast notifications for user feedback
- Loading states and error handling
- Typing indicators
- Online status indicators
- Server and user avatars
- Message reactions with emoji
- Channel and server navigation
- Modal dialogs for server creation

## 🔮 Future Enhancements

### Voice & Video
- WebRTC integration for voice channels
- Video calling support
- Screen sharing
- Push-to-talk functionality

### Advanced Features
- File and image sharing
- Message search functionality
- User roles and permissions management
- Server discovery and joining
- Message threads and replies
- Custom emoji support
- Bot integration support
- Mobile app development

### Performance
- Message pagination and infinite scroll
- Image optimization and CDN integration
- Database indexing optimization
- Redis caching for sessions
- WebSocket clustering for scalability

## 🤝 Contributing

This is a learning project showcasing full-stack development skills. Contributions are welcome for educational purposes.

## 📝 License

This project is for educational and portfolio purposes.

## 👨‍💻 Developer

Built with ❤️ as a comprehensive MERN stack learning project demonstrating:
- Modern React development with hooks and Redux Toolkit
- Express.js API development with MongoDB
- Real-time communication with Socket.io
- Authentication and authorization
- UI/UX design principles
- Full-stack application architecture