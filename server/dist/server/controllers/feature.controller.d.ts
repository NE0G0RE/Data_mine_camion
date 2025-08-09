import { Request, Response, NextFunction } from "express";
/**
 * Contrôleur pour la gestion des fonctionnalités
 */
export declare class FeatureController {
    /**
     * Récupère toutes les fonctionnalités
     */
    getAllFeatures(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Récupère une fonctionnalité par son ID
     */
    getFeatureById(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Crée une nouvelle fonctionnalité
     */
    createFeature(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Met à jour une fonctionnalité existante
     */
    updateFeature(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Supprime une fonctionnalité (soft delete)
     */
    deleteFeature(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Met à jour les permissions d'un rôle pour une fonctionnalité
     */
    updateRolePermission(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Récupère toutes les fonctionnalités avec les permissions pour un rôle
     */
    getRoleFeatures(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Vérifie si l'utilisateur a une certaine permission
     */
    checkPermission(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const featureController: FeatureController;
//# sourceMappingURL=feature.controller.d.ts.map