import { z } from 'zod';
export const UserRole = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    USER: 'user',
    VIEWER: 'viewer',
};
export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});
export const userSchema = z.object({
    email: z.string().email('Email invalide'),
    username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: z.enum([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.VIEWER]).optional(),
    isActive: z.boolean().optional().default(true),
});
export const truckSchema = z.object({
    immatriculation: z.string().min(1, "L'immatriculation est requise"),
    marque: z.string().optional(),
    modele: z.string().min(1, 'Le modèle est requis'),
    annee: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    dateMiseEnService: z.string().datetime().optional(),
    dateDernierControle: z.string().datetime().optional(),
    dateProchainControle: z.string().datetime().optional(),
    kilometrage: z.number().int().min(0).optional(),
    statut: z.enum(['en_service', 'en_maintenance', 'hors_service']).optional(),
    filialeId: z.string().uuid('ID de filiale invalide').optional(),
    photoUrl: z.string().url('URL de photo invalide').optional(),
    commentaires: z.string().optional(),
});
export const filialeSchema = z.object({
    nom: z.string().min(1, 'Le nom est requis'),
    code: z.string().min(1, 'Le code est requis'),
    adresse: z.string().optional(),
    ville: z.string().optional(),
    codePostal: z.string().optional(),
    pays: z.string().optional(),
    telephone: z.string().optional(),
    email: z.string().email('Email invalide').optional(),
    responsable: z.string().optional(),
    isActive: z.boolean().optional().default(true),
});
export const roleSchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    description: z.string().optional(),
    isActive: z.boolean().optional().default(true),
});
export const featureSchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    description: z.string().optional(),
    category: z.string().optional(),
    isActive: z.boolean().optional().default(true),
});
export const permissionSchema = z.object({
    roleId: z.string().uuid('ID de rôle invalide'),
    featureId: z.string().uuid('ID de fonctionnalité invalide'),
    canView: z.boolean().default(false),
    canCreate: z.boolean().default(false),
    canEdit: z.boolean().default(false),
    canDelete: z.boolean().default(false),
});
// Export all schemas as a single object
export const validation = {
    UserRole,
    paginationSchema,
    userSchema,
    truckSchema,
    filialeSchema,
    roleSchema,
    featureSchema,
    permissionSchema,
};
//# sourceMappingURL=validation.js.map