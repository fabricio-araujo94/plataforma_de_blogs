import { PrismaClient } from "../generated/prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { beforeEach, vi } from "vitest";

export const prismaMock = mockDeep<PrismaClient>();

vi.mock("../generated/prisma/client", () => ({
  PrismaClient: vi.fn(() => prismaMock),
}));

beforeEach(() => {
  mockReset(prismaMock);
});
