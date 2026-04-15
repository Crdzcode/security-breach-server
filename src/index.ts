import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocket } from './socket/connection';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:3000';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

setupSocket(io);

httpServer.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`);
  console.log(`[server] accepting connections from ${CLIENT_ORIGIN}`);
});
