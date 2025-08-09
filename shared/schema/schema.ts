// This file serves as a single source of truth for all database schema exports
// It helps avoid circular dependencies by centralizing all exports

// Export all tables and types from individual schema files
export * from './user.schema.js';
export * from './role.schema.js';
export * from './user-role.schema.js';
export * from './permission.schema.js';
export * from './feature.schema.js';
export * from './truck.schema.js';
export * from './filiale.schema.js';
export * from './audit.schema.js';

// Export types explicitly to avoid conflicts
export type { User, NewUser } from './user.schema.js';
export type { Role, NewRole } from './role.schema.js';
export type { Filiale, NewFiliale } from './filiale.schema.js';
export type { AuditLog, NewAuditLog, AuditAction, AuditEntityType } from './audit.schema.js';

type EntityType = 'user' | 'role' | 'permission' | 'feature' | 'truck';
type CrudOperation = 'create' | 'read' | 'update' | 'delete';
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Re-export useful types from drizzle-orm
export type { 
  InferSelectModel, 
  InferInsertModel,
  InferModel,
  SQL
} from 'drizzle-orm';

export type { EntityType, CrudOperation, PaginatedResult, ApiResponse };
