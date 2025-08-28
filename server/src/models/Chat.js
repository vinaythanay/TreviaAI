import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user','assistant'], required: true },
  content: { type: String, default: '' },
  isImage: { type: Boolean, default: false },
  imageUrl: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });
const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('Chat', chatSchema);
