import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import { AuthController } from "./modules/users/controllers/AuthController";
import { PostController } from "./modules/posts/controllers/PostController";
import { MediaController } from "./modules/media/controllers/MediaController";

import { authMiddleware } from "./shared/middlewares/authMiddleware";

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

app.get("/api/posts", PostController.list);
app.get("/api/posts/:slug", PostController.getBySlug);

app.post("/api/posts", authMiddleware, PostController.create);
app.post("/api/posts/:id", authMiddleware, PostController.update);

app.post("/api/media/upload-url", authMiddleware, MediaController.getUploadUrl);

export { app };
