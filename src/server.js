import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { initSocket } from './socket.js';
import { seedAdmins } from './config/admins.js';

const PORT = 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4200", "http://127.0.0.1:4200"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
  }
});

// Registrar instancia global para que controllers puedan emitir eventos
initSocket(io);

// Registrar eventos de Socket.io
io.on('connection', (socket) => {
  console.log('🔌 Usuario conectado vía WebSocket:', socket.id);

  // Unirse a una sala específica de experimento/lobby
  socket.on('join_experiment', (id_experiment) => {
    const room = `experiment_${id_experiment}`;
    socket.join(room);
    console.log(`📍 Socket ${socket.id} unido a la sala: ${room}`);

    // Notificar al docente que hay un nuevo participante
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

  // Evento: Docente envía feedback en tiempo real
  socket.on('send_feedback', ({ id_experiment, message, target }) => {
    const room = `experiment_${id_experiment}`;
    console.log(`💬 Feedback enviado en sala ${room}:`, message);
    // Emitir a todos (o al target específico si se define en el futuro)
    io.to(room).emit('feedback_received', {
      message,
      target,
      timestamp: new Date().toISOString()
    });
  });

  // Evento: Finalizar experiencia (notificar a participantes)
  socket.on('finish_experience', (id_experiment) => {
    const room = `experiment_${id_experiment}`;
    console.log(`🏁 Experiencia ${id_experiment} finalizada, notificando a sala ${room}`);
    io.to(room).emit('experience_finished', { id_experiment });
  });

  // Evento: Docente cambia el modo de visualización para los participantes
  socket.on('set_visualization_mode', ({ id_experiment, mode }) => {
    const room = `experiment_${id_experiment}`;
    console.log(`👁️ Modo de visualización cambiado a ${mode} en sala ${room}`);
    // Emitir solo a los otros clientes (no al docente que lo envió)
    socket.to(room).emit('visualization_mode_changed', { mode });
  });

  // Evento: Cancelar experiencia (notificar a participantes)
  socket.on('cancel_experience', (id_experiment) => {
    const room = `experiment_${id_experiment}`;
    console.log(`🚫 Experiencia ${id_experiment} cancelada, notificando a sala ${room}`);
    io.to(room).emit('experience_cancelled', {
      id_experiment,
      reason: 'El docente canceló el experimento'
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Usuario desconectado de WebSocket:', socket.id);
  });
});

await seedAdmins();

server.listen(PORT, () => {
  console.log(`WRIST Backend Server (con WebSockets) corriendo en puerto ${PORT}`);
});
