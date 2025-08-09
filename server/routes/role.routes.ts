import { Router } from 'express';
import { roleController } from '../controllers/role.controller';
import { isAuthenticated, isAdmin, loadUserPermissions } from '../middleware/auth.middleware';

const router = Router();

// Middleware d'authentification et de chargement des permissions
router.use(isAuthenticated);
router.use(loadUserPermissions);

// Routes pour la gestion des rôles
router.post('/roles', isAdmin, roleController.createRole);
router.get('/roles', isAdmin, roleController.getAllRoles);
router.get('/roles/:id', isAdmin, roleController.getRoleById);
router.put('/roles/:id', isAdmin, roleController.updateRole);
router.delete('/roles/:id', isAdmin, roleController.deleteRole);

// Routes pour l'attribution des rôles aux utilisateurs
router.post('/roles/assign', isAdmin, roleController.assignRoleToUser);
router.get('/users/:userId/roles', isAdmin, roleController.getUserRoles);
router.delete('/users/:userId/roles/:roleId', isAdmin, roleController.revokeUserRole);

// Vérification des permissions
router.get('/users/:userId/permissions/:featureCode/:action', roleController.checkUserPermission);

export default router;
