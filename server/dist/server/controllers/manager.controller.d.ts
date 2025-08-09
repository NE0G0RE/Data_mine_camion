import { Request, Response } from 'express';
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
/**
 * Contrôleur pour les fonctionnalités spécifiques au gestionnaire
 */
declare class ManagerController {
    /**
     * Active ou désactive une fonctionnalité
     */
    toggleFeature(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Attribue une fonctionnalité à un rôle avec des permissions spécifiques
     */
    assignFeatureToRole(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Met à jour les permissions d'un rôle pour plusieurs fonctionnalités
     */
    updateRolePermissions(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Récupère toutes les fonctionnalités avec leur statut d'activation
     */
    getAllFeatures(req: Request, res: Response): Promise<void>;
    /**
     * Récupère les permissions d'un rôle
     */
    getRolePermissions(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Récupère les utilisateurs ayant un rôle spécifique
     */
    getUsersByRole(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const managerController: ManagerController;
export {};
//# sourceMappingURL=manager.controller.d.ts.map