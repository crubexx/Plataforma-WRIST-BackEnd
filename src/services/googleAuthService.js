import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import {
    findUserByEmail,
    createUser,
    getUserWithProvider,
    createAuthProvider,
    updateAuthProviderLastLogin
} from '../repositories/authRepository.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * ACC-005: Autenticación con Google OAuth
 * Arquitectura: user (tabla principal) + user_auth_providers (tabla débil)
 */
export const authenticateWithGoogle = async (idToken) => {
    // 1. Verificar token con Google
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload['sub'];
    const email = payload['email'];
    const fullName = payload['name'] || '';
    const picture = payload['picture'];
    const emailVerified = payload['email_verified'];

    if (!emailVerified) {
        throw new Error('El email de Google no está verificado');
    }

    // 2. Separar nombre y apellido
    const nameParts = fullName.trim().split(' ');
    const first_name = nameParts[0] || 'Usuario';
    const last_name = nameParts.slice(1).join(' ') || 'Google';

    // 3. Buscar si ya existe un usuario con este Google ID
    let userWithProvider = await getUserWithProvider('GOOGLE', googleId);

    if (!userWithProvider) {
        // 4. Verificar si existe un usuario con ese email
        let user = await findUserByEmail(email);

        if (user) {
            // Usuario existe pero no tiene provider de Google, vincular
            await createAuthProvider({
                user_id: user.id_user,
                provider: 'GOOGLE',
                provider_user_id: googleId
            });

            console.log(` Google vinculado a usuario existente: ${email}`);
        } else {
            // 5. Crear nuevo usuario
            const userId = await createUser({
                first_name,
                last_name,
                rut: null,
                email,
                password_hash: null,
                role: 'USUARIO',
                gender: null,
                date_of_birth: null,
                picture
            });

            // Crear provider
            await createAuthProvider({
                user_id: userId,
                provider: 'GOOGLE',
                provider_user_id: googleId
            });

            console.log(` Nuevo usuario creado con Google: ${email}`);
        }

        // Obtener usuario completo con provider
        userWithProvider = await getUserWithProvider('GOOGLE', googleId);
    } else {
        // Usuario ya existe, actualizar último login
        await updateAuthProviderLastLogin(userWithProvider.provider_id);
        console.log(` Usuario autenticado con Google: ${email}`);
    }

    // 6. Verificar estado de la cuenta
    if (userWithProvider.status !== 'ACTIVE') {
        throw new Error('La cuenta no se encuentra activa, contacte al administrador.');
    }

    // 7. Generar JWT
    const jwtPayload = {
        id_user: userWithProvider.id_user,
        email: userWithProvider.email,
        role: userWithProvider.role,
        auth_provider: 'GOOGLE'
    };

    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    // 8. Verificar para completar perfil
    if (!userWithProvider.rut || 
    !userWithProvider.gender || 
    !userWithProvider.date_of_birth) {

    return {
        token,
        requiresCompletion: true,
        user: {
            id: userWithProvider.id_user.toString(),
            name: userWithProvider.first_name,
            lastName: userWithProvider.last_name,
            email: userWithProvider.email,
            role: userWithProvider.role,
            authMethod: 'google'
        }
    };
}

    // 9. Retornar token y usuario
    return {
        token,
        user: {
            id: userWithProvider.id_user.toString(),
            name: userWithProvider.first_name,
            lastName: userWithProvider.last_name,
            email: userWithProvider.email,
            role: userWithProvider.role,
            state: userWithProvider.status.toLowerCase(),
            authMethod: 'google',
            picture: userWithProvider.picture
        }
    };
};
