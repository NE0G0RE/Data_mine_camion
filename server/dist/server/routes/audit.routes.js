import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { isAuthenticated, isAdmin, loadUserPermissions } from '../middleware/auth.middleware';
const router = Router();
// Middleware d'authentification et de chargement des permissions
router.use(isAuthenticated);
router.use(loadUserPermissions);
// Routes pour les journaux d'audit (admin uniquement)
router.get('/audit/logs', isAdmin, auditController.getAuditLogs);
router.get('/audit/stats', isAdmin, auditController.getAuditStats);
export { router as auditRoutes };
//# sourceMappingURL=audit.routes.js.map