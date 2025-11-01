# Instagram Clone - Backend

This backend is a minimal Instagram-like API built with Node.js, Express and MongoDB.

Environment

- Copy `.env.example` to `.env` and fill values.
 - The project can upload media to Cloudinary. Add the Cloudinary keys to your `.env` (or edit `.env.example`):
	 - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
 - Copy `.env.example` to `.env` and fill values (or use the provided `.env` placeholders).

Run

```
cd backend
npm install
npm run dev   # for live reload (requires nodemon)
# or
npm start
```

API base: `http://localhost:5000/api`

Key routes

- POST /api/auth/signup
- POST /api/auth/login
- GET /api/posts
- POST /api/posts (protected) [multipart/form-data: media]
- POST /api/posts/:id/like (protected)
- POST /api/posts/:id/comment (protected)
- GET /api/users/:username
- POST /api/users/follow/:id (protected)

Additional routes:

- DELETE /api/posts/:id (protected) - delete your post
- GET /api/stories - fetch active stories
- POST /api/stories (protected) - upload a story
- GET /api/chats/:userId (protected) - get or create a chat between you and another user
- GET /api/messages/:chatId (protected) - fetch messages for a chat
- POST /api/messages (protected) - send a message (server will broadcast via Socket.io)
- PUT /api/users/:id (protected) - update profile

Realtime

This server exposes a Socket.io endpoint. After the client connects, it should emit a `register` event with the current user's id so the server can deliver notifications and messages to that user:

```js
// example client-side
const socket = io('http://localhost:5000')
socket.emit('register', userId)
socket.on('notification', payload => { console.log('notification', payload) })
socket.on('message', payload => { console.log('new message', payload) })
```

Uploads are saved to `/uploads` directory and served statically.
