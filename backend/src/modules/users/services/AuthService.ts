import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client/extension";
import { PasswordService } from "./PasswordService";
import { RegisterDTO, LoginDTO } from "../dtos/AuthDTO";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "super-refresh-secret";

export class AuthService {
  static async register(data: RegisterDTO) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("E-mail já está em uso");
    }

    const hashedPassword = await PasswordService.hash(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    return user;
  }

  static async login(data: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("Invalid credentials.");
    }

    const isPasswordValid = await PasswordService.compare(
      data.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new Error("Invalid credentials.");
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign({ userid: user.id }, REFRESH_SECRET, {
      expiresIn: "7d",
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt,
      },
    });

    return { user, accessToken, refreshToken };
  }
}
