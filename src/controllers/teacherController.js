import {
  createExperienceService,
  getTeacherExperiencesService,
  getConnectedUsersService,
  createGroupService,
  assignDeviceService,
  startExperienceService,
  finishExperienceService,
  cancelExperienceService,
  getExperienceQuestionsService,
  getExperienceMetricsService,
  updateVisualizationModeService,
  generateExperimentFeedbackService,
  createManualFeedbackService,
  getExperienceByIdService,
  checkExperienceStatusService
} from '../services/teacherService.js';
import { getTeamsByExperimentRepository } from '../repositories/teacherRepository.js';
import { getIO } from '../socket.js';

// DOE-001: Crear experiencia
export const createExperience = async (req, res) => {
  try {
    const result = await createExperienceService(req.body, req.user);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// DOE-002: Ver historial de experiencias del docente
export const getTeacherExperiences = async (req, res) => {
  try {
    const teacherId = req.user.id_user;

    const experiences = await getTeacherExperiencesService(teacherId);

    return res.status(200).json(experiences);
  } catch (error) {
    console.error('Error DOE-002:', error);
    return res.status(500).json({
      message: 'Error al obtener historial de experiencias'
    });
  }
};

export const getExperienceById = async (req, res) => {
  try {
    const experimentId = parseInt(req.params.id);
    const teacherId = req.user.id_user;

    const experiment = await getExperienceByIdService(experimentId, teacherId);
    return res.status(200).json(experiment);
  } catch (error) {
    return res.status(404).json({
      message: error.message
    });
  }
};

export const checkExperienceStatus = async (req, res) => {
  try {
    const experimentId = parseInt(req.params.id);
    const teacherId = req.user.id_user;

    const statusCheck = await checkExperienceStatusService(experimentId, teacherId);
    return res.status(200).json(statusCheck);
  } catch (error) {
    console.error('Error checkExperienceStatus:', error);
    return res.status(500).json({
      message: 'Error al comprobar estado de la experiencia'
    });
  }
};

// DOE-003: Ver usuarios conectados
export const getConnectedUsers = async (req, res) => {
  try {
    const users = await getConnectedUsersService();

    if (users.length === 0) {
      return res.status(200).json([{
        message: 'No hay usuarios conectados actualmente'
      }]);
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error DOE-003:', error);
    return res.status(500).json({
      message: 'Error al obtener usuarios conectados'
    });
  }
};

// DOE-004: Crear equipos
export const createGroup = async (req, res) => {
  try {
    const result = await createGroupService(
      req.user.id_user,
      req.body
    );
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// DOC-005: Agregar dispositivo 
export const assignDevice = async (req, res) => {
  try {
    const result = await assignDeviceService(
      req.user.id_user,
      req.body
    );

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// DOC-006: Mostrar experiencia (métricas)
export const getExperienceMetrics = async (req, res) => {
  try {
    const teacherId = req.user.id_user;
    const { id } = req.params;

    const metrics = await getExperienceMetricsService(id, teacherId);

    return res.status(200).json(metrics);
  } catch (error) {
    console.error('DOE-006:', error.message);
    return res.status(400).json({ message: error.message });
  }
};

// DOC-007: Visualizar equipos
export const getExperienceTeams = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔍 Teacher DOE-007: Solicitando equipos para experiencia:', id);

    const teams = await getTeamsByExperimentRepository(id);

    console.log('✅ Equipos obtenidos (teacher):', teams.length);
    console.log('📊 Detalle:', JSON.stringify(teams, null, 2));

    return res.status(200).json(teams);
  } catch (error) {
    console.error('❌ Error DOE-007:', error.message);
    return res.status(400).json({ message: error.message });
  }
};

// DOE-008: Administrar visualización
export const updateVisualizationMode = async (req, res) => {
  try {
    const { id } = req.params;
    const { visualization_mode } = req.body;

    const result = await updateVisualizationModeService(
      id,
      req.user.id_user,
      visualization_mode
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// DOE-009: Generar feedback
export const generateExperimentFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await generateExperimentFeedbackService(
      id,
      req.user.id_user
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const createManualFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, id_user, id_group } = req.body;

    const result = await createManualFeedbackService(
      id,
      req.user.id_user,
      message,
      { id_user, id_group }
    );

    // Emitir en tiempo real a todos los participantes de la sala
    try {
      const io = getIO();
      const room = `experiment_${id}`;
      io.to(room).emit('feedback_received', {
        message,
        target: id_group ? { id_group } : id_user ? { id_user } : 'all',
        timestamp: new Date().toISOString()
      });
      console.log(`💬 Feedback emitido por socket a sala ${room}`);
    } catch (socketError) {
      console.warn('⚠️ Socket no disponible para emitir feedback:', socketError.message);
    }

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// DOE-010: Iniciar experiencia
export const startExperience = async (req, res) => {
  try {
    const experimentId = parseInt(req.params.id);
    const teacherId = req.user.id_user;

    const result = await startExperienceService(experimentId, teacherId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// DOE-011: Finalizar experiencia
export const finishExperience = async (req, res) => {
  try {
    const experimentId = parseInt(req.params.id);
    const teacherId = req.user.id_user;

    const result = await finishExperienceService(experimentId, teacherId);

    // Notificar a los participantes que la experiencia terminó
    try {
      const io = getIO();
      io.to(`experiment_${experimentId}`).emit('experience_finished', { id_experiment: experimentId });
    } catch (socketError) {
      console.warn('⚠️ Socket no disponible al finalizar experiencia:', socketError.message);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// DOE-012: Obtener preguntas de una experiencia
export const getExperienceQuestions = async (req, res) => {
  try {
    const experimentId = parseInt(req.params.id);
    const teacherId = req.user.id_user;

    const questions = await getExperienceQuestionsService(experimentId, teacherId);
    return res.status(200).json(questions);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// DOE-013: Cancelar experiencia
export const cancelExperience = async (req, res) => {
  try {
    const experimentId = parseInt(req.params.id);
    const teacherId = req.user.id_user;

    const result = await cancelExperienceService(experimentId, teacherId);

    // Notificar a los participantes que el experimento fue cancelado
    try {
      const io = getIO();
      io.to(`experiment_${experimentId}`).emit('experience_cancelled', {
        id_experiment: experimentId,
        reason: 'El docente canceló el experimento'
      });
      console.log(`🚫 experience_cancelled emitido a sala experiment_${experimentId}`);
    } catch (socketError) {
      console.warn('⚠️ Socket no disponible al cancelar experiencia:', socketError.message);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};