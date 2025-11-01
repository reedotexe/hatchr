const express = require('express')
const router = express.Router()
const multer = require('multer')
const streamifier = require('streamifier')
const cloudinary = require('../config/cloudinary')

const auth = require('../middleware/auth')
const Story = require('../models/Story')

const storage = multer.memoryStorage()
const upload = multer({ storage })

// GET /api/stories - active stories
router.get('/', async (req, res) => {
  try {
    const now = new Date()
    const stories = await Story.find({ expiresAt: { $gt: now } }).sort({ createdAt: -1 }).populate('user', 'username name avatar')

    // If Cloudinary is configured, migrate local story files to Cloudinary (limited per request)
    const cloudConfigured = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_API_KEY.includes('your_')
    if (cloudConfigured) {
      const fs = require('fs')
      const path = require('path')
      let migrated = 0
      const MAX_MIGRATE = 5
      for (const story of stories) {
        if (migrated >= MAX_MIGRATE) break
        if (story.mediaUrl && story.mediaUrl.startsWith('/')) {
          const localPath = path.join(__dirname, '..', story.mediaUrl.replace(/^\//, ''))
          if (fs.existsSync(localPath)) {
            try {
              const result = await cloudinary.uploader.upload(localPath, { folder: 'instagram_clone/stories/migrated' })
              story.mediaUrl = result.secure_url
              await story.save()
              migrated++
            } catch (err) {
              console.error('Failed to migrate story to Cloudinary', story._id, err.message || err)
            }
          }
        }
      }
    }

    res.json({ success: true, stories })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// POST /api/stories - create story
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No media uploaded' })
    const buffer = req.file.buffer
    const cloudConfigured = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_API_KEY.includes('your_')
    let mediaUrl
    if (cloudConfigured) {
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'instagram_clone/stories' }, (error, result) => {
            if (result) resolve(result)
            else reject(error)
          })
          streamifier.createReadStream(buffer).pipe(stream)
        })
      }
      try{
        const result = await streamUpload(buffer)
        mediaUrl = result.secure_url
      }catch(err){
        // fallback to local save if Cloudinary upload fails
        console.error('Cloudinary upload failed for story, falling back to local save', err && err.message ? err.message : err)
        try{
          const fs = require('fs')
          const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads'
          const dir = path.join(__dirname, '..', UPLOAD_DIR)
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
          const filename = unique + path.extname(req.file.originalname || '.jpg')
          const filepath = path.join(dir, filename)
          fs.writeFileSync(filepath, req.file.buffer)
          mediaUrl = `/${UPLOAD_DIR}/${filename}`
        }catch(err2){
          console.error('Local save failed for story after Cloudinary failure', err2)
          return res.status(500).json({ success:false, message:'Failed to save story media' })
        }
      }
    } else {
      // fallback to local save
      try{
        const fs = require('fs')
        const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads'
        const dir = path.join(__dirname, '..', UPLOAD_DIR)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const filename = unique + path.extname(req.file.originalname || '.jpg')
        const filepath = path.join(dir, filename)
        fs.writeFileSync(filepath, req.file.buffer)
        mediaUrl = `/${UPLOAD_DIR}/${filename}`
      }catch(err){ console.error('Local save failed', err); return res.status(500).json({ success:false, message:'Failed to save story locally' }) }
    }
    const expiresAt = new Date(Date.now() + 24*60*60*1000)
    const story = new Story({ user: req.userId, mediaUrl, expiresAt })
    await story.save()
    res.json({ success: true, story })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router
