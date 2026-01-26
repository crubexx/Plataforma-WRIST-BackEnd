import 'dotenv/config';
import { pool } from '../src/config/database.js';

const checkUsers = async () => {
    try {
        const [rows] = await pool.query('SELECT id_user, email, role FROM User');
        rows.forEach(user => {
            console.log(`ID: ${user.id_user} | Email: ${user.email} | Role: ${user.role}`);
        });
    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
        process.exit(0);
    }
};

checkUsers();
