import { featureService } from '../services/feature.service';
/**
 * Middleware pour vérifier si l'utilisateur est authentifié
 */
export const isAuthenticated = (req, res, next) => {
    // Vérifier si l'utilisateur est connecté
    // Remarque : À adapter selon votre système d'authentification
    if (!req.user) {
        return res.status(401).json({
            message: 'Accès non autorisé. Veuillez vous connecter.'
        });
    }
    next();
};
/**
 * Middleware pour vérifier si l'utilisateur est administrateur
 */
export const isAdmin = [
    isAuthenticated,
    (req, res, next) => {
        if (!req.user?.isAdmin) {
            return res.status(403).json({
                message: 'Accès refusé. Droits administrateur requis.'
            });
        }
        next();
    }
];
/**
 * Middleware pour vérifier si l'utilisateur est gestionnaire ou administrateur
 */
export const isManager = [
    isAuthenticated,
    (req, res, next) => {
        if (!req.user?.isAdmin && !req.user?.isManager) {
            return res.status(403).json({
                message: 'Accès refusé. Droits de gestion requis.'
            });
        }
        next();
    }
];
/**
 * Middleware pour vérifier une permission spécifique
 * @param featureCode Code de la fonctionnalité
 * @param action Action à vérifier ('voir', 'modifier', 'supprimer')
 */
export const checkPermission = (featureCode, action) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: 'Accès non autorisé. Veuillez vous connecter.'
                });
            }
            // Les administrateurs ont tous les droits
            if (req.user.isAdmin) {
                return next();
            }
            // Vérifier la permission dans le cache des permissions de l'utilisateur
            if (req.user.permissions && req.user.permissions[`${featureCode}:${action}`] !== undefined) {
                if (req.user.permissions[`${featureCode}:${action}`]) {
                    return next();
                }
                else {
                    return res.status(403).json({
                        message: `Accès refusé. Permission ${action} requise pour ${featureCode}.`
                    });
                }
            }
            // Si la permission n'est pas en cache, la vérifier dans la base de données
            const hasPermission = await featureService.hasPermission(req.user.roleId, featureCode, action);
            // Mettre en cache le résultat
            if (!req.user.permissions) {
                req.user.permissions = {};
            }
            req.user.permissions[`${featureCode}:${action}`] = hasPermission;
            if (hasPermission) {
                next();
            }
            else {
                res.status(403).json({
                    message: `Accès refusé. Permission ${action} requise pour ${featureCode}.`
                });
            }
        }
        catch (error) {
            console.error('Erreur lors de la vérification des permissions:', error);
            res.status(500).json({
                message: 'Erreur lors de la vérification des permissions.'
            });
        }
    };
};
/**
 * Middleware pour charger les permissions de l'utilisateur dans la requête
 */
export const loadUserPermissions = async (req, res, next) => {
    try {
        if (!req.user) {
            return next();
        }
        // Si l'utilisateur est admin, on ne charge pas les permissions car il a tous les droits
        if (req.user.isAdmin) {
            req.user.permissions = { '*': true };
            return next();
        }
        // Charger les permissions depuis le service
        const permissions = await featureService.getUserPermissions(req.user.roleId);
        // Stocker les permissions dans l'objet utilisateur
        req.user.permissions = permissions;
        next();
    }
    catch (error) {
        console.error('Erreur lors du chargement des permissions:', error);
        next(); // Continuer même en cas d'erreur
    }
};
/**
 * Middleware pour vérifier si l'utilisateur a accès à une filiale spécifique
 * @param filialeIdParam Nom du paramètre contenant l'ID de la filiale
 */
export const checkFilialeAccess = (filialeIdParam = 'filialeId') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: 'Accès non autorisé. Veuillez vous connecter.'
                });
            }
            // Les administrateurs ont accès à toutes les filiales
            if (req.user.isAdmin) {
                return next();
            }
            const filialeId = req.params[filialeIdParam] || req.body[filialeIdParam];
            if (!filialeId) {
                return res.status(400).json({
                    message: 'ID de filiale manquant dans la requête.'
                });
            }
            // Vérifier si l'utilisateur a accès à cette filiale
            // Remarque : Implémentez cette logique selon votre système d'autorisation
            // Par exemple, vérifier dans la table des permissions utilisateur
            const hasAccess = await featureService.hasFilialeAccess(req.user.id, filialeId);
            if (!hasAccess) {
                return res.status(403).json({
                    message: 'Accès refusé à cette filiale.'
                });
            }
            next();
        }
        catch (error) {
            console.error('Erreur lors de la vérification des accès filiale:', error);
            res.status(500).json({
                message: 'Erreur lors de la vérification des accès.'
            });
        }
    };
};
//# sourceMappingURL=auth.middleware.js.map