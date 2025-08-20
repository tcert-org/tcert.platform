import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_PASSWORD,
  },
});

export async function sendResetPasswordEmail(email: string, resetUrl: string) {
  await transporter.sendMail({
    from: process.env.MAILER_EMAIL,
    to: email,
    subject: "Recupera tu contraseña en T-Cert",
    html: `
      <h2>Recuperación de contraseña</h2>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <p><a href="${resetUrl}" target="_blank">Restablecer contraseña</a></p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
      <p>El enlace expirará en 1 hora.</p>
    `,
  });
}

export default transporter;
