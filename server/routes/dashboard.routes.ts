import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { isAuthenticated, isAdmin, loadUserPermissions } from '../middleware/auth.middleware';

const router = Router();

// Middleware d'authentification et de chargement des permissions
router.use(isAuthenticated);
router.use(loadUserPermissions);

// Routes pour les statistiques du tableau de bord
router.get('/stats', isAdmin, dashboardController.getDashboardStats);
router.get('/stats/features', isAdmin, dashboardController.getFeatureUsageStats);
router.get('/stats/roles', isAdmin, dashboardController.getRoleUsageStats);
router.get('/activity/users', isAdmin, dashboardController.getUserActivity);
router.get('/audit', isAdmin, dashboardController.getAuditStats);

export { router as dashboardRoutes };
