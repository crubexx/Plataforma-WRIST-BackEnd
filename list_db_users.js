
import { pool } from './src/config/database.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function listUsers() {
    try {
        const [rows] = await pool.query('SELECT id_user, email, role, status, password_hash FROM User');
        console.log('Users in DB:');
        rows.forEach(row => {
            const isHashed = row.password_hash.startsWith('$2b$') || row.password_hash.startsWith('$2a$');
            console.log(`- ID: ${row.id_user}, Email: ${row.email}, Role: ${row.role}, Status: ${row.status}, PassHashed: ${isHashed}`);
        });
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

listUsers();
