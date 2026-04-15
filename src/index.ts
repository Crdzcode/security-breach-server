import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocket } from './socket/connection';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Suporta múltiplas origens separadas por vírgula:
// CLIENT_ORIGIN=https://security-breach-next.vercel.app,http://localhost:3000
const rawOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:3000';
const allowedOrigins = rawOrigin.split(',').map((o) => o.trim());

const app = express();
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

setupSocket(io);

httpServer.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`);
  console.log(`[server] accepting connections from ${allowedOrigins.join(', ')}`);
});
