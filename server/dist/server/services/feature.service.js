import { and, eq, sql } from "drizzle-orm";
import { features, roleFeatures, permissionsUtilisateur } from "../../shared/dist/schema/index.js";
import { getDb } from "../db.js";
import { v4 as uuidv4 } from "uuid";
/**
 * Service pour gérer les fonctionnalités et les permissions associées
 */
export class FeatureService {
    /**
     * Récupère toutes les fonctionnalités actives
     */
    async getAllFeatures() {
        const db = await getDb();
        return await db
            .select()
            .from(features)
            .where(eq(features.actif, true));
    }
    /**
     * Récupère une fonctionnalité par son ID
     */
    async getFeatureById(id) {
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
    async getFeatureByCode(code) {
        const db = await getDb();
        const result = await db
            .select()
            .from(features)
            .where(eq(features.code, code))
            .limit(1);
        return result[0];
    }
    /**
     * Crée une nouvelle fonctionnalité
     */
    async createFeature(featureData) {
        const db = await getDb();
        const id = uuidv4();
        await db.insert(features).values({
            ...featureData,
            id,
        });
        const createdFeature = await this.getFeatureById(id);
        if (!createdFeature) {
            throw new Error("Erreur lors de la création de la fonctionnalité");
        }
        return createdFeature;
    }
    /**
     * Met à jour une fonctionnalité existante
     */
    async updateFeature(id, featureData) {
        const db = await getDb();
        await db
            .update(features)
            .set({
            ...featureData,
            dateMiseAJour: new Date(),
        })
            .where(eq(features.id, id));
        return this.getFeatureById(id);
    }
    /**
     * Désactive une fonctionnalité (soft delete)
     */
    async deleteFeature(id) {
        const db = await getDb();
        await db
            .update(features)
            .set({
            actif: false,
            dateMiseAJour: new Date()
        })
            .where(eq(features.id, id));
        return true;
    }
    /**
     * Récupère toutes les permissions pour un rôle
     */
    async getRolePermissions(roleId) {
        const db = await getDb();
        return await db
            .select()
            .from(roleFeatures)
            .where(and(eq(roleFeatures.roleId, roleId), sql `${roleFeatures.dateFin} IS NULL`));
    }
    /**
     * Vérifie si un rôle a une certaine permission
     */
    async hasPermission(roleId, featureCode, action) {
        const db = await getDb();
        const result = await db
            .select()
            .from(roleFeatures)
            .innerJoin(features, eq(roleFeatures.featureId, features.id))
            .where(and(eq(roleFeatures.roleId, roleId), eq(features.code, featureCode), sql `${roleFeatures.dateFin} IS NULL`))
            .limit(1);
        if (result.length === 0) {
            return false;
        }
        const permission = result[0].role_features;
        // Gérer les valeurs null en les convertissant en false
        const peutVoir = permission.peutVoir ?? false;
        const peutModifier = permission.peutModifier ?? false;
        const peutSupprimer = permission.peutSupprimer ?? false;
        switch (action) {
            case 'voir':
                return peutVoir;
            case 'modifier':
                return peutModifier;
            case 'supprimer':
                return peutSupprimer;
            default:
                return false;
        }
    }
    /**
     * Met à jour les permissions d'un rôle pour une fonctionnalité
     */
    async updateRolePermission(roleId, featureId, permissions, attribuePar) {
        const db = await getDb();
        // Désactiver l'ancienne permission si elle existe
        await db
            .update(roleFeatures)
            .set({
            dateFin: new Date()
        })
            .where(and(eq(roleFeatures.roleId, roleId), eq(roleFeatures.featureId, featureId), sql `${roleFeatures.dateFin} IS NULL`));
        // Créer une nouvelle permission
        const newPermission = {
            id: uuidv4(),
            roleId,
            featureId,
            peutVoir: permissions.peutVoir ?? false,
            peutModifier: permissions.peutModifier ?? false,
            peutSupprimer: permissions.peutSupprimer ?? false,
            attribuePar,
            dateAttribution: new Date(),
            dateFin: null,
            // La propriété actif est gérée automatiquement par la base de données
        };
        await db.insert(roleFeatures).values(newPermission);
        // Retourner la nouvelle permission
        const result = await db
            .select()
            .from(roleFeatures)
            .where(and(eq(roleFeatures.roleId, roleId), eq(roleFeatures.featureId, featureId), sql `${roleFeatures.dateFin} IS NULL`))
            .limit(1);
        if (!result[0]) {
            throw new Error("Erreur lors de la mise à jour de la permission");
        }
        return result[0];
    }
    /**
     * Récupère toutes les fonctionnalités avec les permissions pour un rôle
     */
    async getFeaturesWithPermissions(roleId) {
        const allFeatures = await this.getAllFeatures();
        const rolePermissions = await this.getRolePermissions(roleId);
        // Créer une map des permissions par featureId pour un accès plus rapide
        const permissionsMap = new Map(rolePermissions.map(p => [p.featureId, p]));
        // Fusionner les fonctionnalités avec leurs permissions
        return allFeatures.map(feature => {
            const permission = permissionsMap.get(feature.id);
            return {
                ...feature,
                peutVoir: permission?.peutVoir ?? false,
                peutModifier: permission?.peutModifier ?? false,
                peutSupprimer: permission?.peutSupprimer ?? false,
            };
        });
    }
    /**
     * Récupère toutes les permissions d'un utilisateur sous forme d'objet clé-valeur
     * @param roleId ID du rôle de l'utilisateur
     */
    async getUserPermissions(roleId) {
        const rolePermissions = await this.getRolePermissions(roleId);
        const permissions = {};
        for (const perm of rolePermissions) {
            const feature = await this.getFeatureById(perm.featureId);
            if (feature) {
                permissions[`${feature.code}:voir`] = perm.peutVoir ?? false;
                permissions[`${feature.code}:modifier`] = perm.peutModifier ?? false;
                permissions[`${feature.code}:supprimer`] = perm.peutSupprimer ?? false;
            }
        }
        return permissions;
    }
    /**
     * Vérifie si un utilisateur a accès à une filiale spécifique
     * @param userId ID de l'utilisateur
     * @param filialeId ID de la filiale
     */
    async hasFilialeAccess(userId, filialeId) {
        const db = await getDb();
        try {
            // Vérifier si l'utilisateur a une permission explicite pour cette filiale
            const permission = await db
                .select()
                .from(permissionsUtilisateur)
                .where(and(eq(permissionsUtilisateur.utilisateurId, userId), eq(permissionsUtilisateur.filialeId, filialeId), eq(permissionsUtilisateur.actif, true)))
                .limit(1);
            return permission.length > 0;
        }
        catch (error) {
            console.error('Erreur lors de la vérification des accès filiale:', error);
            return false;
        }
    }
}
export const featureService = new FeatureService();
//# sourceMappingURL=feature.service.js.map