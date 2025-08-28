import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import Chat from '../models/Chat.js';

const router = Router();

/**
 * Create a new chat
 */
router.post('/create', auth, async (req, res) => {
  try {
    const chat = await Chat.create({
      userId: req.user._id,
      title: 'New Chat',
      messages: []
    });

    res.json({
      success: true,
      chat: {
        id: chat._id,
        title: chat.title,
        messages: [],
        createdAt: chat.createdAt
      }
    });
  } catch (err) {
    console.error("Error creating chat:", err);
    res.status(500).json({ success: false, message: "Server error creating chat" });
  }
});

/**
 * Get all chats for a user
 */
router.get('/get', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      chats: chats.map(ch => ({
        id: ch._id,
        title: ch.title,
        messages: ch.messages.map(m => ({
          role: m.role,
          content: m.content,
          isImage: m.isImage,
          imageUrl: m.imageUrl,
          timestamp: m.timestamp
        })),
        createdAt: ch.createdAt
      }))
    });
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ success: false, message: "Server error fetching chats" });
  }
});

/**
 * Delete a chat
 */
router.post('/delete', auth, async (req, res) => {
  try {
    const { chatId } = req.body;

    await Chat.deleteOne({ _id: chatId, userId: req.user._id });

    res.json({ success: true, message: 'Chat deleted' });
  } catch (err) {
    console.error("Error deleting chat:", err);
    res.status(500).json({ success: false, message: "Server error deleting chat" });
  }
});

export default router;
