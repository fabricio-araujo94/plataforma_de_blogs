import { describe, it, expect } from "vitest";
import { LikeService } from "./LikeService";
import { prismaMock } from "../../../__mocks__/prisma";

describe("LikeService", () => {
  const mockUserId = "user-1";
  const mockPostId = "post-1";

  describe("toggleLike", () => {
    it("should throw an error if the post does not exist", async () => {
      prismaMock.post.findUnique.mockResolvedValue(null);

      await expect(
        LikeService.toggleLike(mockUserId, mockPostId),
      ).rejects.toThrow("Post not found.");
    });

    it("should add a like if the user hasn't liked the post yet", async () => {
      prismaMock.post.findUnique.mockResolvedValue({ id: mockPostId } as any);
      prismaMock.like.findUnique.mockResolvedValue({
        id: "like-1",
        userId: mockUserId,
        postId: mockPostId,
      });

      const result = await LikeService.toggleLike(mockUserId, mockPostId);

      expect(prismaMock.like.create).toHaveBeenCalledWith({
        data: { userId: mockUserId, postId: mockPostId },
      });
      expect(result).toEqual({ liked: true });
    });

    it("should remove the like if the user had already liked it", async () => {
      const existingLikeId = "like-123";
      prismaMock.post.findUnique.mockResolvedValue({ id: mockPostId } as any);
      prismaMock.like.findUnique.mockResolvedValue({
        id: existingLikeId,
        userId: mockUserId,
        postId: mockPostId,
      });
      prismaMock.like.delete.mockResolvedValue({} as any);

      const result = await LikeService.toggleLike(mockUserId, mockPostId);

      expect(prismaMock.like.delete).toHaveBeenCalledWith({
        where: { id: existingLikeId },
      });
      expect(result).toEqual({ liked: false });
    });
  });
});
