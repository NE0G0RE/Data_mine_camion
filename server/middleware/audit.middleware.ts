import type { Request, Response, NextFunction } from 'express';
import type { AuditAction, AuditEntityType } from '../shared/schema/audit.schema.js';
import { auditService } from '../services/audit.service.js';

// Configuration des routes à auditer avec leurs actions et types d'entités correspondants
const AUDITABLE_ROUTES = {
  // Routes utilisateurs
  'POST /api/users': { action: 'create' as const, entityType: 'user' as const },
  'PUT /api/users/:id': { action: 'update' as const, entityType: 'user' as const },
  'DELETE /api/users/:id': { action: 'delete' as const, entityType: 'user' as const },
  
  // Rôles et permissions
  'POST /api/roles': { action: 'create' as const, entityType: 'role' as const },
  'PUT /api/roles/:id': { action: 'update' as const, entityType: 'role' as const },
  'POST /api/manager/permissions/assign': { action: 'permission_grant' as const, entityType: 'permission' as const },
  'PUT /api/manager/roles/:roleId/permissions': { action: 'permission_grant' as const, entityType: 'role' as const },
  
  // Fonctionnalités
  'POST /api/manager/features/toggle': { action: 'feature_toggle' as const, entityType: 'feature' as const },
  
  // Camions
  'POST /api/trucks': { action: 'create' as const, entityType: 'truck' as const },
  'PUT /api/trucks/:id': { action: 'update' as const, entityType: 'truck' as const },
  'DELETE /api/trucks/:id': { action: 'delete' as const, entityType: 'truck' as const },
  'POST /api/trucks/import': { action: 'import_data' as const, entityType: 'truck' as const },
  'POST /api/trucks/import-with-mapping': { action: 'import_data' as const, entityType: 'truck' as const },
  'POST /api/trucks/import-google-sheet': { action: 'import_data' as const, entityType: 'truck' as const },
  
  // Filiales
  'POST /api/filiales': { action: 'create' as const, entityType: 'filiale' as const },
  'PUT /api/filiales/:id': { action: 'update' as const, entityType: 'filiale' as const },
  'DELETE /api/filiales/:id': { action: 'delete' as const, entityType: 'filiale' as const },
};

/**
 * Middleware pour enregistrer automatiquement les actions importantes dans les journaux d'audit
 */
export function auditMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
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
        const routeKey = `${req.method} ${req.path}` as keyof typeof AUDITABLE_ROUTES;
        let routeConfig = AUDITABLE_ROUTES[routeKey];
        
        if (!routeConfig) {
          // Vérifier les routes avec paramètres (comme /api/users/:id)
          const routeParts = req.path.split('/');
          const baseRoute = routeParts.slice(0, -1).join('/') + '/:id';
          const dynamicRoute = `${req.method} ${baseRoute}` as keyof typeof AUDITABLE_ROUTES;
          
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
        await auditService.logEvent(
          userId,
          action,
          entityType,
          entityId,
          entityName,
          undefined, // oldValues (peut être ajouté si nécessaire)
          { 
            statusCode,
            duration: `${duration}ms`,
            success,
            ...(req.method !== 'GET' && req.method !== 'DELETE' ? { data: req.body } : {})
          },
          {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.headers['user-agent']
          },
          req
        );
        
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'audit:', error);
        // Ne pas interrompre le flux en cas d'erreur d'audit
      }
    };
    
    // Surcharger la méthode end() de la réponse pour intercepter la fin de la requête
    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any, callback?: any): any {
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
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    
    res.json = function (body: any) {
      // Vérifier s'il s'agit d'une réponse d'échec de connexion
      if (req.path === '/api/auth/login' && (!body.success || body.error === 'Invalid credentials')) {
        const email = req.body.email as string | undefined;
        auditService.logEvent(
          null, // Aucun utilisateur connecté
          'login',
          'user',
          undefined,
          email,
          undefined,
          { success: false, reason: body.error || 'Invalid credentials' },
          {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.headers['user-agent']
          },
          req
        ).catch(console.error);
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
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalStatus = res.status;
    
    res.status = function (statusCode: number) {
      if (statusCode === 401 || statusCode === 403) {
        auditService.logEvent(
          req.user?.id || null,
          'login',
          'settings',
          undefined,
          'Unauthorized Access',
          undefined,
          {
            statusCode,
            path: req.path,
            method: req.method,
            authenticated: !!req.user?.id,
            requiredRole: req.user?.role || 'none'
          },
          {
            ip: req.ip,
            userAgent: req.headers['user-agent']
          },
          req
        ).catch(console.error);
      }
      
      return originalStatus.call(this, statusCode);
    };
    
    next();
  };
}
