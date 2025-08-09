import { mysqlTable, varchar, text, datetime, json, mysqlEnum } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { users } from './user.schema.js';
// Define the enum values as constants
export const AUDIT_ACTIONS = [
    'create',
    'read',
    'update',
    'delete',
    'login',
    'logout',
    'password_change',
    'permission_grant',
    'permission_revoke',
    'role_assign',
    'role_revoke',
    'feature_toggle',
    'settings_update',
    'import_data',
    'export_data',
];
export const AUDIT_ENTITY_TYPES = [
    'user',
    'role',
    'feature',
    'permission',
    'truck',
    'filiale',
    'settings',
];
export const auditLogs = mysqlTable('audit_logs', {
    id: varchar('id', { length: 255 }).primaryKey().default(sql `(UUID())`),
    userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'set null' }),
    action: mysqlEnum('action', [...AUDIT_ACTIONS]).notNull(),
    entityType: mysqlEnum('entity_type', [...AUDIT_ENTITY_TYPES]).notNull(),
    entityId: text('entity_id'),
    entityName: text('entity_name'),
    oldValues: json('old_values'),
    newValues: json('new_values'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    metadata: json('metadata'),
    createdAt: datetime('created_at').default(sql `CURRENT_TIMESTAMP`).notNull(),
});
//# sourceMappingURL=audit.schema.js.map