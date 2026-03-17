import { Request, Response } from "express";
import { PrismaClient } from "../../../generated/prisma/client";
import { AdminService } from "../services/AdminService";

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

  static async toggleShadowban(req: Request, res: Response) {
    try {
      const { targetUserId } = req.params;

      if (!targetUserId || Array.isArray(targetUserId)) {
        return res.status(400).json({ error: "Invalid target user id" });
      }

      if (req.user?.id === targetUserId) {
        return res
          .status(400)
          .json({ error: "You cannot shadowban yourself." });
      }

      const result = await AdminService.toggleShadowban(targetUserId);

      res.status(200).json(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res
          .status(500)
          .json({ error: "Internal error while processing shadowban." });
      }
    }
  }
}
