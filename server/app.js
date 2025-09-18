// Configuración principal del servidor Express
// Incluye configuración de sesiones, middleware de seguridad y rutas principales
import "dotenv/config";
import createError from "http-errors";
import express from "express";
import session from "express-session";
import connectSessionSequelize from "connect-session-sequelize";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { fileURLToPath } from "url";

// Configuración de base de datos y relaciones entre modelos Sequelize
import sequelize from "./config/db.js";  
import './config/associations.js'; 

// Importaciones de rutas para cada entidad
import userRoutes from "./modules/users/users.routes.js";
import boardRoutes from "./modules/boards/boards.routes.js"
import boardColumnRoutes from "./modules/boardColumns/boardColumns.routes.js";
import taskRoutes from "./modules/tasks/tasks.routes.js";

// Configuración de rutas absolutas para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración del store de sesiones usando Sequelize
const SequelizeStore = connectSessionSequelize(session.Store);

//Instancia de Express
const app = express();

// Middlewares básicos
app.use(logger("dev")); // Log de peticiones HTTP en desarrollo
app.use(express.json()); // Parseo de JSON en el body de las peticiones
app.use(express.urlencoded({ extended: false })); // Parseo de formularios URL-encoded
app.use(cookieParser()); // Necesario antes de configurar sesiones

// Configuración de CORS para permitir peticiones desde el frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", 
    credentials: true, // Permite envío de cookies y headers de autenticación
  })
);

// Configuración de sesiones usando express-session + Sequelize
// Las sesiones se almacenan en la base de datos en lugar de memoria
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret", // Clave para firmar la sesión
    store: new SequelizeStore({ db: sequelize }), // Almacenamiento persistente en BD
    resave: false, // No guardar sesión si no hay cambios
    saveUninitialized: false, // No crear sesión hasta que se almacene algo
    cookie: {
      httpOnly: true,     // La cookie no es accesible desde JavaScript del cliente (seguridad XSS)
      secure: false,      // false para HTTP, true para HTTPS en producción
      sameSite: "lax",    // Protección CSRF, permite cookies en navegación normal
      maxAge: 1000 * 60 * 60, // Duración de 1 hora (en milisegundos)
    },
  })
);

// Servir archivos estáticos (imágenes, CSS, etc.) desde la carpeta public
app.use(express.static(path.join(__dirname, "public")));

// Configuración de rutas de la API - estructura modular por entidades
app.use("/api/users", userRoutes); // Autenticación, registro, perfil, 2FA
app.use("/api/boards", boardRoutes); // CRUD de tableros y compartir
app.use("/api/boards", boardColumnRoutes); // Gestión de columnas (rutas anidadas)
app.use("/api/tasks", taskRoutes); // CRUD de tareas, asignaciones, drag & drop

// Middleware para capturar rutas no encontradas (404)
app.use(function (req, res, next) {
  next(createError(404));
});

// Middleware de manejo global de errores
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500).json(err);
});

export default app;