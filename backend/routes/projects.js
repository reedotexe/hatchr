const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../config/multer');
const { uploadToCloudinary } = require('../config/cloudinary');

// Create a new project
router.post('/', auth, upload.single('coverImage'), async (req, res) => {
    try {
        const { title, description, category } = req.body;

        let coverImage;
        if (req.file) {
            // Upload to cloudinary from buffer
            const result = await uploadToCloudinary(req.file.buffer);
            coverImage = result.secure_url;
        }

        const project = new Project({
            user: req.user._id || req.userId,
            title,
            description,
            category,
            coverImage
        });

        await project.save();
        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Failed to create project' });
    }
});

// Get all projects for the logged-in user
router.get('/my', auth, async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user._id || req.userId })
            .sort('-createdAt')
            .populate('user', 'username avatar');

        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Failed to fetch projects' });
    }
});

// Get projects by username
router.get('/user/:username', async (req, res) => {
    try {
        // First find the user by username
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Then find their projects
        const projects = await Project.find({ user: user._id })
            .sort('-createdAt')
            .populate('user', 'username avatar')
            .populate('posts');

        res.json(projects);
    } catch (error) {
        console.error('Error fetching user projects:', error);
        res.status(500).json({ message: 'Failed to fetch user projects' });
    }
});

// Get a single project with its posts
router.get('/:id', async (req, res) => {
    try {
        console.log('Fetching project with ID:', req.params.id);
        const project = await Project.findById(req.params.id)
            .populate('user', 'username avatar')
            .populate({
                path: 'posts',
                populate: [
                    {
                        path: 'user',
                        select: 'username avatar'
                    },
                    {
                        path: 'comments',
                        populate: {
                            path: 'user',
                            select: 'username avatar'
                        }
                    }
                ],
                options: { sort: '-createdAt' }
            })
            .select('+coverImage');

        if (!project) {
            console.log('Project not found');
            return res.status(404).json({ message: 'Project not found' });
        }

        console.log('Project found:', project.title);
        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ message: 'Failed to fetch project' });
    }
});



// Update a project
router.put('/:id', auth, upload.single('coverImage'), async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user._id });

        if (!project) {
            return res.status(404).json({ message: 'Project not found or unauthorized' });
        }

        const { title, description, category } = req.body;

        if (title) project.title = title;
        if (description) project.description = description;
        if (category) project.category = category;

        if (req.file) {
            const result = await uploadToCloudinary(req.file.path);
            project.coverImage = result.secure_url;
        }

        await project.save();
        res.json(project);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Failed to update project' });
    }
});

// Delete a project
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user._id });

        if (!project) {
            return res.status(404).json({ message: 'Project not found or unauthorized' });
        }

        // Delete all posts associated with this project first
        await Post.deleteMany({ project: project._id });

        // Use deleteOne instead of remove
        await Project.deleteOne({ _id: project._id });

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Failed to delete project' });
    }
});

module.exports = router;