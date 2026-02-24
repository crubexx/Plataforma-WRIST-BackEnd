import {
  getTeamPerformanceService,
  getUserFeedbackService,
  getMyPerformanceService,
  getExperiencesByDateService,
  joinExperienceService,
  getUserProfileService,
  getUserResultsService,
  joinTeamService,
  getExperienceTeamsService,
  setUserReadyService,
  getExperienceQuestionsService,
  saveUserAnswersService
} from '../services/userService.js';

export const getExperiencesByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: 'Debe indicar una fecha'
      });
    }

    const id_user = req.user.id_user;

    const result = await getExperiencesByDateService(date, id_user);
    return res.status(200).json(result);
  } catch (error) {
    console.error('USR-001 Error:', error);
    return res.status(500).json({
      message: 'Error al obtener experiencias'
    });
  }
};

export const joinExperience = async (req, res) => {
  try {
    const { id_experience, access_code } = req.body;
    const id_user = req.user.id_user;

    const result = await joinExperienceService(
      id_experience,
      access_code,
      id_user
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// USR-003: Ver perfil
export const getMyProfile = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    const profile = await getUserProfileService(id_user);

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// USR-004: Ver resultados de mis experiencias
export const getMyResults = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    const data = await getUserResultsService(id_user);

    if (data.message) {
      return res.status(200).json({ message: data.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('USR-004 error:', error);
    return res.status(500).json({
      message: 'Error al obtener resultados'
    });
  }
};

// USR-005: Unirse a un equipo
export const joinTeam = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { id_experimento, id_group } = req.body;

    console.log('👥 USR-005: Usuario', id_user, 'uniéndose al equipo', id_group, 'en experiencia', id_experimento);

    const result = await joinTeamService(
      id_user,
      id_experimento,
      id_group
    );

    console.log('✅ Usuario unido exitosamente');
    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error en joinTeam:', error);
    return res.status(400).json({
      message: error.message
    });
  }
};

// USR-006: Ver mi desempeño
export const getMyPerformance = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { id_experimento } = req.params;

    const result = await getMyPerformanceService(
      id_user,
      id_experimento
    );

    return res.status(200).json(result);

  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// USR-007: Ver feedback
export const getUserFeedback = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { id_experimento } = req.params;

    const feedback = await getUserFeedbackService(
      id_user,
      id_experimento
    );

    return res.status(200).json(feedback);

  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// USR-008: Ver desempeño de mi equipo
export const getTeamPerformance = async (req, res) => {
  try {
    const requesterId = req.user.id_user;
    const requesterRole = req.user.role;

    const { id_experimento, id_group } = req.params;

    const result = await getTeamPerformanceService(
      requesterRole,
      requesterId,
      id_experimento,
      id_group
    );

    return res.status(200).json(result);

  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// USR-007: Ver equipos de una experiencia
export const getExperienceTeams = async (req, res) => {
  try {
    const { id_experiment } = req.params;
    console.log('🔍 USR-007: Solicitando equipos para experiencia:', id_experiment);
    console.log('📋 Parámetros completos:', req.params);
    console.log('🔐 Usuario autenticado:', req.user ? req.user.id_user : 'NO AUTH');

    const teams = await getExperienceTeamsService(id_experiment);

    console.log('✅ Equipos obtenidos:', teams.length, 'equipos');
    console.log('📊 Detalle:', JSON.stringify(teams, null, 2));

    return res.status(200).json(teams);
  } catch (error) {
    console.error('❌ Error en getExperienceTeams:', error);
    return res.status(400).json({
      message: error.message
    });
  }
};

// USR-008: Marcar como listo
export const setReady = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { id_experimento } = req.body;
    console.log('✋ USR-008: Usuario', id_user, 'marcándose listo en experiencia', id_experimento);

    const result = await setUserReadyService(id_user, id_experimento);
    console.log('✅ Usuario marcado como listo');

    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error en setReady:', error);
    return res.status(400).json({
      message: error.message
    });
  }
};

export const getExperienceQuestions = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { id_experiment } = req.params;

    const questions = await getExperienceQuestionsService(id_experiment, id_user);

    return res.status(200).json(questions);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

export const submitExperienceAnswers = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { id_experiment } = req.params;
    const { answers } = req.body;

    const result = await saveUserAnswersService(id_experiment, id_user, answers);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

export const getExperimentHistory = async (req, res) => {
  try {
    const { id_experiment } = req.params;

    const data = await getExperimentHistoryService(id_experiment);

    return res.status(200).json(data);

  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};