import nodemailer from 'nodemailer';

export const sendTeacherWelcomeEmail = async (to, nombre, password) => {
  if (!to) {
    throw new Error('Correo del docente no definido');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Cuenta Docente creada - WRIST</title>
</head>
<body style="font-family: Arial; background:#f2f2f2; padding:20px;">
  <table width="100%" style="max-width:600px;margin:auto;background:#fff;border-radius:10px;">
    <tr>
      <td style="background:#023859;color:#fff;padding:30px;text-align:center;">
        <h1>WRIST</h1>
        <p>Cuenta Docente creada</p>
      </td>
    </tr>

    <tr>
      <td style="padding:30px;">
        <p>Hola <strong>${nombre}</strong>,</p>

        <p>
          Un administrador ha creado una cuenta de <strong>Docente</strong>
          para ti en la plataforma WRIST.
        </p>

        <p><strong>Credenciales de acceso:</strong></p>
        <ul>
          <li><strong>Correo:</strong> ${to}</li>
          <li><strong>Contraseña:</strong> ${password}</li>
        </ul>

        <p>
          Por seguridad, te recomendamos cambiar tu contraseña al iniciar sesión.
        </p>

        <p style="text-align:center;margin-top:30px;">
          <a href="${process.env.FRONTEND_URL}/acceso/login"
             style="background:#F28F16;color:#fff;padding:12px 25px;
                    border-radius:6px;text-decoration:none;">
            Iniciar sesión
          </a>
        </p>
      </td>
    </tr>

    <tr>
      <td style="text-align:center;padding:20px;color:#999;font-size:12px;">
        © 2026 WRIST - Universidad Católica del Norte
      </td>
    </tr>
  </table>
</body>
</html>
`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Cuenta Docente creada - WRIST',
    html
  });
};

export const sendResetPasswordEmail = async (to, resetUrl, nombre) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false, // Outlook / Gmail
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña - WRIST</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F2F2F2;">
    
    <!-- Wrapper Principal -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F2F2F2;">
        <tr>
            <td style="padding: 40px 20px;">
                
                <!-- Container Central -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header con Gradiente -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #023859 0%, #265D73 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                WRIST
                            </h1>
                            <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">
                                Work Research in Integrated Socio-technical Tracking
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Contenido Principal -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            
                            <!-- Icono de Seguridad -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding-bottom: 30px;">
                                        <div style="width: 80px; height: 80px; background: #FEF3E2; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                                            <span style="font-size: 40px;">🔐</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Título -->
                            <h2 style="margin: 0 0 20px; color: #023859; font-size: 24px; font-weight: 700; text-align: center;">
                                Recuperación de Contraseña
                            </h2>
                            
                            <!-- Saludo -->
                            <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                                Hola <strong>{{nombre}}</strong>,
                            </p>
                            
                            <!-- Mensaje Principal -->
                            <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en WRIST. Si no fuiste tú quien realizó esta solicitud, puedes ignorar este correo de forma segura.
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                                Para crear una nueva contraseña, haz clic en el siguiente botón:
                            </p>
                            
                            <!-- Botón CTA -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 0 0 30px;">
                                        <a href="{{enlace_recuperacion}}" 
                                           style="display: inline-block; padding: 16px 40px; background-color: #F28F16; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(242, 143, 22, 0.3);">
                                            Restablecer Contraseña
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Enlace Alternativo -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; font-weight: 600;">
                                            ¿El botón no funciona?
                                        </p>
                                        <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                                            Copia y pega el siguiente enlace en tu navegador:
                                        </p>
                                        <p style="margin: 10px 0 0; word-break: break-all;">
                                            <a href="{{enlace_recuperacion}}" 
                                               style="color: #265D73; text-decoration: underline; font-size: 13px;">
                                                {{enlace_recuperacion}}
                                            </a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Información Importante -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #E8F4F8; border-left: 4px solid #265D73; border-radius: 4px; padding: 20px; margin-bottom: 30px;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px; color: #023859; font-size: 14px; font-weight: 600;">
                                            ℹ️ Información importante
                                        </p>
                                        <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                                            <li>Este enlace es válido por <strong>1 hora</strong></li>
                                            <li>Solo puede usarse <strong>una vez</strong></li>
                                            <li>Si no solicitaste este cambio, ignora este correo</li>
                                            <li>Tu contraseña actual seguirá siendo válida hasta que la cambies</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Seguridad -->
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                <strong>Consejo de seguridad:</strong> Nunca compartas tu contraseña con nadie. WRIST nunca te pedirá tu contraseña por correo electrónico o teléfono.
                            </p>
                            
                        </td>
                    </tr>
                    
                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 30px;">
                            <div style="border-top: 1px solid #e5e7eb;"></div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; text-align: center; background-color: #f9fafb;">
                            
                            <!-- Ayuda -->
                            <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px;">
                                ¿Necesitas ayuda? 
                                <a href="mailto:soporte@wrist.cl" style="color: #F28F16; text-decoration: none; font-weight: 600;">
                                    Contáctanos
                                </a>
                            </p>
                            
                          
                            
                            <!-- Copyright -->
                            <p style="margin: 0 0 10px; color: #9ca3af; font-size: 12px;">
                                © 2026 WRIST - Universidad Católica del Norte
                            </p>
                            
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                Laboratorio de Producción UCN, Antofagasta, Chile
                            </p>
                            
                            <!-- Desuscribir (Opcional) -->
                            <p style="margin: 15px 0 0; color: #9ca3af; font-size: 11px;">
                                Este es un correo automático de seguridad. Por favor, no respondas a este mensaje.
                            </p>
                            
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
`

.replace(/{{nombre}}/g, nombre)
.replace(/{{enlace_recuperacion}}/g, resetUrl);

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Recuperación de contraseña - WRIST',
    html
  });
};
