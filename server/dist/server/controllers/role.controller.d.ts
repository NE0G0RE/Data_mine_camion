import { Request, Response } from 'express';
/**
 * Contrôleur pour la gestion des rôles
 */
declare class RoleController {
    /**
     * Crée un nouveau rôle
     */
    createRole(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Met à jour un rôle existant
     */
    updateRole(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Supprime un rôle
     */
    deleteRole(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Récupère tous les rôles
     */
    getAllRoles(req: Request, res: Response): Promise<void>;
    /**
     * Récupère un rôle par son ID avec ses permissions
     */
    getRoleById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Attribue un rôle à un utilisateur
     */
    assignRoleToUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Récupère les rôles d'un utilisateur
     */
    getUserRoles(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Révocation d'un rôle à un utilisateur
     */
    revokeUserRole(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Désactive un rôle (marque comme inactif au lieu de le supprimer)
     */
    deactivateRole(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Vérifie si un utilisateur a une permission spécifique
     */
    checkUserPermission(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const roleController: RoleController;
export {};
//# sourceMappingURL=role.controller.d.ts.map