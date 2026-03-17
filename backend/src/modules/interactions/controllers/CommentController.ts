import { Request, Response } from "express";
import { CommentService } from "../services/CommentService";
import { createCommentSchema } from "../dtos/CommentDTO";

export class CommentController {
  static async create(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      if (!postId || Array.isArray(postId)) {
        return res.status(400).json({ error: "Invalid post id." });
      }

      if (!req.user) {
        return res
          .status(401)
          .json({ error: "You must be logged in to comment," });
      }

      const data = createCommentSchema.parse(req.body);
      const comment = await CommentService.create(req.user.id, postId, data);

      res.status(201).json(comment);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res
          .status(500)
          .json({ error: "Internal error while creating a comment." });
      }
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      if (!postId || Array.isArray(postId)) {
        return res.status(400).json({ error: "Invalid post id." });
      }

      const comments = await CommentService.listByPost(postId);

      res.status(200).json(comments);
    } catch (err: unknown) {
      res.status(500).json({ error: "Error retrieving comments." });
    }
  }
}
