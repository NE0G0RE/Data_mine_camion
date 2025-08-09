import { mysqlTable, varchar, text, boolean, date } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const roles = mysqlTable('roles', {
  id: varchar('id', { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  isSystem: boolean('is_system').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: date('created_at').default(sql`(CURRENT_DATE)`).notNull(),
  updatedAt: date('updated_at').default(sql`(CURRENT_DATE)`).notNull(),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
