import { Request, Response, NextFunction } from "express";
import { featureService } from "../services/feature.service";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Schémas de validation
const featureSchema = z.object({
  code: z.string().min(3).max(100),
  nom: z.string().min(3).max(255),
  description: z.string().optional(),
  categorie: z.string().min(3).max(100),
  actif: z.boolean().default(true),
});

const updatePermissionSchema = z.object({
  roleId: z.string().uuid(),
  featureId: z.string().uuid(),
  peutVoir: z.boolean().optional(),
  peutModifier: z.boolean().optional(),
  peutSupprimer: z.boolean().optional(),
});

/**
 * Contrôleur pour la gestion des fonctionnalités
 */
export class FeatureController {
  /**
   * Récupère toutes les fonctionnalités
   */
  async getAllFeatures(req: Request, res: Response, next: NextFunction) {
    try {
      const features = await featureService.getAllFeatures();
      res.json(features);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupère une fonctionnalité par son ID
   */
  async getFeatureById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const feature = await featureService.getFeatureById(id);
      
      if (!feature) {
        return res.status(404).json({ message: "Fonctionnalité non trouvée" });
      }
      
      res.json(feature);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crée une nouvelle fonctionnalité
   */
  async createFeature(req: Request, res: Response, next: NextFunction) {
    try {
      // Vérification des autorisations
      if (!(req as any).user?.isAdmin) {
        return res.status(403).json({ message: "Accès refusé. Droits insuffisants." });
      }

      const validation = featureSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          message: "Données invalides",
          errors: fromZodError(validation.error).message,
        });
      }

      const featureData = validation.data;
      const newFeature = await featureService.createFeature({
        ...featureData,
        // L'ID sera généré par le service
      });

      res.status(201).json(newFeature);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Met à jour une fonctionnalité existante
   */
  async updateFeature(req: Request, res: Response, next: NextFunction) {
    try {
      // Vérification des autorisations
      if (!(req as any).user?.isAdmin) {
        return res.status(403).json({ message: "Accès refusé. Droits insuffisants." });
      }

      const { id } = req.params;
      const validation = featureSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          message: "Données invalides",
          errors: fromZodError(validation.error).message,
        });
      }

      const updatedFeature = await featureService.updateFeature(
        id,
        validation.data
      );

      if (!updatedFeature) {
        return res.status(404).json({ message: "Fonctionnalité non trouvée" });
      }

      res.json(updatedFeature);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Supprime une fonctionnalité (soft delete)
   */
  async deleteFeature(req: Request, res: Response, next: NextFunction) {
    try {
      // Vérification des autorisations
      if (!(req as any).user?.isAdmin) {
        return res.status(403).json({ message: "Accès refusé. Droits insuffisants." });
      }

      const { id } = req.params;
      await featureService.deleteFeature(id);
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Met à jour les permissions d'un rôle pour une fonctionnalité
   */
  async updateRolePermission(req: Request, res: Response, next: NextFunction) {
    try {
      // Vérification des autorisations
      if (!(req as any).user?.isAdmin) {
        return res.status(403).json({ message: "Accès refusé. Droits insuffisants." });
      }

      const validation = updatePermissionSchema.safeParse({
        ...req.params,
        ...req.body,
      });
      
      if (!validation.success) {
        return res.status(400).json({
          message: "Données invalides",
          errors: fromZodError(validation.error).message,
        });
      }

      const { roleId, featureId, ...permissions } = validation.data;
      
      const updatedPermission = await featureService.updateRolePermission(
        roleId,
        featureId,
        permissions,
        (req as any).user.id // ID de l'utilisateur qui effectue la modification
      );

      res.json(updatedPermission);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupère toutes les fonctionnalités avec les permissions pour un rôle
   */
  async getRoleFeatures(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId } = req.params;
      
      // Vérification des autorisations
      const isAdmin = (req as any).user?.isAdmin;
      const isManager = (req as any).user?.isManager;
      
      if (!isAdmin && !isManager) {
        return res.status(403).json({ message: "Accès refusé. Droits insuffisants." });
      }
      
      const features = await featureService.getFeaturesWithPermissions(roleId);
      res.json(features);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Vérifie si l'utilisateur a une certaine permission
   */
  async checkPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const { featureCode, action } = req.params;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Non authentifié" });
      }
      
      // Récupérer le rôle de l'utilisateur
      // Note: Implémentez cette logique selon votre système d'authentification
      const userRole = (req as any).user?.roleId;
      
      if (!userRole) {
        return res.status(403).json({ 
          hasPermission: false,
          message: "Aucun rôle attribué" 
        });
      }
      
      // Vérifier la permission
      const hasPermission = await featureService.hasPermission(
        userRole,
        featureCode,
        action as any
      );
      
      res.json({ hasPermission });
    } catch (error) {
      next(error);
    }
  }
}

export const featureController = new FeatureController();
