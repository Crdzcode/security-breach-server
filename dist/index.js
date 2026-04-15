"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const connection_1 = require("./socket/connection");
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
// Suporta múltiplas origens separadas por vírgula:
// CLIENT_ORIGIN=https://security-breach-next.vercel.app,http://localhost:3000
const rawOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:3000';
const allowedOrigins = rawOrigin.split(',').map((o) => o.trim());
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: allowedOrigins }));
app.use(express_1.default.json());
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
    },
});
(0, connection_1.setupSocket)(io);
httpServer.listen(PORT, () => {
    console.log(`[server] running on port ${PORT}`);
    console.log(`[server] accepting connections from ${allowedOrigins.join(', ')}`);
});
