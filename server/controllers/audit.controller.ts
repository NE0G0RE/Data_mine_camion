import { Request, Response } from 'express';
import { z } from 'zod';
import { getDb } from '../db.js';
import { and, eq, sql, gte, lte, desc } from 'drizzle-orm';
import { auditLogs, type AuditAction, type AuditEntityType, AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '../../shared/dist/schema/audit.schema.js';
import { users } from '../../shared/dist/schema/user.schema.js';

// Schémas de validation avec Zod
const getAuditLogsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().uuid('ID utilisateur invalide').optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).default('50'),
  offset: z.string().regex(/^\d+$/).transform(Number).default('0'),
});

// Interface pour les données d'audit
export interface AuditLogData {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  entityName?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Contrôleur pour la gestion des journaux d'audit
 */
class AuditController {
  /**
   * Enregistre une entrée dans le journal d'audit
   */
  async logAuditEvent(
    userId: string,
    data: AuditLogData,
    req?: Request
  ): Promise<void> {
    try {
      const db = await getDb();
      const ipAddress = (req as any)?.ip || (req as any)?.connection?.remoteAddress || 'unknown';
      const userAgent = req?.headers['user-agent'] || 'unknown';
      
      await db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        userId: userId || null, // Permet la valeur null pour les actions système
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId || null,
        entityName: data.entityName || null,
        oldValues: data.oldValues ? data.oldValues : null,
        newValues: data.newValues ? data.newValues : null,
        ipAddress: ipAddress !== 'unknown' ? ipAddress : null,
        userAgent: userAgent !== 'unknown' ? userAgent : null,
        metadata: data.metadata || null,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'audit:', error);
      // Ne pas propager l'erreur pour ne pas perturber le flux principal
    }
  }

  /**
   * Récupère les journaux d'audit avec filtrage
   */
  async getAuditLogs(req: Request, res: Response) {
    try {
      const db = await getDb();
      const validation = getAuditLogsSchema.safeParse(req.query);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Paramètres de requête invalides',
          errors: validation.error.errors,
        });
      }
      
      const { startDate, endDate, userId, action, entityType, entityId, limit, offset } = validation.data;
      
      // Construire la requête de base avec jointure sur la table users
      let query = db
        .select({
          id: auditLogs.id,
          action: auditLogs.action,
          entityType: auditLogs.entityType,
          entityId: auditLogs.entityId,
          entityName: auditLogs.entityName,
          oldValues: auditLogs.oldValues,
          newValues: auditLogs.newValues,
          ipAddress: auditLogs.ipAddress,
          userAgent: auditLogs.userAgent,
          metadata: auditLogs.metadata,
          createdAt: auditLogs.createdAt,
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
          },
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .$dynamic();

      // Appliquer les filtres
      const conditions = [];
      
      if (startDate) {
        conditions.push(gte(auditLogs.createdAt, new Date(startDate)));
      }
      
      if (endDate) {
        // Ajouter un jour à la date de fin pour inclure toute la journée
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        conditions.push(lte(auditLogs.createdAt, end));
      }
      
      if (userId) {
        conditions.push(eq(auditLogs.userId, userId));
      }
      
      // Filtrer par action si spécifié
      if (action && AUDIT_ACTIONS.includes(action as any)) {
        query = query.where(eq(auditLogs.action, action as any));
      }
      
      // Filtrer par type d'entité si spécifié
      if (entityType && AUDIT_ENTITY_TYPES.includes(entityType as any)) {
        query = query.where(eq(auditLogs.entityType, entityType as any));
      }
      
      if (entityId) {
        conditions.push(eq(auditLogs.entityId, entityId));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Compter le nombre total d'entrées pour la pagination
      const totalCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .then((rows) => Number(rows[0]?.count) || 0);

      // Récupérer les entrées avec pagination
      const logs = await query
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset);

      // Formater les résultats pour la réponse
      const formattedLogs = logs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        entityName: log.entityName,
        oldValues: log.oldValues,
        newValues: log.newValues,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        metadata: log.metadata,
        createdAt: log.createdAt,
        user: log.user
          ? {
              id: log.user.id,
              email: log.user.email,
              firstName: log.user.firstName,
              lastName: log.user.lastName,
            }
          : null,
      }));

      return res.status(200).json({
        success: true,
        data: {
          logs: formattedLogs,
          pagination: {
            total: totalCount,
            limit,
            offset,
            hasMore: offset + limit < totalCount,
          },
        },
      });
      
    } catch (error) {
      console.error('Erreur lors de la récupération des journaux d\'audit:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des journaux d\'audit',
      });
    }
  }

  /**
   * Récupère les statistiques d'audit pour le tableau de bord
   */
  async getAuditStats(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      
      // Définir la période (30 derniers jours par défaut)
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate 
        ? new Date(startDate as string) 
        : new Date();
      
      start.setDate(start.getDate() - 30); // 30 jours par défaut

      // Récupérer le nombre total d'actions par type
      const actionsByType = await db
        .select({
          action: auditLogs.action,
          count: sql<number>`count(*)`,
        })
        .from(auditLogs)
        .where(
          and(
            gte(auditLogs.createdAt, start),
            lte(auditLogs.createdAt, end)
          )
        )
        .groupBy(auditLogs.action);

      // Récupérer le nombre d'actions par utilisateur
      const actionsByUser = await db
        .select({
          userId: auditLogs.userId,
          userEmail: users.email,
          userName: sql<string>`CONCAT(${users.prenom}, ' ', ${users.nom})`,
          count: sql<number>`count(*)`,
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .where(
          and(
            gte(auditLogs.createdAt, start),
            lte(auditLogs.createdAt, end)
          )
        )
        .groupBy(auditLogs.userId, users.email, users.prenom, users.nom)
        .orderBy(desc(sql<number>`count(*)`))
        .limit(10);

      // Récupérer le nombre d'actions par entité
      const actionsByEntity = await db
        .select({
          entityType: auditLogs.entityType,
          count: sql<number>`count(*)`,
        })
        .from(auditLogs)
        .where(
          and(
            gte(auditLogs.createdAt, start),
            lte(auditLogs.createdAt, end),
            sql`${auditLogs.entityType} IS NOT NULL`
          )
        )
        .groupBy(auditLogs.entityType)
        .orderBy(desc(sql<number>`count(*)`));

      // Récupérer l'activité par jour
      const activityByDay = await db
        .select({
          date: sql<Date>`DATE(${auditLogs.createdAt})`,
          count: sql<number>`count(*)`,
        })
        .from(auditLogs)
        .where(
          and(
            gte(auditLogs.createdAt, start),
            lte(auditLogs.createdAt, end)
          )
        )
        .groupBy(sql`DATE(${auditLogs.createdAt})`)
        .orderBy(sql`DATE(${auditLogs.createdAt})`);

      res.json({
        success: true,
        data: {
          period: { start, end },
          actionsByType,
          actionsByUser,
          actionsByEntity,
          activityByDay,
        },
      });
      
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques d\'audit:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques d\'audit',
      });
    }
  }
}

export const auditController = new AuditController();
