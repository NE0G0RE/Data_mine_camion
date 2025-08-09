import { Request, Response } from 'express';
import { type AuditAction, type AuditEntityType } from '../../shared/schema/audit.schema.js';
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
declare class AuditController {
    /**
     * Enregistre une entrée dans le journal d'audit
     */
    logAuditEvent(userId: string, data: AuditLogData, req?: Request): Promise<void>;
    /**
     * Récupère les journaux d'audit avec filtrage
     */
    getAuditLogs(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Récupère les statistiques d'audit pour le tableau de bord
     */
    getAuditStats(req: Request, res: Response): Promise<void>;
}
export declare const auditController: AuditController;
export {};
//# sourceMappingURL=audit.controller.d.ts.map