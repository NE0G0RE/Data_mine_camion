import { Request, Response } from 'express';
/**
 * Contrôleur pour le tableau de bord d'administration
 */
declare class DashboardController {
    /**
     * Récupère les statistiques générales pour le tableau de bord
     */
    getDashboardStats(req: Request, res: Response): Promise<void>;
    /**
     * Récupère les statistiques d'utilisation des fonctionnalités
     */
    getFeatureUsageStats(req: Request, res: Response): Promise<void>;
    /**
     * Récupère les statistiques d'utilisation des rôles
     */
    getRoleUsageStats(req: Request, res: Response): Promise<void>;
    /**
     * Récupère l'activité récente des utilisateurs
     */
    getUserActivity(req: Request, res: Response): Promise<void>;
    /**
     * Récupère les statistiques d'audit (à implémenter avec un système d'audit)
     */
    getAuditStats(req: Request, res: Response): Promise<void>;
}
export declare const dashboardController: DashboardController;
export {};
//# sourceMappingURL=dashboard.controller.d.ts.map