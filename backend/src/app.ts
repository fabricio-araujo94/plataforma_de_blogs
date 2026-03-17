import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import { AuthController } from "./modules/users/controllers/AuthController";
import { PostController } from "./modules/posts/controllers/PostController";
import { MediaController } from "./modules/media/controllers/MediaController";
import { LikeController } from "./modules/interactions/controllers/LikeController";
import { CommentController } from "./modules/interactions/controllers/CommentController";
import { ViewController } from "./modules/interactions/controllers/ViewController";
import { AuthorController } from "./modules/users/controllers/AuthorController";
import { AdminController } from "./modules/admin/controllers/AdminController";

import { authMiddleware } from "./shared/middlewares/authMiddleware";

import { Role } from "./generated/prisma/enums";
import { requireRole } from "./shared/middlewares/roleMiddleware";

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

app.get("/api/posts/:postId/likes", LikeController.getLikesStatus);

app.get("/api/posts", PostController.list);
app.get("/api/posts/search", PostController.search);
app.get("/api/posts/:slug", PostController.getBySlug);

app.post("/api/posts", authMiddleware, PostController.create);
app.post("/api/posts/:id", authMiddleware, PostController.update);

app.get(
  "/api/posts/:postId/like",
  authMiddleware,
  LikeController.togglePostLike,
);

app.get("/api/posts/:postId/comments", CommentController.list);
app.post(
  "/api/posts/:postId/comments",
  authMiddleware,
  CommentController.create,
);

app.post("/api/media/upload-url", authMiddleware, MediaController.getUploadUrl);

app.post("/api/post/:postId/view", ViewController.register);
app.get("/api/posts/:postId/views", ViewController.getCount);

app.get("/api/authors/:id", AuthorController.getProfile);

app.get(
  "/api/admin/stats",
  authMiddleware,
  requireRole([Role.ADMIN]),
  AdminController.getDashboardStats,
);

app.patch(
  "/api/admin/users/:targetUserId/shadowban",
  authMiddleware,
  requireRole([Role.ADMIN]),
  AdminController.toggleShadowban,
);

export { app };
