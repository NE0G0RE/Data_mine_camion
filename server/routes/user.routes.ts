import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { isAuthenticated, isAdmin, loadUserPermissions } from '../middleware/auth.middleware';

const router = Router();

// Middleware d'authentification et de chargement des permissions
router.use(isAuthenticated);
router.use(loadUserPermissions);

// Routes publiques (non protégées par défaut)
const publicRouter = Router();
publicRouter.post('/users/register', userController.createUser);

// Routes protégées pour les utilisateurs connectés
router.get('/users/me', userController.getMyProfile);
router.put('/users/me/password', userController.updateMyPassword);

// Routes protégées pour les administrateurs
const adminRouter = Router();
adminRouter.use(isAdmin);

adminRouter.get('/users', userController.getAllUsers);
adminRouter.get('/users/:id', userController.getUserById);
adminRouter.put('/users/:id', userController.updateUser);
adminRouter.delete('/users/:id', userController.deactivateUser);

// Combiner les routes
router.use(adminRouter);

export { publicRouter as publicUserRoutes };
export { router as userRoutes };
