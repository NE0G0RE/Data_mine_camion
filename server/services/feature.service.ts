import { and, eq } from "drizzle-orm";
import { features, roles, roleFeatures, userRoles } from "../../shared/dist/schema.js";
import { getDb } from "../db.js";
import { v4 as uuidv4 } from "uuid";

// Types
type Feature = typeof features.$inferSelect;
type InsertFeature = typeof features.$inferInsert;
type RoleFeature = typeof roleFeatures.$inferSelect;
type InsertRoleFeature = typeof roleFeatures.$inferInsert;

// Helper type for feature with permissions
type FeatureWithPermissions = Feature & {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

/**
 * Service pour gérer les fonctionnalités et les permissions associées
 */
export class FeatureService {
  /**
   * Récupère toutes les fonctionnalités actives
   */
  async getAllFeatures(): Promise<Feature[]> {
    const db = await getDb();
    return db.select()
      .from(features)
      .where(eq(features.isActive, true));
  }

  /**
   * Récupère une fonctionnalité par son ID
   */
  async getFeatureById(id: string): Promise<Feature | undefined> {
    const db = await getDb();
    const result = await db
      .select()
      .from(features)
      .where(eq(features.id, id))
      .limit(1);
    return result[0];
  }

  /**
   * Récupère une fonctionnalité par son code
   */
  async getFeatureByName(name: string): Promise<Feature | undefined> {
    const db = await getDb();
    const [feature] = await db
      .select()
      .from(features)
      .where(and(
        eq(features.name, name),
        eq(features.isActive, true)
      ))
      .limit(1);
    
    return feature;
  }

  /**
   * Crée une nouvelle fonctionnalité
   */
  async createFeature(featureData: InsertFeature): Promise<Feature> {
    const db = await getDb();
    const newFeature: InsertFeature = {
      ...featureData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.insert(features).values(newFeature);
    const [insertedFeature] = await db.select()
      .from(features)
      .where(eq(features.id, newFeature.id as string))
      .limit(1);
    
    return insertedFeature;
  }

  /**
   * Met à jour une fonctionnalité existante
   */
  async updateFeature(id: string, featureData: Partial<InsertFeature>): Promise<Feature | undefined> {
    const db = await getDb();
    const updateData = {
      ...featureData,
      updatedAt: new Date()
    };
    
    await db.update(features)
      .set(updateData)
      .where(and(
        eq(features.id, id),
        eq(features.isActive, true)
      ));
    
    const [updatedFeature] = await db.select()
      .from(features)
      .where(eq(features.id, id))
      .limit(1);
    
    return updatedFeature;
  }

  /**
   * Désactive une fonctionnalité (soft delete)
   */
  async deleteFeature(id: string): Promise<boolean> {
    const db = await getDb();
    await db.update(features)
      .set({ 
        isActive: false,
        updatedAt: new Date() 
      })
      .where(eq(features.id, id));
    
    const [deletedFeature] = await db.select()
      .from(features)
      .where(eq(features.id, id))
      .limit(1);
    
    return !!deletedFeature && !deletedFeature.isActive;
  }

  /**
   * Récupère toutes les permissions pour un rôle
   */
  async getRolePermissions(roleId: string): Promise<RoleFeature[]> {
    const db = await getDb();
    const result = await db
      .select()
      .from(roleFeatures)
      .where(eq(roleFeatures.roleId, roleId));
    return result;
  }

  /**
   * Vérifie si un rôle a une certaine permission
   */
  async hasPermission(roleId: string, featureId: string, action: 'voir' | 'modifier' | 'supprimer'): Promise<boolean> {
    const db = await getDb();
    
    const result = await db
      .select()
      .from(roleFeatures)
      .leftJoin(features, eq(roleFeatures.featureId, features.id))
      .where(
        and(
          eq(roleFeatures.roleId, roleId),
          eq(roleFeatures.featureId, featureId)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return false;
    }

    const roleFeature = result[0].role_features;
    
    // Handle null values by converting them to false
    const canView = roleFeature?.canView ?? false;
    const canEdit = roleFeature?.canEdit ?? false;
    const canDelete = roleFeature?.canDelete ?? false;
    
    switch (action) {
      case 'voir':
        return canView;
      case 'modifier':
        return canEdit;
      case 'supprimer':
        return canDelete;
      default:
        return false;
    }
  }

  /**
   * Met à jour les permissions d'un rôle pour une fonctionnalité
   */
  async updateRolePermission(
    roleId: string, 
    featureId: string, 
    permissions: {
      canView?: boolean;
      canEdit?: boolean;
      canDelete?: boolean;
    },
    userId: string
  ): Promise<RoleFeature> {
    const db = await getDb();
    
    // Check if permission already exists
    const existingPermissions = await db
      .select()
      .from(roleFeatures)
      .where(
        and(
          eq(roleFeatures.roleId, roleId),
          eq(roleFeatures.featureId, featureId)
        )
      )
      .limit(1);

    if (existingPermissions.length > 0) {
      // Update existing permission
      const existing = existingPermissions[0];
      if (!existing || !existing.id) {
        throw new Error("Invalid existing permission data");
      }
      
      const updateData = {
        canView: permissions.canView ?? existing.canView ?? false,
        canEdit: permissions.canEdit ?? existing.canEdit ?? false,
        canDelete: permissions.canDelete ?? existing.canDelete ?? false,
        updatedAt: new Date()
      };
      
      // Update the permission
      await db
        .update(roleFeatures)
        .set(updateData)
        .where(eq(roleFeatures.id, existing.id));
      
      // Fetch the updated permission with proper type casting
      const [updatedPermission] = await db
        .select()
        .from(roleFeatures)
        .where(eq(roleFeatures.id as any, existing.id)) // Type assertion to bypass the type error
        .limit(1);
      
      if (!updatedPermission) {
        throw new Error("Failed to fetch updated permission");
      }
      
      return updatedPermission as RoleFeature;
    } else {
      // Create new permission
      const newPermission: InsertRoleFeature = {
        id: uuidv4(),
        roleId,
        featureId,
        canView: permissions.canView ?? false,
        canEdit: permissions.canEdit ?? false,
        canDelete: permissions.canDelete ?? false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.insert(roleFeatures).values(newPermission);
      
      const [insertedPermission] = await db.select()
        .from(roleFeatures)
        .where(eq(roleFeatures.id, newPermission.id))
        .limit(1);
      
      if (!insertedPermission) {
        throw new Error("Erreur lors de la création de la permission");
      }
      
      return insertedPermission as RoleFeature;
    }
  }

  /**
   * Récupère toutes les fonctionnalités avec les permissions pour un rôle
   */
  async getFeaturesWithPermissions(roleId: string): Promise<FeatureWithPermissions[]> {
    const db = await getDb();
    
    // Récupérer toutes les fonctionnalités actives
    const allFeatures = await db
      .select()
      .from(features)
      .where(eq(features.isActive, true));

    // Récupérer les permissions du rôle
    const rolePermissions = await db
      .select()
      .from(roleFeatures)
      .where(eq(roleFeatures.roleId, roleId));

    // Combiner les données
    return allFeatures.map(feature => {
      const permission = rolePermissions.find(p => p.featureId === feature.id);
      
      return {
        ...feature,
        canView: permission?.canView ?? false,
        canEdit: permission?.canEdit ?? false,
        canDelete: permission?.canDelete ?? false
      };
    });
  }

  /**
   * Récupère toutes les permissions d'un utilisateur sous forme d'objet clé-valeur
   * @param roleId ID du rôle de l'utilisateur
   */
  async getUserPermissions(roleId: string): Promise<Record<string, boolean>> {
    const userFeatures = await this.getFeaturesWithPermissions(roleId);
    
    // Créer un objet clé-valeur avec les permissions
    const permissions: Record<string, boolean> = {};
    
    userFeatures.forEach(feature => {
      permissions[`${feature.id}:view`] = feature.canView;
      permissions[`${feature.id}:edit`] = feature.canEdit;
      permissions[`${feature.id}:delete`] = feature.canDelete;
    });
    
    return permissions;
  }

  /**
   * Vérifie si un utilisateur a accès à une filiale spécifique
   * @param userId ID de l'utilisateur
   * @param filialeId ID de la filiale
   */
  async hasFilialeAccess(userId: string, filialeId: string): Promise<boolean> {
    const db = await getDb();
    
    try {
      // Check if user has a role that has access to the filiale
      const userRole = await db
        .select()
        .from(userRoles)
        .where(eq(userRoles.userId, userId))
        .limit(1);
      
      if (userRole.length === 0) {
        return false;
      }
      
      // In a real implementation, you would check if the role has access to the filiale
      // For now, we'll just return true if the user has any role
      return true;
      
    } catch (error) {
      console.error('Erreur lors de la vérification des accès filiale:', error);
      return false;
    }
  }
}

export const featureService = new FeatureService();
