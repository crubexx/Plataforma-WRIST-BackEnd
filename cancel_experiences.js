import { config } from 'dotenv';
config();

async function cancelExperiences() {
    try {
        const { pool } = await import('./src/config/database.js');
        const [result] = await pool.query("UPDATE DBProductAPP.Experiment SET status = 'CANCELLED' WHERE status != 'CANCELLED'");
        console.log(`Updated ${result.affectedRows} experiences to CANCELLED.`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating experiences:', error);
        process.exit(1);
    }
}

cancelExperiences();
