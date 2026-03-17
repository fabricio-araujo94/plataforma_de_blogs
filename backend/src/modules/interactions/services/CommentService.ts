import { PrismaClient } from "../../../generated/prisma/client";
import { CreateCommentDTO } from "../dtos/CommentDTO";

const prisma = new PrismaClient();

export class CommentService {
  static async create(userId: string, postId: string, data: CreateCommentDTO) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new Error("Post not found.");
    }

    if (data.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: data.parentId },
      });
      if (!parentComment) {
        throw new Error("");
      }
      if (parentComment.postId !== postId) {
        throw new Error("");
      }
    }

    return prisma.comment.create({
      data: {
        content: data.content,
        userId: userId,
        postId: postId,
        parentId: data.parentId || null,
      },
      include: {
        user: {
          select: { name: true, avatarUrl: true },
        },
      },
    });
  }

  static async listByPost(postId: string) {
    return prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
        isHidden: false,
        user: {
          isShadowbanned: false,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: { name: true, avatarUrl: true },
        },
        replies: {
          where: {
            isHidden: false,
            user: {
              isShadowbanned: false,
            },
          },
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { name: true, avatarUrl: true } },
          },
        },
      },
    });
  }
}
