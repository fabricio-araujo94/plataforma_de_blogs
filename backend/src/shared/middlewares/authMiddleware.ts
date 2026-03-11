import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";

interface TokenPayload {
  userId: string;
  role: Role;
  iat: number;
  exp: number;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied: Token not provided." });
    }

    const secret = process.env.JWT_SECRET || "super-secret-key";

    const decoded = jwt.verify(token, secret) as TokenPayload;

    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    return next();
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      return res
        .status(401)
        .json({ error: "Token expired.", code: "token_expired" });
    }

    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token." });
    }

    return res
      .status(500)
      .json({ error: "Internal error in authentication validation." });
  }
}
