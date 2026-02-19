import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';

const PORT = 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4200", "http://127.0.0.1:4200"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
  }
});

// Registrar eventos de Socket.io
io.on('connection', (socket) => {
  console.log('🔌 Usuario conectado vía WebSocket:', socket.id);

  // Unirse a una sala específica de experimento/lobby
  socket.on('join_experiment', (id_experiment) => {
    const room = `experiment_${id_experiment}`;
    socket.join(room);
    console.log(`📍 Socket ${socket.id} unido a la sala: ${room}`);

    // Notificar al docente que hay un nuevo participante (opcional por ahora)
    socket.to(room).emit('participant_joined', { socketId: socket.id });
  });

  // Evento: Iniciar Experiencia (emitido por el docente)
  socket.on('start_experience', (id_experiment) => {
    const room = `experiment_${id_experiment}`;
    console.log(`🚀 Iniciando experiencia ${id_experiment} para todos en la sala ${room}`);

    // Emitir a todos en la sala (incluyendo alumnos)
    io.to(room).emit('experience_started', { id_experiment });
  });

  // Evento: Actualización de Lobby (miembros, equipos, ready state)
  socket.on('lobby_update', (id_experiment) => {
    const room = `experiment_${id_experiment}`;
    console.log(`🔄 Actualización de lobby detectada en sala ${room}`);
    // Notificar a todos los demás en la sala que deben recargar sus datos
    socket.to(room).emit('lobby_refresh');
  });

  socket.on('disconnect', () => {
    console.log('❌ Usuario desconectado de WebSocket');
  });
});

server.listen(PORT, () => {
  console.log(`WRIST Backend Server (con WebSockets) corriendo en puerto ${PORT}`);
});
