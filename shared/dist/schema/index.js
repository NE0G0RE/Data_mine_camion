// Core database schemas
export * from './user.schema.js';
export * from './role.schema.js';
export * from './user-role.schema.js';
export * from './permission.schema.js';
export * from './feature.schema.js';
export * from './truck.schema.js';
export * from './filiale.schema.js';
export * from './audit.schema.js';
// Validation schemas
export { validation } from './validation.js';
// Import all tables from their source files
import { users, utilisateurs } from './user.schema.js';
import { roles } from './role.schema.js';
import { userRoles } from './user-role.schema.js';
import { roleFeatures } from './user-role.schema.js'; // Assuming roleFeatures is in user-role.schema
import { features } from './feature.schema.js';
import { permissions, permissionsUtilisateur } from './permission.schema.js';
import { trucks } from './truck.schema.js';
import { filiales } from './filiale.schema.js';
import { auditLogs } from './audit.schema.js';
// Export all tables with consistent naming
export { 
// Users and authentication
users, utilisateurs, // Legacy
// Roles and permissions
roles, userRoles, roleFeatures, features, permissions, permissionsUtilisateur, // Legacy
// Business entities
trucks, filiales, 
// Audit logs
auditLogs };
//# sourceMappingURL=index.js.map