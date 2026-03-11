import bcrypt from 'bcrypt';
import { pool } from './database.js';

export const seedAdmins = async () => {
try {

const superAdminEmail = "produlab.ucn@gmail.com";
const adminEmail = "produlab.ucn@hotmail.com";

const superAdminPassword = "SuperAdminProdulabUCN654321!";
const adminPassword = "AdminProdulabUCN123456!";

const hashSuper = await bcrypt.hash(superAdminPassword, 10);
const hashAdmin = await bcrypt.hash(adminPassword, 10);

// Verificar si ya existen
const [existing] = await pool.query(
`SELECT email FROM User WHERE email IN (?, ?)`,
[superAdminEmail, adminEmail]
);

const emails = existing.map(u => u.email);

if (!emails.includes(superAdminEmail)) {

await pool.query(
`INSERT INTO User
(first_name, last_name, email, password_hash, role, status)
VALUES (?, ?, ?, ?, ?, ?)`,
[
"Super",
"Admin",
superAdminEmail,
hashSuper,
"SUPERADMIN",
"ACTIVE"
]
);

console.log("SuperAdmin creado");
}

if (!emails.includes(adminEmail)) {

await pool.query(
`INSERT INTO User
(first_name, last_name, email, password_hash, role, status)
VALUES (?, ?, ?, ?, ?, ?)`,
[
"Admin",
"Produlab",
adminEmail,
hashAdmin,
"ADMIN",
"ACTIVE"
]
);

console.log("Admin creado");
}

} catch (error) {
console.error("Error creando usuarios iniciales:", error);
}
};