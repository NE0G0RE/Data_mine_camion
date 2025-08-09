import type { Request, Response } from 'express';
/**
 * Contrôleur pour la gestion des utilisateurs
 */
declare class UserController {
    /**
     * Crée un nouvel utilisateur
     */
    static createUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Met à jour un utilisateur existant
     */
    updateUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Désactive un utilisateur
     */
    deactivateUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Récupère tous les utilisateurs (pour les administrateurs)
     */
    getAllUsers(req: Request, res: Response): Promise<void>;
    /**
     * Récupère un utilisateur par son ID
     */
    getUserById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Récupère le profil de l'utilisateur connecté
     */
    getMyProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Met à jour le mot de passe de l'utilisateur connecté
     */
    updateMyPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const userController: UserController;
export {};
//# sourceMappingURL=user.controller.d.ts.map