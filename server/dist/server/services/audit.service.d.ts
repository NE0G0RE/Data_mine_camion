import type { Request } from 'express';
import type { AuditAction, AuditEntityType } from '../shared/schema/audit.schema.js';
/**
 * Service utilitaire pour l'enregistrement des journaux d'audit
 */
declare class AuditService {
    /**
     * Enregistre un événement d'audit générique
     */
    logEvent(userId: string | null, action: AuditAction, entityType: AuditEntityType, entityId?: string, entityName?: string, oldValues?: Record<string, any>, newValues?: Record<string, any>, metadata?: Record<string, any>, req?: Request): Promise<void>;
    logLogin(userId: string, email: string, success: boolean, req: Request): Promise<void>;
    logLogout(userId: string, email: string, req: Request): Promise<void>;
    logUserCreation(adminId: string, newUser: {
        id: string;
        email: string;
    }, req: Request): Promise<void>;
    logUserUpdate(adminId: string, userId: string, email: string, changes: Record<string, {
        oldValue: any;
        newValue: any;
    }>, req: Request): Promise<void>;
    logRoleAssignment(adminId: string, userId: string, email: string, roleId: string, roleName: string, req: Request): Promise<void>;
    logFeatureToggle(adminId: string, featureId: string, featureName: string, enabled: boolean, req: Request): Promise<void>;
    logDataImport(userId: string, entityType: AuditEntityType, count: number, source: string, req: Request): Promise<void>;
    logDataExport(userId: string, entityType: AuditEntityType, count: number, format: string, req: Request): Promise<void>;
    logTruckOperation(userId: string, action: 'create' | 'update' | 'delete', truckId: string, immatriculation: string, changes?: Record<string, {
        oldValue: any;
        newValue: any;
    }>, req?: Request): Promise<void>;
    logFilialeOperation(userId: string, action: 'create' | 'update' | 'delete', filialeId: string, filialeName: string, changes?: Record<string, {
        oldValue: any;
        newValue: any;
    }>, req?: Request): Promise<void>;
}
export declare const auditService: AuditService;
export {};
//# sourceMappingURL=audit.service.d.ts.map