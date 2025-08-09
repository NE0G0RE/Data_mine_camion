import { Router } from 'express';
import { managerController } from '../controllers/manager.controller';
import { isAuthenticated, isManager, loadUserPermissions } from '../middleware/auth.middleware';
const router = Router();
// Middleware d'authentification et de chargement des permissions
router.use(isAuthenticated);
router.use(isManager);
router.use(loadUserPermissions);
// Routes pour la gestion des fonctionnalités
router.get('/features', managerController.getAllFeatures);
router.post('/features/toggle', managerController.toggleFeature);
// Routes pour la gestion des permissions
router.post('/permissions/assign', managerController.assignFeatureToRole);
router.put('/roles/:roleId/permissions', managerController.updateRolePermissions);
router.get('/roles/:roleId/permissions', managerController.getRolePermissions);
// Routes pour la gestion des utilisateurs par rôle
router.get('/roles/:roleId/users', managerController.getUsersByRole);
export { router as managerRoutes };
//# sourceMappingURL=manager.routes.js.map