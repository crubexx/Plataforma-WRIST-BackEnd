import nodemailer from 'nodemailer';

export const sendResetPasswordEmail = async (to, resetUrl) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Recuperación de contraseña - WRIST',
    html: `
      <p>Has solicitado recuperar tu contraseña.</p>
      <p>Haz click en el siguiente enlace:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Este enlace expira en 1 hora.</p>
    `
  });
};