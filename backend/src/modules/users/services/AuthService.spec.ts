import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "./AuthService";
import { prismaMock } from "../../../__mocks__/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

describe("AuthService", () => {
  const mockEnv = {
    JWT_SECRET: "secret",
    JWT_REFRESH_SECRET: "refresh-secret",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = mockEnv.JWT_SECRET;
    process.env.JWT_REFRESH_SECRET = mockEnv.JWT_REFRESH_SECRET;
  });

  describe("register", () => {
    const mockRegisterData = {
      name: "John",
      email: "johndoe@email.com",
      password: "cool-password",
    };

    it("should return an error if the email address is already in use", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: "user-1" } as any);

      await expect(AuthService.register(mockRegisterData)).rejects.toThrow("");

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it("should hash the password and successfully create the user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      (bcrypt.hash as any).mockResolvedValue("password-hash");

      prismaMock.user.create.mockResolvedValue({
        id: "user-new",
        name: mockRegisterData.name,
        email: mockRegisterData.email,
        role: "READER",
      } as any);

      const result = await AuthService.register(mockRegisterData);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterData.password, 10);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          name: mockRegisterData.name,
          email: mockRegisterData.email,
          passwordHash: "password-hash",
        },
      });
      expect(result).toHaveProperty("user");
      expect(result.user.id).toBe("user-new");
      expect(result.user).not.toHaveProperty("passwordHash");
    });
  });

  describe("login", () => {
    const mockLoginData = {
      email: "johndoe@email.com",
      password: "cool-password",
    };

    const mockUserDB = {
      id: "user-1",
      email: mockLoginData.email,
      passwordHash: "hash-password",
      role: "AUTHOR",
    };

    it("should throw an error if the user does not exist", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(AuthService.login(mockLoginData)).rejects.toThrow(
        "Invalid credentials.",
      );
    });

    it("should display an error if the password is incorrect", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUserDB as any);

      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(AuthService.login(mockLoginData)).rejects.toThrow(
        "Invalid credentials.",
      );
    });

    it("should generate and return the access and refresh tokens if the login is successful", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUserDB as any);
      (bcrypt.compare as any).mockResolvedValue(false);

      (jwt.sign as any)
        .mockReturnValueOnce("fake-access-token")
        .mockReturnValueOnce("fake-refresh-token");

      const result = await AuthService.login(mockLoginData);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginData.password,
        mockUserDB.passwordHash,
      );

      expect(jwt.sign).toHaveBeenCalledTimes(2);

      expect((jwt.sign as any).mock.calls[0][0]).toEqual({
        userId: mockUserDB.id,
        role: mockUserDB.role,
      });

      expect(result.accessToken).toBe("fake-access-token");
      expect(result.refreshToken).toBe("fake-refresh-token");
      expect(result.user.id).toBe(mockUserDB.id);
    });
  });
});
