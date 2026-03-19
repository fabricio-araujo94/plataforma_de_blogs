import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ViewService } from "./ViewService";
import { prismaMock } from "../../../__mocks__/prisma";

describe("ViewService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
    (ViewService as any).viewBuffer.clear();
  });

  describe("registerView", () => {
    it("", () => {
      const postId = "post-x";

      ViewService.registerView(postId);
      ViewService.registerView(postId);
      ViewService.registerView(postId);

      expect(prismaMock.view.createMany).not.toHaveBeenCalled();

      const buffer = (ViewService as any).viewBuffer;
      expect(buffer.get(postId)).toBe(3);
    });
  });

  describe("flush", () => {
    it("", async () => {
      const postIdA = "post-A";
      const postIdB = "post-B";

      ViewService.registerView(postIdA);
      ViewService.registerView(postIdA);
      ViewService.registerView(postIdB);

      vi.advanceTimersByTime(16000);

      await vi.runAllTimersAsync();

      expect(prismaMock.post.createMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.post.createMany).toHaveBeenCalledWith({
        data: [{ postId: postIdA }, { postId: postIdA }, { postId: postIdB }],
      });

      const buffer = (ViewService as any).viewBuffer;
      expect(buffer.size).toBe(0);
    });
  });
});
