import { Request, Response, NextFunction } from "express";
import { authService } from "../auth";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token d'accès requis" });
  }

  try {
    const user = await authService.authenticateToken(token);
    if (!user) {
      return res.status(401).json({ message: "Token invalide" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
}

export async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentification requise" });
  }

  const canAssign = await authService.canAssignRoles(req.user.id);
  if (!canAssign) {
    return res.status(403).json({ message: "Permissions administrateur requises" });
  }

  next();
} 