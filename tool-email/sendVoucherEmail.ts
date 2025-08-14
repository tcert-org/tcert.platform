import transporter from "./mailer";

export async function sendVoucherEmail(email: string, code: string) {
  if (!email || !code) throw new Error("Faltan datos para enviar el correo");

  const mailOptions = {
    from: process.env.MAILER_EMAIL,
    to: email,
    subject: "Tu código de voucher",
    text: `¡Hola! Tu código de voucher es: ${code}`,
    html: `<p>¡Hola!</p><p>Tu código de voucher es: <b>${code}</b></p>`,
  };

  return transporter.sendMail(mailOptions);
}

export async function sendCredentialsPartner(email: string, password: string) {
  if (!email || !password)
    throw new Error("Faltan datos para enviar el correo");

  const mailOptions = {
    from: process.env.MAILER_EMAIL,
    to: email,
    subject: "Tus credenciales de acceso",
    text: `¡Hola! Tus credenciales de acceso son:\n\nEmail: ${email}\nContraseña: ${password}`,
    html: `<p>¡Hola!</p><p>Tus credenciales de acceso son:</p><ul><li>Email: ${email}</li><li>Contraseña: ${password}</li></ul>`,
  };

  return transporter.sendMail(mailOptions);
}
