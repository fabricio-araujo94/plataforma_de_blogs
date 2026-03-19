import { describe, it, expect } from "vitest";
import { AdminService } from "./AdminService";
import { prismaMock } from "../../../__mocks__/prisma";

describe("AdminService", () => {
  describe("toggleShadowban", () => {
    it("should shadowban the user if they are active", async () => {
      const mockUserId = "user-123";

      prismaMock.user.findUnique.mockResolvedValue({
        id: mockUserId,
        isShadowbanned: false,
      });

      prismaMock.user.update.mockResolvedValue({
        id: mockUserId,
        isShadowBanned: true,
      });

      const result = await AdminService.toggleShadowban(mockUserId);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true, isShadowbanned: true },
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { isShadowbanned: true },
      });

      expect(result).toEqual({
        userId: mockUserId,
        isShadowbanned: true,
        message: "User has been shadowbanned.",
      });
    });

    it("should throw an error if the user is not found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(AdminService.toggleShadowban("fake-id")).rejects.toThrow(
        "User not found..",
      );
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });
});
