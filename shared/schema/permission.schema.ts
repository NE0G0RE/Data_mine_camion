import { mysqlTable, varchar, text, boolean, date } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { roles } from './role.schema.js';
import { features } from './feature.schema.js';

// Modern permissions table
export const permissions = mysqlTable('permissions', {
  id: varchar('id', { length: 255 }).primaryKey().default(sql`(UUID())`),
  roleId: varchar('role_id', { length: 255 })
    .references(() => roles.id, { onDelete: 'cascade' })
    .notNull(),
  featureId: varchar('feature_id', { length: 255 })
    .references(() => features.id, { onDelete: 'cascade' })
    .notNull(),
  canView: boolean('can_view').notNull().default(false),
  canCreate: boolean('can_create').notNull().default(false),
  canEdit: boolean('can_edit').notNull().default(false),
  canDelete: boolean('can_delete').notNull().default(false),
  createdAt: date('created_at').default(sql`(CURRENT_DATE)`).notNull(),
  updatedAt: date('updated_at').default(sql`(CURRENT_DATE)`).notNull(),
});

// Legacy permissions utilisateur table
export const permissionsUtilisateur = mysqlTable('permissions_utilisateur', {
  id: varchar('id', { length: 255 }).primaryKey().default(sql`(UUID())`),
  utilisateurId: varchar('utilisateur_id', { length: 255 }).notNull(),
  roleId: varchar('role_id', { length: 255 }).notNull(),
  filialeId: varchar('filiale_id', { length: 255 }), // null for group roles
  dateAttribution: date('date_attribution').default(sql`(CURRENT_DATE)`).notNull(),
  attribuePar: varchar('attribue_par', { length: 255 }).notNull(),
  dateFin: date('date_fin'),
  commentaire: text('commentaire'),
  actif: boolean('actif').default(true).notNull(),
});

// Types for permissions
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;

// Types for permissions utilisateur
export type PermissionUtilisateur = typeof permissionsUtilisateur.$inferSelect;
export type NewPermissionUtilisateur = typeof permissionsUtilisateur.$inferInsert;
