import { features, roleFeatures } from "../../shared/dist/schema/index.js";
type Feature = typeof features.$inferSelect;
type InsertFeature = typeof features.$inferInsert;
type RoleFeature = typeof roleFeatures.$inferSelect;
/**
 * Service pour gérer les fonctionnalités et les permissions associées
 */
export declare class FeatureService {
    /**
     * Récupère toutes les fonctionnalités actives
     */
    getAllFeatures(): Promise<Feature[]>;
    /**
     * Récupère une fonctionnalité par son ID
     */
    getFeatureById(id: string): Promise<Feature | undefined>;
    /**
     * Récupère une fonctionnalité par son code
     */
    getFeatureByCode(code: string): Promise<Feature | undefined>;
    /**
     * Crée une nouvelle fonctionnalité
     */
    createFeature(featureData: InsertFeature): Promise<Feature>;
    /**
     * Met à jour une fonctionnalité existante
     */
    updateFeature(id: string, featureData: Partial<InsertFeature>): Promise<Feature | undefined>;
    /**
     * Désactive une fonctionnalité (soft delete)
     */
    deleteFeature(id: string): Promise<boolean>;
    /**
     * Récupère toutes les permissions pour un rôle
     */
    getRolePermissions(roleId: string): Promise<RoleFeature[]>;
    /**
     * Vérifie si un rôle a une certaine permission
     */
    hasPermission(roleId: string, featureCode: string, action: 'voir' | 'modifier' | 'supprimer'): Promise<boolean>;
    /**
     * Met à jour les permissions d'un rôle pour une fonctionnalité
     */
    updateRolePermission(roleId: string, featureId: string, permissions: {
        peutVoir?: boolean;
        peutModifier?: boolean;
        peutSupprimer?: boolean;
    }, attribuePar: string): Promise<RoleFeature>;
    /**
     * Récupère toutes les fonctionnalités avec les permissions pour un rôle
     */
    getFeaturesWithPermissions(roleId: string): Promise<Array<Feature & {
        peutVoir: boolean;
        peutModifier: boolean;
        peutSupprimer: boolean;
    }>>;
    /**
     * Récupère toutes les permissions d'un utilisateur sous forme d'objet clé-valeur
     * @param roleId ID du rôle de l'utilisateur
     */
    getUserPermissions(roleId: string): Promise<Record<string, boolean>>;
    /**
     * Vérifie si un utilisateur a accès à une filiale spécifique
     * @param userId ID de l'utilisateur
     * @param filialeId ID de la filiale
     */
    hasFilialeAccess(userId: string, filialeId: string): Promise<boolean>;
}
export declare const featureService: FeatureService;
export {};
//# sourceMappingURL=feature.service.d.ts.map