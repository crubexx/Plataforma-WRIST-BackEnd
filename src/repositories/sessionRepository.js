import { pool } from '../config/database.js';

export const registerUserSession = async (userId) => {
  await pool.query(
    `
    INSERT INTO UserSession (id_user, last_activity, is_active)
    VALUES (?, NOW(), TRUE)
    `,
    [userId]
  );
};

export const deactivateUserSession = async (userId) => {
  await pool.query(
    `
    UPDATE UserSession
    SET is_active = FALSE
    WHERE id_user = ?
    `,
    [userId]
  );
};
