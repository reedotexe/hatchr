const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const Message = require('../models/Message')
const Chat = require('../models/Chat')

// GET /api/messages/:chatId - get messages for chat
router.get('/:chatId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId }).sort({ createdAt: 1 }).populate('sender', 'username name avatar')
    res.json({ success: true, messages })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// POST /api/messages - send message (and emit via socket)
router.post('/', auth, async (req, res) => {
  try {
    const { chatId, text, to } = req.body
    if (!chatId || !text) return res.status(400).json({ success: false, message: 'Missing fields' })
    const chat = await Chat.findById(chatId)
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' })
    const message = new Message({ chatId, sender: req.userId, text })
    await message.save()
    await message.populate('sender', 'username name avatar')

    // emit to recipient(s)
    try{
      const io = req.app.get('io')
      if (io) {
        // emit to all members except sender
        chat.members.forEach(memberId => {
          if (memberId.toString() !== req.userId) {
            io.to(memberId.toString()).emit('message', { message, chatId })
          }
        })
      }
    }catch(e){ console.error('emit message failed', e) }

    res.json({ success: true, message })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router
