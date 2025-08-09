import { z } from 'zod';
import { getDb } from '../db.js';
import { users, utilisateurs } from '../../shared/schema/user.schema.js';
import { roles } from '../../shared/schema/role.schema.js';
import { userRoles } from '../../shared/schema/user-role.schema.js';
import { and, eq, sql } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { featureService } from '../services/feature.service.js';
import crypto from 'crypto';
// Schémas de validation avec Zod
const createUserSchema = z.object({
    email: z.string().email('Email invalide'),
    motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    nom: z.string().min(1, 'Le nom est requis'),
    prenom: z.string().min(1, 'Le prénom est requis'),
    telephone: z.string().optional(),
    photoProfil: z.string().optional(),
    actif: z.boolean().default(true),
    roleIds: z.array(z.string().uuid('ID de rôle invalide')).optional(),
});
const updateUserSchema = createUserSchema
    .omit({ motDePasse: true })
    .extend({
    motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional(),
    currentPassword: z.string().optional(),
});
/**
 * Contrôleur pour la gestion des utilisateurs
 */
class UserController {
    /**
     * Crée un nouvel utilisateur
     */
    static async createUser(req, res) {
        try {
            const userData = req.body;
            // Valider les données
            const validation = createUserSchema.safeParse(userData);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Données utilisateur invalides',
                    errors: validation.error.errors,
                });
            }
            // Vérifier si l'email existe déjà
            const db = await getDb();
            const existingUser = await db
                .select()
                .from(utilisateurs)
                .where(eq(utilisateurs.email, userData.email));
            if (existingUser.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Un utilisateur avec cet email existe déjà',
                });
            }
            // Vérifier les rôles fournis
            const validRoleIds = [];
            if (userData.roleIds && userData.roleIds.length > 0) {
                const roleRecords = await db
                    .select()
                    .from(roles)
                    .where(sql `${roles.id} IN (${userData.roleIds.join(',')})`);
                validRoleIds.push(...roleRecords.map((r) => r.id));
            }
            // Hasher le mot de passe
            const hashedPassword = await bcrypt.hash(userData.motDePasse, 10);
            const userId = crypto.randomUUID();
            // Créer l'utilisateur dans une transaction
            await db.transaction(async (tx) => {
                // Map the fields to match the utilisateurs schema
                const newUser = {
                    id: userId,
                    email: userData.email,
                    motDePasse: hashedPassword,
                    nom: userData.nom,
                    prenom: userData.prenom,
                    telephone: userData.telephone,
                    photoProfil: userData.photoProfil,
                    actif: userData.actif,
                    dateCreation: new Date(),
                    updatedAt: new Date(),
                };
                // Insert the user
                await tx.insert(utilisateurs).values(newUser);
                // Handle role assignments if provided
                if (validRoleIds.length > 0) {
                    // Create user-role mappings
                    const userRoleMappings = validRoleIds.map(roleId => ({
                        id: crypto.randomUUID(),
                        userId: userId,
                        roleId,
                        isActive: true,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }));
                    await tx.insert(userRoles).values(userRoleMappings);
                }
            });
            // Récupérer l'utilisateur créé avec ses rôles
            const createdUser = await db
                .select()
                .from(utilisateurs)
                .where(eq(utilisateurs.id, userId));
            if (!createdUser.length) {
                throw new Error('Erreur lors de la création de l\'utilisateur');
            }
            // Ne pas renvoyer le mot de passe dans la réponse
            const { motDePasse, ...userWithoutPassword } = createdUser[0];
            return res.status(201).json({
                success: true,
                data: userWithoutPassword
            });
        }
        catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur :', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la création de l\'utilisateur',
                error: error instanceof Error ? error.message : 'Erreur inconnue',
            });
        }
    }
    /**
     * Met à jour un utilisateur existant
     */
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const validation = updateUserSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Données invalides',
                    errors: validation.error.errors,
                });
            }
            const { password, currentPassword, roleIds, ...updateData } = validation.data;
            const db = await getDb();
            // Vérifier que l'utilisateur existe
            const [existingUser] = await db
                .select()
                .from(users)
                .where(eq(users.id, id))
                .limit(1);
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé',
                });
            }
            // Si l'utilisateur met à jour son propre mot de passe
            if (password) {
                // Vérifier que le mot de passe actuel est fourni et correct
                if (!currentPassword) {
                    return res.status(400).json({
                        success: false,
                        message: 'Le mot de passe actuel est requis pour modifier le mot de passe',
                    });
                }
                const isPasswordValid = await bcrypt.compare(currentPassword, existingUser.password);
                if (!isPasswordValid) {
                    return res.status(401).json({
                        success: false,
                        message: 'Mot de passe actuel incorrect',
                    });
                }
                // Hacher le nouveau mot de passe
                updateData.password = await bcrypt.hash(password, 10);
            }
            // Démarrer une transaction
            await db.transaction(async (tx) => {
                // Mettre à jour l'utilisateur
                const [updatedUser] = await tx.update(users)
                    .set({
                    ...updateData,
                    dateModification: new Date(),
                })
                    .where(eq(users.id, id))
                    .returning();
                // Si des rôles sont fournis, mettre à jour les rôles de l'utilisateur
                if (roleIds) {
                    // Supprimer les rôles actuels qui ne sont plus dans la nouvelle liste
                    await tx.delete(userRoles)
                        .where(and(eq(userRoles.userId, id), sql `${userRoles.roleId} NOT IN ${roleIds.length > 0 ? roleIds : ['']}`));
                    // Ajouter les nouveaux rôles
                    if (roleIds.length > 0) {
                        // Récupérer les rôles existants
                        const existingRoles = await tx
                            .select({ id: userRoles.roleId })
                            .from(userRoles)
                            .where(and(eq(userRoles.userId, id), sql `${userRoles.roleId} IN ${roleIds}`));
                        const existingRoleIds = existingRoles.map(r => r.id);
                        const newRoleIds = roleIds.filter((roleId) => !existingRoleIds.includes(roleId));
                        if (newRoleIds.length > 0) {
                            await tx.insert(userRoles)
                                .values(newRoleIds.map((roleId) => ({
                                id: crypto.randomUUID(),
                                userId: id,
                                roleId,
                                dateDebut: new Date(),
                                attribuePar: req.user?.id || 'system',
                                dateAttribution: new Date(),
                            })));
                        }
                    }
                }
                // Ne pas renvoyer le mot de passe dans la réponse
                const { password: _, ...userWithoutPassword } = updatedUser;
                res.json({
                    success: true,
                    data: userWithoutPassword,
                });
            });
        }
        catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de l\'utilisateur',
            });
        }
    }
    /**
     * Désactive un utilisateur
     */
    async deactivateUser(req, res) {
        try {
            const { id } = req.params;
            const db = await getDb();
            // Vérifier que l'utilisateur existe
            const [existingUser] = await db
                .select()
                .from(users)
                .where(eq(users.id, id))
                .limit(1);
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé',
                });
            }
            // Désactiver l'utilisateur
            await db.update(users)
                .set({
                actif: false,
                dateModification: new Date(),
            })
                .where(eq(users.id, id));
            res.json({
                success: true,
                message: 'Utilisateur désactivé avec succès',
            });
        }
        catch (error) {
            console.error('Erreur lors de la désactivation de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la désactivation de l\'utilisateur',
            });
        }
    }
    /**
     * Récupère tous les utilisateurs (pour les administrateurs)
     */
    async getAllUsers(req, res) {
        try {
            const { page = '1', limit = '10', search = '' } = req.query;
            const pageNumber = parseInt(page, 10) || 1;
            const limitNumber = parseInt(limit, 10) || 10;
            const offset = (pageNumber - 1) * limitNumber;
            const db = await getDb();
            // Construire la requête de base
            let query = db
                .select()
                .from(users)
                .$dynamic();
            // Ajouter la recherche si un terme est fourni
            if (search) {
                const searchTerm = `%${search}%`;
                query = query.where(sql `
            ${users.email} LIKE ${searchTerm} OR
            ${users.nom} LIKE ${searchTerm} OR
            ${users.prenom} LIKE ${searchTerm} OR
            ${users.telephone} LIKE ${searchTerm}
          `);
            }
            // Compter le nombre total d'utilisateurs pour la pagination
            const totalCount = await db
                .select({ count: sql `count(*)` })
                .from(users);
            // Récupérer les utilisateurs avec pagination
            const allUsers = await query
                .limit(limitNumber)
                .offset(offset);
            // Ne pas renvoyer les mots de passe
            const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);
            res.json({
                success: true,
                data: usersWithoutPasswords,
                pagination: {
                    total: totalCount[0].count,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages: Math.ceil(totalCount[0].count / limitNumber),
                },
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des utilisateurs',
            });
        }
    }
    /**
     * Récupère un utilisateur par son ID
     */
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const db = await getDb();
            // Récupérer l'utilisateur
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.id, id))
                .limit(1);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé',
                });
            }
            // Récupérer les rôles de l'utilisateur
            const userRolesList = await db
                .select({
                id: userRoles.id,
                roleId: userRoles.roleId,
                roleNom: roles.nom,
                roleDescription: roles.description,
                dateDebut: userRoles.dateDebut,
                dateFin: userRoles.dateFin,
                dateAttribution: userRoles.dateAttribution,
                attribuePar: userRoles.attribuePar,
                commentaire: userRoles.commentaire,
            })
                .from(userRoles)
                .innerJoin(roles, eq(userRoles.roleId, roles.id))
                .where(and(eq(userRoles.userId, id), sql `${userRoles.dateFin} IS NULL OR ${userRoles.dateFin} >= CURRENT_DATE`));
            // Récupérer les permissions de l'utilisateur
            const permissions = {};
            for (const userRole of userRolesList) {
                const rolePermissions = await featureService.getUserPermissions(userRole.roleId);
                Object.assign(permissions, rolePermissions);
            }
            // Ne pas renvoyer le mot de passe dans la réponse
            const { password, ...userWithoutPassword } = user;
            res.json({
                success: true,
                data: {
                    ...userWithoutPassword,
                    roles: userRolesList,
                    permissions,
                },
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération de l\'utilisateur',
            });
        }
    }
    /**
     * Récupère le profil de l'utilisateur connecté
     */
    async getMyProfile(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Non authentifié',
                });
            }
            const db = await getDb();
            // Récupérer l'utilisateur
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.id, req.user.id))
                .limit(1);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé',
                });
            }
            // Récupérer les rôles de l'utilisateur
            const userRolesList = await db
                .select({
                id: userRoles.id,
                roleId: userRoles.roleId,
                roleNom: roles.nom,
                roleDescription: roles.description,
                dateDebut: userRoles.dateDebut,
                dateFin: userRoles.dateFin,
                dateAttribution: userRoles.dateAttribution,
                attribuePar: userRoles.attribuePar,
                commentaire: userRoles.commentaire,
            })
                .from(userRoles)
                .innerJoin(roles, eq(userRoles.roleId, roles.id))
                .where(and(eq(userRoles.userId, req.user.id), sql `${userRoles.dateFin} IS NULL OR ${userRoles.dateFin} >= CURRENT_DATE`));
            // Récupérer les permissions de l'utilisateur
            const permissions = {};
            for (const userRole of userRolesList) {
                const rolePermissions = await featureService.getUserPermissions(userRole.roleId);
                Object.assign(permissions, rolePermissions);
            }
            // Ne pas renvoyer le mot de passe dans la réponse
            const { password, ...userWithoutPassword } = user;
            res.json({
                success: true,
                data: {
                    ...userWithoutPassword,
                    roles: userRolesList,
                    permissions,
                },
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du profil',
            });
        }
    }
    /**
     * Met à jour le mot de passe de l'utilisateur connecté
     */
    async updateMyPassword(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Non authentifié',
                });
            }
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Le mot de passe actuel et le nouveau mot de passe sont requis',
                });
            }
            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
                });
            }
            const db = await getDb();
            // Récupérer l'utilisateur avec le mot de passe
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.id, req.user.id))
                .limit(1);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé',
                });
            }
            // Vérifier le mot de passe actuel
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Mot de passe actuel incorrect',
                });
            }
            // Hacher le nouveau mot de passe
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            // Mettre à jour le mot de passe
            await db.update(users)
                .set({
                password: hashedPassword,
                dateModification: new Date(),
            })
                .where(eq(users.id, req.user.id));
            res.json({
                success: true,
                message: 'Mot de passe mis à jour avec succès',
            });
        }
        catch (error) {
            console.error('Erreur lors de la mise à jour du mot de passe:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du mot de passe',
            });
        }
    }
}
export const userController = new UserController();
//# sourceMappingURL=user.controller.js.map