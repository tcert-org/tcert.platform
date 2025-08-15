import transporter from "./mailer";
import ejs from "ejs";
import path from "path";
import { promises as fs } from "fs";

export async function sendVoucherEmail(
  email: string,
  code: string,
  nombre?: string
) {
  if (!email || !code) throw new Error("Faltan datos para enviar el correo");

  const templatePath = path.join(
    process.cwd(),
    "public",
    "templates",
    "voucher-email.ejs"
  );
  const template = await fs.readFile(templatePath, "utf-8");
  const html = ejs.render(template, { codigo: code, nombre });

  const mailOptions = {
    from: process.env.MAILER_EMAIL,
    to: email,
    subject: "Tu código de voucher",
    html,
  };

  return transporter.sendMail(mailOptions);
}

export async function sendCredentialsPartner(
  email: string,
  password: string,
  nombre?: string
) {
  if (!email || !password)
    throw new Error("Faltan datos para enviar el correo");

  const templatePath = path.join(
    process.cwd(),
    "public",
    "templates",
    "credentials-email.ejs"
  );
  const template = await fs.readFile(templatePath, "utf-8");
  const html = ejs.render(template, { email, password, nombre });

  const mailOptions = {
    from: process.env.MAILER_EMAIL,
    to: email,
    subject: "Tus credenciales de acceso",
    html,
  };

  return transporter.sendMail(mailOptions);
}
