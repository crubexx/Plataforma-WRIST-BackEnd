import { pool } from '../config/database.js';

export const createDeviceAssignment = async ({
  external_device_id,
  device_type,
  id_experiment,
  id_group,
  id_user
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO DeviceAssignment
    (external_device_id, device_type, id_experiment, id_group, id_user)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      external_device_id,
      device_type,
      id_experiment || null,
      id_group || null,
      id_user || null
    ]
  );

  return result.insertId;
};
