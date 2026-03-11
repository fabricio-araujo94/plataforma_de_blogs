import { PrismaClient, Role } from "../../../generated/prisma/client";
import { generateSlug } from "../utils/slugifier";
import { extractExcerpt } from "../utils/excerptExtractor";
import { CreatePostDTO, UpdatePostDTO } from "../dtos/PostDTO";

const prisma = new PrismaClient();

interface EditorContent {
  blocks: Array<{ type: string; data: Record<string, unknown> }>;
}

export class PostService {
  static async create(authorId: string, data: CreatePostDTO) {
    const slug = generateSlug(data.title);

    const content = data.content as unknown as EditorContent;
    const excerpt = extractExcerpt(content);

    return prisma.post.create({
      data: {
        title: data.title,
        slug,
        content: data.content as object,
        excerpt,
        published: data.published ?? false,
        authorId,
      },
    });
  }

  static async update(
    postId: string,
    userId: string,
    userRole: Role,
    data: UpdatePostDTO,
  ) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error("Post not found.");
    }

    if (post.authorId !== userId && userRole !== Role.ADMIN) {
      throw new Error(
        "Access denied: Only the author or an administrator can edit this post.",
      );
    }

    const updateData: Record<string, unknown> = {};

    if (data.title) {
      updateData.title = data.title;
    }

    if (data.content) {
      updateData.content = data.content as object;
      const content = data.content as unknown as EditorContent;
      updateData.excerpt = extractExcerpt(content);
    }

    if (data.published !== undefined) {
      updateData.published = data.published;
    }

    return prisma.post.update({
      where: { id: postId },
      data: updateData,
    });
  }
}
