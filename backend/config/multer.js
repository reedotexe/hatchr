const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to validate uploads
const fileFilter = (req, file, cb) => {
  // Accept images and videos only
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image or video! Please upload only images or videos.'), false);
  }
};

// Configure upload limits
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB limit
  files: 1 // Maximum one file
};

// Create multer instance with configuration
const upload = multer({
  storage,
  fileFilter,
  limits
});

module.exports = upload;