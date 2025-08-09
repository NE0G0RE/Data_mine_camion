import { z } from 'zod';
import { featureService } from '../services/feature.service.js';
import { getDb } from '../db.js';
import { eq, and, sql, or, isNull, gte } from 'drizzle-orm';
import { roles, roleFeatures, users, userRoles } from '../../shared/schema.js';
// Schémas de validation avec Zod
const createRoleSchema = z.object({
    name: z.string().min(1, 'Le nom du rôle est requis'),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
    isSystem: z.boolean().default(false),
    permissions: z.array(z.object({
        featureId: z.string().min(1, 'ID de fonctionnalité requis'),
        canView: z.boolean().default(false),
        canEdit: z.boolean().default(false),
        canDelete: z.boolean().default(false),
        comment: z.string().optional(),
    })).optional(),
});
const updateRoleSchema = createRoleSchema.partial().extend({
    id: z.string().min(1, 'ID de rôle requis'),
});
const assignRoleSchema = z.object({
    userId: z.string().min(1, 'ID utilisateur requis'),
    roleId: z.string().min(1, 'ID rôle requis'),
    isActive: z.boolean().default(true),
    assignedBy: z.string().min(1, 'ID administrateur requis'),
    comment: z.string().optional(),
});
/**
 * Contrôleur pour la gestion des rôles
 */
class RoleController {
    /**
     * Crée un nouveau rôle
     */
    async createRole(req, res) {
        try {
            const validation = createRoleSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Données invalides',
                    errors: validation.error.errors,
                });
            }
            const { permissions, ...roleData } = validation.data;
            const db = await getDb();
            // Create new role with transaction
            const newRole = await db.transaction(async (tx) => {
                // Create the role using the correct field names from the schema
                const roleValues = {
                    id: crypto.randomUUID(),
                    type: 'custom', // Default role type
                    nom: roleData.name, // Map name to nom
                    description: roleData.description,
                    niveau: 1, // Default level
                    actif: roleData.isActive, // Map isActive to actif
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                // Insert the role
                await tx.insert(roles).values(roleValues);
                // Fetch the created role to return it
                const [role] = await tx.select()
                    .from(roles)
                    .where(eq(roles.id, roleValues.id))
                    .limit(1);
                return role;
                // Add permissions if provided
                if (permissions && permissions.length > 0) {
                    const roleFeaturesToInsert = permissions.map(permission => ({
                        id: crypto.randomUUID(),
                        roleId: newRole.id,
                        featureId: permission.featureId,
                        peutVoir: permission.canView ?? false,
                        peutModifier: permission.canEdit ?? false,
                        peutSupprimer: permission.canDelete ?? false,
                        commentaire: permission.comment,
                        attribuePar: req.user?.id || 'system',
                        dateAttribution: new Date(),
                        actif: true,
                        dateCreation: new Date(),
                        dateModification: new Date()
                    }));
                    await tx.insert(roleFeatures).values(roleFeaturesToInsert); // Temporary any to bypass type checking
                }
                res.status(201).json({
                    success: true,
                    data: newRole,
                });
            });
        }
        catch (error) {
            console.error('Erreur lors de la création du rôle:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création du rôle',
            });
        }
    }
    /**
     * Met à jour un rôle existant
     */
    async updateRole(req, res) {
        try {
            const { id } = req.params;
            const validation = updateRoleSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Données invalides',
                    errors: validation.error.errors,
                });
            }
            const { permissions, ...updateData } = validation.data;
            const db = await getDb();
            // Vérifier que le rôle existe
            const [existingRole] = await db.select()
                .from(roles)
                .where(eq(roles.id, id))
                .limit(1);
            if (!existingRole) {
                return res.status(404).json({
                    success: false,
                    message: 'Rôle non trouvé',
                });
            }
            // Update role with transaction
            await db.transaction(async (tx) => {
                // Update the role using the correct field names
                await tx.update(roles)
                    .set({
                    nom: updateData.name,
                    description: updateData.description,
                    actif: updateData.isActive,
                    updatedAt: new Date(),
                    dateModification: new Date()
                }) // Temporary any to bypass type checking
                    .where(eq(roles.id, id));
                // Return the updated role by querying it
                const [role] = await tx.select()
                    .from(roles)
                    .where(eq(roles.id, id));
                return role;
                // Si des permissions sont fournies, les mettre à jour
                if (permissions) {
                    // Supprimer les anciennes permissions
                    await tx.delete(roleFeatures)
                        .where(eq(roleFeatures.roleId, id));
                    // Ajouter les nouvelles permissions
                    if (permissions.length > 0) {
                        await tx.insert(roleFeatures)
                            .values(permissions.map(perm => {
                            const permissionData = {
                                featureId: perm.featureId,
                                canView: perm.canView,
                                canEdit: perm.canEdit,
                                canDelete: perm.canDelete,
                                comment: perm.comment,
                            };
                            return {
                                id: crypto.randomUUID(),
                                roleId: id,
                                ...permissionData,
                                assignedAt: new Date(),
                                assignedBy: req.user?.id || 'system',
                            };
                        }));
                    }
                }
            });
            res.json({
                success: true,
                data: updatedRole,
            });
        }
        catch (error) {
            console.error('Erreur lors de la mise à jour du rôle:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du rôle',
            });
        }
    }
    /**
     * Supprime un rôle
     */
    async deleteRole(req, res) {
        try {
            const { id } = req.params;
            const db = await getDb();
            // Vérifier que le rôle existe
            const [existingRole] = await db.select()
                .from(roles)
                .where(eq(roles.id, id))
                .limit(1);
            if (!existingRole) {
                return res.status(404).json({
                    success: false,
                    message: 'Rôle non trouvé',
                });
            }
            // Vérifier si le rôle est utilisé par des utilisateurs
            const usersWithRole = await db
                .select()
                .from(userRoles)
                .where(and(eq(userRoles.roleId, id), sql `${userRoles.dateFin} IS NULL OR ${userRoles.dateFin} >= CURRENT_DATE`))
                .limit(1);
            if (usersWithRole.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Impossible de supprimer ce rôle car il est attribué à un ou plusieurs utilisateurs',
                });
            }
            // Désactiver le rôle au lieu de le supprimer
            await db.update(roles)
                .set({
                actif: false,
                dateModification: new Date(),
            })
                .where(eq(roles.id, id));
            res.json({
                success: true,
                message: 'Rôle désactivé avec succès',
            });
        }
        catch (error) {
            console.error('Erreur lors de la suppression du rôle:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression du rôle',
            });
        }
    }
    /**
     * Récupère tous les rôles
     */
    async getAllRoles(req, res) {
        try {
            const db = await getDb();
            const allRoles = await db.select().from(roles);
            res.json({
                success: true,
                data: allRoles,
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des rôles:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des rôles',
            });
        }
    }
    /**
     * Récupère un rôle par son ID avec ses permissions
     */
    async getRoleById(req, res) {
        try {
            const { id } = req.params;
            const db = await getDb();
            // Get role with features
            const roleWithFeatures = await db.query.roles.findFirst({
                where: eq(roles.id, id),
                with: {
                    roleFeatures: {
                        with: {
                            feature: true
                        }
                    }
                }
            });
            if (!roleWithFeatures) {
                return res.status(404).json({ message: 'Rôle non trouvé' });
            }
            // Map to response format
            const response = {
                ...roleWithFeatures,
                features: roleWithFeatures.roleFeatures.map(rf => ({
                    id: rf.featureId,
                    name: rf.feature.name,
                    description: rf.feature.description,
                    canView: rf.canView,
                    canEdit: rf.canEdit,
                    canDelete: rf.canDelete,
                    assignedAt: rf.assignedAt,
                    assignedBy: rf.assignedBy,
                    comment: rf.comment,
                    isActive: rf.isActive
                }))
            };
            res.json({
                success: true,
                data: response,
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération du rôle:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du rôle',
            });
        }
    }
    /**
     * Attribue un rôle à un utilisateur
     */
    async assignRoleToUser(req, res) {
        try {
            const validation = assignRoleSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Données invalides',
                    errors: validation.error.errors,
                });
            }
            const { userId, roleId, dateDebut, dateFin, attribuePar, commentaire } = validation.data;
            const db = await getDb();
            // Vérifier que l'utilisateur existe
            const [user] = await db.select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé',
                });
            }
            // Vérifier que le rôle existe
            const [role] = await db.select()
                .from(roles)
                .where(eq(roles.id, roleId))
                .limit(1);
            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: 'Rôle non trouvé',
                });
            }
            // Vérifier si l'utilisateur a déjà ce rôle actif
            const existingAssignment = await db
                .select()
                .from(userRoles)
                .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId), sql `${userRoles.dateFin} IS NULL OR ${userRoles.dateFin} >= CURRENT_DATE`))
                .limit(1);
            if (existingAssignment.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Ce rôle est déjà attribué à cet utilisateur',
                });
            }
            // Attribuer le rôle à l'utilisateur
            const userRoleData = {
                roleId: roleId,
                userId: userId,
                isActive: true,
                assignedBy: attribuePar,
                comment: commentaire,
            };
            const [assignment] = await db.insert(userRoles)
                .values(userRoleData)
                .returning();
            res.status(201).json({
                success: true,
                data: assignment,
            });
        }
        catch (error) {
            console.error('Erreur lors de l\'attribution du rôle:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'attribution du rôle',
            });
        }
    }
    /**
     * Récupère les rôles d'un utilisateur
     */
    async getUserRoles(req, res) {
        try {
            const { userId } = req.params;
            const db = await getDb();
            // Vérifier que l'utilisateur existe
            const [user] = await db.select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé',
                });
            }
            // Get user roles with role details
            const userRoleData = await db.query.userRoles.findMany({
                where: and(eq(userRoles.userId, userId), or(isNull(userRoles.endDate), gte(userRoles.endDate, new Date()))),
                with: {
                    role: true
                }
            });
            // Map to response format with proper type assertions
            const response = userRoleData.map(ur => ({
                id: ur.id,
                roleId: ur.roleId,
                roleName: ur.role?.name || 'Unknown Role',
                startDate: ur.dateDebut || null,
                endDate: ur.dateFin || null,
                assignedAt: ur.dateAttribution || new Date(),
                assignedBy: ur.attribuePar || 'system',
                comment: ur.commentaire || '',
                isActive: ur.actif ?? true
            }));
            res.json({
                success: true,
                data: response,
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des rôles utilisateur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des rôles utilisateur',
            });
        }
    }
    /**
     * Révocation d'un rôle à un utilisateur
     */
    async revokeUserRole(req, res) {
        try {
            const { userId, roleId } = req.params;
            const { commentaire } = req.body;
            const db = await getDb();
            // Vérifier que l'utilisateur a bien ce rôle
            const [assignment] = await db
                .select()
                .from(userRoles)
                .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId), sql `${userRoles.dateFin} IS NULL`))
                .limit(1);
            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: 'Aucune attribution de rôle active trouvée pour cet utilisateur',
                });
            }
            // Mettre à jour la date de fin pour révoquer le rôle
            await db.update(userRoles)
                .set({
                dateFin: new Date(),
                commentaire,
            })
                .where(eq(userRoles.id, assignment.id));
            res.json({
                success: true,
                message: 'Rôle révoqué avec succès',
            });
        }
        catch (error) {
            console.error('Erreur lors de la révocation du rôle:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la révocation du rôle',
            });
        }
    }
    /**
     * Désactive un rôle (marque comme inactif au lieu de le supprimer)
     */
    async deactivateRole(req, res) {
        try {
            const { id } = req.params;
            const db = await getDb();
            // Vérifier si le rôle existe
            const role = await db
                .select()
                .from(roles)
                .where(eq(roles.id, id))
                .limit(1);
            if (role.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Rôle non trouvé',
                });
            }
            // Mettre à jour le statut du rôle à inactif
            await db
                .update(roles)
                .set({ actif: false })
                .where(eq(roles.id, id));
            res.json({
                success: true,
                message: 'Rôle désactivé avec succès',
            });
        }
        catch (error) {
            console.error('Erreur lors de la désactivation du rôle:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la désactivation du rôle',
            });
        }
    }
    /**
     * Vérifie si un utilisateur a une permission spécifique
     */
    async checkUserPermission(req, res) {
        try {
            const { userId, featureCode, action } = req.params;
            if (!['voir', 'modifier', 'supprimer'].includes(action)) {
                return res.status(400).json({
                    success: false,
                    message: 'Action non valide. Les valeurs autorisées sont: voir, modifier, supprimer',
                });
            }
            // Récupérer les rôles actifs de l'utilisateur
            const db = await getDb();
            const activeRoles = await db
                .select({ roleId: userRoles.roleId })
                .from(userRoles)
                .where(and(eq(userRoles.userId, userId), sql `${userRoles.dateFin} IS NULL OR ${userRoles.dateFin} >= CURRENT_DATE`));
            // Si l'utilisateur n'a aucun rôle actif
            if (activeRoles.length === 0) {
                return res.json({
                    success: true,
                    hasPermission: false,
                    message: 'Aucun rôle actif trouvé pour cet utilisateur',
                });
            }
            // Vérifier si au moins un des rôles a la permission demandée
            let hasPermission = false;
            for (const { roleId } of activeRoles) {
                const permission = await featureService.hasPermission(roleId, featureCode, action);
                if (permission) {
                    hasPermission = true;
                    break;
                }
            }
            res.json({
                success: true,
                hasPermission,
            });
        }
        catch (error) {
            console.error('Erreur lors de la vérification de la permission:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la vérification de la permission',
            });
        }
    }
}
export const roleController = new RoleController();
//# sourceMappingURL=role.controller.js.map