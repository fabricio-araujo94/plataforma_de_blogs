import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { AuthController } from "./modules/users/controllers/AuthController";

const app = express();

// Global middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.post("/api/auth/register", AuthController.register);
app.post("/api/auth/login", AuthController.login);

export { app };
