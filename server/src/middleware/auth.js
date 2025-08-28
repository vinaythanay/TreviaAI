import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export async function auth(req, res, next) {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ success:false, message:'No token' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ success:false, message:'User not found' });
    req.user = user;
    next();
  } catch (err) { return res.status(401).json({ success:false, message:'Invalid token' }); }
}
