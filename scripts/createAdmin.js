import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from '../src/config/database.js';

const createAdmin = async () => {
    const adminData = {
        first_name: 'Admin',
        last_name: 'Wrist',
        rut: '123456780',
        email: 'admin@wrist.cl',
        password: 'AdminPassword123!',
        role: 'ADMIN',
        gender: 'Otro',
        date_of_birth: '1990-01-01'
    };

    try {
        console.log('🚀 Creando usuario administrador...');

        // 1. Verificar si ya existe
        const [existing] = await pool.query('SELECT id_user FROM User WHERE email = ?', [adminData.email]);

        const password_hash = await bcrypt.hash(adminData.password, 10);

        if (existing.length > 0) {
            console.log(`🔄 El usuario ${adminData.email} ya existe. Actualizando contraseña y rol...`);
            await pool.query(
                'UPDATE User SET password_hash = ?, role = ?, status = "ACTIVE" WHERE email = ?',
                [password_hash, adminData.role, adminData.email]
            );
            console.log('✅ Datos del administrador actualizados.');
            process.exit(0);
        }

        // 2. Hash password
        password_hash = await bcrypt.hash(adminData.password, 10);

        // 3. Insertar
        const [result] = await pool.query(
            `INSERT INTO User 
        (first_name, last_name, rut, email, password_hash, role, gender, date_of_birth, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
            [
                adminData.first_name,
                adminData.last_name,
                adminData.rut,
                adminData.email,
                password_hash,
                adminData.role,
                adminData.gender,
                adminData.date_of_birth
            ]
        );

        console.log('✅ Administrador creado con éxito!');
        console.log('📧 Email:', adminData.email);
        console.log('🔑 Password:', adminData.password);
        console.log('🆔 ID:', result.insertId);

    } catch (error) {
        console.error('❌ Error al crear administrador:', error.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
};

createAdmin();
