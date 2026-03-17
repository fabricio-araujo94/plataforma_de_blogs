import { Request, Response } from "express";
import { PrismaClient } from "../../../generated/prisma/client";

const prisma = new PrismaClient();

export class AuthorController {
  static async getProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: "Invalid author id." });
      }

      const author = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          bio: true,
          avatarUrl: true,
          posts: {
            where: { published: true },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              slug: true,
              title: true,
              excerpt: true,
              createdAt: true,
              author: { select: { name: true } },
            },
          },
        },
      });

      if (!author) {
        res.status(404).json({ error: "Author not found." });
      }

      res.status(200).json(author);
    } catch (err: unknown) {
      res.status(500).json({ error: "Error retrieving author profile." });
    }
  }
}
