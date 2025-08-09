// Core database schemas
export * from './user.schema.js';
export * from './role.schema.js';
export * from './user-role.schema.js';
export * from './permission.schema.js';
export * from './feature.schema.js';
export * from './truck.schema.js';
export * from './filiale.schema.js';
export * from './audit.schema.js';

// Common types
export type { 
  EntityType, 
  CrudOperation, 
  PaginatedResult, 
  ApiResponse 
} from './types.js';

// Validation schemas
export { validation } from './validation.js';

// Re-export useful types
export type { 
  InferSelectModel, 
  InferInsertModel,
  InferModel
} from 'drizzle-orm';

// Import all tables from their source files
import { users, utilisateurs, type User, type NewUser, type Utilisateur, type NewUtilisateur } from './user.schema.js';
import { roles, type Role, type NewRole } from './role.schema.js';
import { userRoles, type UserRole } from './user-role.schema.js';
import { roleFeatures } from './user-role.schema.js'; // Assuming roleFeatures is in user-role.schema
import { features, type Feature, type NewFeature } from './feature.schema.js';
import { permissions, permissionsUtilisateur, type Permission, type NewPermission, type PermissionUtilisateur, type NewPermissionUtilisateur } from './permission.schema.js';
import { trucks, type Truck, type NewTruck } from './truck.schema.js';
import { filiales, type Filiale, type NewFiliale } from './filiale.schema.js';
import { auditLogs, type AuditLog, type NewAuditLog } from './audit.schema.js';

// Export all tables with consistent naming
export {
  // Users and authentication
  users,
  utilisateurs, // Legacy
  
  // Roles and permissions
  roles,
  userRoles,
  roleFeatures,
  features,
  permissions,
  permissionsUtilisateur, // Legacy
  
  // Business entities
  trucks,
  filiales,
  
  // Audit logs
  auditLogs
};

// Export all types
export type {
  // User types
  User,
  NewUser,
  Utilisateur,
  NewUtilisateur,
  UserRole,
  
  // Role types
  Role,
  NewRole,
  
  // Permission types
  Permission,
  NewPermission,
  PermissionUtilisateur,
  NewPermissionUtilisateur,
  
  // Feature types
  Feature,
  NewFeature,
  
  // Business entity types
  Truck,
  NewTruck,
  Filiale,
  NewFiliale,
  
  // Audit log types
  AuditLog,
  NewAuditLog
};
