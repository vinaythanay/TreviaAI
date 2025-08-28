import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import CommunityImage from '../models/CommunityImage.js';
import { generateText } from '../lib/ai.js';
import fetch from 'node-fetch';
const router = Router();

router.post('/:mode', auth, async (req, res) => {
  try {
    const { mode } = req.params;
    const { chatId, prompt, isPublished } = req.body;
    if (!chatId || !prompt) return res.json({ success:false, message:'chatId and prompt required' });
    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) return res.json({ success:false, message:'Chat not found' });

    const cost = mode === 'image' ? 2 : 1;
    const user = await User.findById(req.user._id);
    if (user.credits < cost) return res.json({ success:false, message:'Not enough credits' });

    chat.messages.push({ role:'user', content: prompt, isImage: false });
    await chat.save();

    if (mode === 'text') {
      const text = await generateText(prompt);
      chat.title = chat.title === 'New Chat' ? (prompt.slice(0,40) || 'New Chat') : chat.title;
      chat.messages.push({ role:'assistant', content: text, isImage:false });
      await chat.save();
      user.credits -= 1; await user.save();
      return res.json({ success:true, reply: { role:'assistant', content:text, isImage:false, timestamp: Date.now() } });
    } else if (mode === 'image') {
      const encoded = encodeURIComponent(prompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encoded}`;
      try { await fetch(imageUrl, { method:'GET' }); } catch {}
      chat.title = chat.title === 'New Chat' ? (prompt.slice(0,40) || 'New Chat') : chat.title;
      chat.messages.push({ role:'assistant', content:'', isImage:true, imageUrl });
      await chat.save();
      if (isPublished) await CommunityImage.create({ userId: user._id, prompt, url: imageUrl });
      user.credits -= 2; await user.save();
      return res.json({ success:true, reply: { role:'assistant', content:'', isImage:true, imageUrl, timestamp: Date.now() } });
    } else {
      return res.json({ success:false, message:'Invalid mode' });
    }
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

export default router;
