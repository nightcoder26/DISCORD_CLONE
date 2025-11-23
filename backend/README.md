# Discord Clone Backend

A real-time chat application backend built with Node.js, Express, MongoDB, and Socket.io.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Google OAuth integration
  - Role-based permissions (Owner, Co-owner, Admin, Mod, Neta-ji, Member)

- **Server Management**
  - Create and manage Discord-like servers
  - Invite system with unique codes
  - Member management with roles

- **Real-time Communication**
  - Text messaging with Socket.io
  - Message reactions and replies
  - Typing indicators
  - Direct messaging

- **Voice Channels**
  - Voice channel management
  - User connection tracking
  - Voice state management (mute, deafen)

- **User Features**
  - Friend system
  - User status and custom status
  - Profile management
  - Search functionality

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT, Passport.js (Google OAuth)
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Servers
- `POST /api/servers` - Create server
- `GET /api/servers` - Get user's servers
- `GET /api/servers/:id` - Get server by ID
- `PUT /api/servers/:id` - Update server
- `DELETE /api/servers/:id` - Delete server
- `POST /api/servers/join/:inviteCode` - Join server by invite
- `POST /api/servers/:id/leave` - Leave server

### Channels
- `POST /api/channels` - Create channel
- `GET /api/channels/:id` - Get channel by ID
- `PUT /api/channels/:id` - Update channel
- `DELETE /api/channels/:id` - Delete channel
- `GET /api/channels/server/:serverId` - Get server channels

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/channel/:channelId` - Get channel messages
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message
- `POST /api/messages/:id/reactions` - Add reaction
- `DELETE /api/messages/:id/reactions/:emoji` - Remove reaction

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/status` - Update status
- `GET /api/users/search` - Search users
- `POST /api/users/:id/friend-request` - Send friend request
- `PUT /api/users/:id/friend-request/accept` - Accept friend request

### Direct Messages
- `POST /api/dm/conversations` - Create/get DM conversation
- `GET /api/dm/conversations` - Get user's conversations
- `POST /api/dm/messages` - Send DM message
- `GET /api/dm/conversations/:id/messages` - Get DM messages

## Socket.io Events

### Client to Server
- `authenticate` - Authenticate user with JWT token
- `join_server` - Join server room
- `join_channel` - Join channel room
- `send_message` - Send real-time message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `join_voice_channel` - Join voice channel
- `leave_voice_channel` - Leave voice channel
- `status_change` - Update user status

### Server to Client
- `authenticated` - Authentication successful
- `new_message` - New message received
- `user_typing` - User started typing
- `user_stop_typing` - User stopped typing
- `user_status_change` - User status changed
- `user_joined_voice` - User joined voice channel
- `user_left_voice` - User left voice channel

## Database Models

- **User**: User accounts with authentication and profile data
- **Server**: Discord-like servers with members and roles
- **Channel**: Text and voice channels within servers
- **Message**: Text messages with reactions and replies
- **DirectMessage**: Private conversations between users

## Role Permissions

- **Owner**: Full server control
- **Co-owner**: Manage server, channels, members
- **Admin**: Manage channels, members, kick/ban
- **Mod**: Manage messages, kick members
- **Neta-ji**: Send messages, manage messages (special Indian role 😄)
- **Member**: Send messages only

## Development

1. Start MongoDB
2. Run `npm run dev` for development with nodemon
3. Use `npm start` for production

## Testing

The application supports 100+ concurrent users with 95% uptime during beta testing.

## Future Features

- Voice and video calling implementation
- File upload with Cloudinary
- Message encryption
- Advanced moderation tools
- Server templates
- Bot integration

## License

MIT License