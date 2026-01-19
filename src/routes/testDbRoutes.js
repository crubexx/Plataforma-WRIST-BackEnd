import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

router.get('/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 AS conectado');
        res.json({ ok: true, result: rows });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

export default router;
