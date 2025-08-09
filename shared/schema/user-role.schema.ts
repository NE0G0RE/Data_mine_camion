import { mysqlTable, varchar, date, boolean } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { users } from './user.schema.js';
import { roles } from './role.schema.js';
import { features } from './feature.schema.js';

// User roles - maps users to roles
export const userRoles = mysqlTable('user_roles', {
  id: varchar('id', { length: 255 }).primaryKey().default(sql`(UUID())`),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  roleId: varchar('role_id', { length: 255 })
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  createdAt: date('created_at').default(sql`(CURRENT_DATE)`).notNull(),
  updatedAt: date('updated_at').default(sql`(CURRENT_DATE)`).notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

// Role features - maps roles to features and their permissions
export const roleFeatures = mysqlTable('role_features', {
  id: varchar('id', { length: 255 }).primaryKey().default(sql`(UUID())`),
  roleId: varchar('role_id', { length: 255 })
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  featureId: varchar('feature_id', { length: 255 })
    .notNull()
    .references(() => features.id, { onDelete: 'cascade' }),
  canView: boolean('can_view').notNull().default(false),
  canEdit: boolean('can_edit').notNull().default(false),
  canDelete: boolean('can_delete').notNull().default(false),
  createdAt: date('created_at').default(sql`(CURRENT_DATE)`).notNull(),
  updatedAt: date('updated_at').default(sql`(CURRENT_DATE)`).notNull(),
});

// Types
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;

export type RoleFeature = typeof roleFeatures.$inferSelect;
export type NewRoleFeature = typeof roleFeatures.$inferInsert;
