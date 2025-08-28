import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import CommunityImage from '../models/CommunityImage.js';
import { signToken } from '../lib/utils.js';
const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.json({ success:false, message:'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.json({ success:false, message:'Email already in use' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    const token = signToken(user);
    res.json({ success:true, token });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success:false, message:'Invalid email or password' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.json({ success:false, message:'Invalid email or password' });
    const token = signToken(user);
    res.json({ success:true, token });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

router.get('/data', auth, async (req, res) => {
  const u = req.user;
  res.json({ success:true, user: { id:u._id, name:u.name, email:u.email, credits:u.credits } });
});

router.get('/published-images', async (_req, res) => {
  const images = await CommunityImage.find({}).sort({ createdAt: -1 }).limit(100).populate('userId', 'name');
  res.json({ success:true, images: images.map(img => ({
    id: img._id, url: img.url, prompt: img.prompt, userName: img.userId?.name || 'User', createdAt: img.createdAt
  })) });
});

export default router;
