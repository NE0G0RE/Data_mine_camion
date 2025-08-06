import type { Express } from "express";
import { authService } from "../auth";

export function registerAuthRoutes(app: Express) {
  // Connexion utilisateur
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }
      
      const user = await authService.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Identifiants invalides" });
      }
      
      const token = authService.generateToken(user.id);
      const permissions = await authService.getUserPermissions(user.id);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
        },
        token,
        permissions,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la connexion" });
    }
  });

  // Vérifier le token
  app.get("/api/auth/verify", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Token manquant" });
      }
      
      const user = await authService.authenticateToken(token);
      if (!user) {
        return res.status(401).json({ message: "Token invalide" });
      }
      
      const permissions = await authService.getUserPermissions(user.id);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
        },
        permissions,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la vérification" });
    }
  });
} 