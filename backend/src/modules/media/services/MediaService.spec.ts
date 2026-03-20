import { describe, it, expect, vi, beforeEach } from "vitest";
import { MediaService } from "./MediaService";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn(),
  PutObjectCommand: vi.fn((args) => args),
}));

describe("MediaService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.CLOUDFLARE_R2_BUCKET_NAME = "test-bucket";
    process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN = "https://media.test.com";
  });

  describe("generatePresignedUrl", () => {
    it("should generate a signed url and a public url correctly", async () => {
      const mockUserId = "user-123";
      const mockData = {
        filename: "minha foto.png",
        contentType: "image/png",
        contentLength: 1024 * 1024,
      };

      const fakeSignedUrl = "https://fake-s3-url.com/upload?signature=xyz";

      (getSignedUrl as any).mockResolvedValue(fakeSignedUrl);

      const result = await MediaService.generatePresignedUrl(
        mockUserId,
        mockData,
      );

      expect(getSignedUrl).toHaveBeenCalledOnce();
      expect(PutObjectCommand).toHaveBeenCalledOnce();

      const commandArgs = (PutObjectCommand as any).mock.calls[0][0];
      expect(commandArgs.Key).toMatch(
        new RegExp(`^uploads/users/${mockUserId}/[a-f0-9]+-minha_foto.png$`),
      );
      expect(commandArgs.contentType).toBe("image/png");
      expect(commandArgs.contentLength).toBe(1048576);

      expect(result).toHaveProperty("uploadUrl", fakeSignedUrl);
      expect(result.publicUrl).toMatch(
        /^https:\/\/media\.test\.com\/uploads\/users\/user\/[a-f0-9]+-minha_foto.png$/,
      );
    });
  });
});
