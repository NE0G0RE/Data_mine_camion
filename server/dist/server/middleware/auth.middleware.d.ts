import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                roleId: string;
                isAdmin: boolean;
                isManager: boolean;
                permissions?: Record<string, boolean>;
            };
        }
    }
}
/**
 * Middleware pour vérifier si l'utilisateur est authentifié
 */
export declare const isAuthenticated: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware pour vérifier si l'utilisateur est administrateur
 */
export declare const isAdmin: ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined)[];
/**
 * Middleware pour vérifier si l'utilisateur est gestionnaire ou administrateur
 */
export declare const isManager: ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined)[];
/**
 * Middleware pour vérifier une permission spécifique
 * @param featureCode Code de la fonctionnalité
 * @param action Action à vérifier ('voir', 'modifier', 'supprimer')
 */
export declare const checkPermission: (featureCode: string, action: "voir" | "modifier" | "supprimer") => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Middleware pour charger les permissions de l'utilisateur dans la requête
 */
export declare const loadUserPermissions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware pour vérifier si l'utilisateur a accès à une filiale spécifique
 * @param filialeIdParam Nom du paramètre contenant l'ID de la filiale
 */
export declare const checkFilialeAccess: (filialeIdParam?: string) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.middleware.d.ts.map