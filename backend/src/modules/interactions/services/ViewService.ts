import { PrismaClient } from "../../../generated/prisma/client";

const prisma = new PrismaClient();

export class ViewService {
  // In-memory buffer: Map<postId, number of pending views>
  private static viewBuffer = new Map<string, number>();

  private static flushInterval = 1000 * 15;

  static {
    setInterval(() => ViewService.flush(), ViewService.flushInterval);
  }

  static registerView(postId: string) {
    const currentCount = this.viewBuffer.get(postId) || 0;
    this.viewBuffer.set(postId, currentCount + 1);
  }

  static async getPostViews(postId: string) {
    return prisma.view.count({
      where: { postId },
    });
  }

  private static async flush() {
    if (this.viewBuffer.size === 0) return;

    const entries = Array.from(this.viewBuffer.entries());
    this.viewBuffer.clear();

    try {
      const viewsData: { postId: string }[] = [];

      for (const [postId, count] of entries) {
        for (let i = 0; i < count; i++) {
          viewsData.push({ postId });
        }
      }

      await prisma.view.createMany({
        data: viewsData,
      });

      console.log(
        `[ViewService] ${viewsData.length} views saved in the database.`,
      );
    } catch (err: unknown) {
      console.error("[ViewService] Error downloading views:", err);
    }
  }
}
