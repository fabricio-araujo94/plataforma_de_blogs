import { Request, Response } from "express";
import { PrismaClient } from "../../../generated/prisma/client";

const prisma = new PrismaClient();

export class AdminController {
  static async getDashboardStats(req: Request, res: Response) {
    try {
      const [totalUsers, totalPosts, totalComments] = await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.comment.count(),
      ]);

      res.status(200).json({
        totalUsers,
        totalPosts,
        totalComments,
      });
    } catch (err: unknown) {
      res.status(500).json({ error: "Error loading admin statistics." });
    }
  }
}
