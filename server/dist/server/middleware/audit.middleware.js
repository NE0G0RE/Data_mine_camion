import { auditService } from '../services/audit.service.js';
// Configuration des routes à auditer avec leurs actions et types d'entités correspondants
const AUDITABLE_ROUTES = {
    // Routes utilisateurs
    'POST /api/users': { action: 'create', entityType: 'user' },
    'PUT /api/users/:id': { action: 'update', entityType: 'user' },
    'DELETE /api/users/:id': { action: 'delete', entityType: 'user' },
    // Rôles et permissions
    'POST /api/roles': { action: 'create', entityType: 'role' },
    'PUT /api/roles/:id': { action: 'update', entityType: 'role' },
    'POST /api/manager/permissions/assign': { action: 'permission_grant', entityType: 'permission' },
    'PUT /api/manager/roles/:roleId/permissions': { action: 'permission_grant', entityType: 'role' },
    // Fonctionnalités
    'POST /api/manager/features/toggle': { action: 'feature_toggle', entityType: 'feature' },
    // Camions
    'POST /api/trucks': { action: 'create', entityType: 'truck' },
    'PUT /api/trucks/:id': { action: 'update', entityType: 'truck' },
    'DELETE /api/trucks/:id': { action: 'delete', entityType: 'truck' },
    'POST /api/trucks/import': { action: 'import_data', entityType: 'truck' },
    'POST /api/trucks/import-with-mapping': { action: 'import_data', entityType: 'truck' },
    'POST /api/trucks/import-google-sheet': { action: 'import_data', entityType: 'truck' },
    // Filiales
    'POST /api/filiales': { action: 'create', entityType: 'filiale' },
    'PUT /api/filiales/:id': { action: 'update', entityType: 'filiale' },
    'DELETE /api/filiales/:id': { action: 'delete', entityType: 'filiale' },
};
/**
 * Middleware pour enregistrer automatiquement les actions importantes dans les journaux d'audit
 */
export function auditMiddleware() {
    return async (req, res, next) => {
        // Enregistrer le moment du début de la requête
        const startTime = Date.now();
        // Fonction pour enregistrer la réponse
        const logResponse = async () => {
            try {
                // Vérifier si l'utilisateur est authentifié
                if (!req.user?.id) {
                    return; // Ne pas enregistrer les actions des utilisateurs non authentifiés
                }
                // Vérifier si la route est à auditer
                const routeKey = `${req.method} ${req.path}`;
                let routeConfig = AUDITABLE_ROUTES[routeKey];
                if (!routeConfig) {
                    // Vérifier les routes avec paramètres (comme /api/users/:id)
                    const routeParts = req.path.split('/');
                    const baseRoute = routeParts.slice(0, -1).join('/') + '/:id';
                    const dynamicRoute = `${req.method} ${baseRoute}`;
                    if (!AUDITABLE_ROUTES[dynamicRoute]) {
                        return; // Route non configurée pour l'audit
                    }
                    routeConfig = AUDITABLE_ROUTES[dynamicRoute];
                }
                const { action, entityType } = routeConfig;
                const { id: userId, email } = req.user;
                const entityId = req.params.id || req.body.id;
                const entityName = req.body.name || req.body.email || req.body.immatriculation || entityId;
                // Préparer les données de l'audit
                const duration = Date.now() - startTime;
                const statusCode = res.statusCode;
                const success = statusCode >= 200 && statusCode < 400;
                // Enregistrer l'événement d'audit
                await auditService.logEvent(userId, action, entityType, entityId, entityName, undefined, // oldValues (peut être ajouté si nécessaire)
                {
                    statusCode,
                    duration: `${duration}ms`,
                    success,
                    ...(req.method !== 'GET' && req.method !== 'DELETE' ? { data: req.body } : {})
                }, {
                    method: req.method,
                    url: req.originalUrl,
                    ip: req.ip,
                    userAgent: req.headers['user-agent']
                }, req);
            }
            catch (error) {
                console.error('Erreur lors de l\'enregistrement de l\'audit:', error);
                // Ne pas interrompre le flux en cas d'erreur d'audit
            }
        };
        // Surcharger la méthode end() de la réponse pour intercepter la fin de la requête
        const originalEnd = res.end;
        res.end = function (chunk, encoding, callback) {
            logResponse().finally(() => {
                originalEnd.call(res, chunk, encoding, callback);
            });
        };
        // Passer à la suite du middleware
        next();
    };
}
/**
 * Middleware pour enregistrer les tentatives de connexion échouées
 */
export function auditFailedLogin() {
    return async (req, res, next) => {
        const originalJson = res.json;
        res.json = function (body) {
            // Vérifier s'il s'agit d'une réponse d'échec de connexion
            if (req.path === '/api/auth/login' && (!body.success || body.error === 'Invalid credentials')) {
                const email = req.body.email;
                auditService.logEvent(null, // Aucun utilisateur connecté
                'login', 'user', undefined, email, undefined, { success: false, reason: body.error || 'Invalid credentials' }, {
                    method: req.method,
                    url: req.originalUrl,
                    ip: req.ip,
                    userAgent: req.headers['user-agent']
                }, req).catch(console.error);
            }
            return originalJson.call(this, body);
        };
        next();
    };
}
/**
 * Middleware pour enregistrer les accès non autorisés
 */
export function auditUnauthorizedAccess() {
    return async (req, res, next) => {
        const originalStatus = res.status;
        res.status = function (statusCode) {
            if (statusCode === 401 || statusCode === 403) {
                auditService.logEvent(req.user?.id || null, 'login', 'settings', undefined, 'Unauthorized Access', undefined, {
                    statusCode,
                    path: req.path,
                    method: req.method,
                    authenticated: !!req.user?.id,
                    requiredRole: req.user?.role || 'none'
                }, {
                    ip: req.ip,
                    userAgent: req.headers['user-agent']
                }, req).catch(console.error);
            }
            return originalStatus.call(this, statusCode);
        };
        next();
    };
}
//# sourceMappingURL=audit.middleware.js.map