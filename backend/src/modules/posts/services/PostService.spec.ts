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

    describe("getBySlug", () => {
      it("should return the post if it exists and has been published", async () => {
        const mockSlug = "artigo-valido";
        prismaMock.post.findUnique.mockResolvedValue({
          id: "post-1",
          slug: mockSlug,
          published: true,
        } as any);

        const result = await PostService.getBySlug(mockSlug);

        expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
          where: { slug: mockSlug },
          include: {
            author: { select: { name: true, bio: true, avatarUrl: true } },
          },
        });
        expect(result.id).toBe("post-1");
      });

      it("should return the post if it exists and has been published", async () => {
        prismaMock.post.findUnique.mockResolvedValue({
          id: "post-1",
          slug: "rascunho-secreto",
          published: false,
        } as any);

        await expect(PostService.getBySlug("rascunho-secreto")).rejects.toThrow(
          "Post not found.",
        );
      });

      it("should throw an error if the post does not exist in the database", async () => {
        prismaMock.post.findUnique.mockResolvedValue(null);
        await expect(PostService.getBySlug("nao-existe")).rejects.toThrow(
          "Post not found.",
        );
      });
    });

    describe("search", () => {
      it("should return an empty array if the query is empty or contains only spaces", async () => {
        const result = await PostService.search("   ");
        expect(result).toEqual([]);
        expect(prismaMock.$queryRaw).not.toHaveBeenCalled();
      });

      it("should execute the raw query correctly and return the search results", async () => {
        const mockQuery = "Tecnologia";
        const mockResults = [
          { id: "1", title: "Tecnologia Avançada", rank: 0.9 },
        ];

        prismaMock.$queryRaw.mockResolvedValue(mockResults);

        const result = await PostService.search(mockQuery, 5);

        expect(prismaMock.$queryRaw).toHaveBeenCalledOnce();
        expect(result).toEqual(mockResults);
      });
    });
  });
});
