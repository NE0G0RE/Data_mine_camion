export * from './user.schema.js';
export * from './role.schema.js';
export * from './user-role.schema.js';
export * from './permission.schema.js';
export * from './feature.schema.js';
export * from './truck.schema.js';
export * from './filiale.schema.js';
export * from './audit.schema.js';
export type { EntityType, CrudOperation, PaginatedResult, ApiResponse } from './types.js';
export { validation } from './validation.js';
export type { InferSelectModel, InferInsertModel, InferModel } from 'drizzle-orm';
import { users, utilisateurs, type User, type NewUser, type Utilisateur, type NewUtilisateur } from './user.schema.js';
import { roles, type Role, type NewRole } from './role.schema.js';
import { userRoles, type UserRole } from './user-role.schema.js';
import { roleFeatures } from './user-role.schema.js';
import { features, type Feature, type NewFeature } from './feature.schema.js';
import { permissions, permissionsUtilisateur, type Permission, type NewPermission, type PermissionUtilisateur, type NewPermissionUtilisateur } from './permission.schema.js';
import { trucks, type Truck, type NewTruck } from './truck.schema.js';
import { filiales, type Filiale, type NewFiliale } from './filiale.schema.js';
import { auditLogs, type AuditLog, type NewAuditLog } from './audit.schema.js';
export { users, utilisateurs, // Legacy
roles, userRoles, roleFeatures, features, permissions, permissionsUtilisateur, // Legacy
trucks, filiales, auditLogs };
export type { User, NewUser, Utilisateur, NewUtilisateur, UserRole, Role, NewRole, Permission, NewPermission, PermissionUtilisateur, NewPermissionUtilisateur, Feature, NewFeature, Truck, NewTruck, Filiale, NewFiliale, AuditLog, NewAuditLog };
//# sourceMappingURL=index.d.ts.map