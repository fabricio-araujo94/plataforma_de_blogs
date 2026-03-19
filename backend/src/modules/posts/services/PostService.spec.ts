import { describe, it, expect, vi } from "vitest";
import { PostService } from "./PostService";
import { prismaMock } from "../../../__mocks__/prisma";
import { Role } from "../../../generated/prisma/enums";

describe("PostService", () => {
  describe("create", () => {
    it("it should create a post by generating a unique slug and extracting the excerpt", async () => {
      const authorId = "user-123";
      const mockData = {
        title: "Meu Primeiro Post",
        content: {
          blocks: [
            {
              type: "paragraph",
              data: { text: "Este é o primeiro parágrafo do texto." },
            },
          ],
        },
        published: true,
      };

      prismaMock.post.create.mockResolvedValue({
        id: "post-1",
        title: mockData.title,
        slug: "meu-primeiro-post-abc123",
        excerpt: "Este é o primeiro parágrafo do texto.",
        content: mockData.content as any,
        published: true,
        authorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await PostService.create(authorId, mockData);

      expect(prismaMock.post.create).toHaveBeenCalledOnce();

      const callArgs = prismaMock.post.create.mock.calls[0]![0]!.data;

      expect(callArgs.title).toBe(mockData.title);
      expect(callArgs.authorId).toBe(authorId);
      expect(callArgs.slug).toMatch(/^meu-primeiro-post-[a-f0-9]{6}$/);
      expect(callArgs.excerpt).toBe("Este é o primeiro parágrafo do texto.");
      expect(result.id).toBe("post-1");
    });

    describe("update", () => {
      it("should block editing if the user is neither the author nor an admin", async () => {
        const postId = "post-1";
        const hackerId = "user-999";

        prismaMock.post.findUnique.mockResolvedValue({
          id: postId,
          authorId: "user-123",
          title: "Post Original",
          slug: "post-original-123",
          excerpt: null,
          content: {},
          published: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await expect(
          PostService.update(postId, hackerId, Role.READER, {
            title: "Hacked",
          }),
        ).rejects.toThrow(
          "Access denied: Only the author or an administrator can edit this post.",
        );

        expect(prismaMock.post.update).not.toHaveBeenCalled();
      });

      it("should allow editing if the user is an admin", async () => {
        const postId = "post-1";
        const adminId = "admin-001";

        prismaMock.post.findUnique.mockResolvedValue({
          id: postId,
          authorId: "user-123",
        } as any);

        prismaMock.post.update.mockResolvedValue({ id: postId } as any);

        await PostService.update(postId, adminId, Role.ADMIN, {
          title: "Corrected Title",
        });

        expect(prismaMock.post.update).toHaveBeenCalledOnce();
      });
    });
  });
});
