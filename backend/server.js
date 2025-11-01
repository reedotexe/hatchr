require('dotenv').config(
  { path: require('path').resolve(__dirname, './env') }
);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const chatRoutes = require('./routes/chats');
const messageRoutes = require('./routes/messages');

const app = express();
app.use(helmet());
// Allow requests from the frontend and allow credentials (cookies)
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173'
// Configure CORS for all routes
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  exposedHeaders: ['Cross-Origin-Resource-Policy']
}));

app.use(express.json());
app.use(morgan('dev'));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure static file serving with proper headers
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
app.use('/' + UPLOAD_DIR, (req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': FRONTEND_ORIGIN,
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cross-Origin-Embedder-Policy': 'credentialless'
  });
  next();
}, express.static(path.join(__dirname, UPLOAD_DIR)));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: FRONTEND_ORIGIN, methods: ['GET', 'POST'], credentials: true } });

// simple map of userId -> socket.id (supports single socket per user for simplicity)
const userSockets = new Map();

io.on('connection', (socket) => {
  // client should emit 'register' with their userId after connecting
  socket.on('register', (userId) => {
    try {
      userSockets.set(userId, socket.id);
      socket.join(userId); // join room for direct messages/notifications
    } catch (e) { console.error(e) }
  });

  socket.on('disconnect', () => {
    // remove mapping if exists
    for (const [userId, sid] of userSockets.entries()) {
      if (sid === socket.id) userSockets.delete(userId)
    }
  });
});

// make io accessible in routes via app.get('io')
app.set('io', io);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/instagram_clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Mongo connection error', err);
});
