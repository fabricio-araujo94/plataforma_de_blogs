import { Request, Response, NextFunction } from "express";
import { Role } from "../../generated/prisma/enums";

export function requireRole(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error:
          "Access denied: You do not have permission to perform this action",
      });
    }

    next();
  };
}
