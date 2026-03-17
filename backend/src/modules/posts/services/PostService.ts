import { PrismaClient, Role } from "../../../generated/prisma/client";
import { generateSlug } from "../utils/slugifier";
import { extractExcerpt } from "../utils/excerptExtractor";
import { CreatePostDTO, UpdatePostDTO } from "../dtos/PostDTO";

const prisma = new PrismaClient();

interface EditorContent {
  blocks: Array<{ type: string; data: Record<string, unknown> }>;
}

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  createdAt: Date;
  authorName: string;
  rank: number;
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

  static async list(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: {
        published: true,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    return posts;
  }

  static async getBySlug(slug: string) {
    const post = await prisma.post.findUnique({
      where: {
        slug,
      },
      include: {
        author: {
          select: { name: true, bio: true, avatarUrl: true },
        },
      },
    });

    if (!post || !post.published) {
      throw new Error("Post not found.");
    }

    return post;
  }

  static async search(
    query: string,
    limit: number = 10,
  ): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchQuery = query.trim();

    const posts = await prisma.$queryRaw<SearchResult[]>`
      SELECT
        p.id,
        p.slug,
        p.title,
        p.excerpt,
        p."createdAt",
        u.name AS "authorName",
        ts_rank(to_tsvector('portuguese', ´.title || ' ' || coalesce(p.excerpt, '')), websearch_to_tsquery('portuguese', ${searchQuery})) AS rank,
        similarity(p.title, ${searchQuery}) AS sim_score
      FROM "Post" p
      INNER JOIN "User" u ON p."authorId" = u.id
      WHERE p.published = true
        AND (
          to_tsvector('portuguese', p.title || ' ' || coalesce(p.excerpt, '')) @@ websearch_to_tsquery('portuguese', ${searchQuery})
          OR
          p.title % ${searchQuery}
        )
        ORDER BY rank DESC, sim_score DESC
        LIMIT ${limit};
      `;

    return posts;
  }
}
