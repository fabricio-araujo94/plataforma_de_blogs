import { Request, Response } from "express";
import { MediaService } from "../services/MediaService";
import { generatePresignedUrlSchema } from "../dtos/MediaDTO";

export class MediaController {
  static async getUploadUrl(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthenticated user." });
      }

      const data = generatePresignedUrlSchema.parse(req.body);
      const result = await MediaService.generatePresignedUrl(req.user.id, data);

      res.status(200).json(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res
          .status(500)
          .json({ error: "Internal error while generating the upload URL" });
      }
    }
  }
}
