import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import { Server } from 'socket.io';
import { apiRouter } from './routes/api';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Redis
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

// MongoDB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-hub')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Socket.io
const io = new Server(server, { cors: { origin: process.env.FRONTEND_ORIGIN || '*' } });
io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);
  socket.on('chat:message', (msg) => {
    // Echo for scaffold
    socket.emit('chat:response', { id: msg.id, text: `Echo: ${msg.text}` });
  });
});

app.use('/api', apiRouter({ redis: redisClient }));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
