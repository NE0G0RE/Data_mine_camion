import { mysqlTable, varchar, text, boolean, date } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Modern users table (English naming)
export const users = mysqlTable('users', {
  id: varchar('id', { length: 255 }).primaryKey().default(sql`(UUID())`),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  avatarUrl: varchar('avatar_url', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  lastLogin: date('last_login'),
  createdAt: date('created_at').default(sql`(CURRENT_DATE)`).notNull(),
  updatedAt: date('updated_at').default(sql`(CURRENT_DATE)`).notNull(),
});

// Legacy utilisateurs table (French naming for backward compatibility)
export const utilisateurs = mysqlTable('utilisateurs', {
  id: varchar('id', { length: 255 }).primaryKey().default(sql`(UUID())`),
  email: varchar('email', { length: 255 }).notNull().unique(),
  nom: varchar('nom', { length: 255 }).notNull(),
  prenom: varchar('prenom', { length: 255 }).notNull(),
  motDePasse: varchar('mot_de_passe', { length: 255 }).notNull(),
  photoProfil: varchar('photo_profil', { length: 255 }),
  preferences: text('preferences'),
  actif: boolean('actif').default(true).notNull(),
  dateCreation: date('date_creation').default(sql`(CURRENT_DATE)`).notNull(),
});

// Types for the modern users table
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Types for the legacy utilisateurs table
export type Utilisateur = typeof utilisateurs.$inferSelect;
export type NewUtilisateur = typeof utilisateurs.$inferInsert;

// Validation schemas
export const userSchema = createSelectSchema(users);
export const newUserSchema = createInsertSchema(users);

export const utilisateurSchema = createSelectSchema(utilisateurs);
export const newUtilisateurSchema = createInsertSchema(utilisateurs);
