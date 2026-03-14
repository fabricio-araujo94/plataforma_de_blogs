import { Request, Response } from "express";
import { LikeService } from "../services/LikeService";

export class LikeController {
  static async togglePostLike(req: Request, res: Response) {
    try {
      const { postId } = req.params;

      if (!postId || Array.isArray(postId)) {
        return res.status(400).json({ error: "Invalid post id." });
      }

      if (!req.user) {
        return res
          .status(401)
          .json({ error: "You need to be logged in to like a post." });
      }

      const result = await LikeService.toggleLike(req.user.id, postId);

      res.status(200).json(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === "Post not found.") {
          return res.status(404).json({ error: err.message });
        }
        res.status(400).json({ error: err.message });
      } else {
        res
          .status(500)
          .json({ error: "Internal error while processing the like." });
      }
    }
  }

  static async getLikesStatus(req: Request, res: Response) {
    try {
      const { postId } = req.params;

      if (!postId || Array.isArray(postId)) {
        return res.status(400).json({ error: "Invalid post id." });
      }

      const userId = req.user?.id;

      const result = await LikeService.getPostLikes(postId, userId);

      res.status(200).json(result);
    } catch (err: unknown) {
      res.status(500).json({ error: "Error retrieving the number of likes." });
    }
  }
}
