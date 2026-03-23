import prisma from "../../../lib/prisma";

export class AdminService {
  static async toggleShadowban(targetUserId: string) {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, isShadowbanned: true },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const newStatus = !user.isShadowbanned;

    await prisma.user.update({
      where: { id: targetUserId },
      data: { isShadowbanned: newStatus },
    });

    return {
      userId: targetUserId,
      isShadowbanned: newStatus,
      message: newStatus ? "User shadowbanned" : "Shadowban removed",
    };
  }
}
