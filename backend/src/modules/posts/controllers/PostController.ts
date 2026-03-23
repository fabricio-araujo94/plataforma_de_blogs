import { Request, Response } from "express";
import { PostService } from "../services/PostService";
import { createPostSchema, updatePostSchema } from "../dtos/PostDTO";
import { PrismaClient } from "../../../generated/prisma/client";

const prisma = new PrismaClient();

export class PostController {
  static async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthenticated user." });
      }

      const data = createPostSchema.parse(req.body);

      const post = await PostService.create(req.user.id, data);

      res.status(201).json(post);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: "Internal server error." });
      }
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: "Invalid post id." });
      }

      if (!req.user) {
        return res.status(401).json({ error: "Unauthenticated user." });
      }

      const data = updatePostSchema.parse(req.body);

      const post = await PostService.update(
        id,
        req.user.id,
        req.user.role,
        data,
      );

      res.status(200).json(post);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("Access denied.")) {
          return res.status(403).json({ error: err.message });
        }
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: "Internal server error." });
      }
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const pageParam = req.query.page;
      const limitParam = req.query.limit;

      const page = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;
      const limit =
        typeof limitParam === "string" ? parseInt(limitParam, 10) : 10;

      const safePage = isNaN(page) || page < 1 ? 1 : page;
      const safeLimit = isNaN(limit) || limit < 1 || limit > 50 ? 10 : limit;

      const posts = await PostService.list(safePage, safeLimit);

      res.status(200).json(posts);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res
          .status(500)
          .json({ error: "Internal error while retrieving posts." });
      }
    }
  }

  static async getBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      if (!slug || Array.isArray(slug)) {
        return res.status(400).json({ error: "Slug is required." });
      }

      const post = await PostService.getBySlug(slug);

      res.status(200).json(post);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "Post not found.") {
        res.status(404).json({ error: err.message });
      } else {
        res.status(500).json({ error: "Internal error while retrieving post" });
      }
    }
  }

  static async search(req: Request, res: Response) {
    try {
      const queryParam = req.query.q;

      if (typeof queryParam !== "string" || queryParam.trim().length === 0) {
        return res
          .status(400)
          .json({ error: "The search parameter (q) is required." });
      }

      const limitParam = req.query.limit;
      const limit =
        typeof limitParam === "string" ? parseInt(limitParam, 10) : 10;
      const safeLimit = isNaN(limit) || limit < 1 || limit > 50 ? 10 : limit;

      const results = await PostService.search(queryParam, safeLimit);

      res.status(200).json(results);
    } catch (err: unknown) {
      res
        .status(500)
        .json({ error: "Internal error while performing the search." });
    }
  }

  static async listMyPosts(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized," });
      }

      const posts = await prisma.post.findMany({
        where: { authorId: req.user.id },
        select: {
          id: true,
          title: true,
          slug: true,
          published: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { views: true, likes: true, comments: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      res.status(200).json(posts);
    } catch (err: unknown) {
      res.status(500).json({ error: "Error retrieving your posts." });
    }
  }
}
