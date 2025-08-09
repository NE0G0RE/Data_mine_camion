import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { and, eq, sql, inArray } from 'drizzle-orm';
import { features, roles, roleFeatures } from '../../shared/schema.js';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: string;
      [key: string]: any;
    };
  }
}

// Schémas de validation avec Zod
const toggleFeatureSchema = z.object({
  featureId: z.string().uuid('ID de fonctionnalité invalide'),
  active: z.boolean(),
});

const assignFeatureToRoleSchema = z.object({
  roleId: z.string().uuid('ID de rôle invalide'),
  featureId: z.string().uuid('ID de fonctionnalité invalide'),
  peutVoir: z.boolean().default(false),
  peutModifier: z.boolean().default(false),
  peutSupprimer: z.boolean().default(false),
  commentaire: z.string().optional(),
});

const updateRolePermissionsSchema = z.object({
  permissions: z.array(
    z.object({
      featureId: z.string().uuid('ID de fonctionnalité invalide'),
      peutVoir: z.boolean(),
      peutModifier: z.boolean(),
      peutSupprimer: z.boolean(),
    })
  ),
});

/**
 * Contrôleur pour les fonctionnalités spécifiques au gestionnaire
 */
class ManagerController {
  /**
   * Active ou désactive une fonctionnalité
   */
  async toggleFeature(req: Request, res: Response) {
    try {
      const validation = toggleFeatureSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: validation.error.errors,
        });
      }

      const { featureId, active } = validation.data;
      
      // Vérifier que la fonctionnalité existe
      const [feature] = await db
        .select()
        .from(features)
        .where(eq(features.id, featureId))
        .limit(1);
      
      if (!feature) {
        return res.status(404).json({
          success: false,
          message: 'Fonctionnalité non trouvée',
        });
      }

      // Mettre à jour le statut de la fonctionnalité
      await db
        .update(features)
        .set({
          actif: active,
        })
        .where(eq(features.id, featureId));
      
      // Récupérer la fonctionnalité mise à jour
      const [updatedFeature] = await db
        .select()
        .from(features)
        .where(eq(features.id, featureId))
        .limit(1);
      
      res.json({
        success: true,
        data: updatedFeature,
      });
      
    } catch (error) {
      console.error('Erreur lors de la modification du statut de la fonctionnalité:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la modification du statut de la fonctionnalité',
      });
    }
  }

  /**
   * Attribue une fonctionnalité à un rôle avec des permissions spécifiques
   */
  async assignFeatureToRole(req: Request, res: Response) {
    try {
      const validation = assignFeatureToRoleSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: validation.error.errors,
        });
      }

      const { roleId, featureId, ...permissions } = validation.data;
      
      // Vérifier que le rôle existe
      const [role] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, roleId))
        .limit(1);
      
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Rôle non trouvé',
        });
      }
      
      // Vérifier que la fonctionnalité existe
      const [feature] = await db
        .select()
        .from(features)
        .where(eq(features.id, featureId))
        .limit(1);
      
      if (!feature) {
        return res.status(404).json({
          success: false,
          message: 'Fonctionnalité non trouvée',
        });
      }
      
      // Vérifier si la permission existe déjà pour ce rôle et cette fonctionnalité
      const [existingPermission] = await db
        .select()
        .from(roleFeatures)
        .where(
          and(
            eq(roleFeatures.roleId, roleId),
            eq(roleFeatures.featureId, featureId),
            sql`${roleFeatures.dateFin} IS NULL`
          )
        )
        .limit(1);
      
      if (existingPermission) {
        // Mettre à jour la permission existante
        await db
          .update(roleFeatures)
          .set(permissions)
          .where(eq(roleFeatures.id, existingPermission.id));
        
        // Récupérer la permission mise à jour
        const [updatedPermission] = await db
          .select()
          .from(roleFeatures)
          .where(eq(roleFeatures.id, existingPermission.id))
          .limit(1);
        
        return res.json({
          success: true,
          data: updatedPermission,
          message: 'Permission mise à jour avec succès',
        });
      } else {
        // Créer une nouvelle permission
        const newPermissionId = crypto.randomUUID();
        await db
          .insert(roleFeatures)
          .values({
            id: newPermissionId,
            roleId,
            featureId,
            ...permissions,
            dateAttribution: new Date(),
            attribuePar: (req as any).user?.id || 'system',
          });
        
        // Récupérer la nouvelle permission
        const [newPermission] = await db
          .select()
          .from(roleFeatures)
          .where(eq(roleFeatures.id, newPermissionId))
          .limit(1);
        
        return res.status(201).json({
          success: true,
          data: newPermission,
          message: 'Permission attribuée avec succès',
        });
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'attribution de la permission:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'attribution de la permission',
      });
    }
  }

  /**
   * Met à jour les permissions d'un rôle pour plusieurs fonctionnalités
   */
  async updateRolePermissions(req: Request, res: Response) {
    try {
      const { roleId } = req.params;
      const validation = updateRolePermissionsSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: validation.error.errors,
        });
      }

      const { permissions } = validation.data;
      
      // Vérifier que le rôle existe
      const [role] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, roleId))
        .limit(1);
      
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Rôle non trouvé',
        });
      }
      
      // Vérifier que toutes les fonctionnalités existent
      const featureIds = permissions.map(p => p.featureId);
      const existingFeatures = await db
        .select({ id: features.id })
        .from(features)
        .where(inArray(features.id, featureIds));
      
      if (existingFeatures.length !== featureIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Une ou plusieurs fonctionnalités n\'existent pas',
        });
      }
      
      // Démarrer une transaction
      await db.transaction(async (tx: any) => {
        // Supprimer les anciennes permissions du rôle
        await tx
          .delete(roleFeatures)
          .where(eq(roleFeatures.roleId, roleId));
        
        // Ajouter les nouvelles permissions
        if (permissions.length > 0) {
          await tx
            .insert(roleFeatures)
            .values(
              permissions.map(perm => ({
                id: crypto.randomUUID(),
                roleId,
                featureId: perm.featureId,
                peutVoir: perm.peutVoir,
                peutModifier: perm.peutModifier,
                peutSupprimer: perm.peutSupprimer,
                dateAttribution: new Date(),
                attribuePar: req.user?.id || 'system',
              }))
            );
        }
        
        res.json({
          success: true,
          message: 'Permissions mises à jour avec succès',
        });
      });
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour des permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour des permissions',
      });
    }
  }

  /**
   * Récupère toutes les fonctionnalités avec leur statut d'activation
   */
  async getAllFeatures(req: Request, res: Response) {
    try {
      const allFeatures = await db
        .select()
        .from(features)
        .orderBy(features.nom);
      
      res.json({
        success: true,
        data: allFeatures,
      });
      
    } catch (error) {
      console.error('Erreur lors de la récupération des fonctionnalités:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des fonctionnalités',
      });
    }
  }

  /**
   * Récupère les permissions d'un rôle
   */
  async getRolePermissions(req: Request, res: Response) {
    try {
      const { roleId } = req.params;
      const db = await getDb();
      
      // Vérifier que le rôle existe
      const [role] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, roleId))
        .limit(1);
      
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Rôle non trouvé',
        });
      }
      
      // Récupérer toutes les fonctionnalités avec les permissions actuelles du rôle
      const allFeatures = await db
        .select({
          id: features.id,
          code: features.code,
          nom: features.nom,
          description: features.description,
          actif: features.actif,
          permissionId: roleFeatures.id,
          peutVoir: roleFeatures.peutVoir,
          peutModifier: roleFeatures.peutModifier,
          peutSupprimer: roleFeatures.peutSupprimer,
        })
        .from(features)
        .leftJoin(
          roleFeatures,
          and(
            eq(features.id, roleFeatures.featureId),
            eq(roleFeatures.roleId, roleId),
            sql`${roleFeatures.dateFin} IS NULL`
          )
        )
        .orderBy(features.nom);
      
      // Formater la réponse
      const formattedFeatures = allFeatures.map((feature: any) => ({
        id: feature.id,
        code: feature.code,
        nom: feature.nom,
        description: feature.description,
        actif: feature.actif,
        permissions: feature.permissionId ? {
          peutVoir: feature.peutVoir,
          peutModifier: feature.peutModifier,
          peutSupprimer: feature.peutSupprimer,
        } : null,
      }));
      
      res.json({
        success: true,
        data: {
          role,
          features: formattedFeatures,
        },
      });
      
    } catch (error) {
      console.error('Erreur lors de la récupération des permissions du rôle:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des permissions du rôle',
      });
    }
  }

  /**
   * Récupère les utilisateurs ayant un rôle spécifique
   */
  async getUsersByRole(req: Request, res: Response) {
    try {
      const { roleId } = req.params;
      
      // Vérifier que le rôle existe
      const [role] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, roleId))
        .limit(1);
      
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Rôle non trouvé',
        });
      }
      
      // Dans une implémentation réelle, vous devriez avoir une table users et user_roles
      // Pour l'instant, nous retournons un tableau vide comme solution temporaire
      const usersWithRole: any[] = [];
      
      res.json({
        success: true,
        data: {
          role,
          users: usersWithRole,
        },
      });
      
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs par rôle:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des utilisateurs par rôle',
      });
    }
  }
}

export const managerController = new ManagerController();
