import mysql from 'mysql2/promise';

// Sistema principal
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
});

// Base IoT (Totem / Raspberry)
export const poolIoT = mysql.createPool({
  host: process.env.DB_IOT_HOST,
  user: process.env.DB_IOT_USER,
  password: process.env.DB_IOT_PASSWORD,
  database: process.env.DB_IOT_NAME,
  port: parseInt(process.env.DB_IOT_PORT),
  waitForConnections: true,
  connectionLimit: 10,
});