import type { Request } from 'express';
import type { AuditAction, AuditEntityType } from '../../shared/dist/schema/audit.schema.js';
import { auditController } from '../controllers/audit.controller.js';

/**
 * Service utilitaire pour l'enregistrement des journaux d'audit
 */
class AuditService {
  /**
   * Enregistre un événement d'audit générique
   */
  async logEvent(
    userId: string | null,
    action: AuditAction,
    entityType: AuditEntityType,
    entityId?: string,
    entityName?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    metadata?: Record<string, any>,
    req?: Request
  ): Promise<void> {
    await auditController.logAuditEvent(userId || 'system', {
      action,
      entityType,
      entityId,
      entityName,
      oldValues,
      newValues,
      metadata,
    }, req);
  }

  // Méthodes pratiques pour les actions courantes

  async logLogin(userId: string, email: string, success: boolean, req: Request) {
    await this.logEvent(
      userId,
      'login',
      'user',
      userId,
      email,
      undefined,
      { success },
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] },
      req
    );
  }

  async logLogout(userId: string, email: string, req: Request) {
    await this.logEvent(
      userId,
      'logout',
      'user',
      userId,
      email,
      undefined,
      undefined,
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] },
      req
    );
  }

  async logUserCreation(adminId: string, newUser: { id: string; email: string }, req: Request) {
    await this.logEvent(
      adminId,
      'create',
      'user',
      newUser.id,
      newUser.email,
      undefined,
      { email: newUser.email },
      undefined,
      req
    );
  }

  async logUserUpdate(
    adminId: string,
    userId: string,
    email: string,
    changes: Record<string, { oldValue: any; newValue: any }>,
    req: Request
  ) {
    await this.logEvent(
      adminId,
      'update',
      'user',
      userId,
      email,
      undefined,
      changes,
      undefined,
      req
    );
  }

  async logRoleAssignment(
    adminId: string,
    userId: string,
    email: string,
    roleId: string,
    roleName: string,
    req: Request
  ) {
    await this.logEvent(
      adminId,
      'role_assign',
      'role',
      roleId,
      roleName,
      undefined,
      { userId, email },
      undefined,
      req
    );
  }

  async logFeatureToggle(
    adminId: string,
    featureId: string,
    featureName: string,
    enabled: boolean,
    req: Request
  ) {
    await this.logEvent(
      adminId,
      'feature_toggle',
      'feature',
      featureId,
      featureName,
      { enabled: !enabled },
      { enabled },
      undefined,
      req
    );
  }

  async logDataImport(
    userId: string,
    entityType: AuditEntityType,
    count: number,
    source: string,
    req: Request
  ) {
    await this.logEvent(
      userId,
      'import_data',
      entityType,
      undefined,
      `${count} ${entityType} imported`,
      undefined,
      { count, source },
      undefined,
      req
    );
  }

  async logDataExport(
    userId: string,
    entityType: AuditEntityType,
    count: number,
    format: string,
    req: Request
  ) {
    await this.logEvent(
      userId,
      'export_data',
      entityType,
      undefined,
      `${count} ${entityType} exported`,
      undefined,
      { count, format },
      undefined,
      req
    );
  }

  async logTruckOperation(
    userId: string,
    action: 'create' | 'update' | 'delete',
    truckId: string,
    immatriculation: string,
    changes?: Record<string, { oldValue: any; newValue: any }>,
    req?: Request
  ) {
    await this.logEvent(
      userId,
      action as AuditAction,
      'truck',
      truckId,
      immatriculation,
      action === 'update' ? changes : undefined,
      action === 'create' ? changes : undefined,
      undefined,
      req
    );
  }

  async logFilialeOperation(
    userId: string,
    action: 'create' | 'update' | 'delete',
    filialeId: string,
    filialeName: string,
    changes?: Record<string, { oldValue: any; newValue: any }>,
    req?: Request
  ) {
    await this.logEvent(
      userId,
      action as AuditAction,
      'filiale',
      filialeId,
      filialeName,
      action === 'update' ? changes : undefined,
      action === 'create' ? changes : undefined,
      undefined,
      req
    );
  }
}

export const auditService = new AuditService();
