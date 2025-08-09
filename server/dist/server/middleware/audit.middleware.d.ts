import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware pour enregistrer automatiquement les actions importantes dans les journaux d'audit
 */
export declare function auditMiddleware(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware pour enregistrer les tentatives de connexion échouées
 */
export declare function auditFailedLogin(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware pour enregistrer les accès non autorisés
 */
export declare function auditUnauthorizedAccess(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=audit.middleware.d.ts.map