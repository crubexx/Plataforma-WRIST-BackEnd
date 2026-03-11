import express from 'express';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import { pool } from './config/database.js';
import cors from 'cors';

const app = express();


// CORS configuration
//app.use(cors({
//  origin: 'http://localhost:4200',  // Frontend URL
//  credentials: true,
//  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//  allowedHeaders: ['Content-Type', 'Authorization']
// }));

// CORS Temporal
app.use(cors());


app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/teacher', teacherRoutes);

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL conectado correctamente');
    connection.release();

    // Ejecutar migraciones completas
    const { runMigrations } = await import('./config/migrations.js');
    await runMigrations();
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
  }
})();

app.get('/', (req, res) => {
  res.send('WRIST Backend is running');
});

export default app;
