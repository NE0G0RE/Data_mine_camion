import { User } from './user.schema.js';
import { Role } from './role.schema.js';
import { Feature } from './feature.schema.js';
import { Permission } from './permission.schema.js';
import { Truck } from './truck.schema.js';
import { Filiale } from './filiale.schema.js';
import { AuditLog } from './audit.schema.js';

export type { User, Role, Feature, Permission, Truck, Filiale, AuditLog };

export type EntityType = 
  | 'user' 
  | 'role' 
  | 'feature' 
  | 'permission' 
  | 'truck' 
  | 'filiale' 
  | 'settings';

export type CrudOperation = 'create' | 'read' | 'update' | 'delete';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}
