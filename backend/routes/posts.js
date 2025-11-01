const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary } = require('../config/cloudinary');
const upload = require('../config/multer');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Project = require('../models/Project');

// Local upload directory for fallback
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const ensureUploadDir = () => {
  const dir = path.join(__dirname, '..', UPLOAD_DIR);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// GET /api/posts - list recent posts
router.get('/', async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .lean()
      .populate('user', 'username name avatar')
      .populate({
        path: 'project',
        populate: { path: 'posts' }
      })
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username name avatar' }
      });

    // Process each post to add vote status
    const processedPosts = posts.map(post => ({
      ...post,
      hasUpvoted: userId ? post.upvotes.some(id => String(id) === String(userId)) : false,
      hasDownvoted: userId ? post.downvotes.some(id => String(id) === String(userId)) : false,
      upvoteCount: post.upvotes.length,
      downvoteCount: post.downvotes.length
    }));

    res.json({ success: true, posts: processedPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new post
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    const { caption, projectId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Media file is required'
      });
    }

    let mediaUrl;
    try {
      const result = await uploadToCloudinary(req.file.buffer);
      mediaUrl = result.secure_url;
    } catch (err) {
      console.error('Cloudinary upload failed:', err);
      // Fallback to local storage
      try {
        ensureUploadDir();
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = unique + path.extname(req.file.originalname || '.jpg');
        const filepath = path.join(__dirname, '..', UPLOAD_DIR, filename);
        fs.writeFileSync(filepath, req.file.buffer);
        mediaUrl = `/${UPLOAD_DIR}/${filename}`;
      } catch (err2) {
        console.error('Local save failed:', err2);
        return res.status(500).json({
          success: false,
          message: 'Failed to save media'
        });
      }
    }

    const post = new Post({
      caption,
      mediaUrl,
      user: req.userId,
      project: projectId,
      contentType: req.file.mimetype
    });

    await post.save();

    // Update project's posts array
    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        project.posts.push(post._id);
        await project.save();
      }
    }

    await post.populate('user', 'username name avatar');
    await post.populate('project');

    res.status(201).json({
      success: true,
      post: {
        ...post.toObject(),
        hasUpvoted: false,
        hasDownvoted: false,
        upvoteCount: 0,
        downvoteCount: 0
      }
    });
  } catch (err) {
    console.error('Post creation error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create post'
    });
  }
});

// Add comment to a post
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = new Comment({
      text,
      user: req.userId,
      post: post._id
    });

    await comment.save();
    await comment.populate('user', 'username name avatar');

    post.comments.push(comment._id);
    await post.save();

    res.json({
      success: true,
      comment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
});

// Upvote a post
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const hasUpvoted = post.upvotes.includes(req.userId);
    const hasDownvoted = post.downvotes.includes(req.userId);

    if (hasUpvoted) {
      // Remove upvote
      post.upvotes = post.upvotes.filter(id => id.toString() !== req.userId);
    } else {
      // Add upvote and remove downvote if exists
      post.upvotes.push(req.userId);
      if (hasDownvoted) {
        post.downvotes = post.downvotes.filter(id => id.toString() !== req.userId);
      }
    }

    await post.save();
    res.json({
      success: true,
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
      hasUpvoted: !hasUpvoted,
      hasDownvoted: false
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update vote'
    });
  }
});

// Downvote a post
router.post('/:id/downvote', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const hasDownvoted = post.downvotes.includes(req.userId);
    const hasUpvoted = post.upvotes.includes(req.userId);

    if (hasDownvoted) {
      // Remove downvote
      post.downvotes = post.downvotes.filter(id => id.toString() !== req.userId);
    } else {
      // Add downvote and remove upvote if exists
      post.downvotes.push(req.userId);
      if (hasUpvoted) {
        post.upvotes = post.upvotes.filter(id => id.toString() !== req.userId);
      }
    }

    await post.save();
    res.json({
      success: true,
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
      hasUpvoted: false,
      hasDownvoted: !hasDownvoted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update vote'
    });
  }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: post._id });

    // Remove post reference from project
    if (post.project) {
      const project = await Project.findById(post.project);
      if (project) {
        project.posts = project.posts.filter(id => id.toString() !== post._id.toString());
        await project.save();
      }
    }

    await post.deleteOne();
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
});

module.exports = router;