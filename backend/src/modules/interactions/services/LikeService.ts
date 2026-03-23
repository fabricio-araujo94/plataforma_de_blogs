import prisma from "../../../lib/prisma";

export class LikeService {
  static async toggleLike(userId: string, postId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error("Post not found.");
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      return { liked: false };
    } else {
      await prisma.like.create({
        data: {
          userId,
          postId,
        },
      });
      return { liked: true };
    }
  }

  static async getPostLikes(postId: string, userId?: string) {
    const totalLikes = await prisma.like.count({
      where: { postId },
    });

    let userLiked = false;

    if (userId) {
      const like = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      userLiked = !!like;
    }

    return { totalLikes, userLiked };
  }
}
