// Configuración de Nodemailer - envío de emails
// Usado para recuperación de contraseñas y códigos 2FA

import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Creación del transportador de correo usando Gmail SMTP
// Este objeto se encarga de enviar todos los emails de la aplicación
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT, 
  secure: false, 
  auth: {
    user: process.env.SMTP_USER, // Email del remitente
    pass: process.env.SMTP_PASS, // Contraseña de aplicación de Gmail para nodemailer
  },
});

// Exporta el transportador para uso en controllers
export default transporter;