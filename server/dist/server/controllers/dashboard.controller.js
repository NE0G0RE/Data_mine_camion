import { getDb } from '../db.js';
import { and, eq, sql, count, gte, lte, desc } from 'drizzle-orm';
import { users, userRoles, roles, features, roleFeatures } from '../../shared/schema/schema.js';
/**
 * Contrôleur pour le tableau de bord d'administration
 */
class DashboardController {
    /**
     * Récupère les statistiques générales pour le tableau de bord
     */
    async getDashboardStats(req, res) {
        try {
            const db = await getDb();
            try {
                // Compter le nombre total d'utilisateurs actifs
                const [totalUsersResult] = await db
                    .select({ count: count() })
                    .from(users)
                    .where(eq(users.isActive, true));
                // Compter le nombre d'utilisateurs actifs (ayant été actifs au cours des 30 derniers jours)
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const [activeUsersResult] = await db
                    .select({ count: count() })
                    .from(users)
                    .where(and(eq(users.isActive, true), gte(users.lastLogin, thirtyDaysAgo)));
                // Compter le nombre total de rôles actifs
                const [totalRolesResult] = await db
                    .select({ count: count() })
                    .from(roles)
                    .where(eq(roles.isActive, true));
                // Compter le nombre total de fonctionnalités actives
                const [totalFeaturesResult] = await db
                    .select({ count: count() })
                    .from(features)
                    .where(eq(features.isActive, true));
                // Récupérer les dernières fonctionnalités ajoutées
                const recentFeatures = await db
                    .select({
                    id: features.id,
                    name: features.name,
                    category: features.category,
                    createdAt: features.createdAt,
                })
                    .from(features)
                    .where(and(eq(features.isActive, true), gte(features.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))))
                    .orderBy(desc(features.createdAt))
                    .limit(5);
                // Récupérer la répartition des utilisateurs par rôle
                const usersByRole = await db
                    .select({
                    roleId: roles.id,
                    roleName: roles.name,
                    userCount: count(users.id),
                })
                    .from(roles)
                    .leftJoin(userRoles, and(eq(roles.id, userRoles.roleId), eq(userRoles.isActive, true)))
                    .leftJoin(users, and(eq(userRoles.userId, users.id), eq(users.isActive, true)))
                    .where(eq(roles.isActive, true))
                    .groupBy(roles.id, roles.name);
                // Récupérer l'activité récente des utilisateurs
                const recentActivity = await db
                    .select({
                    id: users.id,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    lastLogin: users.lastLogin,
                    isActive: users.isActive,
                    role: roles.name,
                })
                    .from(users)
                    .leftJoin(userRoles, and(eq(users.id, userRoles.userId), eq(userRoles.isActive, true)))
                    .leftJoin(roles, eq(userRoles.roleId, roles.id))
                    .where(eq(users.isActive, true))
                    .orderBy(desc(users.lastLogin))
                    .limit(10);
                // Récupérer les fonctionnalités les plus utilisées
                const popularFeatures = await db
                    .select({
                    id: features.id,
                    name: features.name,
                    category: features.category,
                    usageCount: count(roleFeatures.id),
                })
                    .from(features)
                    .leftJoin(roleFeatures, and(eq(features.id, roleFeatures.featureId), gte(roleFeatures.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), lte(roleFeatures.createdAt, new Date())))
                    .where(eq(features.isActive, true))
                    .groupBy(features.id, features.name, features.category)
                    .orderBy(desc(count(roleFeatures.id)))
                    .limit(5);
                // Récupérer la répartition des rôles
                const roleDistribution = await db
                    .select({
                    id: roles.id,
                    name: roles.name,
                    isSystem: roles.isSystem,
                    userCount: count(userRoles.userId),
                })
                    .from(roles)
                    .leftJoin(userRoles, and(eq(roles.id, userRoles.roleId), eq(userRoles.isActive, true)))
                    .where(eq(roles.isActive, true))
                    .groupBy(roles.id, roles.name, roles.isSystem);
                // Récupérer les utilisateurs avec des rôles inactifs
                const inactiveUserRoles = await db
                    .select({
                    id: users.id,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    lastLogin: users.lastLogin,
                    role: roles.name,
                    isActive: userRoles.isActive,
                })
                    .from(users)
                    .innerJoin(userRoles, eq(users.id, userRoles.userId))
                    .innerJoin(roles, eq(userRoles.roleId, roles.id))
                    .where(and(eq(users.isActive, true), eq(roles.isActive, true), eq(userRoles.isActive, false)))
                    .orderBy(desc(users.lastLogin));
                res.json({
                    success: true,
                    data: {
                        totalUsers: totalUsersResult.count,
                        activeUsers: activeUsersResult.count,
                        totalRoles: totalRolesResult.count,
                        totalFeatures: totalFeaturesResult.count,
                        recentFeatures,
                        usersByRole,
                        recentActivity,
                        popularFeatures,
                        roleDistribution,
                        inactiveUserRoles,
                    },
                });
            }
            catch (error) {
                console.error('Error in getDashboardStats:', error);
                res.status(500).json({ success: false, error: 'Failed to fetch dashboard statistics' });
            }
        }
        catch (error) {
            console.error('Erreur lors de la récupération des statistiques du tableau de bord:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des statistiques du tableau de bord',
            });
        }
    }
    /**
     * Récupère les statistiques d'utilisation des fonctionnalités
     */
    async getFeatureUsageStats(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const db = await getDb();
            // Définir les dates de début et de fin pour la période demandée
            const start = startDate ? new Date(startDate) : new Date();
            start.setDate(start.getDate() - 30); // Par défaut, 30 jours en arrière
            const end = endDate ? new Date(endDate) : new Date();
            // Récupérer les statistiques d'utilisation des fonctionnalités pour la période
            const featureUsage = await db
                .select({
                featureId: features.id,
                featureName: features.nom,
                featureCode: features.code,
                usageCount: count(roleFeatures.id),
            })
                .from(features)
                .leftJoin(roleFeatures, and(eq(features.id, roleFeatures.featureId), gte(roleFeatures.dateAttribution, start), lte(roleFeatures.dateAttribution, end)))
                .where(eq(features.actif, true))
                .groupBy(features.id, features.nom, features.code)
                .orderBy(desc(count(roleFeatures.id)));
            res.json({
                success: true,
                data: featureUsage,
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des statistiques d\'utilisation des fonctionnalités:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des statistiques d\'utilisation des fonctionnalités',
            });
        }
    }
    /**
     * Récupère les statistiques d'utilisation des rôles
     */
    async getRoleUsageStats(req, res) {
        try {
            const db = await getDb();
            // Récupérer les statistiques d'utilisation des rôles
            const roleUsage = await db
                .select({
                roleId: roles.id,
                roleName: roles.nom,
                roleDescription: roles.description,
                userCount: count(userRoles.id),
                isSystemRole: eq(roles.type, 'système'),
            })
                .from(roles)
                .leftJoin(userRoles, and(eq(roles.id, userRoles.roleId), sql `${userRoles.dateFin} IS NULL`))
                .where(eq(roles.actif, true))
                .groupBy(roles.id, roles.nom, roles.description, roles.type)
                .orderBy(desc(count(userRoles.id)));
            res.json({
                success: true,
                data: roleUsage,
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des statistiques d\'utilisation des rôles:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des statistiques d\'utilisation des rôles',
            });
        }
    }
    /**
     * Récupère l'activité récente des utilisateurs
     */
    async getUserActivity(req, res) {
        try {
            const { limit = '10' } = req.query;
            const limitNumber = parseInt(limit, 10) || 10;
            const db = await getDb();
            // Récupérer l'activité récente des utilisateurs
            const recentActivity = await db
                .select({
                id: users.id,
                email: users.email,
                nom: users.nom,
                prenom: users.prenom,
                derniereConnexion: users.derniereConnexion,
                estConnecte: users.estConnecte,
                roleName: roles.nom,
            })
                .from(users)
                .leftJoin(userRoles, and(eq(users.id, userRoles.userId), sql `${userRoles.dateFin} IS NULL`))
                .leftJoin(roles, eq(userRoles.roleId, roles.id))
                .orderBy(desc(users.derniereConnexion))
                .limit(limitNumber);
            // Grouper les rôles par utilisateur
            const activityByUser = recentActivity.reduce((acc, activity) => {
                if (!acc[activity.id]) {
                    acc[activity.id] = {
                        id: activity.id,
                        email: activity.email,
                        nom: activity.nom,
                        prenom: activity.prenom,
                        derniereConnexion: activity.derniereConnexion,
                        estConnecte: activity.estConnecte,
                        roles: [],
                    };
                }
                if (activity.roleName) {
                    acc[activity.id].roles.push(activity.roleName);
                }
                return acc;
            }, {});
            res.json({
                success: true,
                data: Object.values(activityByUser),
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération de l\'activité des utilisateurs:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération de l\'activité des utilisateurs',
            });
        }
    }
    /**
     * Récupère les statistiques d'audit (à implémenter avec un système d'audit)
     */
    async getAuditStats(req, res) {
        try {
            // À implémenter avec un système d'audit
            res.json({
                success: true,
                data: {
                    message: 'Fonctionnalité d\'audit à implémenter',
                },
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des statistiques d\'audit:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des statistiques d\'audit',
            });
        }
    }
}
export const dashboardController = new DashboardController();
//# sourceMappingURL=dashboard.controller.js.map