import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { GeneratePresignedUrlDTO } from "../dtos/MediaDTO";

export class MediaService {
  private static get client(): S3Client {
    return new S3Client({
      region: "auto",
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || "",
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
      },
    });
  }

  static async generatePresignedUrl(
    userId: string,
    data: GeneratePresignedUrlDTO,
  ) {
    const fileHash = crypto.randomBytes(8).toString("hex");
    const sanitizedFilename = data.filename.replace(/[^a-zA-Z0-9.-]/g, "_");

    const fileKey = `uploads/users/${userId}/${fileHash}-${sanitizedFilename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || "teu-media-bucket",
      Key: fileKey,
      ContentType: data.contentType,
      ContentLength: data.contentLength,
    });

    const signedUrl = await getSignedUrl(this.client, command, {
      expiresIn: 60,
    });

    const publicDomain =
      process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN ||
      "https://media.teu-project.com";
    const publicUrl = `${publicDomain}/${fileKey}`;

    return {
      uploadUrl: signedUrl,
      publicUrl: publicUrl,
    };
  }
}
