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

import sequelize from "./config/db.js";  
import userRoutes from "./modules/users/users.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SequelizeStore = connectSessionSequelize(session.Store);
const app = express();

// Middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // ✅ antes de session
app.use(cookieParser()); // ✅ antes de session
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Configuración de sesión
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    store: new SequelizeStore({ db: sequelize }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,     // la cookie no es accesible desde JS
      secure: false,      // true si usas HTTPS
      sameSite: "lax",    // o "none" si usas HTTPS
      maxAge: 1000 * 60 * 60, // 1 hora
    },
  })
);

// Static 
app.use(express.static(path.join(__dirname, "public")));

// Rutas
app.use("/api/users", userRoutes);

// catch 404
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500).json(err);
});

export default app;
