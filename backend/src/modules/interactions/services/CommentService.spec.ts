import { describe, it, expect } from "vitest";
import { CommentService } from "./CommentService";
import { prismaMock } from "../../../__mocks__/prisma";

describe("CommentService", () => {
  const mockUserId = "user-1";
  const mockPostId = "post-1";

  describe("create", () => {
    it("should throw an error if the post does not exist", async () => {
      prismaMock.post.findUnique.mockResolvedValue(null);

      await expect(
        CommentService.create(mockUserId, mockPostId, {
          content: "Muito bom!",
        }),
      ).rejects.toThrow("Post not found.");
    });

    it("should create a root comment if no parentId is provided", async () => {
      prismaMock.post.findUnique.mockResolvedValue({ id: mockPostId } as any);
      prismaMock.comment.create.mockResolvedValue({
        id: "comment-1",
        content: "Muito bom!",
        userId: mockUserId,
        postId: mockPostId,
        parentId: null,
      } as any);

      const result = await CommentService.create(mockUserId, mockPostId, {
        content: "Muito bom!",
      });

      expect(prismaMock.comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            content: "Muito bom!",
            userId: mockUserId,
            postId: mockPostId,
            parentId: null,
          },
        }),
      );
      expect(result.id).toBe("comment-1");
    });

    it("should throw an error if attempting to reply to a comment from another post", async () => {
      prismaMock.post.findUnique.mockResolvedValue({ id: mockPostId } as any);

      prismaMock.comment.findUnique.mockResolvedValue({
        id: "parent-1",
        postId: "post-2",
      } as any);

      await expect(
        CommentService.create(mockUserId, mockPostId, {
          content: "Resposta",
          parentId: "parent-1",
        }),
      ).rejects.toThrow("the parent comment belongs to another post");
    });
  });

  describe("listByPost", () => {
    it("should retrieve comments by applying the Shadowban filter", async () => {
      prismaMock.comment.findMany.mockResolvedValue([]);

      await CommentService.listByPost(mockPostId);

      expect(prismaMock.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            postId: mockPostId,
            parentId: null,
            isHidden: false,
            user: { isShadowbanned: false },
          }),
        }),
      );
    });
  });
});
