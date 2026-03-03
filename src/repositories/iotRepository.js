import { poolIoT } from '../config/database.js';

export const getHeartRateByMac = async (mac) => {
  const [rows] = await poolIoT.query(
    `
    SELECT hr, ts
    FROM registros_hw9
    WHERE mac = ?
    ORDER BY ts DESC
    `,
    [mac]
  );

  return rows;
};

export const getActivityLogsByUid = async (uidHex) => {
  const [rows] = await poolIoT.query(
    `
    SELECT activity, duration, event, ts
    FROM registros_tiempo
    WHERE uid_hex = ?
    ORDER BY ts ASC
    `,
    [uidHex]
  );

  return rows;
};

export const getHeartRateByMacAndRange = async (mac, start, end) => {
  const [rows] = await poolIoT.query(
    `
    SELECT hr, ts
    FROM registros_hw9
    WHERE mac = ?
      AND ts BETWEEN ? AND ?
    ORDER BY ts ASC
    `,
    [mac, start, end]
  );

  return rows;
};

export const getActivityLogsByUidAndRange = async (uidHex, start, end) => {
  const [rows] = await poolIoT.query(
    `
    SELECT activity, duration, event, ts
    FROM registros_tiempo
    WHERE uid_hex = ?
      AND ts BETWEEN ? AND ?
    ORDER BY ts ASC
    `,
    [uidHex, start, end]
  );

  return rows;
};