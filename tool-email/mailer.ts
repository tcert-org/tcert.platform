import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";
import fs from "fs";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_PASSWORD,
  },
});

export async function sendResetPasswordEmail(email: string, resetUrl: string) {
  const templatePath = path.join(
    process.cwd(),
    "public",
    "templates",
    "reset-password-email.ejs"
  );
  const template = fs.readFileSync(templatePath, "utf8");
  const html = ejs.render(template, { resetUrl });
  await transporter.sendMail({
    from: process.env.MAILER_EMAIL,
    to: email,
    subject: "Recupera tu contraseña en T-Cert",
    html,
  });
}

export default transporter;
