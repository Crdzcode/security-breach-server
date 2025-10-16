const users = require('./users.js');

const flag = '0';

const {
  missionBriefings,
  innocentAbilities,
  assassinAbilities,
  copAbilities,
  vipAbilities,
  agentsData,
  agentsPlaying,
  lastNightReport
} = require('./agents-data.js');

const express = require('express');            // Framework HTTP (rotas/middlewares)
const http = require('http');                  // Cria o servidor HTTP base
const { Server } = require('socket.io');       // Servidor Socket.IO

const app = express();
const cors = require('cors');
app.use(cors());

let usersConnected = []

// Rota HTTP simples para retornar os usuários conectados
app.get('/connected-users', (req, res) => {
  res.json(usersConnected);
});

// O Socket.IO precisa de um servidor HTTP “real” por baixo.
// Ao invés de app.listen(), criamos manualmente o HTTP server:
const server = http.createServer(app);

// Instancia o Socket.IO e acopla ao HTTP server.
// CORS liberado em desenvolvimento para facilitar testes locais.
const io = new Server(server, {
  cors: { origin: '*' },
});

// (Opcional) middleware do Socket.IO para autenticar/conferir algo na conexão
// Ex.: ?token=abc no client; aqui você poderia validar.
// io.use((socket, next) => {
//   const token = socket.handshake.auth?.token || socket.handshake.query?.token;
//   // if (token !== 'seu-token') return next(new Error('unauthorized'));
//   next();
// });

// Evento raiz: sempre que um cliente conecta, ganhamos um "socket"
io.on('connection', (socket) => {
  console.log('[socket connected]', socket.id);

  socket.on('client:login', (payload) => {
    const { codename, password } = payload;

    const user = users.find((u) => u.name === codename && u.password === password);

    const alreadyConnected = usersConnected.some(u => u.name === codename);

    if (user && !alreadyConnected) {
      socket.emit('server:login_success', {
        status: 'ok',
        disableGame: flag,
        data: {
            missionBriefings,
            innocentAbilities,
            assassinAbilities,
            copAbilities,
            vipAbilities,
            agentData: agentsData[codename],
            agentsPlaying,
            lastNightReport
        }
     });

     usersConnected.push({
        name: codename, socketId: socket.id, avatar: agentsData[codename].agentImage
     });
    } else {
      socket.emit('server:login_failure', { status: 'error' });
    }
  });

  // Envia um “oi” para o cliente recém-conectado
  socket.emit('server:hello', {
    message: 'Conexão estabelecida com sucesso!',
    yourSocketId: socket.id,
  });

  /**
   * Exemplo de evento bidirecional:
   * - Cliente emite "client:ping" com um payload
   * - Servidor responde de duas formas:
   *   1) Emite um evento de volta: "server:pong"
   *   2) Chama o "ack" (callback de confirmação) se o cliente forneceu
   *
   * Observação: o "ack" é opcional — só existe se o cliente passar um callback.
   */
  socket.on('client:ping', (payload, ack) => {
    console.log('[client:ping] from', socket.id, 'payload=', payload);

    // 1) Emissão de evento de volta (sem depender do ack):
    socket.emit('server:pong', {
      receivedAt: Date.now(),
      echo: payload,
    });

    // 2) Se o cliente forneceu "ack", chamamos para confirmar processamento:
    if (typeof ack === 'function') {
      ack({ ok: true, serverTime: Date.now() });
    }
  });

  // Quando o cliente desconecta
  socket.on('disconnect', (reason) => {
    console.log('[socket disconnected]', socket.id, 'reason=', reason);
    usersConnected = usersConnected.filter(u => u.socketId !== socket.id);
  });
});

// Sobe o servidor HTTP (e, por tabela, o Socket.IO)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`HTTP+WS ouvindo em http://localhost:${PORT}`);
});
