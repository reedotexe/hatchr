const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const Chat = require('../models/Chat')
const User = require('../models/User')

// GET /api/chats/:userId - get or create chat between current user and userId
router.get('/:userId', auth, async (req, res) => {
  try {
    const otherId = req.params.userId
    const me = req.userId
    // find existing chat with both members
    let chat = await Chat.findOne({ members: { $all: [me, otherId] } })
    if (!chat) {
      chat = new Chat({ members: [me, otherId] })
      await chat.save()
    }
    await chat.populate('members', 'username name avatar')
    res.json({ success: true, chat })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router
