// Re-export all schema-related types and tables from individual schema files
export * from './schema/role.schema.js';
export * from './schema/user.schema.js';
export * from './schema/user-role.schema.js';
export * from './schema/feature.schema.js';

// Keep the existing schema definitions
import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, date, boolean, int } from "drizzle-orm/mysql-core";
import { z } from "zod";

// Table des fonctionnalités
export const features = mysqlTable("features", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  code: varchar("code", { length: 100 }).notNull().unique(),
  nom: varchar("nom", { length: 255 }).notNull(),
  description: text("description"),
  categorie: varchar("categorie", { length: 100 }).notNull(),
  actif: boolean("actif").default(true),
  dateCreation: date("date_creation").default(sql`(CURRENT_TIMESTAMP)`),
  dateMiseAJour: date("date_mise_a_jour").default(sql`(CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`),
});

// Table des fonctionnalités par rôle
export const roleFeatures = mysqlTable("role_features", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  roleId: varchar("role_id", { length: 255 }).notNull(),
  featureId: varchar("feature_id", { length: 255 }).notNull(),
  peutVoir: boolean("peut_voir").default(false),
  peutModifier: boolean("peut_modifier").default(false),
  peutSupprimer: boolean("peut_supprimer").default(false),
  dateAttribution: date("date_attribution").default(sql`(CURRENT_TIMESTAMP)`),
  attribuePar: varchar("attribue_par", { length: 255 }).notNull(),
  dateFin: date("date_fin"),
  commentaire: text("commentaire"),
});

// Table des rôles
export const roles = mysqlTable("roles", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  nom: varchar("nom", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 500 }),
  niveau: int("niveau").notNull(), // 1=admin, 2=responsable, 3=lecteur
  type: varchar("type", { length: 50 }).notNull(), // "groupe" ou "filiale"
  actif: boolean("actif").default(true),
});

// Table des utilisateurs
export const utilisateurs = mysqlTable("utilisateurs", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  nom: varchar("nom", { length: 255 }).notNull(),
  prenom: varchar("prenom", { length: 255 }).notNull(),
  motDePasse: varchar("mot_de_passe", { length: 255 }).notNull(),
  photoProfil: varchar("photo_profil", { length: 255 }),
  preferences: text("preferences"),
  actif: boolean("actif").default(true),
  dateCreation: date("date_creation").default(sql`(CURRENT_DATE)`),
});

// Table des permissions utilisateur (relation many-to-many)
export const permissionsUtilisateur = mysqlTable("permissions_utilisateur", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  utilisateurId: varchar("utilisateur_id", { length: 255 }).notNull(),
  roleId: varchar("role_id", { length: 255 }).notNull(),
  filialeId: varchar("filiale_id", { length: 255 }), // null pour les rôles groupe
  dateAttribution: date("date_attribution").default(sql`(CURRENT_DATE)`),
  attribuePar: varchar("attribue_par", { length: 255 }).notNull(),
  dateFin: date("date_fin"),
  commentaire: text("commentaire"),
  actif: boolean("actif").default(true),
});

// Table des filiales
export const filiales = mysqlTable("filiales", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  nom: varchar("nom", { length: 255 }).notNull().unique(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  adresse: varchar("adresse", { length: 500 }),
  telephone: varchar("telephone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  responsable: varchar("responsable", { length: 255 }),
  dateCreation: date("date_creation").default(sql`(CURRENT_DATE)`),
  actif: boolean("actif").default(true),
});

// Table des camions avec référence à la filiale
export const trucks = mysqlTable("trucks", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  filialeId: varchar("filiale_id", { length: 255 }).notNull(),
  immatriculation: varchar("immatriculation", { length: 255 }).notNull(),
  modele: varchar("modele", { length: 255 }).notNull(),
  
  // Section État
  numeroDA: varchar("numero_da", { length: 255 }),
  dateDA: date("date_da"),
  daValide: varchar("da_valide", { length: 50 }), // "oui", "non", "na"
  numeroCA: varchar("numero_ca", { length: 255 }),
  dateCA: date("date_ca"),
  dateReception: date("date_reception"),
  validationReception: varchar("validation_reception", { length: 50 }), // "oui", "non", "na"
  
  // Section Truck4U
  installePar: varchar("installe_par", { length: 255 }),
  dateInstallation: date("date_installation"),
  parametrageRealise: varchar("parametrage_realise", { length: 50 }), // "oui", "non", "partiel"
  localisationFonctionnelle: varchar("localisation_fonctionnelle", { length: 255 }),
  statutConduite: varchar("statut_conduite", { length: 50 }), // "fonctionnel", "non_fonctionnel", "test_requis"
  telechargementMemoireMasse: varchar("telechargement_memoire_masse", { length: 255 }),
  numeroTruck4U: varchar("numero_truck4u", { length: 255 }),
  
  // Section Tablette
  presenceTablette: varchar("presence_tablette", { length: 50 }), // "oui", "non"
  typeTablette: varchar("type_tablette", { length: 255 }),
  imei: varchar("imei", { length: 255 }),
  fonctionnelle: varchar("fonctionnelle", { length: 50 }), // "oui", "non", "partiel"
  compatibilite: varchar("compatibilite", { length: 50 }), // "compatible", "incompatible", "test_requis"
  deliverup: varchar("deliverup", { length: 50 }), // "installe", "non_installe", "erreur"
  applicationsSpecifiques: text("applications_specifiques"),
  raisonsNonInstalle: text("raisons_non_installe"),
  
  // Section Matériel
  cameraCabineTelematics: varchar("camera_cabine_telematics", { length: 50 }), // "oui", "non", "pas_besoin"
  dashcam: varchar("dashcam", { length: 50 }), // "oui", "non", "pas_besoin"
  numeroPDA: varchar("numero_pda", { length: 255 }),
  materielRequis: varchar("materiel_requis", { length: 50 }), // "complet", "partiel", "manquant"
  testsOK: varchar("tests_ok", { length: 50 }), // "oui", "non", "en_cours"
  
  // Champs d'action
  champAction: text("champ_action"),
  observations: text("observations"),
});

// Schémas de validation pour les rôles
export const insertRoleSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  description: z.string().optional(),
  niveau: z.number().min(1).max(3),
  type: z.enum(["groupe", "filiale"]),
  actif: z.boolean().default(true),
});

// Schémas de validation pour les utilisateurs
export const insertUtilisateurSchema = z.object({
  email: z.string().email("Email invalide"),
  nom: z.string().min(1, "Le nom est obligatoire"),
  prenom: z.string().min(1, "Le prénom est obligatoire"),
  motDePasse: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  actif: z.boolean().default(true),
});

// Schémas de validation pour les permissions
export const insertPermissionSchema = z.object({
  utilisateurId: z.string().min(1, "L'utilisateur est obligatoire"),
  roleId: z.string().min(1, "Le rôle est obligatoire"),
  filialeId: z.string().optional(), // optionnel pour les rôles groupe
  attribuePar: z.string().min(1, "L'administrateur qui attribue est obligatoire"),
  actif: z.boolean().default(true),
});

// Schéma de validation pour les filiales
export const insertFilialeSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  code: z.string().min(1, "Le code est obligatoire"),
  adresse: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email().optional(),
  responsable: z.string().optional(),
  actif: z.boolean().default(true),
});

// Schéma de validation pour l'insertion d'un camion
export const insertTruckSchema = z.object({
  filialeId: z.string().min(1, "L'ID de la filiale est obligatoire"),
  immatriculation: z.string().min(1, "L'immatriculation est obligatoire"),
  modele: z.string().min(1, "Le modèle est obligatoire"),
  numeroDA: z.string().optional(),
  dateDA: z.string().optional(),
  daValide: z.string().optional(),
  numeroCA: z.string().optional(),
  dateCA: z.string().optional(),
  dateReception: z.string().optional(),
  validationReception: z.string().optional(),
  installePar: z.string().optional(),
  dateInstallation: z.string().optional(),
  parametrageRealise: z.string().optional(),
  localisationFonctionnelle: z.string().optional(),
  statutConduite: z.string().optional(),
  telechargementMemoireMasse: z.string().optional(),
  numeroTruck4U: z.string().optional(),
  presenceTablette: z.string().optional(),
  typeTablette: z.string().optional(),
  imei: z.string().optional(),
  fonctionnelle: z.string().optional(),
  compatibilite: z.string().optional(),
  deliverup: z.string().optional(),
  applicationsSpecifiques: z.string().optional(),
  raisonsNonInstalle: z.string().optional(),
  cameraCabineTelematics: z.string().optional(),
  dashcam: z.string().optional(),
  numeroPDA: z.string().optional(),
  materielRequis: z.string().optional(),
  testsOK: z.string().optional(),
  champAction: z.string().optional(),
  observations: z.string().optional(),
});

// Types
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Utilisateur = typeof utilisateurs.$inferSelect;
export type InsertUtilisateur = z.infer<typeof insertUtilisateurSchema>;
export type PermissionUtilisateur = typeof permissionsUtilisateur.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Filiale = typeof filiales.$inferSelect;
export type InsertFiliale = z.infer<typeof insertFilialeSchema>;
export type Truck = typeof trucks.$inferSelect;
export type InsertTruck = z.infer<typeof insertTruckSchema>;
