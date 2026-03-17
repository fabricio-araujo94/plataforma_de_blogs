import { Request, Response } from "express";
import { ViewService } from "../services/ViewService";

export class ViewController {
  static register(req: Request, res: Response) {
    const { postId } = req.params;

    if (!postId || Array.isArray(postId)) {
      return res.status(400).json({ error: "The post ID is required." });
    }

    ViewService.registerView(postId);

    res.status(202).json({ message: "View recorded in the queue." });
  }

  static async getCount(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      if (!postId || Array.isArray(postId)) {
        return res.status(400).json({ error: "Invalid post id." });
      }
      const count = await ViewService.getPostViews(postId);

      res.status(200).json({ views: count });
    } catch (err: unknown) {
      res.status(500).json({ error: "Error retrieving views." });
    }
  }
}
