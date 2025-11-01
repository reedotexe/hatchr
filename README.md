# Hatchr - Social Media Platform

A full-stack social media platform built with React, Node.js, Express, and MongoDB.

## Project Structure

### Backend (`/backend`)

```
backend/
├── config/                 # Configuration files
│   ├── cloudinary.js      # Cloudinary integration for image uploads
│   └── multer.js          # File upload middleware configuration
│
├── middleware/
│   └── auth.js            # JWT authentication middleware
│
├── models/                 # MongoDB/Mongoose models
│   ├── Chat.js            # Chat model for messaging
│   ├── Comment.js         # Comment model for posts
│   ├── Message.js         # Message model for chat system
│   ├── Post.js            # Post model for user posts
│   ├── Project.js         # Project model for user projects
│   ├── Story.js          # Story model for user stories
│   └── User.js            # User model for authentication
│
├── routes/                 # API route handlers
│   ├── auth.js            # Authentication routes (login, signup)
│   ├── chats.js           # Chat related routes
│   ├── messages.js        # Message related routes
│   ├── posts.js           # Post CRUD operations
│   ├── projects.js        # Project management routes
│   ├── stories.js         # Story related routes
│   └── users.js           # User profile routes
│
├── uploads/               # Local file upload directory (fallback)
├── utils/                 # Utility functions
│   └── email.js           # Email service utilities
│
├── server.js              # Main application entry point
└── package.json           # Project dependencies and scripts
```

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ChatBox.jsx           # Chat interface
│   │   ├── EditProfileModal.jsx  # Profile editing modal
│   │   ├── ImageUpload.jsx       # Image upload component
│   │   ├── Navbar.jsx            # Navigation bar
│   │   ├── Notifications.jsx     # Notifications component
│   │   ├── PostCard.jsx          # Post display component
│   │   ├── PostModal.jsx         # Post creation/editing modal
│   │   ├── PostView.jsx          # Detailed post view
│   │   ├── ProfileHeader.jsx     # Profile header component
│   │   ├── ProjectGrid.jsx       # Project display grid
│   │   ├── ProjectModal.jsx      # Project creation modal
│   │   ├── ProjectTimeline.jsx   # Project timeline view
│   │   ├── ProtectedRoute.jsx    # Route protection wrapper
│   │   ├── StatusSelector.jsx    # Status selection component
│   │   └── VerificationModal.jsx # Email verification modal
│   │
│   ├── hooks/            # Custom React hooks
│   │   └── useImage.js   # Image loading and management hook
│   │
│   ├── lib/             # Utility libraries
│   │   ├── api.js       # API client configuration
│   │   └── media.js     # Media handling utilities
│   │
│   ├── pages/           # Main application pages
│   │   ├── Feed.jsx     # Main feed page
│   │   ├── Login.jsx    # Login page
│   │   ├── Profile.jsx  # User profile page
│   │   ├── Project.jsx  # Project detail page
│   │   └── Signup.jsx   # Registration page
│   │
│   ├── store/          # State management
│   │   ├── useAuth.js  # Authentication state
│   │   └── useTheme.js # Theme management
│   │
│   ├── utils/          # Utility functions
│   │   ├── api.js      # API utilities
│   │   └── auth.js     # Authentication utilities
│   │
│   ├── index.css       # Global styles
│   └── main.jsx        # Application entry point
│
├── index.html          # HTML entry point
├── package.json        # Project dependencies and scripts
├── postcss.config.cjs  # PostCSS configuration
└── tailwind.config.cjs # Tailwind CSS configuration
```

## Key Features

- **Authentication**: JWT-based authentication system
- **Posts**: Create, read, update, and delete posts with media uploads
- **Projects**: Project management with timeline and posts
- **Comments**: Comment system for posts
- **Real-time Chat**: Direct messaging between users
- **Media Handling**: Image upload with Cloudinary integration
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Technology Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Cloudinary for media storage

### Frontend
- React.js
- Zustand for state management
- Tailwind CSS for styling
- Axios for API requests
- React Router for navigation

## Setup and Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

4. Set up environment variables:
   - Backend `.env`:
     ```
     PORT=5000
     MONGODB_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     CLOUDINARY_CLOUD_NAME=your_cloudinary_name
     CLOUDINARY_API_KEY=your_cloudinary_key
     CLOUDINARY_API_SECRET=your_cloudinary_secret
     ```
   - Frontend `.env`:
     ```
     VITE_API_URL=http://localhost:5000
     ```

5. Start the development servers:
   - Backend: `npm run dev`
   - Frontend: `npm run dev`

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### Posts
- GET `/api/posts` - Get all posts
- POST `/api/posts` - Create new post
- POST `/api/posts/:id/comment` - Add comment
- POST `/api/posts/:id/upvote` - Upvote post
- POST `/api/posts/:id/downvote` - Downvote post
- DELETE `/api/posts/:id` - Delete post

### Projects
- GET `/api/projects` - Get all projects
- POST `/api/projects` - Create new project
- GET `/api/projects/:id` - Get project details
- PUT `/api/projects/:id` - Update project
- DELETE `/api/projects/:id` - Delete project

### Users
- GET `/api/users/:username` - Get user profile
- PUT `/api/users/profile` - Update profile
- GET `/api/users/:username/projects` - Get user projects

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.