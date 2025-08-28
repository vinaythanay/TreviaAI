import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js';
import messageRoutes from './routes/message.js';
import creditRoutes from './routes/credit.js';
import { webhookHandler } from './routes/stripe.js';
import bodyParser from 'body-parser';

const app = express();

app.use('/api/ai/astripe', bodyParser.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));

const origins = (process.env.CLIENT_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origins.length === 0 || origins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true
}));

app.use(morgan('dev'));

const MONGO = process.env.MONGO_URI;
if (!MONGO) throw new Error('MONGO_URI missing');
mongoose.connect(MONGO).then(()=>console.log('Mongo connected')).catch(err=>{
  console.error('Mongo error', err); process.exit(1);
});

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/credit', creditRoutes);
app.post('/api/ai/astripe', webhookHandler);

app.get('/', (_,res)=>res.json({ok:true, name:'Trevia AI API'}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
