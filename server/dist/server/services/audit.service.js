import { auditController } from '../controllers/audit.controller.js';
/**
 * Service utilitaire pour l'enregistrement des journaux d'audit
 */
class AuditService {
    /**
     * Enregistre un événement d'audit générique
     */
    async logEvent(userId, action, entityType, entityId, entityName, oldValues, newValues, metadata, req) {
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
    async logLogin(userId, email, success, req) {
        await this.logEvent(userId, 'login', 'user', userId, email, undefined, { success }, { ipAddress: req.ip, userAgent: req.headers['user-agent'] }, req);
    }
    async logLogout(userId, email, req) {
        await this.logEvent(userId, 'logout', 'user', userId, email, undefined, undefined, { ipAddress: req.ip, userAgent: req.headers['user-agent'] }, req);
    }
    async logUserCreation(adminId, newUser, req) {
        await this.logEvent(adminId, 'create', 'user', newUser.id, newUser.email, undefined, { email: newUser.email }, undefined, req);
    }
    async logUserUpdate(adminId, userId, email, changes, req) {
        await this.logEvent(adminId, 'update', 'user', userId, email, undefined, changes, undefined, req);
    }
    async logRoleAssignment(adminId, userId, email, roleId, roleName, req) {
        await this.logEvent(adminId, 'role_assign', 'role', roleId, roleName, undefined, { userId, email }, undefined, req);
    }
    async logFeatureToggle(adminId, featureId, featureName, enabled, req) {
        await this.logEvent(adminId, 'feature_toggle', 'feature', featureId, featureName, { enabled: !enabled }, { enabled }, undefined, req);
    }
    async logDataImport(userId, entityType, count, source, req) {
        await this.logEvent(userId, 'import_data', entityType, undefined, `${count} ${entityType} imported`, undefined, { count, source }, undefined, req);
    }
    async logDataExport(userId, entityType, count, format, req) {
        await this.logEvent(userId, 'export_data', entityType, undefined, `${count} ${entityType} exported`, undefined, { count, format }, undefined, req);
    }
    async logTruckOperation(userId, action, truckId, immatriculation, changes, req) {
        await this.logEvent(userId, action, 'truck', truckId, immatriculation, action === 'update' ? changes : undefined, action === 'create' ? changes : undefined, undefined, req);
    }
    async logFilialeOperation(userId, action, filialeId, filialeName, changes, req) {
        await this.logEvent(userId, action, 'filiale', filialeId, filialeName, action === 'update' ? changes : undefined, action === 'create' ? changes : undefined, undefined, req);
    }
}
export const auditService = new AuditService();
//# sourceMappingURL=audit.service.js.map