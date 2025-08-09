var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/vite.ts
var vite_exports = {};
__export(vite_exports, {
  log: () => log,
  serveStatic: () => serveStatic,
  setupVite: () => setupVite
});
import express from "express";
import fs from "fs";
import path3 from "path";
import { nanoid } from "nanoid";
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  if (process.env.NODE_ENV === "development") {
    try {
      const { createServer: createServer2 } = await Promise.resolve().then(() => (init_vite(), vite_exports));
      const devServer = await createServer2({
        root: path3.join(process.cwd(), "client"),
        server: {
          middlewareMode: true,
          hmr: { server }
        },
        appType: "custom"
      });
      app2.use(devServer.middlewares);
      vite = devServer;
    } catch (err) {
      console.error("Failed to start Vite dev server:", err);
      process.exit(1);
    }
  }
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        process.cwd(),
        "dist/client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      if (process.env.NODE_ENV !== "development") {
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}"`
        );
      }
      if (vite) {
        const page = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } else {
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      }
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}
var vite, viteLogger;
var init_vite = __esm({
  "server/vite.ts"() {
    "use strict";
    vite = null;
    viteLogger = console;
    if (process.env.NODE_ENV === "development") {
      Promise.resolve().then(() => (init_vite(), vite_exports)).then((viteModule) => {
        const { createServer: createServer2, createLogger } = viteModule;
        viteLogger = createLogger();
      }).catch((err) => {
        console.error("Failed to load Vite in development mode:", err);
      });
    }
  }
});

// server/index.ts
import dotenv2 from "dotenv";
import express2 from "express";
import cors from "cors";
import path4 from "path";

// server/routes.ts
import { createServer } from "http";
import multer from "multer";
import * as XLSX from "xlsx";

// server/db.ts
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as path from "path";
import { fileURLToPath } from "url";

// shared/dist/schema.js
var schema_exports = {};
__export(schema_exports, {
  features: () => features2,
  filiales: () => filiales,
  insertFilialeSchema: () => insertFilialeSchema,
  insertPermissionSchema: () => insertPermissionSchema,
  insertRoleSchema: () => insertRoleSchema,
  insertTruckSchema: () => insertTruckSchema,
  insertUtilisateurSchema: () => insertUtilisateurSchema,
  newUserSchema: () => newUserSchema,
  newUtilisateurSchema: () => newUtilisateurSchema,
  permissionsUtilisateur: () => permissionsUtilisateur,
  roleFeatures: () => roleFeatures2,
  roles: () => roles2,
  trucks: () => trucks,
  userRoles: () => userRoles,
  userSchema: () => userSchema,
  users: () => users,
  utilisateurSchema: () => utilisateurSchema,
  utilisateurs: () => utilisateurs2
});

// shared/dist/schema/role.schema.js
import { mysqlTable, varchar, text, boolean, date } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
var roles = mysqlTable("roles", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  isSystem: boolean("is_system").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: date("created_at").default(sql`(CURRENT_DATE)`).notNull(),
  updatedAt: date("updated_at").default(sql`(CURRENT_DATE)`).notNull()
});

// shared/dist/schema/user.schema.js
import { mysqlTable as mysqlTable2, varchar as varchar2, text as text2, boolean as boolean2, date as date2 } from "drizzle-orm/mysql-core";
import { sql as sql2 } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
var users = mysqlTable2("users", {
  id: varchar2("id", { length: 255 }).primaryKey().default(sql2`(UUID())`),
  email: varchar2("email", { length: 255 }).notNull().unique(),
  username: varchar2("username", { length: 255 }).notNull().unique(),
  password: varchar2("password", { length: 255 }).notNull(),
  firstName: varchar2("first_name", { length: 255 }),
  lastName: varchar2("last_name", { length: 255 }),
  avatarUrl: varchar2("avatar_url", { length: 255 }),
  isActive: boolean2("is_active").default(true).notNull(),
  lastLogin: date2("last_login"),
  createdAt: date2("created_at").default(sql2`(CURRENT_DATE)`).notNull(),
  updatedAt: date2("updated_at").default(sql2`(CURRENT_DATE)`).notNull()
});
var utilisateurs = mysqlTable2("utilisateurs", {
  id: varchar2("id", { length: 255 }).primaryKey().default(sql2`(UUID())`),
  email: varchar2("email", { length: 255 }).notNull().unique(),
  nom: varchar2("nom", { length: 255 }).notNull(),
  prenom: varchar2("prenom", { length: 255 }).notNull(),
  motDePasse: varchar2("mot_de_passe", { length: 255 }).notNull(),
  photoProfil: varchar2("photo_profil", { length: 255 }),
  preferences: text2("preferences"),
  actif: boolean2("actif").default(true).notNull(),
  dateCreation: date2("date_creation").default(sql2`(CURRENT_DATE)`).notNull()
});
var userSchema = createSelectSchema(users);
var newUserSchema = createInsertSchema(users);
var utilisateurSchema = createSelectSchema(utilisateurs);
var newUtilisateurSchema = createInsertSchema(utilisateurs);

// shared/dist/schema/user-role.schema.js
import { mysqlTable as mysqlTable4, varchar as varchar4, date as date4, boolean as boolean4 } from "drizzle-orm/mysql-core";
import { sql as sql4 } from "drizzle-orm";

// shared/dist/schema/feature.schema.js
import { mysqlTable as mysqlTable3, varchar as varchar3, text as text3, boolean as boolean3, date as date3 } from "drizzle-orm/mysql-core";
import { sql as sql3 } from "drizzle-orm";
var features = mysqlTable3("features", {
  id: varchar3("id", { length: 255 }).primaryKey().default(sql3`(UUID())`),
  name: varchar3("name", { length: 255 }).notNull().unique(),
  description: text3("description"),
  category: varchar3("category", { length: 100 }),
  isActive: boolean3("is_active").notNull().default(true),
  isSystem: boolean3("is_system").notNull().default(false),
  createdAt: date3("created_at").default(sql3`(CURRENT_DATE)`).notNull(),
  updatedAt: date3("updated_at").default(sql3`(CURRENT_DATE)`).notNull()
});

// shared/dist/schema/user-role.schema.js
var userRoles = mysqlTable4("user_roles", {
  id: varchar4("id", { length: 255 }).primaryKey().default(sql4`(UUID())`),
  userId: varchar4("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: varchar4("role_id", { length: 255 }).notNull().references(() => roles.id, { onDelete: "cascade" }),
  createdAt: date4("created_at").default(sql4`(CURRENT_DATE)`).notNull(),
  updatedAt: date4("updated_at").default(sql4`(CURRENT_DATE)`).notNull(),
  isActive: boolean4("is_active").notNull().default(true)
});
var roleFeatures = mysqlTable4("role_features", {
  id: varchar4("id", { length: 255 }).primaryKey().default(sql4`(UUID())`),
  roleId: varchar4("role_id", { length: 255 }).notNull().references(() => roles.id, { onDelete: "cascade" }),
  featureId: varchar4("feature_id", { length: 255 }).notNull().references(() => features.id, { onDelete: "cascade" }),
  canView: boolean4("can_view").notNull().default(false),
  canEdit: boolean4("can_edit").notNull().default(false),
  canDelete: boolean4("can_delete").notNull().default(false),
  createdAt: date4("created_at").default(sql4`(CURRENT_DATE)`).notNull(),
  updatedAt: date4("updated_at").default(sql4`(CURRENT_DATE)`).notNull()
});

// shared/dist/schema.js
import { sql as sql5 } from "drizzle-orm";
import { mysqlTable as mysqlTable5, text as text4, varchar as varchar5, date as date5, boolean as boolean5, int } from "drizzle-orm/mysql-core";
import { z } from "zod";
var features2 = mysqlTable5("features", {
  id: varchar5("id", { length: 255 }).primaryKey().default(sql5`(UUID())`),
  code: varchar5("code", { length: 100 }).notNull().unique(),
  nom: varchar5("nom", { length: 255 }).notNull(),
  description: text4("description"),
  categorie: varchar5("categorie", { length: 100 }).notNull(),
  actif: boolean5("actif").default(true),
  dateCreation: date5("date_creation").default(sql5`(CURRENT_TIMESTAMP)`),
  dateMiseAJour: date5("date_mise_a_jour").default(sql5`(CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`)
});
var roleFeatures2 = mysqlTable5("role_features", {
  id: varchar5("id", { length: 255 }).primaryKey().default(sql5`(UUID())`),
  roleId: varchar5("role_id", { length: 255 }).notNull(),
  featureId: varchar5("feature_id", { length: 255 }).notNull(),
  peutVoir: boolean5("peut_voir").default(false),
  peutModifier: boolean5("peut_modifier").default(false),
  peutSupprimer: boolean5("peut_supprimer").default(false),
  dateAttribution: date5("date_attribution").default(sql5`(CURRENT_TIMESTAMP)`),
  attribuePar: varchar5("attribue_par", { length: 255 }).notNull(),
  dateFin: date5("date_fin"),
  commentaire: text4("commentaire")
});
var roles2 = mysqlTable5("roles", {
  id: varchar5("id", { length: 255 }).primaryKey().default(sql5`(UUID())`),
  nom: varchar5("nom", { length: 100 }).notNull().unique(),
  description: varchar5("description", { length: 500 }),
  niveau: int("niveau").notNull(),
  // 1=admin, 2=responsable, 3=lecteur
  type: varchar5("type", { length: 50 }).notNull(),
  // "groupe" ou "filiale"
  actif: boolean5("actif").default(true)
});
var utilisateurs2 = mysqlTable5("utilisateurs", {
  id: varchar5("id", { length: 255 }).primaryKey().default(sql5`(UUID())`),
  email: varchar5("email", { length: 255 }).notNull().unique(),
  nom: varchar5("nom", { length: 255 }).notNull(),
  prenom: varchar5("prenom", { length: 255 }).notNull(),
  motDePasse: varchar5("mot_de_passe", { length: 255 }).notNull(),
  photoProfil: varchar5("photo_profil", { length: 255 }),
  preferences: text4("preferences"),
  actif: boolean5("actif").default(true),
  dateCreation: date5("date_creation").default(sql5`(CURRENT_DATE)`)
});
var permissionsUtilisateur = mysqlTable5("permissions_utilisateur", {
  id: varchar5("id", { length: 255 }).primaryKey().default(sql5`(UUID())`),
  utilisateurId: varchar5("utilisateur_id", { length: 255 }).notNull(),
  roleId: varchar5("role_id", { length: 255 }).notNull(),
  filialeId: varchar5("filiale_id", { length: 255 }),
  // null pour les rôles groupe
  dateAttribution: date5("date_attribution").default(sql5`(CURRENT_DATE)`),
  attribuePar: varchar5("attribue_par", { length: 255 }).notNull(),
  dateFin: date5("date_fin"),
  commentaire: text4("commentaire"),
  actif: boolean5("actif").default(true)
});
var filiales = mysqlTable5("filiales", {
  id: varchar5("id", { length: 255 }).primaryKey().default(sql5`(UUID())`),
  nom: varchar5("nom", { length: 255 }).notNull().unique(),
  code: varchar5("code", { length: 50 }).notNull().unique(),
  adresse: varchar5("adresse", { length: 500 }),
  telephone: varchar5("telephone", { length: 50 }),
  email: varchar5("email", { length: 255 }),
  responsable: varchar5("responsable", { length: 255 }),
  dateCreation: date5("date_creation").default(sql5`(CURRENT_DATE)`),
  actif: boolean5("actif").default(true)
});
var trucks = mysqlTable5("trucks", {
  id: varchar5("id", { length: 255 }).primaryKey().default(sql5`(UUID())`),
  filialeId: varchar5("filiale_id", { length: 255 }).notNull(),
  immatriculation: varchar5("immatriculation", { length: 255 }).notNull(),
  modele: varchar5("modele", { length: 255 }).notNull(),
  // Section État
  numeroDA: varchar5("numero_da", { length: 255 }),
  dateDA: date5("date_da"),
  daValide: varchar5("da_valide", { length: 50 }),
  // "oui", "non", "na"
  numeroCA: varchar5("numero_ca", { length: 255 }),
  dateCA: date5("date_ca"),
  dateReception: date5("date_reception"),
  validationReception: varchar5("validation_reception", { length: 50 }),
  // "oui", "non", "na"
  // Section Truck4U
  installePar: varchar5("installe_par", { length: 255 }),
  dateInstallation: date5("date_installation"),
  parametrageRealise: varchar5("parametrage_realise", { length: 50 }),
  // "oui", "non", "partiel"
  localisationFonctionnelle: varchar5("localisation_fonctionnelle", { length: 255 }),
  statutConduite: varchar5("statut_conduite", { length: 50 }),
  // "fonctionnel", "non_fonctionnel", "test_requis"
  telechargementMemoireMasse: varchar5("telechargement_memoire_masse", { length: 255 }),
  numeroTruck4U: varchar5("numero_truck4u", { length: 255 }),
  // Section Tablette
  presenceTablette: varchar5("presence_tablette", { length: 50 }),
  // "oui", "non"
  typeTablette: varchar5("type_tablette", { length: 255 }),
  imei: varchar5("imei", { length: 255 }),
  fonctionnelle: varchar5("fonctionnelle", { length: 50 }),
  // "oui", "non", "partiel"
  compatibilite: varchar5("compatibilite", { length: 50 }),
  // "compatible", "incompatible", "test_requis"
  deliverup: varchar5("deliverup", { length: 50 }),
  // "installe", "non_installe", "erreur"
  applicationsSpecifiques: text4("applications_specifiques"),
  raisonsNonInstalle: text4("raisons_non_installe"),
  // Section Matériel
  cameraCabineTelematics: varchar5("camera_cabine_telematics", { length: 50 }),
  // "oui", "non", "pas_besoin"
  dashcam: varchar5("dashcam", { length: 50 }),
  // "oui", "non", "pas_besoin"
  numeroPDA: varchar5("numero_pda", { length: 255 }),
  materielRequis: varchar5("materiel_requis", { length: 50 }),
  // "complet", "partiel", "manquant"
  testsOK: varchar5("tests_ok", { length: 50 }),
  // "oui", "non", "en_cours"
  // Champs d'action
  champAction: text4("champ_action"),
  observations: text4("observations")
});
var insertRoleSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  description: z.string().optional(),
  niveau: z.number().min(1).max(3),
  type: z.enum(["groupe", "filiale"]),
  actif: z.boolean().default(true)
});
var insertUtilisateurSchema = z.object({
  email: z.string().email("Email invalide"),
  nom: z.string().min(1, "Le nom est obligatoire"),
  prenom: z.string().min(1, "Le pr\xE9nom est obligatoire"),
  motDePasse: z.string().min(6, "Le mot de passe doit contenir au moins 6 caract\xE8res"),
  actif: z.boolean().default(true)
});
var insertPermissionSchema = z.object({
  utilisateurId: z.string().min(1, "L'utilisateur est obligatoire"),
  roleId: z.string().min(1, "Le r\xF4le est obligatoire"),
  filialeId: z.string().optional(),
  // optionnel pour les rôles groupe
  attribuePar: z.string().min(1, "L'administrateur qui attribue est obligatoire"),
  actif: z.boolean().default(true)
});
var insertFilialeSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  code: z.string().min(1, "Le code est obligatoire"),
  adresse: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email().optional(),
  responsable: z.string().optional(),
  actif: z.boolean().default(true)
});
var insertTruckSchema = z.object({
  filialeId: z.string().min(1, "L'ID de la filiale est obligatoire"),
  immatriculation: z.string().min(1, "L'immatriculation est obligatoire"),
  modele: z.string().min(1, "Le mod\xE8le est obligatoire"),
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
  observations: z.string().optional()
});

// server/db.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(process.cwd(), ".env") });
console.log("Environment file loaded from:", path.join(process.cwd(), ".env"));
if (!process.env.DATABASE_URL) {
  console.error("Available environment variables:", Object.keys(process.env).join(", "));
  throw new Error("DATABASE_URL is not defined in environment variables");
}
var dbConnection = null;
async function getConnection() {
  if (!dbConnection) {
    dbConnection = await mysql.createConnection(process.env.DATABASE_URL);
  }
  return dbConnection;
}
var db2 = drizzle(await getConnection(), {
  schema: schema_exports,
  mode: "default"
});
var {
  trucks: trucks2,
  filiales: filiales2,
  roles: roles3,
  utilisateurs: utilisateurs3,
  permissionsUtilisateur: permissionsUtilisateur2
} = schema_exports;
async function getDb2() {
  return db2;
}
process.on("exit", async () => {
  if (dbConnection) {
    await dbConnection.end();
  }
});

// server/storage.ts
import { eq, like, or, and } from "drizzle-orm";
var MySQLStorage = class {
  // Méthodes pour les rôles
  async getRole(id) {
    const db3 = await getDb2();
    const result = await db3.select().from(roles2).where(eq(roles2.id, id)).limit(1);
    return result[0];
  }
  async getAllRoles() {
    const db3 = await getDb2();
    return await db3.select().from(roles2).where(eq(roles2.actif, true));
  }
  async createRole(insertRole) {
    const db3 = await getDb2();
    await db3.insert(roles2).values(insertRole);
    const createdRole = await this.getRole(insertRole.nom);
    if (!createdRole) {
      throw new Error("Erreur lors de la cr\xE9ation du r\xF4le");
    }
    return createdRole;
  }
  async updateRole(id, updateData) {
    const db3 = await getDb2();
    await db3.update(roles2).set(updateData).where(eq(roles2.id, id));
    return await this.getRole(id);
  }
  async deleteRole(id) {
    const db3 = await getDb2();
    await db3.update(roles2).set({ actif: false }).where(eq(roles2.id, id));
    return true;
  }
  // Méthodes pour les utilisateurs
  async getUtilisateur(id) {
    const db3 = await getDb2();
    const result = await db3.select().from(utilisateurs2).where(eq(utilisateurs2.id, id)).limit(1);
    return result[0];
  }
  async getUtilisateurByEmail(email) {
    const db3 = await getDb2();
    const result = await db3.select().from(utilisateurs2).where(eq(utilisateurs2.email, email)).limit(1);
    return result[0];
  }
  async getAllUtilisateurs() {
    const db3 = await getDb2();
    return await db3.select().from(utilisateurs2).where(eq(utilisateurs2.actif, true));
  }
  async createUtilisateur(insertUtilisateur) {
    const db3 = await getDb2();
    await db3.insert(utilisateurs2).values(insertUtilisateur);
    const createdUtilisateur = await this.getUtilisateurByEmail(insertUtilisateur.email);
    if (!createdUtilisateur) {
      throw new Error("Erreur lors de la cr\xE9ation de l'utilisateur");
    }
    return createdUtilisateur;
  }
  async updateUtilisateur(id, updateData) {
    const db3 = await getDb2();
    await db3.update(utilisateurs2).set(updateData).where(eq(utilisateurs2.id, id));
    return await this.getUtilisateur(id);
  }
  async deleteUtilisateur(id) {
    const db3 = await getDb2();
    await db3.update(utilisateurs2).set({ actif: false }).where(eq(utilisateurs2.id, id));
    return true;
  }
  // Méthodes pour les permissions
  async getPermission(id) {
    const db3 = await getDb2();
    const result = await db3.select().from(permissionsUtilisateur).where(eq(permissionsUtilisateur.id, id)).limit(1);
    return result[0];
  }
  async getPermissionsByUtilisateur(utilisateurId) {
    const db3 = await getDb2();
    return await db3.select().from(permissionsUtilisateur).where(
      and(
        eq(permissionsUtilisateur.utilisateurId, utilisateurId),
        eq(permissionsUtilisateur.actif, true)
      )
    );
  }
  async createPermission(insertPermission) {
    const db3 = await getDb2();
    await db3.insert(permissionsUtilisateur).values(insertPermission);
    const createdPermission = await this.getPermission(insertPermission.utilisateurId);
    if (!createdPermission) {
      throw new Error("Erreur lors de la cr\xE9ation de la permission");
    }
    return createdPermission;
  }
  async updatePermission(id, updateData) {
    const db3 = await getDb2();
    await db3.update(permissionsUtilisateur).set(updateData).where(eq(permissionsUtilisateur.id, id));
    return await this.getPermission(id);
  }
  async deletePermission(id) {
    const db3 = await getDb2();
    await db3.update(permissionsUtilisateur).set({ actif: false }).where(eq(permissionsUtilisateur.id, id));
    return true;
  }
  // Méthodes pour les filiales
  async getFiliale(id) {
    const db3 = await getDb2();
    const result = await db3.select().from(filiales).where(eq(filiales.id, id)).limit(1);
    return result[0];
  }
  async getAllFiliales() {
    const db3 = await getDb2();
    return await db3.select().from(filiales).where(eq(filiales.actif, true));
  }
  async getFilialeByCode(code) {
    const db3 = await getDb2();
    const result = await db3.select().from(filiales).where(eq(filiales.code, code)).limit(1);
    return result[0];
  }
  async createFiliale(insertFiliale) {
    const db3 = await getDb2();
    await db3.insert(filiales).values(insertFiliale);
    const createdFiliale = await this.getFilialeByCode(insertFiliale.code);
    if (!createdFiliale) {
      throw new Error("Erreur lors de la cr\xE9ation de la filiale");
    }
    return createdFiliale;
  }
  async updateFiliale(id, updateData) {
    const db3 = await getDb2();
    await db3.update(filiales).set(updateData).where(eq(filiales.id, id));
    return await this.getFiliale(id);
  }
  async deleteFiliale(id) {
    const db3 = await getDb2();
    await db3.update(filiales).set({ actif: false }).where(eq(filiales.id, id));
    return true;
  }
  // Méthodes pour les camions
  async getTruck(id) {
    const db3 = await getDb2();
    const result = await db3.select().from(trucks).where(eq(trucks.id, id)).limit(1);
    return result[0];
  }
  async getAllTrucks(filialeId) {
    const db3 = await getDb2();
    if (filialeId) {
      return await db3.select().from(trucks).where(eq(trucks.filialeId, filialeId));
    }
    return await db3.select().from(trucks);
  }
  async getTruckByImmatriculation(immatriculation, filialeId) {
    const db3 = await getDb2();
    if (filialeId) {
      const result2 = await db3.select().from(trucks).where(
        and(eq(trucks.immatriculation, immatriculation), eq(trucks.filialeId, filialeId))
      ).limit(1);
      return result2[0];
    }
    const result = await db3.select().from(trucks).where(eq(trucks.immatriculation, immatriculation)).limit(1);
    return result[0];
  }
  async createTruck(insertTruck) {
    const db3 = await getDb2();
    const truckData = {
      filialeId: insertTruck.filialeId,
      immatriculation: insertTruck.immatriculation,
      modele: insertTruck.modele,
      numeroDA: insertTruck.numeroDA || null,
      dateDA: insertTruck.dateDA ? new Date(insertTruck.dateDA) : null,
      daValide: insertTruck.daValide || null,
      numeroCA: insertTruck.numeroCA || null,
      dateCA: insertTruck.dateCA ? new Date(insertTruck.dateCA) : null,
      dateReception: insertTruck.dateReception ? new Date(insertTruck.dateReception) : null,
      validationReception: insertTruck.validationReception || null,
      installePar: insertTruck.installePar || null,
      dateInstallation: insertTruck.dateInstallation ? new Date(insertTruck.dateInstallation) : null,
      parametrageRealise: insertTruck.parametrageRealise || null,
      localisationFonctionnelle: insertTruck.localisationFonctionnelle || null,
      statutConduite: insertTruck.statutConduite || null,
      telechargementMemoireMasse: insertTruck.telechargementMemoireMasse || null,
      numeroTruck4U: insertTruck.numeroTruck4U || null,
      presenceTablette: insertTruck.presenceTablette || null,
      typeTablette: insertTruck.typeTablette || null,
      imei: insertTruck.imei || null,
      fonctionnelle: insertTruck.fonctionnelle || null,
      compatibilite: insertTruck.compatibilite || null,
      deliverup: insertTruck.deliverup || null,
      applicationsSpecifiques: insertTruck.applicationsSpecifiques || null,
      raisonsNonInstalle: insertTruck.raisonsNonInstalle || null,
      cameraCabineTelematics: insertTruck.cameraCabineTelematics || null,
      dashcam: insertTruck.dashcam || null,
      numeroPDA: insertTruck.numeroPDA || null,
      materielRequis: insertTruck.materielRequis || null,
      testsOK: insertTruck.testsOK || null,
      champAction: insertTruck.champAction || null,
      observations: insertTruck.observations || null
    };
    await db3.insert(trucks).values(truckData);
    const createdTruck = await this.getTruckByImmatriculation(insertTruck.immatriculation, insertTruck.filialeId);
    if (!createdTruck) {
      throw new Error("Erreur lors de la cr\xE9ation du camion");
    }
    return createdTruck;
  }
  async updateTruck(id, updateData) {
    const db3 = await getDb2();
    const updateValues = {};
    if (updateData.filialeId !== void 0) updateValues.filialeId = updateData.filialeId;
    if (updateData.immatriculation !== void 0) updateValues.immatriculation = updateData.immatriculation;
    if (updateData.modele !== void 0) updateValues.modele = updateData.modele;
    if (updateData.numeroDA !== void 0) updateValues.numeroDA = updateData.numeroDA || null;
    if (updateData.dateDA !== void 0) updateValues.dateDA = updateData.dateDA ? new Date(updateData.dateDA) : null;
    if (updateData.daValide !== void 0) updateValues.daValide = updateData.daValide || null;
    if (updateData.numeroCA !== void 0) updateValues.numeroCA = updateData.numeroCA || null;
    if (updateData.dateCA !== void 0) updateValues.dateCA = updateData.dateCA ? new Date(updateData.dateCA) : null;
    if (updateData.dateReception !== void 0) updateValues.dateReception = updateData.dateReception ? new Date(updateData.dateReception) : null;
    if (updateData.validationReception !== void 0) updateValues.validationReception = updateData.validationReception || null;
    if (updateData.installePar !== void 0) updateValues.installePar = updateData.installePar || null;
    if (updateData.dateInstallation !== void 0) updateValues.dateInstallation = updateData.dateInstallation ? new Date(updateData.dateInstallation) : null;
    if (updateData.parametrageRealise !== void 0) updateValues.parametrageRealise = updateData.parametrageRealise || null;
    if (updateData.localisationFonctionnelle !== void 0) updateValues.localisationFonctionnelle = updateData.localisationFonctionnelle || null;
    if (updateData.statutConduite !== void 0) updateValues.statutConduite = updateData.statutConduite || null;
    if (updateData.telechargementMemoireMasse !== void 0) updateValues.telechargementMemoireMasse = updateData.telechargementMemoireMasse || null;
    if (updateData.numeroTruck4U !== void 0) updateValues.numeroTruck4U = updateData.numeroTruck4U || null;
    if (updateData.presenceTablette !== void 0) updateValues.presenceTablette = updateData.presenceTablette || null;
    if (updateData.typeTablette !== void 0) updateValues.typeTablette = updateData.typeTablette || null;
    if (updateData.imei !== void 0) updateValues.imei = updateData.imei || null;
    if (updateData.fonctionnelle !== void 0) updateValues.fonctionnelle = updateData.fonctionnelle || null;
    if (updateData.compatibilite !== void 0) updateValues.compatibilite = updateData.compatibilite || null;
    if (updateData.deliverup !== void 0) updateValues.deliverup = updateData.deliverup || null;
    if (updateData.applicationsSpecifiques !== void 0) updateValues.applicationsSpecifiques = updateData.applicationsSpecifiques || null;
    if (updateData.raisonsNonInstalle !== void 0) updateValues.raisonsNonInstalle = updateData.raisonsNonInstalle || null;
    if (updateData.cameraCabineTelematics !== void 0) updateValues.cameraCabineTelematics = updateData.cameraCabineTelematics || null;
    if (updateData.dashcam !== void 0) updateValues.dashcam = updateData.dashcam || null;
    if (updateData.numeroPDA !== void 0) updateValues.numeroPDA = updateData.numeroPDA || null;
    if (updateData.materielRequis !== void 0) updateValues.materielRequis = updateData.materielRequis || null;
    if (updateData.testsOK !== void 0) updateValues.testsOK = updateData.testsOK || null;
    if (updateData.champAction !== void 0) updateValues.champAction = updateData.champAction || null;
    if (updateData.observations !== void 0) updateValues.observations = updateData.observations || null;
    await db3.update(trucks).set(updateValues).where(eq(trucks.id, id));
    return await this.getTruck(id);
  }
  async deleteTruck(id) {
    const db3 = await getDb2();
    await db3.delete(trucks).where(eq(trucks.id, id));
    return true;
  }
  async searchTrucks(query, filialeId) {
    const db3 = await getDb2();
    const searchTerm = `%${query}%`;
    if (filialeId) {
      return await db3.select().from(trucks).where(
        and(
          eq(trucks.filialeId, filialeId),
          or(
            like(trucks.immatriculation, searchTerm),
            like(trucks.modele, searchTerm),
            like(trucks.imei, searchTerm),
            like(trucks.numeroTruck4U, searchTerm),
            like(trucks.numeroPDA, searchTerm)
          )
        )
      );
    }
    return await db3.select().from(trucks).where(
      or(
        like(trucks.immatriculation, searchTerm),
        like(trucks.modele, searchTerm),
        like(trucks.imei, searchTerm),
        like(trucks.numeroTruck4U, searchTerm),
        like(trucks.numeroPDA, searchTerm)
      )
    );
  }
  async filterTrucksByStatus(status, filialeId) {
    const db3 = await getDb2();
    if (filialeId) {
      return await db3.select().from(trucks).where(
        and(
          eq(trucks.filialeId, filialeId),
          or(
            eq(trucks.daValide, status),
            eq(trucks.validationReception, status),
            eq(trucks.parametrageRealise, status),
            eq(trucks.statutConduite, status),
            eq(trucks.presenceTablette, status),
            eq(trucks.fonctionnelle, status),
            eq(trucks.compatibilite, status),
            eq(trucks.deliverup, status),
            eq(trucks.cameraCabineTelematics, status),
            eq(trucks.dashcam, status),
            eq(trucks.materielRequis, status),
            eq(trucks.testsOK, status)
          )
        )
      );
    }
    return await db3.select().from(trucks).where(
      or(
        eq(trucks.daValide, status),
        eq(trucks.validationReception, status),
        eq(trucks.parametrageRealise, status),
        eq(trucks.statutConduite, status),
        eq(trucks.presenceTablette, status),
        eq(trucks.fonctionnelle, status),
        eq(trucks.compatibilite, status),
        eq(trucks.deliverup, status),
        eq(trucks.cameraCabineTelematics, status),
        eq(trucks.dashcam, status),
        eq(trucks.materielRequis, status),
        eq(trucks.testsOK, status)
      )
    );
  }
};
var storage = new MySQLStorage();

// shared/schema/role.schema.ts
import { mysqlTable as mysqlTable6, varchar as varchar6, text as text5, boolean as boolean6, date as date6 } from "drizzle-orm/mysql-core";
import { sql as sql6 } from "drizzle-orm";
var roles4 = mysqlTable6("roles", {
  id: varchar6("id", { length: 255 }).primaryKey().default(sql6`(UUID())`),
  name: varchar6("name", { length: 255 }).notNull().unique(),
  description: text5("description"),
  isSystem: boolean6("is_system").notNull().default(false),
  isActive: boolean6("is_active").notNull().default(true),
  createdAt: date6("created_at").default(sql6`(CURRENT_DATE)`).notNull(),
  updatedAt: date6("updated_at").default(sql6`(CURRENT_DATE)`).notNull()
});

// shared/schema/user.schema.ts
import { mysqlTable as mysqlTable7, varchar as varchar7, text as text6, boolean as boolean7, date as date7 } from "drizzle-orm/mysql-core";
import { sql as sql7 } from "drizzle-orm";
import { createInsertSchema as createInsertSchema2, createSelectSchema as createSelectSchema2 } from "drizzle-zod";
var users2 = mysqlTable7("users", {
  id: varchar7("id", { length: 255 }).primaryKey().default(sql7`(UUID())`),
  email: varchar7("email", { length: 255 }).notNull().unique(),
  username: varchar7("username", { length: 255 }).notNull().unique(),
  password: varchar7("password", { length: 255 }).notNull(),
  firstName: varchar7("first_name", { length: 255 }),
  lastName: varchar7("last_name", { length: 255 }),
  avatarUrl: varchar7("avatar_url", { length: 255 }),
  isActive: boolean7("is_active").default(true).notNull(),
  lastLogin: date7("last_login"),
  createdAt: date7("created_at").default(sql7`(CURRENT_DATE)`).notNull(),
  updatedAt: date7("updated_at").default(sql7`(CURRENT_DATE)`).notNull()
});
var utilisateurs4 = mysqlTable7("utilisateurs", {
  id: varchar7("id", { length: 255 }).primaryKey().default(sql7`(UUID())`),
  email: varchar7("email", { length: 255 }).notNull().unique(),
  nom: varchar7("nom", { length: 255 }).notNull(),
  prenom: varchar7("prenom", { length: 255 }).notNull(),
  motDePasse: varchar7("mot_de_passe", { length: 255 }).notNull(),
  photoProfil: varchar7("photo_profil", { length: 255 }),
  preferences: text6("preferences"),
  actif: boolean7("actif").default(true).notNull(),
  dateCreation: date7("date_creation").default(sql7`(CURRENT_DATE)`).notNull()
});
var userSchema2 = createSelectSchema2(users2);
var newUserSchema2 = createInsertSchema2(users2);
var utilisateurSchema2 = createSelectSchema2(utilisateurs4);
var newUtilisateurSchema2 = createInsertSchema2(utilisateurs4);

// shared/schema/user-role.schema.ts
import { mysqlTable as mysqlTable9, varchar as varchar9, date as date9, boolean as boolean9 } from "drizzle-orm/mysql-core";
import { sql as sql9 } from "drizzle-orm";

// shared/schema/feature.schema.ts
import { mysqlTable as mysqlTable8, varchar as varchar8, text as text7, boolean as boolean8, date as date8 } from "drizzle-orm/mysql-core";
import { sql as sql8 } from "drizzle-orm";
var features3 = mysqlTable8("features", {
  id: varchar8("id", { length: 255 }).primaryKey().default(sql8`(UUID())`),
  name: varchar8("name", { length: 255 }).notNull().unique(),
  description: text7("description"),
  category: varchar8("category", { length: 100 }),
  isActive: boolean8("is_active").notNull().default(true),
  isSystem: boolean8("is_system").notNull().default(false),
  createdAt: date8("created_at").default(sql8`(CURRENT_DATE)`).notNull(),
  updatedAt: date8("updated_at").default(sql8`(CURRENT_DATE)`).notNull()
});

// shared/schema/user-role.schema.ts
var userRoles2 = mysqlTable9("user_roles", {
  id: varchar9("id", { length: 255 }).primaryKey().default(sql9`(UUID())`),
  userId: varchar9("user_id", { length: 255 }).notNull().references(() => users2.id, { onDelete: "cascade" }),
  roleId: varchar9("role_id", { length: 255 }).notNull().references(() => roles4.id, { onDelete: "cascade" }),
  createdAt: date9("created_at").default(sql9`(CURRENT_DATE)`).notNull(),
  updatedAt: date9("updated_at").default(sql9`(CURRENT_DATE)`).notNull(),
  isActive: boolean9("is_active").notNull().default(true)
});
var roleFeatures3 = mysqlTable9("role_features", {
  id: varchar9("id", { length: 255 }).primaryKey().default(sql9`(UUID())`),
  roleId: varchar9("role_id", { length: 255 }).notNull().references(() => roles4.id, { onDelete: "cascade" }),
  featureId: varchar9("feature_id", { length: 255 }).notNull().references(() => features3.id, { onDelete: "cascade" }),
  canView: boolean9("can_view").notNull().default(false),
  canEdit: boolean9("can_edit").notNull().default(false),
  canDelete: boolean9("can_delete").notNull().default(false),
  createdAt: date9("created_at").default(sql9`(CURRENT_DATE)`).notNull(),
  updatedAt: date9("updated_at").default(sql9`(CURRENT_DATE)`).notNull()
});

// shared/schema.ts
import { sql as sql10 } from "drizzle-orm";
import { mysqlTable as mysqlTable10, text as text8, varchar as varchar10, date as date10, boolean as boolean10, int as int2 } from "drizzle-orm/mysql-core";
import { z as z2 } from "zod";
var features4 = mysqlTable10("features", {
  id: varchar10("id", { length: 255 }).primaryKey().default(sql10`(UUID())`),
  code: varchar10("code", { length: 100 }).notNull().unique(),
  nom: varchar10("nom", { length: 255 }).notNull(),
  description: text8("description"),
  categorie: varchar10("categorie", { length: 100 }).notNull(),
  actif: boolean10("actif").default(true),
  dateCreation: date10("date_creation").default(sql10`(CURRENT_TIMESTAMP)`),
  dateMiseAJour: date10("date_mise_a_jour").default(sql10`(CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`)
});
var roleFeatures4 = mysqlTable10("role_features", {
  id: varchar10("id", { length: 255 }).primaryKey().default(sql10`(UUID())`),
  roleId: varchar10("role_id", { length: 255 }).notNull(),
  featureId: varchar10("feature_id", { length: 255 }).notNull(),
  peutVoir: boolean10("peut_voir").default(false),
  peutModifier: boolean10("peut_modifier").default(false),
  peutSupprimer: boolean10("peut_supprimer").default(false),
  dateAttribution: date10("date_attribution").default(sql10`(CURRENT_TIMESTAMP)`),
  attribuePar: varchar10("attribue_par", { length: 255 }).notNull(),
  dateFin: date10("date_fin"),
  commentaire: text8("commentaire")
});
var roles5 = mysqlTable10("roles", {
  id: varchar10("id", { length: 255 }).primaryKey().default(sql10`(UUID())`),
  nom: varchar10("nom", { length: 100 }).notNull().unique(),
  description: varchar10("description", { length: 500 }),
  niveau: int2("niveau").notNull(),
  // 1=admin, 2=responsable, 3=lecteur
  type: varchar10("type", { length: 50 }).notNull(),
  // "groupe" ou "filiale"
  actif: boolean10("actif").default(true)
});
var utilisateurs5 = mysqlTable10("utilisateurs", {
  id: varchar10("id", { length: 255 }).primaryKey().default(sql10`(UUID())`),
  email: varchar10("email", { length: 255 }).notNull().unique(),
  nom: varchar10("nom", { length: 255 }).notNull(),
  prenom: varchar10("prenom", { length: 255 }).notNull(),
  motDePasse: varchar10("mot_de_passe", { length: 255 }).notNull(),
  photoProfil: varchar10("photo_profil", { length: 255 }),
  preferences: text8("preferences"),
  actif: boolean10("actif").default(true),
  dateCreation: date10("date_creation").default(sql10`(CURRENT_DATE)`)
});
var permissionsUtilisateur3 = mysqlTable10("permissions_utilisateur", {
  id: varchar10("id", { length: 255 }).primaryKey().default(sql10`(UUID())`),
  utilisateurId: varchar10("utilisateur_id", { length: 255 }).notNull(),
  roleId: varchar10("role_id", { length: 255 }).notNull(),
  filialeId: varchar10("filiale_id", { length: 255 }),
  // null pour les rôles groupe
  dateAttribution: date10("date_attribution").default(sql10`(CURRENT_DATE)`),
  attribuePar: varchar10("attribue_par", { length: 255 }).notNull(),
  dateFin: date10("date_fin"),
  commentaire: text8("commentaire"),
  actif: boolean10("actif").default(true)
});
var filiales3 = mysqlTable10("filiales", {
  id: varchar10("id", { length: 255 }).primaryKey().default(sql10`(UUID())`),
  nom: varchar10("nom", { length: 255 }).notNull().unique(),
  code: varchar10("code", { length: 50 }).notNull().unique(),
  adresse: varchar10("adresse", { length: 500 }),
  telephone: varchar10("telephone", { length: 50 }),
  email: varchar10("email", { length: 255 }),
  responsable: varchar10("responsable", { length: 255 }),
  dateCreation: date10("date_creation").default(sql10`(CURRENT_DATE)`),
  actif: boolean10("actif").default(true)
});
var trucks3 = mysqlTable10("trucks", {
  id: varchar10("id", { length: 255 }).primaryKey().default(sql10`(UUID())`),
  filialeId: varchar10("filiale_id", { length: 255 }).notNull(),
  immatriculation: varchar10("immatriculation", { length: 255 }).notNull(),
  modele: varchar10("modele", { length: 255 }).notNull(),
  // Section État
  numeroDA: varchar10("numero_da", { length: 255 }),
  dateDA: date10("date_da"),
  daValide: varchar10("da_valide", { length: 50 }),
  // "oui", "non", "na"
  numeroCA: varchar10("numero_ca", { length: 255 }),
  dateCA: date10("date_ca"),
  dateReception: date10("date_reception"),
  validationReception: varchar10("validation_reception", { length: 50 }),
  // "oui", "non", "na"
  // Section Truck4U
  installePar: varchar10("installe_par", { length: 255 }),
  dateInstallation: date10("date_installation"),
  parametrageRealise: varchar10("parametrage_realise", { length: 50 }),
  // "oui", "non", "partiel"
  localisationFonctionnelle: varchar10("localisation_fonctionnelle", { length: 255 }),
  statutConduite: varchar10("statut_conduite", { length: 50 }),
  // "fonctionnel", "non_fonctionnel", "test_requis"
  telechargementMemoireMasse: varchar10("telechargement_memoire_masse", { length: 255 }),
  numeroTruck4U: varchar10("numero_truck4u", { length: 255 }),
  // Section Tablette
  presenceTablette: varchar10("presence_tablette", { length: 50 }),
  // "oui", "non"
  typeTablette: varchar10("type_tablette", { length: 255 }),
  imei: varchar10("imei", { length: 255 }),
  fonctionnelle: varchar10("fonctionnelle", { length: 50 }),
  // "oui", "non", "partiel"
  compatibilite: varchar10("compatibilite", { length: 50 }),
  // "compatible", "incompatible", "test_requis"
  deliverup: varchar10("deliverup", { length: 50 }),
  // "installe", "non_installe", "erreur"
  applicationsSpecifiques: text8("applications_specifiques"),
  raisonsNonInstalle: text8("raisons_non_installe"),
  // Section Matériel
  cameraCabineTelematics: varchar10("camera_cabine_telematics", { length: 50 }),
  // "oui", "non", "pas_besoin"
  dashcam: varchar10("dashcam", { length: 50 }),
  // "oui", "non", "pas_besoin"
  numeroPDA: varchar10("numero_pda", { length: 255 }),
  materielRequis: varchar10("materiel_requis", { length: 50 }),
  // "complet", "partiel", "manquant"
  testsOK: varchar10("tests_ok", { length: 50 }),
  // "oui", "non", "en_cours"
  // Champs d'action
  champAction: text8("champ_action"),
  observations: text8("observations")
});
var insertRoleSchema2 = z2.object({
  nom: z2.string().min(1, "Le nom est obligatoire"),
  description: z2.string().optional(),
  niveau: z2.number().min(1).max(3),
  type: z2.enum(["groupe", "filiale"]),
  actif: z2.boolean().default(true)
});
var insertUtilisateurSchema2 = z2.object({
  email: z2.string().email("Email invalide"),
  nom: z2.string().min(1, "Le nom est obligatoire"),
  prenom: z2.string().min(1, "Le pr\xE9nom est obligatoire"),
  motDePasse: z2.string().min(6, "Le mot de passe doit contenir au moins 6 caract\xE8res"),
  actif: z2.boolean().default(true)
});
var insertPermissionSchema2 = z2.object({
  utilisateurId: z2.string().min(1, "L'utilisateur est obligatoire"),
  roleId: z2.string().min(1, "Le r\xF4le est obligatoire"),
  filialeId: z2.string().optional(),
  // optionnel pour les rôles groupe
  attribuePar: z2.string().min(1, "L'administrateur qui attribue est obligatoire"),
  actif: z2.boolean().default(true)
});
var insertFilialeSchema2 = z2.object({
  nom: z2.string().min(1, "Le nom est obligatoire"),
  code: z2.string().min(1, "Le code est obligatoire"),
  adresse: z2.string().optional(),
  telephone: z2.string().optional(),
  email: z2.string().email().optional(),
  responsable: z2.string().optional(),
  actif: z2.boolean().default(true)
});
var insertTruckSchema2 = z2.object({
  filialeId: z2.string().min(1, "L'ID de la filiale est obligatoire"),
  immatriculation: z2.string().min(1, "L'immatriculation est obligatoire"),
  modele: z2.string().min(1, "Le mod\xE8le est obligatoire"),
  numeroDA: z2.string().optional(),
  dateDA: z2.string().optional(),
  daValide: z2.string().optional(),
  numeroCA: z2.string().optional(),
  dateCA: z2.string().optional(),
  dateReception: z2.string().optional(),
  validationReception: z2.string().optional(),
  installePar: z2.string().optional(),
  dateInstallation: z2.string().optional(),
  parametrageRealise: z2.string().optional(),
  localisationFonctionnelle: z2.string().optional(),
  statutConduite: z2.string().optional(),
  telechargementMemoireMasse: z2.string().optional(),
  numeroTruck4U: z2.string().optional(),
  presenceTablette: z2.string().optional(),
  typeTablette: z2.string().optional(),
  imei: z2.string().optional(),
  fonctionnelle: z2.string().optional(),
  compatibilite: z2.string().optional(),
  deliverup: z2.string().optional(),
  applicationsSpecifiques: z2.string().optional(),
  raisonsNonInstalle: z2.string().optional(),
  cameraCabineTelematics: z2.string().optional(),
  dashcam: z2.string().optional(),
  numeroPDA: z2.string().optional(),
  materielRequis: z2.string().optional(),
  testsOK: z2.string().optional(),
  champAction: z2.string().optional(),
  observations: z2.string().optional()
});

// server/routes.ts
import { z as z7 } from "zod";
import path2 from "path";
import { existsSync, mkdirSync } from "fs";
import { fileURLToPath as fileURLToPath2 } from "url";

// server/controllers/user.controller.ts
import { z as z3 } from "zod";
import { eq as eq2, sql as sql11 } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import crypto2 from "crypto";
var createUserSchema = z3.object({
  email: z3.string().email("Email invalide"),
  motDePasse: z3.string().min(8, "Le mot de passe doit contenir au moins 8 caract\xE8res"),
  nom: z3.string().min(1, "Le nom est requis"),
  prenom: z3.string().min(1, "Le pr\xE9nom est requis"),
  telephone: z3.string().optional(),
  photoProfil: z3.string().optional(),
  actif: z3.boolean().default(true),
  roleIds: z3.array(z3.string().uuid("ID de r\xF4le invalide")).optional()
});
var updateUserSchema = createUserSchema.omit({ motDePasse: true }).extend({
  motDePasse: z3.string().min(8, "Le mot de passe doit contenir au moins 8 caract\xE8res").optional(),
  currentPassword: z3.string().optional()
});
var UserController = class {
  /**
   * Récupère le profil de l'utilisateur connecté
   */
  async getMyProfile(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Non autoris\xE9" });
      }
      const db3 = getDb2();
      const user = await db3.query.utilisateurs.findFirst({
        where: (utilisateurs6, { eq: eq8 }) => eq8(utilisateurs6.id, req.user.id),
        with: {
          role: {
            columns: {
              id: true,
              nom: true,
              description: true
            }
          }
        }
      });
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouv\xE9" });
      }
      const { motDePasse, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        isAdmin: user.role?.nom === "admin",
        isManager: user.role?.nom === "manager"
      });
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration du profil:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
  /**
   * Met à jour le mot de passe de l'utilisateur connecté
   */
  async updateMyPassword(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Non autoris\xE9" });
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Les mots de passe actuels et nouveaux sont requis" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 8 caract\xE8res" });
      }
      const db3 = getDb2();
      const user = await db3.query.utilisateurs.findFirst({
        where: (utilisateurs6, { eq: eq8 }) => eq8(utilisateurs6.id, req.user.id)
      });
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouv\xE9" });
      }
      const isPasswordValid = await bcrypt.compare(currentPassword, user.motDePasse);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Mot de passe actuel incorrect" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db3.update(utilisateurs4).set({
        motDePasse: hashedPassword,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(utilisateurs4.id, req.user.id));
      res.json({ message: "Mot de passe mis \xE0 jour avec succ\xE8s" });
    } catch (error) {
      console.error("Erreur lors de la mise \xE0 jour du mot de passe:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
  /**
   * Récupère tous les utilisateurs (admin seulement)
   */
  async getAllUsers(_req, res) {
    try {
      const db3 = await getDb2();
      const users4 = await db3.query.utilisateurs.findMany({
        with: {
          role: {
            columns: {
              id: true,
              nom: true,
              description: true
            }
          }
        },
        orderBy: (utilisateurs6, { asc }) => [asc(utilisateurs6.nom), asc(utilisateurs6.prenom)]
      });
      const usersWithoutPasswords = users4.map(({ motDePasse, ...user }) => ({
        ...user,
        isAdmin: user.role?.nom === "admin",
        isManager: user.role?.nom === "manager"
      }));
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration des utilisateurs:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
  /**
   * Récupère un utilisateur par son ID (admin seulement)
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const db3 = await getDb2();
      const user = await db3.query.utilisateurs.findFirst({
        where: (utilisateurs6, { eq: eq8 }) => eq8(utilisateurs6.id, id),
        with: {
          role: {
            columns: {
              id: true,
              nom: true,
              description: true
            }
          }
        }
      });
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouv\xE9" });
      }
      const { motDePasse, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        isAdmin: user.role?.nom === "admin",
        isManager: user.role?.nom === "manager"
      });
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration de l'utilisateur:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
  /**
   * Met à jour un utilisateur (admin seulement)
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;
      const validation = updateUserSchema.safeParse(userData);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Donn\xE9es utilisateur invalides",
          errors: validation.error.errors
        });
      }
      const db3 = await getDb2();
      const existingUser = await db3.query.utilisateurs.findFirst({
        where: (utilisateurs6, { eq: eq8 }) => eq8(utilisateurs6.id, id)
      });
      if (!existingUser) {
        return res.status(404).json({ message: "Utilisateur non trouv\xE9" });
      }
      await db3.update(utilisateurs4).set({
        email: userData.email,
        nom: userData.nom,
        prenom: userData.prenom,
        telephone: userData.telephone || null,
        photoProfil: userData.photoProfil || null,
        actif: userData.actif,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(utilisateurs4.id, id));
      if (userData.roleIds) {
        await db3.delete(userRoles2).where(eq2(userRoles2.userId, id));
        if (userData.roleIds.length > 0) {
          const newUserRoles = userData.roleIds.map((roleId) => ({
            userId: id,
            roleId,
            dateAttribution: /* @__PURE__ */ new Date(),
            attribuePar: req.user?.id || "system",
            isActive: true
          }));
          await db3.insert(userRoles2).values(newUserRoles);
        }
      }
      res.json({ success: true, message: "Utilisateur mis \xE0 jour avec succ\xE8s" });
    } catch (error) {
      console.error("Erreur lors de la mise \xE0 jour de l'utilisateur:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
  /**
   * Désactive un utilisateur (admin seulement)
   */
  async deactivateUser(req, res) {
    try {
      const { id } = req.params;
      if (id === req.user?.id) {
        return res.status(400).json({ message: "Vous ne pouvez pas d\xE9sactiver votre propre compte" });
      }
      const db3 = await getDb2();
      const existingUser = await db3.query.utilisateurs.findFirst({
        where: (utilisateurs6, { eq: eq8 }) => eq8(utilisateurs6.id, id)
      });
      if (!existingUser) {
        return res.status(404).json({ message: "Utilisateur non trouv\xE9" });
      }
      await db3.update(utilisateurs4).set({
        actif: false,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(utilisateurs4.id, id));
      res.json({ success: true, message: "Utilisateur d\xE9sactiv\xE9 avec succ\xE8s" });
    } catch (error) {
      console.error("Erreur lors de la d\xE9sactivation de l'utilisateur:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
  /**
   * Crée un nouvel utilisateur
   */
  async createUser(req, res) {
    try {
      const userData = req.body;
      const validation = createUserSchema.safeParse(userData);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Donn\xE9es utilisateur invalides",
          errors: validation.error.errors
        });
      }
      const db3 = await getDb2();
      const existingUser = await db3.select().from(utilisateurs4).where(eq2(utilisateurs4.email, userData.email));
      if (existingUser.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Un utilisateur avec cet email existe d\xE9j\xE0"
        });
      }
      const validRoleIds = [];
      if (userData.roleIds && userData.roleIds.length > 0) {
        const roleRecords = await db3.select().from(roles4).where(sql11`${roles4.id} IN (${userData.roleIds.join(",")})`);
        validRoleIds.push(...roleRecords.map((r) => r.id));
      }
      const hashedPassword = await bcrypt.hash(userData.motDePasse, 10);
      const userId = crypto2.randomUUID();
      await db3.transaction(async (tx) => {
        const newUser = {
          id: userId,
          email: userData.email,
          motDePasse: hashedPassword,
          nom: userData.nom,
          prenom: userData.prenom,
          telephone: userData.telephone,
          photoProfil: userData.photoProfil,
          actif: userData.actif,
          dateCreation: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        await tx.insert(utilisateurs4).values(newUser);
        if (validRoleIds.length > 0) {
          const userRoleMappings = validRoleIds.map((roleId) => ({
            id: crypto2.randomUUID(),
            userId,
            roleId,
            isActive: true,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }));
          await tx.insert(userRoles2).values(userRoleMappings);
        }
      });
      const createdUser = await db3.select().from(utilisateurs4).where(eq2(utilisateurs4.id, userId));
      if (!createdUser.length) {
        throw new Error("Erreur lors de la cr\xE9ation de l'utilisateur");
      }
      const { motDePasse, ...userWithoutPassword } = createdUser[0];
      return res.status(201).json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      console.error("Erreur lors de la cr\xE9ation de l'utilisateur :", error);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la cr\xE9ation de l'utilisateur",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  }
};
var userController = new UserController();

// server/controllers/role.controller.ts
import { z as z4 } from "zod";

// server/services/feature.service.ts
import { and as and3, eq as eq3 } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
var FeatureService = class {
  /**
   * Récupère toutes les fonctionnalités actives
   */
  async getAllFeatures() {
    const db3 = await getDb2();
    return db3.select().from(features2).where(eq3(features2.isActive, true));
  }
  /**
   * Récupère une fonctionnalité par son ID
   */
  async getFeatureById(id) {
    const db3 = await getDb2();
    const result = await db3.select().from(features2).where(eq3(features2.id, id)).limit(1);
    return result[0];
  }
  /**
   * Récupère une fonctionnalité par son code
   */
  async getFeatureByName(name) {
    const db3 = await getDb2();
    const [feature] = await db3.select().from(features2).where(and3(
      eq3(features2.name, name),
      eq3(features2.isActive, true)
    )).limit(1);
    return feature;
  }
  /**
   * Crée une nouvelle fonctionnalité
   */
  async createFeature(featureData) {
    const db3 = await getDb2();
    const newFeature = {
      ...featureData,
      isActive: true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    const result = await db3.insert(features2).values(newFeature);
    const [insertedFeature] = await db3.select().from(features2).where(eq3(features2.id, newFeature.id)).limit(1);
    return insertedFeature;
  }
  /**
   * Met à jour une fonctionnalité existante
   */
  async updateFeature(id, featureData) {
    const db3 = await getDb2();
    const updateData = {
      ...featureData,
      updatedAt: /* @__PURE__ */ new Date()
    };
    await db3.update(features2).set(updateData).where(and3(
      eq3(features2.id, id),
      eq3(features2.isActive, true)
    ));
    const [updatedFeature] = await db3.select().from(features2).where(eq3(features2.id, id)).limit(1);
    return updatedFeature;
  }
  /**
   * Désactive une fonctionnalité (soft delete)
   */
  async deleteFeature(id) {
    const db3 = await getDb2();
    await db3.update(features2).set({
      isActive: false,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq3(features2.id, id));
    const [deletedFeature] = await db3.select().from(features2).where(eq3(features2.id, id)).limit(1);
    return !!deletedFeature && !deletedFeature.isActive;
  }
  /**
   * Récupère toutes les permissions pour un rôle
   */
  async getRolePermissions(roleId) {
    const db3 = await getDb2();
    const result = await db3.select().from(roleFeatures2).where(eq3(roleFeatures2.roleId, roleId));
    return result;
  }
  /**
   * Vérifie si un rôle a une certaine permission
   */
  async hasPermission(roleId, featureId, action) {
    const db3 = await getDb2();
    const result = await db3.select().from(roleFeatures2).leftJoin(features2, eq3(roleFeatures2.featureId, features2.id)).where(
      and3(
        eq3(roleFeatures2.roleId, roleId),
        eq3(roleFeatures2.featureId, featureId)
      )
    ).limit(1);
    if (result.length === 0) {
      return false;
    }
    const roleFeature = result[0].role_features;
    const canView = roleFeature?.canView ?? false;
    const canEdit = roleFeature?.canEdit ?? false;
    const canDelete = roleFeature?.canDelete ?? false;
    switch (action) {
      case "voir":
        return canView;
      case "modifier":
        return canEdit;
      case "supprimer":
        return canDelete;
      default:
        return false;
    }
  }
  /**
   * Met à jour les permissions d'un rôle pour une fonctionnalité
   */
  async updateRolePermission(roleId, featureId, permissions2, userId) {
    const db3 = await getDb2();
    const existingPermissions = await db3.select().from(roleFeatures2).where(
      and3(
        eq3(roleFeatures2.roleId, roleId),
        eq3(roleFeatures2.featureId, featureId)
      )
    ).limit(1);
    if (existingPermissions.length > 0) {
      const existing = existingPermissions[0];
      if (!existing || !existing.id) {
        throw new Error("Invalid existing permission data");
      }
      const updateData = {
        canView: permissions2.canView ?? existing.canView ?? false,
        canEdit: permissions2.canEdit ?? existing.canEdit ?? false,
        canDelete: permissions2.canDelete ?? existing.canDelete ?? false,
        updatedAt: /* @__PURE__ */ new Date()
      };
      await db3.update(roleFeatures2).set(updateData).where(eq3(roleFeatures2.id, existing.id));
      const [updatedPermission] = await db3.select().from(roleFeatures2).where(eq3(roleFeatures2.id, existing.id)).limit(1);
      if (!updatedPermission) {
        throw new Error("Failed to fetch updated permission");
      }
      return updatedPermission;
    } else {
      const newPermission = {
        id: uuidv4(),
        roleId,
        featureId,
        canView: permissions2.canView ?? false,
        canEdit: permissions2.canEdit ?? false,
        canDelete: permissions2.canDelete ?? false,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      await db3.insert(roleFeatures2).values(newPermission);
      const [insertedPermission] = await db3.select().from(roleFeatures2).where(eq3(roleFeatures2.id, newPermission.id)).limit(1);
      if (!insertedPermission) {
        throw new Error("Erreur lors de la cr\xE9ation de la permission");
      }
      return insertedPermission;
    }
  }
  /**
   * Récupère toutes les fonctionnalités avec les permissions pour un rôle
   */
  async getFeaturesWithPermissions(roleId) {
    const db3 = await getDb2();
    const allFeatures = await db3.select().from(features2).where(eq3(features2.isActive, true));
    const rolePermissions = await db3.select().from(roleFeatures2).where(eq3(roleFeatures2.roleId, roleId));
    return allFeatures.map((feature) => {
      const permission = rolePermissions.find((p) => p.featureId === feature.id);
      return {
        ...feature,
        canView: permission?.canView ?? false,
        canEdit: permission?.canEdit ?? false,
        canDelete: permission?.canDelete ?? false
      };
    });
  }
  /**
   * Récupère toutes les permissions d'un utilisateur sous forme d'objet clé-valeur
   * @param roleId ID du rôle de l'utilisateur
   */
  async getUserPermissions(roleId) {
    const userFeatures = await this.getFeaturesWithPermissions(roleId);
    const permissions2 = {};
    userFeatures.forEach((feature) => {
      permissions2[`${feature.id}:view`] = feature.canView;
      permissions2[`${feature.id}:edit`] = feature.canEdit;
      permissions2[`${feature.id}:delete`] = feature.canDelete;
    });
    return permissions2;
  }
  /**
   * Vérifie si un utilisateur a accès à une filiale spécifique
   * @param userId ID de l'utilisateur
   * @param filialeId ID de la filiale
   */
  async hasFilialeAccess(userId, filialeId) {
    const db3 = await getDb2();
    try {
      const userRole = await db3.select().from(userRoles).where(eq3(userRoles.userId, userId)).limit(1);
      if (userRole.length === 0) {
        return false;
      }
      return true;
    } catch (error) {
      console.error("Erreur lors de la v\xE9rification des acc\xE8s filiale:", error);
      return false;
    }
  }
};
var featureService = new FeatureService();

// server/controllers/role.controller.ts
import { eq as eq4, and as and4, sql as sql12, or as or2, isNull, gte } from "drizzle-orm";
var createRoleSchema = z4.object({
  name: z4.string().min(1, "Le nom du r\xF4le est requis"),
  description: z4.string().optional(),
  isActive: z4.boolean().default(true),
  isSystem: z4.boolean().default(false),
  permissions: z4.array(
    z4.object({
      featureId: z4.string().min(1, "ID de fonctionnalit\xE9 requis"),
      canView: z4.boolean().default(false),
      canEdit: z4.boolean().default(false),
      canDelete: z4.boolean().default(false),
      comment: z4.string().optional()
    })
  ).optional()
});
var updateRoleSchema = createRoleSchema.partial().extend({
  id: z4.string().min(1, "ID de r\xF4le requis")
});
var assignRoleSchema = z4.object({
  userId: z4.string().min(1, "ID utilisateur requis"),
  roleId: z4.string().min(1, "ID r\xF4le requis"),
  isActive: z4.boolean().default(true),
  assignedBy: z4.string().min(1, "ID administrateur requis"),
  comment: z4.string().optional()
});
var RoleController = class {
  /**
   * Crée un nouveau rôle
   */
  async createRole(req, res) {
    try {
      const validation = createRoleSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Donn\xE9es invalides",
          errors: validation.error.errors
        });
      }
      const { permissions: permissions2, ...roleData } = validation.data;
      const db3 = await getDb2();
      const newRole = await db3.transaction(async (tx) => {
        const roleValues = {
          id: crypto.randomUUID(),
          type: "custom",
          // Default role type
          nom: roleData.name,
          // Map name to nom
          description: roleData.description,
          niveau: 1,
          // Default level
          actif: roleData.isActive,
          // Map isActive to actif
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        await tx.insert(roles5).values(roleValues);
        const [role] = await tx.select().from(roles5).where(eq4(roles5.id, roleValues.id)).limit(1);
        return role;
        if (permissions2 && permissions2.length > 0) {
          const roleFeaturesToInsert = permissions2.map((permission) => ({
            id: crypto.randomUUID(),
            roleId: newRole.id,
            featureId: permission.featureId,
            peutVoir: permission.canView ?? false,
            peutModifier: permission.canEdit ?? false,
            peutSupprimer: permission.canDelete ?? false,
            commentaire: permission.comment,
            attribuePar: req.user?.id || "system",
            dateAttribution: /* @__PURE__ */ new Date(),
            actif: true,
            dateCreation: /* @__PURE__ */ new Date(),
            dateModification: /* @__PURE__ */ new Date()
          }));
          await tx.insert(roleFeatures4).values(roleFeaturesToInsert);
        }
        res.status(201).json({
          success: true,
          data: newRole
        });
      });
    } catch (error) {
      console.error("Erreur lors de la cr\xE9ation du r\xF4le:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la cr\xE9ation du r\xF4le"
      });
    }
  }
  /**
   * Met à jour un rôle existant
   */
  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const validation = updateRoleSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Donn\xE9es invalides",
          errors: validation.error.errors
        });
      }
      const { permissions: permissions2, ...updateData } = validation.data;
      const db3 = await getDb2();
      const [existingRole] = await db3.select().from(roles5).where(eq4(roles5.id, id)).limit(1);
      if (!existingRole) {
        return res.status(404).json({
          success: false,
          message: "R\xF4le non trouv\xE9"
        });
      }
      await db3.transaction(async (tx) => {
        await tx.update(roles5).set({
          nom: updateData.name,
          description: updateData.description,
          actif: updateData.isActive,
          updatedAt: /* @__PURE__ */ new Date(),
          dateModification: /* @__PURE__ */ new Date()
        }).where(eq4(roles5.id, id));
        const [role] = await tx.select().from(roles5).where(eq4(roles5.id, id));
        return role;
        if (permissions2) {
          await tx.delete(roleFeatures4).where(eq4(roleFeatures4.roleId, id));
          if (permissions2.length > 0) {
            await tx.insert(roleFeatures4).values(
              permissions2.map((perm) => {
                const permissionData = {
                  featureId: perm.featureId,
                  canView: perm.canView,
                  canEdit: perm.canEdit,
                  canDelete: perm.canDelete,
                  comment: perm.comment
                };
                return {
                  id: crypto.randomUUID(),
                  roleId: id,
                  ...permissionData,
                  assignedAt: /* @__PURE__ */ new Date(),
                  assignedBy: req.user?.id || "system"
                };
              })
            );
          }
        }
      });
      res.json({
        success: true,
        data: updatedRole
      });
    } catch (error) {
      console.error("Erreur lors de la mise \xE0 jour du r\xF4le:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise \xE0 jour du r\xF4le"
      });
    }
  }
  /**
   * Supprime un rôle
   */
  async deleteRole(req, res) {
    try {
      const { id } = req.params;
      const db3 = await getDb2();
      const [existingRole] = await db3.select().from(roles5).where(eq4(roles5.id, id)).limit(1);
      if (!existingRole) {
        return res.status(404).json({
          success: false,
          message: "R\xF4le non trouv\xE9"
        });
      }
      const usersWithRole = await db3.select().from(userRoles2).where(
        and4(
          eq4(userRoles2.roleId, id),
          sql12`${userRoles2.dateFin} IS NULL OR ${userRoles2.dateFin} >= CURRENT_DATE`
        )
      ).limit(1);
      if (usersWithRole.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Impossible de supprimer ce r\xF4le car il est attribu\xE9 \xE0 un ou plusieurs utilisateurs"
        });
      }
      await db3.update(roles5).set({
        actif: false,
        dateModification: /* @__PURE__ */ new Date()
      }).where(eq4(roles5.id, id));
      res.json({
        success: true,
        message: "R\xF4le d\xE9sactiv\xE9 avec succ\xE8s"
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du r\xF4le:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression du r\xF4le"
      });
    }
  }
  /**
   * Récupère tous les rôles
   */
  async getAllRoles(req, res) {
    try {
      const db3 = await getDb2();
      const allRoles = await db3.select().from(roles5);
      res.json({
        success: true,
        data: allRoles
      });
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration des r\xF4les:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la r\xE9cup\xE9ration des r\xF4les"
      });
    }
  }
  /**
   * Récupère un rôle par son ID avec ses permissions
   */
  async getRoleById(req, res) {
    try {
      const { id } = req.params;
      const db3 = await getDb2();
      const roleWithFeatures = await db3.query.roles.findFirst({
        where: eq4(roles5.id, id),
        with: {
          roleFeatures: {
            with: {
              feature: true
            }
          }
        }
      });
      if (!roleWithFeatures) {
        return res.status(404).json({ message: "R\xF4le non trouv\xE9" });
      }
      const response = {
        ...roleWithFeatures,
        features: roleWithFeatures.roleFeatures.map((rf) => ({
          id: rf.featureId,
          name: rf.feature.name,
          description: rf.feature.description,
          canView: rf.canView,
          canEdit: rf.canEdit,
          canDelete: rf.canDelete,
          assignedAt: rf.assignedAt,
          assignedBy: rf.assignedBy,
          comment: rf.comment,
          isActive: rf.isActive
        }))
      };
      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration du r\xF4le:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la r\xE9cup\xE9ration du r\xF4le"
      });
    }
  }
  /**
   * Attribue un rôle à un utilisateur
   */
  async assignRoleToUser(req, res) {
    try {
      const validation = assignRoleSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Donn\xE9es invalides",
          errors: validation.error.errors
        });
      }
      const { userId, roleId, dateDebut, dateFin, attribuePar, commentaire } = validation.data;
      const db3 = await getDb2();
      const [user] = await db3.select().from(users2).where(eq4(users2.id, userId)).limit(1);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouv\xE9"
        });
      }
      const [role] = await db3.select().from(roles5).where(eq4(roles5.id, roleId)).limit(1);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: "R\xF4le non trouv\xE9"
        });
      }
      const existingAssignment = await db3.select().from(userRoles2).where(
        and4(
          eq4(userRoles2.userId, userId),
          eq4(userRoles2.roleId, roleId),
          sql12`${userRoles2.dateFin} IS NULL OR ${userRoles2.dateFin} >= CURRENT_DATE`
        )
      ).limit(1);
      if (existingAssignment.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ce r\xF4le est d\xE9j\xE0 attribu\xE9 \xE0 cet utilisateur"
        });
      }
      const userRoleData = {
        roleId,
        userId,
        isActive: true,
        assignedBy: attribuePar,
        comment: commentaire
      };
      const [assignment] = await db3.insert(userRoles2).values(userRoleData).returning();
      res.status(201).json({
        success: true,
        data: assignment
      });
    } catch (error) {
      console.error("Erreur lors de l'attribution du r\xF4le:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'attribution du r\xF4le"
      });
    }
  }
  /**
   * Récupère les rôles d'un utilisateur
   */
  async getUserRoles(req, res) {
    try {
      const { userId } = req.params;
      const db3 = await getDb2();
      const [user] = await db3.select().from(users2).where(eq4(users2.id, userId)).limit(1);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouv\xE9"
        });
      }
      const userRoleData = await db3.query.userRoles.findMany({
        where: and4(
          eq4(userRoles2.userId, userId),
          or2(
            isNull(userRoles2.endDate),
            gte(userRoles2.endDate, /* @__PURE__ */ new Date())
          )
        ),
        with: {
          role: true
        }
      });
      const response = userRoleData.map((ur) => ({
        id: ur.id,
        roleId: ur.roleId,
        roleName: ur.role?.name || "Unknown Role",
        startDate: ur.dateDebut || null,
        endDate: ur.dateFin || null,
        assignedAt: ur.dateAttribution || /* @__PURE__ */ new Date(),
        assignedBy: ur.attribuePar || "system",
        comment: ur.commentaire || "",
        isActive: ur.actif ?? true
      }));
      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration des r\xF4les utilisateur:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la r\xE9cup\xE9ration des r\xF4les utilisateur"
      });
    }
  }
  /**
   * Révocation d'un rôle à un utilisateur
   */
  async revokeUserRole(req, res) {
    try {
      const { userId, roleId } = req.params;
      const { commentaire } = req.body;
      const db3 = await getDb2();
      const [assignment] = await db3.select().from(userRoles2).where(
        and4(
          eq4(userRoles2.userId, userId),
          eq4(userRoles2.roleId, roleId),
          sql12`${userRoles2.dateFin} IS NULL`
        )
      ).limit(1);
      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Aucune attribution de r\xF4le active trouv\xE9e pour cet utilisateur"
        });
      }
      await db3.update(userRoles2).set({
        dateFin: /* @__PURE__ */ new Date(),
        commentaire
      }).where(eq4(userRoles2.id, assignment.id));
      res.json({
        success: true,
        message: "R\xF4le r\xE9voqu\xE9 avec succ\xE8s"
      });
    } catch (error) {
      console.error("Erreur lors de la r\xE9vocation du r\xF4le:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la r\xE9vocation du r\xF4le"
      });
    }
  }
  /**
   * Désactive un rôle (marque comme inactif au lieu de le supprimer)
   */
  async deactivateRole(req, res) {
    try {
      const { id } = req.params;
      const db3 = await getDb2();
      const role = await db3.select().from(roles5).where(eq4(roles5.id, id)).limit(1);
      if (role.length === 0) {
        return res.status(404).json({
          success: false,
          message: "R\xF4le non trouv\xE9"
        });
      }
      await db3.update(roles5).set({ actif: false }).where(eq4(roles5.id, id));
      res.json({
        success: true,
        message: "R\xF4le d\xE9sactiv\xE9 avec succ\xE8s"
      });
    } catch (error) {
      console.error("Erreur lors de la d\xE9sactivation du r\xF4le:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la d\xE9sactivation du r\xF4le"
      });
    }
  }
  /**
   * Vérifie si un utilisateur a une permission spécifique
   */
  async checkUserPermission(req, res) {
    try {
      const { userId, featureCode, action } = req.params;
      if (!["voir", "modifier", "supprimer"].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "Action non valide. Les valeurs autoris\xE9es sont: voir, modifier, supprimer"
        });
      }
      const db3 = await getDb2();
      const activeRoles = await db3.select({ roleId: userRoles2.roleId }).from(userRoles2).where(
        and4(
          eq4(userRoles2.userId, userId),
          sql12`${userRoles2.dateFin} IS NULL OR ${userRoles2.dateFin} >= CURRENT_DATE`
        )
      );
      if (activeRoles.length === 0) {
        return res.json({
          success: true,
          hasPermission: false,
          message: "Aucun r\xF4le actif trouv\xE9 pour cet utilisateur"
        });
      }
      let hasPermission = false;
      for (const { roleId } of activeRoles) {
        const permission = await featureService.hasPermission(
          roleId,
          featureCode,
          action
        );
        if (permission) {
          hasPermission = true;
          break;
        }
      }
      res.json({
        success: true,
        hasPermission
      });
    } catch (error) {
      console.error("Erreur lors de la v\xE9rification de la permission:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la v\xE9rification de la permission"
      });
    }
  }
};
var roleController = new RoleController();

// server/controllers/dashboard.controller.ts
import { and as and5, eq as eq5, sql as sql17, count, gte as gte2, lte, desc } from "drizzle-orm";

// shared/schema/permission.schema.ts
import { mysqlTable as mysqlTable11, varchar as varchar11, text as text9, boolean as boolean11, date as date11 } from "drizzle-orm/mysql-core";
import { sql as sql13 } from "drizzle-orm";
var permissions = mysqlTable11("permissions", {
  id: varchar11("id", { length: 255 }).primaryKey().default(sql13`(UUID())`),
  roleId: varchar11("role_id", { length: 255 }).references(() => roles4.id, { onDelete: "cascade" }).notNull(),
  featureId: varchar11("feature_id", { length: 255 }).references(() => features3.id, { onDelete: "cascade" }).notNull(),
  canView: boolean11("can_view").notNull().default(false),
  canCreate: boolean11("can_create").notNull().default(false),
  canEdit: boolean11("can_edit").notNull().default(false),
  canDelete: boolean11("can_delete").notNull().default(false),
  createdAt: date11("created_at").default(sql13`(CURRENT_DATE)`).notNull(),
  updatedAt: date11("updated_at").default(sql13`(CURRENT_DATE)`).notNull()
});
var permissionsUtilisateur4 = mysqlTable11("permissions_utilisateur", {
  id: varchar11("id", { length: 255 }).primaryKey().default(sql13`(UUID())`),
  utilisateurId: varchar11("utilisateur_id", { length: 255 }).notNull(),
  roleId: varchar11("role_id", { length: 255 }).notNull(),
  filialeId: varchar11("filiale_id", { length: 255 }),
  // null for group roles
  dateAttribution: date11("date_attribution").default(sql13`(CURRENT_DATE)`).notNull(),
  attribuePar: varchar11("attribue_par", { length: 255 }).notNull(),
  dateFin: date11("date_fin"),
  commentaire: text9("commentaire"),
  actif: boolean11("actif").default(true).notNull()
});

// shared/schema/truck.schema.ts
import { mysqlTable as mysqlTable13, varchar as varchar13, text as text11, date as date12, int as int3, boolean as boolean13, timestamp as mysqlTimestamp } from "drizzle-orm/mysql-core";
import { sql as sql15 } from "drizzle-orm";

// shared/schema/filiale.schema.ts
import { mysqlTable as mysqlTable12, varchar as varchar12, text as text10, datetime, boolean as boolean12 } from "drizzle-orm/mysql-core";
import { sql as sql14 } from "drizzle-orm";
var filiales4 = mysqlTable12("filiales", {
  id: varchar12("id", { length: 255 }).primaryKey().default(sql14`(UUID())`),
  nom: text10("nom").notNull(),
  code: text10("code").notNull().unique(),
  adresse: text10("adresse"),
  ville: text10("ville"),
  codePostal: text10("code_postal"),
  pays: text10("pays"),
  telephone: text10("telephone"),
  email: text10("email"),
  responsable: text10("responsable"),
  isActive: boolean12("is_active").notNull().default(true),
  createdAt: datetime("created_at").default(sql14`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: datetime("updated_at").default(sql14`CURRENT_TIMESTAMP`).notNull()
});

// shared/schema/truck.schema.ts
var trucks4 = mysqlTable13("trucks", {
  id: varchar13("id", { length: 36 }).primaryKey().notNull().default(sql15`(UUID())`),
  immatriculation: varchar13("immatriculation", { length: 50 }).notNull().unique(),
  marque: varchar13("marque", { length: 100 }),
  modele: varchar13("modele", { length: 100 }).notNull(),
  annee: int3("annee"),
  dateMiseEnService: date12("date_mise_en_service"),
  dateDernierControle: date12("date_dernier_controle"),
  dateProchainControle: date12("date_prochain_controle"),
  kilometrage: int3("kilometrage"),
  statut: varchar13("statut", { length: 50 }).default("en_service"),
  filialeId: varchar13("filiale_id", { length: 36 }).references(() => filiales4.id, { onDelete: "set null" }),
  photoUrl: text11("photo_url"),
  commentaires: text11("commentaires"),
  isActive: boolean13("is_active").notNull().default(true),
  createdAt: mysqlTimestamp("created_at").default(sql15`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: mysqlTimestamp("updated_at").default(sql15`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull()
});

// shared/schema/audit.schema.ts
import { mysqlTable as mysqlTable14, varchar as varchar14, text as text12, datetime as datetime3, json, mysqlEnum } from "drizzle-orm/mysql-core";
import { sql as sql16 } from "drizzle-orm";
var AUDIT_ACTIONS = [
  "create",
  "read",
  "update",
  "delete",
  "login",
  "logout",
  "password_change",
  "permission_grant",
  "permission_revoke",
  "role_assign",
  "role_revoke",
  "feature_toggle",
  "settings_update",
  "import_data",
  "export_data"
];
var AUDIT_ENTITY_TYPES = [
  "user",
  "role",
  "feature",
  "permission",
  "truck",
  "filiale",
  "settings"
];
var auditLogs = mysqlTable14("audit_logs", {
  id: varchar14("id", { length: 255 }).primaryKey().default(sql16`(UUID())`),
  userId: varchar14("user_id", { length: 255 }).references(() => users2.id, { onDelete: "set null" }),
  action: mysqlEnum("action", [...AUDIT_ACTIONS]).notNull(),
  entityType: mysqlEnum("entity_type", [...AUDIT_ENTITY_TYPES]).notNull(),
  entityId: text12("entity_id"),
  entityName: text12("entity_name"),
  oldValues: json("old_values"),
  newValues: json("new_values"),
  ipAddress: text12("ip_address"),
  userAgent: text12("user_agent"),
  metadata: json("metadata"),
  createdAt: datetime3("created_at").default(sql16`CURRENT_TIMESTAMP`).notNull()
});

// server/controllers/dashboard.controller.ts
var DashboardController = class {
  /**
   * Récupère les statistiques générales pour le tableau de bord
   */
  async getDashboardStats(req, res) {
    try {
      const db3 = await getDb2();
      try {
        const [totalUsersResult] = await db3.select({ count: count() }).from(users2).where(eq5(users2.isActive, true));
        const thirtyDaysAgo = /* @__PURE__ */ new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [activeUsersResult] = await db3.select({ count: count() }).from(users2).where(
          and5(
            eq5(users2.isActive, true),
            gte2(users2.lastLogin, thirtyDaysAgo)
          )
        );
        const [totalRolesResult] = await db3.select({ count: count() }).from(roles4).where(eq5(roles4.isActive, true));
        const [totalFeaturesResult] = await db3.select({ count: count() }).from(features3).where(eq5(features3.isActive, true));
        const recentFeatures = await db3.select({
          id: features3.id,
          name: features3.name,
          category: features3.category,
          createdAt: features3.createdAt
        }).from(features3).where(
          and5(
            eq5(features3.isActive, true),
            gte2(features3.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3))
          )
        ).orderBy(desc(features3.createdAt)).limit(5);
        const usersByRole = await db3.select({
          roleId: roles4.id,
          roleName: roles4.name,
          userCount: count(users2.id)
        }).from(roles4).leftJoin(
          userRoles2,
          and5(
            eq5(roles4.id, userRoles2.roleId),
            eq5(userRoles2.isActive, true)
          )
        ).leftJoin(
          users2,
          and5(
            eq5(userRoles2.userId, users2.id),
            eq5(users2.isActive, true)
          )
        ).where(eq5(roles4.isActive, true)).groupBy(roles4.id, roles4.name);
        const recentActivity = await db3.select({
          id: users2.id,
          firstName: users2.firstName,
          lastName: users2.lastName,
          lastLogin: users2.lastLogin,
          isActive: users2.isActive,
          role: roles4.name
        }).from(users2).leftJoin(
          userRoles2,
          and5(
            eq5(users2.id, userRoles2.userId),
            eq5(userRoles2.isActive, true)
          )
        ).leftJoin(roles4, eq5(userRoles2.roleId, roles4.id)).where(eq5(users2.isActive, true)).orderBy(desc(users2.lastLogin)).limit(10);
        const popularFeatures = await db3.select({
          id: features3.id,
          name: features3.name,
          category: features3.category,
          usageCount: count(roleFeatures3.id)
        }).from(features3).leftJoin(
          roleFeatures3,
          and5(
            eq5(features3.id, roleFeatures3.featureId),
            gte2(roleFeatures3.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3)),
            lte(roleFeatures3.createdAt, /* @__PURE__ */ new Date())
          )
        ).where(eq5(features3.isActive, true)).groupBy(features3.id, features3.name, features3.category).orderBy(desc(count(roleFeatures3.id))).limit(5);
        const roleDistribution = await db3.select({
          id: roles4.id,
          name: roles4.name,
          isSystem: roles4.isSystem,
          userCount: count(userRoles2.userId)
        }).from(roles4).leftJoin(
          userRoles2,
          and5(
            eq5(roles4.id, userRoles2.roleId),
            eq5(userRoles2.isActive, true)
          )
        ).where(eq5(roles4.isActive, true)).groupBy(roles4.id, roles4.name, roles4.isSystem);
        const inactiveUserRoles = await db3.select({
          id: users2.id,
          firstName: users2.firstName,
          lastName: users2.lastName,
          lastLogin: users2.lastLogin,
          role: roles4.name,
          isActive: userRoles2.isActive
        }).from(users2).innerJoin(userRoles2, eq5(users2.id, userRoles2.userId)).innerJoin(roles4, eq5(userRoles2.roleId, roles4.id)).where(
          and5(
            eq5(users2.isActive, true),
            eq5(roles4.isActive, true),
            eq5(userRoles2.isActive, false)
          )
        ).orderBy(desc(users2.lastLogin));
        res.json({
          success: true,
          data: {
            totalUsers: totalUsersResult.count,
            activeUsers: activeUsersResult.count,
            totalRoles: totalRolesResult.count,
            totalFeatures: totalFeaturesResult.count,
            recentFeatures,
            usersByRole,
            recentActivity,
            popularFeatures,
            roleDistribution,
            inactiveUserRoles
          }
        });
      } catch (error) {
        console.error("Error in getDashboardStats:", error);
        res.status(500).json({ success: false, error: "Failed to fetch dashboard statistics" });
      }
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration des statistiques du tableau de bord:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la r\xE9cup\xE9ration des statistiques du tableau de bord"
      });
    }
  }
  /**
   * Récupère les statistiques d'utilisation des fonctionnalités
   */
  async getFeatureUsageStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const db3 = await getDb2();
      const start = startDate ? new Date(startDate) : /* @__PURE__ */ new Date();
      start.setDate(start.getDate() - 30);
      const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
      const featureUsage = await db3.select({
        featureId: features3.id,
        featureName: features3.nom,
        featureCode: features3.code,
        usageCount: count(roleFeatures3.id)
      }).from(features3).leftJoin(roleFeatures3, and5(
        eq5(features3.id, roleFeatures3.featureId),
        gte2(roleFeatures3.dateAttribution, start),
        lte(roleFeatures3.dateAttribution, end)
      )).where(eq5(features3.actif, true)).groupBy(features3.id, features3.nom, features3.code).orderBy(desc(count(roleFeatures3.id)));
      res.json({
        success: true,
        data: featureUsage
      });
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration des statistiques d'utilisation des fonctionnalit\xE9s:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la r\xE9cup\xE9ration des statistiques d'utilisation des fonctionnalit\xE9s"
      });
    }
  }
  /**
   * Récupère les statistiques d'utilisation des rôles
   */
  async getRoleUsageStats(req, res) {
    try {
      const db3 = await getDb2();
      const roleUsage = await db3.select({
        roleId: roles4.id,
        roleName: roles4.nom,
        roleDescription: roles4.description,
        userCount: count(userRoles2.id),
        isSystemRole: eq5(roles4.type, "syst\xE8me")
      }).from(roles4).leftJoin(userRoles2, and5(
        eq5(roles4.id, userRoles2.roleId),
        sql17`${userRoles2.dateFin} IS NULL`
      )).where(eq5(roles4.actif, true)).groupBy(roles4.id, roles4.nom, roles4.description, roles4.type).orderBy(desc(count(userRoles2.id)));
      res.json({
        success: true,
        data: roleUsage
      });
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration des statistiques d'utilisation des r\xF4les:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la r\xE9cup\xE9ration des statistiques d'utilisation des r\xF4les"
      });
    }
  }
  /**
   * Récupère l'activité récente des utilisateurs
   */
  async getUserActivity(req, res) {
    try {
      const { limit = "10" } = req.query;
      const limitNumber = parseInt(limit, 10) || 10;
      const db3 = await getDb2();
      const recentActivity = await db3.select({
        id: users2.id,
        email: users2.email,
        nom: users2.nom,
        prenom: users2.prenom,
        derniereConnexion: users2.derniereConnexion,
        estConnecte: users2.estConnecte,
        roleName: roles4.nom
      }).from(users2).leftJoin(userRoles2, and5(
        eq5(users2.id, userRoles2.userId),
        sql17`${userRoles2.dateFin} IS NULL`
      )).leftJoin(roles4, eq5(userRoles2.roleId, roles4.id)).orderBy(desc(users2.derniereConnexion)).limit(limitNumber);
      const activityByUser = recentActivity.reduce((acc, activity) => {
        if (!acc[activity.id]) {
          acc[activity.id] = {
            id: activity.id,
            email: activity.email,
            nom: activity.nom,
            prenom: activity.prenom,
            derniereConnexion: activity.derniereConnexion,
            estConnecte: activity.estConnecte,
            roles: []
          };
        }
        if (activity.roleName) {
          acc[activity.id].roles.push(activity.roleName);
        }
        return acc;
      }, {});
      res.json({
        success: true,
        data: Object.values(activityByUser)
      });
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration de l'activit\xE9 des utilisateurs:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la r\xE9cup\xE9ration de l'activit\xE9 des utilisateurs"
      });
    }
  }
  /**
   * Récupère les statistiques d'audit (à implémenter avec un système d'audit)
   */
  async getAuditStats(req, res) {
    try {
      res.json({
        success: true,
        data: {
          message: "Fonctionnalit\xE9 d'audit \xE0 impl\xE9menter"
        }
      });
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration des statistiques d'audit:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la r\xE9cup\xE9ration des statistiques d'audit"
      });
    }
  }
};
var dashboardController = new DashboardController();

// server/controllers/manager.controller.ts
import { z as z5 } from "zod";
import { and as and6, eq as eq6, sql as sql18, inArray as inArray2 } from "drizzle-orm";
var toggleFeatureSchema = z5.object({
  featureId: z5.string().uuid("ID de fonctionnalit\xE9 invalide"),
  active: z5.boolean()
});
var assignFeatureToRoleSchema = z5.object({
  roleId: z5.string().uuid("ID de r\xF4le invalide"),
  featureId: z5.string().uuid("ID de fonctionnalit\xE9 invalide"),
  peutVoir: z5.boolean().default(false),
  peutModifier: z5.boolean().default(false),
  peutSupprimer: z5.boolean().default(false),
  commentaire: z5.string().optional()
});
var updateRolePermissionsSchema = z5.object({
  permissions: z5.array(
    z5.object({
      featureId: z5.string().uuid("ID de fonctionnalit\xE9 invalide"),
      peutVoir: z5.boolean(),
      peutModifier: z5.boolean(),
      peutSupprimer: z5.boolean()
    })
  )
});
var ManagerController = class {
  /**
   * Active ou désactive une fonctionnalité
   */
  async toggleFeature(req, res) {
    try {
      const validation = toggleFeatureSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Donn\xE9es invalides",
          errors: validation.error.errors
        });
      }
      const { featureId, active } = validation.data;
      const [feature] = await db2.select().from(features4).where(eq6(features4.id, featureId)).limit(1);
      if (!feature) {
        return res.status(404).json({
          success: false,
          message: "Fonctionnalit\xE9 non trouv\xE9e"
        });
      }
      await db2.update(features4).set({
        actif: active
      }).where(eq6(features4.id, featureId));
      const [updatedFeature] = await db2.select().from(features4).where(eq6(features4.id, featureId)).limit(1);
      res.json({
        success: true,
        data: updatedFeature
      });
    } catch (error) {
      console.error("Erreur lors de la modification du statut de la fonctionnalit\xE9:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la modification du statut de la fonctionnalit\xE9"
      });
    }
  }
  /**
   * Attribue une fonctionnalité à un rôle avec des permissions spécifiques
   */
  async assignFeatureToRole(req, res) {
    try {
      const validation = assignFeatureToRoleSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Donn\xE9es invalides",
          errors: validation.error.errors
        });
      }
      const { roleId, featureId, ...permissions2 } = validation.data;
      const [role] = await db2.select().from(roles5).where(eq6(roles5.id, roleId)).limit(1);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: "R\xF4le non trouv\xE9"
        });
      }
      const [feature] = await db2.select().from(features4).where(eq6(features4.id, featureId)).limit(1);
      if (!feature) {
        return res.status(404).json({
          success: false,
          message: "Fonctionnalit\xE9 non trouv\xE9e"
        });
      }
      const [existingPermission] = await db2.select().from(roleFeatures4).where(
        and6(
          eq6(roleFeatures4.roleId, roleId),
          eq6(roleFeatures4.featureId, featureId),
          sql18`${roleFeatures4.dateFin} IS NULL`
        )
      ).limit(1);
      if (existingPermission) {
        await db2.update(roleFeatures4).set(permissions2).where(eq6(roleFeatures4.id, existingPermission.id));
        const [updatedPermission] = await db2.select().from(roleFeatures4).where(eq6(roleFeatures4.id, existingPermission.id)).limit(1);
        return res.json({
          success: true,
          data: updatedPermission,
          message: "Permission mise \xE0 jour avec succ\xE8s"
        });
      } else {
        const newPermissionId = crypto.randomUUID();
        await db2.insert(roleFeatures4).values({
          id: newPermissionId,
          roleId,
          featureId,
          ...permissions2,
          dateAttribution: /* @__PURE__ */ new Date(),
          attribuePar: req.user?.id || "system"
        });
        const [newPermission] = await db2.select().from(roleFeatures4).where(eq6(roleFeatures4.id, newPermissionId)).limit(1);
        return res.status(201).json({
          success: true,
          data: newPermission,
          message: "Permission attribu\xE9e avec succ\xE8s"
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'attribution de la permission:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'attribution de la permission"
      });
    }
  }
  /**
   * Met à jour les permissions d'un rôle pour plusieurs fonctionnalités
   */
  async updateRolePermissions(req, res) {
    try {
      const { roleId } = req.params;
      const validation = updateRolePermissionsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Donn\xE9es invalides",
          errors: validation.error.errors
        });
      }
      const { permissions: permissions2 } = validation.data;
      const [role] = await db2.select().from(roles5).where(eq6(roles5.id, roleId)).limit(1);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: "R\xF4le non trouv\xE9"
        });
      }
      const featureIds = permissions2.map((p) => p.featureId);
      const existingFeatures = await db2.select({ id: features4.id }).from(features4).where(inArray2(features4.id, featureIds));
      if (existingFeatures.length !== featureIds.length) {
        return res.status(400).json({
          success: false,
          message: "Une ou plusieurs fonctionnalit\xE9s n'existent pas"
        });
      }
      await db2.transaction(async (tx) => {
        await tx.delete(roleFeatures4).where(eq6(roleFeatures4.roleId, roleId));
        if (permissions2.length > 0) {
          await tx.insert(roleFeatures4).values(
            permissions2.map((perm) => ({
              id: crypto.randomUUID(),
              roleId,
              featureId: perm.featureId,
              peutVoir: perm.peutVoir,
              peutModifier: perm.peutModifier,
              peutSupprimer: perm.peutSupprimer,
              dateAttribution: /* @__PURE__ */ new Date(),
              attribuePar: req.user?.id || "system"
            }))
          );
        }
        res.json({
          success: true,
          message: "Permissions mises \xE0 jour avec succ\xE8s"
        });
      });
    } catch (error) {
      console.error("Erreur lors de la mise \xE0 jour des permissions:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise \xE0 jour des permissions"
      });
    }
  }
  /**
   * Récupère toutes les fonctionnalités avec leur statut d'activation
   */
  async getAllFeatures(req, res) {
    try {
      const allFeatures = await db2.select().from(features4).orderBy(features4.nom);
      res.json({
        success: true,
        data: allFeatures
      });
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration des fonctionnalit\xE9s:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la r\xE9cup\xE9ration des fonctionnalit\xE9s"
      });
    }
  }
  /**
   * Récupère les permissions d'un rôle
   */
  async getRolePermissions(req, res) {
    try {
      const { roleId } = req.params;
      const db3 = await getDb();
      const [role] = await db3.select().from(roles5).where(eq6(roles5.id, roleId)).limit(1);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: "R\xF4le non trouv\xE9"
        });
      }
      const allFeatures = await db3.select({
        id: features4.id,
        code: features4.code,
        nom: features4.nom,
        description: features4.description,
        actif: features4.actif,
        permissionId: roleFeatures4.id,
        peutVoir: roleFeatures4.peutVoir,
        peutModifier: roleFeatures4.peutModifier,
        peutSupprimer: roleFeatures4.peutSupprimer
      }).from(features4).leftJoin(
        roleFeatures4,
        and6(
          eq6(features4.id, roleFeatures4.featureId),
          eq6(roleFeatures4.roleId, roleId),
          sql18`${roleFeatures4.dateFin} IS NULL`
        )
      ).orderBy(features4.nom);
      const formattedFeatures = allFeatures.map((feature) => ({
        id: feature.id,
        code: feature.code,
        nom: feature.nom,
        description: feature.description,
        actif: feature.actif,
        permissions: feature.permissionId ? {
          peutVoir: feature.peutVoir,
          peutModifier: feature.peutModifier,
          peutSupprimer: feature.peutSupprimer
        } : null
      }));
      res.json({
        success: true,
        data: {
          role,
          features: formattedFeatures
        }
      });
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration des permissions du r\xF4le:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la r\xE9cup\xE9ration des permissions du r\xF4le"
      });
    }
  }
  /**
   * Récupère les utilisateurs ayant un rôle spécifique
   */
  async getUsersByRole(req, res) {
    try {
      const { roleId } = req.params;
      const [role] = await db2.select().from(roles5).where(eq6(roles5.id, roleId)).limit(1);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: "R\xF4le non trouv\xE9"
        });
      }
      const usersWithRole = [];
      res.json({
        success: true,
        data: {
          role,
          users: usersWithRole
        }
      });
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration des utilisateurs par r\xF4le:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la r\xE9cup\xE9ration des utilisateurs par r\xF4le"
      });
    }
  }
};
var managerController = new ManagerController();

// server/controllers/audit.controller.ts
import { z as z6 } from "zod";
import { and as and7, eq as eq7, sql as sql20, gte as gte3, lte as lte2, desc as desc2 } from "drizzle-orm";

// shared/dist/schema/audit.schema.js
import { mysqlTable as mysqlTable15, varchar as varchar15, text as text13, datetime as datetime4, json as json2, mysqlEnum as mysqlEnum2 } from "drizzle-orm/mysql-core";
import { sql as sql19 } from "drizzle-orm";
var AUDIT_ACTIONS2 = [
  "create",
  "read",
  "update",
  "delete",
  "login",
  "logout",
  "password_change",
  "permission_grant",
  "permission_revoke",
  "role_assign",
  "role_revoke",
  "feature_toggle",
  "settings_update",
  "import_data",
  "export_data"
];
var AUDIT_ENTITY_TYPES2 = [
  "user",
  "role",
  "feature",
  "permission",
  "truck",
  "filiale",
  "settings"
];
var auditLogs2 = mysqlTable15("audit_logs", {
  id: varchar15("id", { length: 255 }).primaryKey().default(sql19`(UUID())`),
  userId: varchar15("user_id", { length: 255 }).references(() => users.id, { onDelete: "set null" }),
  action: mysqlEnum2("action", [...AUDIT_ACTIONS2]).notNull(),
  entityType: mysqlEnum2("entity_type", [...AUDIT_ENTITY_TYPES2]).notNull(),
  entityId: text13("entity_id"),
  entityName: text13("entity_name"),
  oldValues: json2("old_values"),
  newValues: json2("new_values"),
  ipAddress: text13("ip_address"),
  userAgent: text13("user_agent"),
  metadata: json2("metadata"),
  createdAt: datetime4("created_at").default(sql19`CURRENT_TIMESTAMP`).notNull()
});

// server/controllers/audit.controller.ts
var getAuditLogsSchema = z6.object({
  startDate: z6.string().optional(),
  endDate: z6.string().optional(),
  userId: z6.string().uuid("ID utilisateur invalide").optional(),
  action: z6.string().optional(),
  entityType: z6.string().optional(),
  entityId: z6.string().optional(),
  limit: z6.string().regex(/^\d+$/).transform(Number).default("50"),
  offset: z6.string().regex(/^\d+$/).transform(Number).default("0")
});
var AuditController = class {
  /**
   * Enregistre une entrée dans le journal d'audit
   */
  async logAuditEvent(userId, data, req) {
    try {
      const db3 = await getDb2();
      const ipAddress = req?.ip || req?.connection?.remoteAddress || "unknown";
      const userAgent = req?.headers["user-agent"] || "unknown";
      await db3.insert(auditLogs2).values({
        id: crypto.randomUUID(),
        userId: userId || null,
        // Permet la valeur null pour les actions système
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId || null,
        entityName: data.entityName || null,
        oldValues: data.oldValues ? data.oldValues : null,
        newValues: data.newValues ? data.newValues : null,
        ipAddress: ipAddress !== "unknown" ? ipAddress : null,
        userAgent: userAgent !== "unknown" ? userAgent : null,
        metadata: data.metadata || null,
        createdAt: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'audit:", error);
    }
  }
  /**
   * Récupère les journaux d'audit avec filtrage
   */
  async getAuditLogs(req, res) {
    try {
      const db3 = await getDb2();
      const validation = getAuditLogsSchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Param\xE8tres de requ\xEAte invalides",
          errors: validation.error.errors
        });
      }
      const { startDate, endDate, userId, action, entityType, entityId, limit, offset } = validation.data;
      let query = db3.select({
        id: auditLogs2.id,
        action: auditLogs2.action,
        entityType: auditLogs2.entityType,
        entityId: auditLogs2.entityId,
        entityName: auditLogs2.entityName,
        oldValues: auditLogs2.oldValues,
        newValues: auditLogs2.newValues,
        ipAddress: auditLogs2.ipAddress,
        userAgent: auditLogs2.userAgent,
        metadata: auditLogs2.metadata,
        createdAt: auditLogs2.createdAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName
        }
      }).from(auditLogs2).leftJoin(users, eq7(auditLogs2.userId, users.id)).$dynamic();
      const conditions = [];
      if (startDate) {
        conditions.push(gte3(auditLogs2.createdAt, new Date(startDate)));
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        conditions.push(lte2(auditLogs2.createdAt, end));
      }
      if (userId) {
        conditions.push(eq7(auditLogs2.userId, userId));
      }
      if (action && AUDIT_ACTIONS2.includes(action)) {
        query = query.where(eq7(auditLogs2.action, action));
      }
      if (entityType && AUDIT_ENTITY_TYPES2.includes(entityType)) {
        query = query.where(eq7(auditLogs2.entityType, entityType));
      }
      if (entityId) {
        conditions.push(eq7(auditLogs2.entityId, entityId));
      }
      if (conditions.length > 0) {
        query = query.where(and7(...conditions));
      }
      const totalCount = await db3.select({ count: sql20`count(*)` }).from(auditLogs2).where(conditions.length > 0 ? and7(...conditions) : void 0).then((rows) => Number(rows[0]?.count) || 0);
      const logs = await query.where(conditions.length > 0 ? and7(...conditions) : void 0).orderBy(desc2(auditLogs2.createdAt)).limit(limit).offset(offset);
      const formattedLogs = logs.map((log2) => ({
        id: log2.id,
        action: log2.action,
        entityType: log2.entityType,
        entityId: log2.entityId,
        entityName: log2.entityName,
        oldValues: log2.oldValues,
        newValues: log2.newValues,
        ipAddress: log2.ipAddress,
        userAgent: log2.userAgent,
        metadata: log2.metadata,
        createdAt: log2.createdAt,
        user: log2.user ? {
          id: log2.user.id,
          email: log2.user.email,
          firstName: log2.user.firstName,
          lastName: log2.user.lastName
        } : null
      }));
      return res.status(200).json({
        success: true,
        data: {
          logs: formattedLogs,
          pagination: {
            total: totalCount,
            limit,
            offset,
            hasMore: offset + limit < totalCount
          }
        }
      });
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration des journaux d'audit:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la r\xE9cup\xE9ration des journaux d'audit"
      });
    }
  }
  /**
   * Récupère les statistiques d'audit pour le tableau de bord
   */
  async getAuditStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
      const start = startDate ? new Date(startDate) : /* @__PURE__ */ new Date();
      start.setDate(start.getDate() - 30);
      const actionsByType = await db.select({
        action: auditLogs2.action,
        count: sql20`count(*)`
      }).from(auditLogs2).where(
        and7(
          gte3(auditLogs2.createdAt, start),
          lte2(auditLogs2.createdAt, end)
        )
      ).groupBy(auditLogs2.action);
      const actionsByUser = await db.select({
        userId: auditLogs2.userId,
        userEmail: users.email,
        userName: sql20`CONCAT(${users.prenom}, ' ', ${users.nom})`,
        count: sql20`count(*)`
      }).from(auditLogs2).leftJoin(users, eq7(auditLogs2.userId, users.id)).where(
        and7(
          gte3(auditLogs2.createdAt, start),
          lte2(auditLogs2.createdAt, end)
        )
      ).groupBy(auditLogs2.userId, users.email, users.prenom, users.nom).orderBy(desc2(sql20`count(*)`)).limit(10);
      const actionsByEntity = await db.select({
        entityType: auditLogs2.entityType,
        count: sql20`count(*)`
      }).from(auditLogs2).where(
        and7(
          gte3(auditLogs2.createdAt, start),
          lte2(auditLogs2.createdAt, end),
          sql20`${auditLogs2.entityType} IS NOT NULL`
        )
      ).groupBy(auditLogs2.entityType).orderBy(desc2(sql20`count(*)`));
      const activityByDay = await db.select({
        date: sql20`DATE(${auditLogs2.createdAt})`,
        count: sql20`count(*)`
      }).from(auditLogs2).where(
        and7(
          gte3(auditLogs2.createdAt, start),
          lte2(auditLogs2.createdAt, end)
        )
      ).groupBy(sql20`DATE(${auditLogs2.createdAt})`).orderBy(sql20`DATE(${auditLogs2.createdAt})`);
      res.json({
        success: true,
        data: {
          period: { start, end },
          actionsByType,
          actionsByUser,
          actionsByEntity,
          activityByDay
        }
      });
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration des statistiques d'audit:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la r\xE9cup\xE9ration des statistiques d'audit"
      });
    }
  }
};
var auditController = new AuditController();

// server/middleware/auth.middleware.ts
var isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Acc\xE8s non autoris\xE9. Veuillez vous connecter."
    });
  }
  next();
};
var isAdmin = [
  isAuthenticated,
  (req, res, next) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        message: "Acc\xE8s refus\xE9. Droits administrateur requis."
      });
    }
    next();
  }
];
var isManager = [
  isAuthenticated,
  (req, res, next) => {
    if (!req.user?.isAdmin && !req.user?.isManager) {
      return res.status(403).json({
        message: "Acc\xE8s refus\xE9. Droits de gestion requis."
      });
    }
    next();
  }
];
var loadUserPermissions = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }
    if (req.user.isAdmin) {
      req.user.permissions = { "*": true };
      return next();
    }
    const permissions2 = await featureService.getUserPermissions(req.user.roleId);
    req.user.permissions = permissions2;
    next();
  } catch (error) {
    console.error("Erreur lors du chargement des permissions:", error);
    next();
  }
};

// server/routes.ts
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var uploadDir = path2.join(process.cwd(), "uploads", "avatars");
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}
var fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path2.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});
var upload = multer({
  storage: fileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Type de fichier non autoris\xE9. Seuls les fichiers JPG, PNG et GIF sont accept\xE9s."));
    }
  }
});
var handleMulterError = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "La taille du fichier d\xE9passe la limite autoris\xE9e (5MB)" });
    }
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};
function mapStatus(value) {
  const v = value.toLowerCase().trim();
  if (v.includes("oui") || v.includes("yes") || v.includes("ok") || v === "1") return "oui";
  if (v.includes("non") || v.includes("no") || v.includes("ko") || v === "0") return "non";
  return "na";
}
function mapTruckStatus(value) {
  const v = value.toLowerCase().trim();
  if (v.includes("fonctionnel") || v.includes("ok")) return "fonctionnel";
  if (v.includes("non") || v.includes("ko")) return "non_fonctionnel";
  return "test_requis";
}
function mapPresence(value) {
  const v = value.toLowerCase().trim();
  if (v.includes("oui") || v.includes("yes") || v.includes("pr\xE9sent")) return "oui";
  return "non";
}
function mapCompatibility(value) {
  const v = value.toLowerCase().trim();
  if (v.includes("compatible") || v.includes("ok")) return "compatible";
  if (v.includes("incompatible") || v.includes("ko")) return "incompatible";
  return "test_requis";
}
function mapAppStatus(value) {
  const v = value.toLowerCase().trim();
  if (v.includes("install\xE9") || v.includes("ok")) return "installe";
  if (v.includes("erreur")) return "erreur";
  return "non_installe";
}
function mapMaterial(value) {
  const v = value.toLowerCase().trim();
  if (v.includes("oui") || v.includes("pr\xE9sent")) return "oui";
  if (v.includes("non") && !v.includes("besoin")) return "non";
  return "pas_besoin";
}
function mapMaterialStatus(value) {
  const v = value.toLowerCase().trim();
  if (v.includes("complet") || v.includes("ok")) return "complet";
  if (v.includes("manquant")) return "manquant";
  return "partiel";
}
function mapTestStatus(value) {
  const v = value.toLowerCase().trim();
  if (v.includes("oui") || v.includes("ok") || v.includes("valid\xE9")) return "oui";
  if (v.includes("cours") || v.includes("progress")) return "en_cours";
  return "non";
}
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  app2.use("/api", isAuthenticated);
  app2.use("/api", loadUserPermissions);
  app2.post("/api/auth/register", userController.createUser);
  app2.get("/api/users/me", userController.getMyProfile);
  app2.put("/api/users/me/password", userController.updateMyPassword);
  app2.get("/api/admin/users", isAdmin, userController.getAllUsers);
  app2.get("/api/admin/users/:id", isAdmin, userController.getUserById);
  app2.put("/api/admin/users/:id", isAdmin, userController.updateUser);
  app2.delete("/api/admin/users/:id", isAdmin, userController.deactivateUser);
  app2.get("/api/admin/roles", isAdmin, roleController.getAllRoles);
  app2.post("/api/admin/roles", isAdmin, roleController.createRole);
  app2.get("/api/admin/roles/:id", isAdmin, roleController.getRoleById);
  app2.put("/api/admin/roles/:id", isAdmin, roleController.updateRole);
  app2.delete("/api/admin/roles/:id", isAdmin, roleController.deactivateRole);
  app2.get("/api/dashboard/stats", isAdmin, dashboardController.getDashboardStats);
  app2.get("/api/dashboard/stats/features", isAdmin, dashboardController.getFeatureUsageStats);
  app2.get("/api/dashboard/stats/roles", isAdmin, dashboardController.getRoleUsageStats);
  app2.get("/api/dashboard/activity/users", isAdmin, dashboardController.getUserActivity);
  app2.get("/api/manager/features", isManager, managerController.getAllFeatures);
  app2.post("/api/manager/features/toggle", isManager, managerController.toggleFeature);
  app2.post("/api/manager/permissions/assign", isManager, managerController.assignFeatureToRole);
  app2.put("/api/manager/roles/:roleId/permissions", isManager, managerController.updateRolePermissions);
  app2.get("/api/manager/roles/:roleId/permissions", isManager, managerController.getRolePermissions);
  app2.get("/api/manager/roles/:roleId/users", isManager, managerController.getUsersByRole);
  app2.get("/api/audit/logs", isAdmin, auditController.getAuditLogs);
  app2.get("/api/audit/stats", isAdmin, auditController.getAuditStats);
  app2.post("/api/users/upload-avatar", upload.single("avatar"), handleMulterError, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier t\xE9l\xE9charg\xE9" });
      }
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      res.status(200).json({
        success: true,
        avatarUrl,
        message: "Photo de profil mise \xE0 jour avec succ\xE8s."
      });
    } catch (error) {
      console.error("Erreur lors du t\xE9l\xE9chargement de l'avatar:", error);
      res.status(500).json({
        success: false,
        error: "Une erreur est survenue lors du t\xE9l\xE9chargement de la photo de profil."
      });
    }
  });
  app2.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      res.status(200).json({
        success: true,
        message: "Profil mis \xE0 jour avec succ\xE8s",
        user: { id, ...updateData }
      });
    } catch (error) {
      console.error("Erreur lors de la mise \xE0 jour du profil:", error);
      res.status(500).json({
        success: false,
        error: "Une erreur est survenue lors de la mise \xE0 jour du profil."
      });
    }
  });
  app2.get("/api/trucks", async (req, res) => {
    try {
      const { filialeId } = req.query;
      const trucks5 = await storage.getAllTrucks(filialeId);
      const filiales5 = await storage.getAllFiliales();
      const filialeMap = new Map(filiales5.map((f) => [f.id, f.nom]));
      const formattedTrucks = trucks5.map((truck) => {
        let status = "Inactif";
        if (truck.statutConduite === "fonctionnel" && truck.testsOK === "oui") {
          status = "Actif";
        } else if (truck.statutConduite === "non_fonctionnel" || truck.testsOK === "non") {
          status = "En maintenance";
        }
        return {
          id: truck.id,
          numero: truck.immatriculation,
          // Utiliser immatriculation
          filiale: filialeMap.get(truck.filialeId) || truck.filialeId,
          // Nom de la filiale si disponible, sinon ID
          marque: truck.modele ? truck.modele.split(" ")[0] : "Inconnue",
          // Extraire la marque du modèle
          modele: truck.modele || "Mod\xE8le inconnu",
          status
        };
      });
      res.json(formattedTrucks);
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration des camions :", error);
      res.status(500).json({ error: "Erreur serveur lors de la r\xE9cup\xE9ration des camions" });
    }
  });
  app2.get("/api/filiales", async (_req, res) => {
    try {
      const filiales5 = await storage.getAllFiliales();
      res.json(filiales5);
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration des filiales :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/filiales/:id", async (req, res) => {
    try {
      const filiale = await storage.getFiliale(req.params.id);
      if (!filiale) {
        return res.status(404).json({ message: "Filiale non trouv\xE9e" });
      }
      res.json(filiale);
    } catch (error) {
      res.status(500).json({ message: "\xC9chec de r\xE9cup\xE9ration de la filiale" });
    }
  });
  app2.put("/api/filiales/:id", async (req, res) => {
    try {
      const updatedFiliale = await storage.updateFiliale(req.params.id, req.body);
      if (!updatedFiliale) {
        return res.status(404).json({ message: "Filiale non trouv\xE9e" });
      }
      res.json(updatedFiliale);
    } catch (error) {
      console.error("Erreur lors de la mise \xE0 jour de la filiale :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/filiales", async (req, res) => {
    try {
      const validatedData = insertFilialeSchema2.parse(req.body);
      const newFiliale = await storage.createFiliale(validatedData);
      res.status(201).json(newFiliale);
    } catch (error) {
      console.error("Erreur lors de la cr\xE9ation de la filiale :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.delete("/api/filiales/:id", async (req, res) => {
    try {
      const success = await storage.deleteFiliale(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Filiale non trouv\xE9e" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Erreur lors de la suppression de la filiale :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/trucks", async (_req, res) => {
    try {
      const trucks5 = await storage.getAllTrucks();
      res.json(trucks5);
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration des camions :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.get("/api/trucks/:id", async (req, res) => {
    try {
      const truck = await storage.getTruck(req.params.id);
      if (!truck) {
        return res.status(404).json({ message: "Camion non trouv\xE9" });
      }
      res.json(truck);
    } catch (error) {
      console.error("Erreur lors de la r\xE9cup\xE9ration du camion :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.post("/api/trucks", async (req, res) => {
    console.log("\u{1F535} POST /api/trucks - Donn\xE9es re\xE7ues:", JSON.stringify(req.body, null, 2));
    try {
      const validatedData = insertTruckSchema2.parse(req.body);
      console.log("\u2705 Donn\xE9es valid\xE9es avec succ\xE8s");
      const truck = await storage.createTruck(validatedData);
      console.log("\u2705 Camion cr\xE9\xE9 avec succ\xE8s:", truck.id);
      res.status(201).json({
        success: true,
        message: "Camion cr\xE9\xE9 avec succ\xE8s",
        data: truck
      });
    } catch (error) {
      console.error("\u274C Erreur lors de la cr\xE9ation du camion:", error);
      if (error instanceof z7.ZodError) {
        const errorDetails = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message
        }));
        console.error("\u274C Erreur de validation:", errorDetails);
        return res.status(400).json({
          success: false,
          message: "Donn\xE9es invalides",
          errors: errorDetails
        });
      }
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la cr\xE9ation du camion",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });
  app2.patch("/api/trucks/:id", async (req, res) => {
    try {
      const partialSchema = insertTruckSchema2.partial();
      const validatedData = partialSchema.parse(req.body);
      const truck = await storage.updateTruck(req.params.id, validatedData);
      if (!truck) {
        return res.status(404).json({ message: "Camion non trouv\xE9" });
      }
      res.json(truck);
    } catch (error) {
      if (error instanceof z7.ZodError) {
        return res.status(400).json({ message: "Donn\xE9es invalides", errors: error.errors });
      }
      console.error("Erreur lors de la mise \xE0 jour du camion :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.delete("/api/trucks/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTruck(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Camion non trouv\xE9" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "\xC9chec de suppression du camion" });
    }
  });
  app2.get("/api/trucks/search/:query", async (req, res) => {
    try {
      const filialeId = req.query.filialeId;
      const trucks5 = await storage.searchTrucks(req.params.query, filialeId);
      res.json(trucks5);
    } catch (error) {
      res.status(500).json({ message: "\xC9chec de recherche des camions" });
    }
  });
  app2.post("/api/trucks/import", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier t\xE9l\xE9charg\xE9" });
      }
      const filialeId = req.body.filialeId;
      if (!filialeId) {
        return res.status(400).json({ message: "ID de filiale requis" });
      }
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      let imported = 0;
      let errors = 0;
      for (const row of jsonData) {
        try {
          const rowData = row;
          const findValue = (possibleColumns) => {
            for (const col of possibleColumns) {
              if (rowData[col] !== void 0 && rowData[col] !== null && String(rowData[col]).trim() !== "") {
                return String(rowData[col]).trim();
              }
            }
            return "";
          };
          const findValueWithDefault = (possibleColumns, defaultValue) => {
            const value = findValue(possibleColumns);
            return value || defaultValue;
          };
          const truckData = {
            filialeId,
            immatriculation: findValue([
              "Immatriculation",
              "immatriculation",
              "N\xB0 Camion",
              "Numero",
              "Num\xE9ro",
              "N\xB0Camion",
              "Numero Camion",
              "Num\xE9ro Camion",
              "ID",
              "Camion",
              "Plaque",
              "Registration",
              "Vehicle Number",
              "Truck Number"
            ]),
            modele: findValue([
              "Mod\xE8le",
              "Modele",
              "Mod\xE8le Camion",
              "Model",
              "Type",
              "Marque",
              "Brand",
              "Vehicle Model",
              "Truck Model",
              "Make"
            ]),
            numeroDA: findValue([
              "N\xB0 DA",
              "Numero DA",
              "Num\xE9ro DA",
              "DA",
              "N\xB0DA",
              "Numero_DA",
              "DA Number",
              "Document Authorization",
              "Authorization Number"
            ]),
            dateDA: findValue([
              "Date DA",
              "Date_DA",
              "DA Date",
              "Date Authorization",
              "Authorization Date",
              "Date du DA"
            ]),
            daValide: mapStatus(findValueWithDefault([
              "DA Valid\xE9",
              "DA Valide",
              "DA Valid\xE9e",
              "DA_Valide",
              "DA Valid",
              "Authorization Valid",
              "DA OK",
              "Validation DA",
              "DA Status"
            ], "na")),
            numeroCA: findValue([
              "N\xB0 CA",
              "Numero CA",
              "Num\xE9ro CA",
              "CA",
              "N\xB0CA",
              "Numero_CA",
              "CA Number",
              "Contract Number",
              "Commande"
            ]),
            dateCA: findValue([
              "Date CA",
              "Date_CA",
              "CA Date",
              "Contract Date",
              "Date Commande",
              "Date du CA"
            ]),
            dateReception: findValue([
              "Date R\xE9ception",
              "Date Reception",
              "Date_Reception",
              "Reception Date",
              "Delivery Date",
              "Date Livraison",
              "Date de R\xE9ception"
            ]),
            validationReception: mapStatus(findValueWithDefault([
              "Validation R\xE9ception",
              "Validation Reception",
              "Reception Valid",
              "Delivery Valid",
              "R\xE9ception OK",
              "Reception Status"
            ], "na")),
            installePar: findValueWithDefault([
              "Install\xE9 par",
              "Installe par",
              "Technicien",
              "Installed by",
              "Installer",
              "Tech",
              "Responsable Installation",
              "Intervenant"
            ], "technicien1"),
            dateInstallation: findValue([
              "Date Installation",
              "Date_Installation",
              "Installation Date",
              "Date Pose",
              "Date de Pose",
              "Install Date"
            ]),
            parametrageRealise: mapStatus(findValueWithDefault([
              "Param\xE9trage R\xE9alis\xE9",
              "Parametrage Realise",
              "Param\xE9trage",
              "Configuration",
              "Setup Done",
              "Config OK",
              "Param\xE8tres",
              "Settings"
            ], "non")),
            localisationFonctionnelle: findValue([
              "Localisation Fonctionnelle",
              "Localisation",
              "Location",
              "Site",
              "Depot",
              "Agence",
              "Base",
              "Functional Location"
            ]),
            statutConduite: mapTruckStatus(findValueWithDefault([
              "Statut Conduite",
              "Status Conduite",
              "Driving Status",
              "Conduite",
              "Drive Status",
              "Syst\xE8me Conduite",
              "Driving System"
            ], "test_requis")),
            telechargementMemoireMasse: mapTruckStatus(findValueWithDefault([
              "T\xE9l\xE9chargement M\xE9moire Masse",
              "Telechargement Memoire Masse",
              "M\xE9moire Masse",
              "Memory Download",
              "Data Download",
              "Tachograph Download",
              "Tacho"
            ], "test_requis")),
            numeroTruck4U: findValue([
              "N\xB0 Truck4U",
              "Numero Truck4U",
              "Truck4U",
              "T4U",
              "Truck4U ID",
              "Truck4U Number",
              "System ID"
            ]),
            presenceTablette: mapPresence(findValueWithDefault([
              "Pr\xE9sence Tablette",
              "Presence Tablette",
              "Tablette",
              "Tablet Present",
              "Tablet",
              "MDT",
              "Terminal",
              "Device"
            ], "non")),
            typeTablette: findValueWithDefault([
              "Type Tablette",
              "Type de Tablette",
              "Tablet Type",
              "Device Type",
              "Mod\xE8le Tablette",
              "Tablet Model",
              "Terminal Type"
            ], "samsung").toLowerCase(),
            imei: findValue([
              "IMEI",
              "IMEI Tablette",
              "IMEI Tablet",
              "Serial Number",
              "Device ID",
              "Terminal IMEI",
              "SIM ID"
            ]),
            fonctionnelle: mapStatus(findValueWithDefault([
              "Tablette Fonctionnelle",
              "Fonctionnelle",
              "Tablet Working",
              "Working",
              "Functional",
              "Tablet OK",
              "Device OK",
              "Terminal OK"
            ], "non")),
            compatibilite: mapCompatibility(findValueWithDefault([
              "Compatibilit\xE9",
              "Compatibilite",
              "Compatibility",
              "Compatible",
              "System Compatibility",
              "Compat"
            ], "test_requis")),
            deliverup: mapAppStatus(findValueWithDefault([
              "DeliverUp",
              "Deliver Up",
              "Application DeliverUp",
              "DeliverUp App",
              "App DeliverUp",
              "DeliverUp Status",
              "Application"
            ], "non_installe")),
            applicationsSpecifiques: findValue([
              "Applications Sp\xE9cifiques",
              "Applications Specifiques",
              "Apps Sp\xE9cifiques",
              "Specific Apps",
              "Other Apps",
              "Custom Apps",
              "Additional Apps"
            ]),
            raisonsNonInstalle: findValue([
              "Raisons Non Install\xE9",
              "Raisons Non Installe",
              "Raisons",
              "Reasons",
              "Install Issues",
              "Problems",
              "Blockers",
              "Issues"
            ]),
            cameraCabineTelematics: mapMaterial(findValueWithDefault([
              "Cam\xE9ra Cabine",
              "Camera Cabine",
              "Cam\xE9ra",
              "Camera",
              "Cab Camera",
              "Driver Camera",
              "Interior Camera",
              "Cam\xE9ra Conducteur"
            ], "pas_besoin")),
            dashcam: mapMaterial(findValueWithDefault([
              "Dashcam",
              "Dash Cam",
              "Dashboard Camera",
              "Front Camera",
              "Road Camera",
              "Cam\xE9ra Route",
              "Cam\xE9ra Avant"
            ], "pas_besoin")),
            numeroPDA: findValue([
              "N\xB0 PDA",
              "Numero PDA",
              "PDA",
              "PDA Number",
              "Handheld",
              "Scanner",
              "Mobile Device",
              "Portable"
            ]),
            materielRequis: mapMaterialStatus(findValueWithDefault([
              "Mat\xE9riel Requis",
              "Materiel Requis",
              "Mat\xE9riel",
              "Material Required",
              "Equipment",
              "Hardware",
              "Material Status",
              "Equipment Status"
            ], "complet")),
            testsOK: mapTestStatus(findValueWithDefault([
              "Tests OK",
              "Tests",
              "Test OK",
              "Testing",
              "Tests Status",
              "Validation",
              "V\xE9rification",
              "QC",
              "Quality Check"
            ], "non")),
            champAction: findValue([
              "Actions",
              "Champ Action",
              "Action",
              "Action Required",
              "Next Steps",
              "Todo",
              "\xC0 Faire",
              "Action Items",
              "Work Required"
            ]),
            observations: findValue([
              "Observations",
              "Observation",
              "Commentaires",
              "Comments",
              "Notes",
              "Remarks",
              "Description",
              "Details",
              "Additional Info",
              "Info"
            ])
          };
          if (!truckData.immatriculation && !truckData.modele) {
            continue;
          }
          if (!truckData.immatriculation) {
            truckData.immatriculation = `IMMAT_${Date.now().toString(36).toUpperCase().substr(4, 6)}`;
          }
          if (!truckData.modele) {
            truckData.modele = "Mod\xE8le non sp\xE9cifi\xE9";
          }
          const validatedData = insertTruckSchema2.parse(truckData);
          await storage.createTruck(validatedData);
          imported++;
        } catch (error) {
          console.error("Error importing row:", error);
          errors++;
        }
      }
      res.json({
        message: `Import termin\xE9: ${imported} camions import\xE9s, ${errors} erreurs`,
        imported,
        errors
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ message: "\xC9chec d'importation des camions" });
    }
  });
  app2.post("/api/trucks/import-with-mapping", upload.single("file"), async (req, res) => {
    console.log("\u{1F535} POST /api/trucks/import-with-mapping - D\xE9but du traitement");
    try {
      if (!req.file) {
        console.error("\u274C Aucun fichier t\xE9l\xE9charg\xE9");
        return res.status(400).json({
          success: false,
          message: "Aucun fichier t\xE9l\xE9charg\xE9"
        });
      }
      console.log(`\u{1F4C2} Fichier re\xE7u: ${req.file.originalname} (${req.file.size} octets)`);
      let fieldMapping;
      try {
        fieldMapping = JSON.parse(req.body.fieldMapping || "{}");
        console.log("\u{1F50D} Mappage des champs:", JSON.stringify(fieldMapping, null, 2));
      } catch (e) {
        console.error("\u274C Erreur de parsing du mappage des champs:", e);
        return res.status(400).json({
          success: false,
          message: "Format de mappage des champs invalide"
        });
      }
      if (!fieldMapping.numero) {
        console.error("\u274C Champ obligatoire non mapp\xE9: numero");
        return res.status(400).json({
          success: false,
          message: "Le mappage du champ 'numero' est obligatoire"
        });
      }
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      let processed = 0;
      let inserted = 0;
      let updated = 0;
      let failed = 0;
      const errors = [];
      for (let i = 0; i < jsonData.length; i++) {
        try {
          const rowData = jsonData[i];
          processed++;
          const getMappedValue = (fieldKey) => {
            const columnName = fieldMapping[fieldKey];
            if (!columnName || !rowData[columnName]) return "";
            return String(rowData[columnName]).trim();
          };
          const numero = getMappedValue("numero");
          if (!numero) {
            errors.push({ row: i + 1, error: "Num\xE9ro de camion manquant" });
            failed++;
            continue;
          }
          let filialeId = getMappedValue("filiale");
          if (!filialeId) {
            const allFiliales = await storage.getAllFiliales();
            const defaultFiliale = allFiliales.length > 0 ? allFiliales[0] : null;
            if (!defaultFiliale) {
              errors.push({ row: i + 1, error: "Aucune filiale trouv\xE9e ou mapp\xE9e" });
              failed++;
              continue;
            }
            filialeId = defaultFiliale.id;
          } else {
            const filiale = await storage.getFilialeByCode(filialeId);
            if (filiale) {
              filialeId = filiale.id;
            } else {
              const newFiliale = await storage.createFiliale({
                nom: filialeId,
                code: filialeId.toLowerCase().replace(/\s+/g, "_"),
                actif: true,
                adresse: "",
                telephone: "",
                email: ""
              });
              filialeId = newFiliale.id;
            }
          }
          const truckData = {
            filialeId,
            numero,
            modele: getMappedValue("modele") || "",
            imei: getMappedValue("imei") || "",
            numeroTruck4U: getMappedValue("numeroTruck4U") || "",
            statutConduite: mapTruckStatus(getMappedValue("statutConduite") || "test_requis"),
            equipement: mapStatus(getMappedValue("equipement") || "na"),
            compatibilite: mapCompatibility(getMappedValue("compatibilite") || "test_requis"),
            deliverup: mapAppStatus(getMappedValue("deliverup") || "non_installe"),
            testsOK: mapTestStatus(getMappedValue("testsOK") || "non"),
            commentaires: getMappedValue("commentaires") || "",
            // Champs avec valeurs par défaut
            numeroDA: "",
            dateDA: "",
            daValide: "na",
            numeroCA: "",
            dateCA: "",
            dateReception: "",
            validationReception: "na",
            installePar: "technicien1",
            dateInstallation: "",
            parametrageRealise: "non",
            localisationFonctionnelle: "",
            telechargementMemoireMasse: "test_requis",
            presenceTablette: "non",
            typeTablette: "standard",
            modeleTablette: "",
            numeroSerieTablette: "",
            versionLogicielTablette: "",
            compatibiliteTablette: "test_requis",
            installationDeliverupTablette: "non_installe",
            testsTablette: "non",
            presenceCamera: "non",
            typeCamera: "",
            modeleCamera: "",
            numeroSerieCamera: "",
            compatibiliteCamera: "test_requis",
            installationDeliverupCamera: "non_installe",
            testsCamera: "non",
            presenceMaterielComplementaire: "non",
            typeMaterielComplementaire: "",
            modeleMaterielComplementaire: "",
            numeroSerieMaterielComplementaire: "",
            compatibiliteMaterielComplementaire: "test_requis",
            installationDeliverupMaterielComplementaire: "non_installe",
            testsMaterielComplementaire: "non",
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          };
          const immatriculation = getMappedValue("immatriculation") || getMappedValue("numero");
          if (!immatriculation) {
            throw new Error("Immatriculation manquante");
          }
          const truckDataWithImmatriculation = {
            ...truckData,
            immatriculation
          };
          const existingTruck = await storage.getTruckByImmatriculation(immatriculation, truckData.filialeId);
          if (existingTruck) {
            await storage.updateTruck(existingTruck.id, truckDataWithImmatriculation);
            updated++;
          } else {
            await storage.createTruck(truckDataWithImmatriculation);
            inserted++;
          }
        } catch (error) {
          console.error(`Erreur ligne ${i + 1}:`, error);
          errors.push({
            row: i + 1,
            error: error instanceof Error ? error.message : "Erreur inconnue"
          });
          failed++;
        }
      }
      res.json({
        success: true,
        message: `Import termin\xE9: ${inserted} cr\xE9\xE9s, ${updated} mis \xE0 jour, ${failed} \xE9checs`,
        processed,
        inserted,
        updated,
        failed,
        errors: errors.slice(0, 10)
        // Limiter à 10 erreurs pour éviter une réponse trop lourde
      });
    } catch (error) {
      console.error("Erreur d'import Excel:", error);
      res.status(500).json({
        message: "Erreur lors de l'import Excel",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });
  app2.post("/api/trucks/import-google-sheet", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    console.log("\u{1F535} POST /api/trucks/import-google-sheet - D\xE9but du traitement");
    console.log("\u{1F4E1} Donn\xE9es re\xE7ues:", JSON.stringify(req.body, null, 2));
    try {
      const { spreadsheetUrl, sheetUrl, sheetName } = req.body;
      const effectiveSpreadsheetUrl = spreadsheetUrl || sheetUrl;
      if (!effectiveSpreadsheetUrl) {
        console.error("\u274C Aucune URL de feuille Google Sheets fournie");
        return res.status(400).json({
          success: false,
          message: "URL de la feuille Google Sheets requise (spreadsheetUrl ou sheetUrl)"
        });
      }
      console.log(`\u{1F310} URL de la feuille: ${effectiveSpreadsheetUrl}`);
      if (sheetName) {
        console.log(`\u{1F4CB} Nom de l'onglet sp\xE9cifi\xE9: ${sheetName}`);
      }
      let csvUrl = effectiveSpreadsheetUrl;
      if (effectiveSpreadsheetUrl.includes("docs.google.com/spreadsheets")) {
        const match = effectiveSpreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (match) {
          const spreadsheetId = match[1];
          const gid = sheetName || "0";
          csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
          console.log("Converted to CSV URL:", csvUrl);
        } else {
          console.log("Failed to extract spreadsheet ID from URL");
          return res.status(400).json({
            success: false,
            message: "URL Google Sheets invalide. V\xE9rifiez que l'URL est correcte."
          });
        }
      }
      console.log("Fetching CSV data from:", csvUrl);
      const response = await fetch(csvUrl);
      console.log("CSV fetch response status:", response.status);
      if (!response.ok) {
        console.log("Failed to fetch CSV data:", response.status, response.statusText);
        return res.status(400).json({
          success: false,
          message: `Erreur lors de la r\xE9cup\xE9ration des donn\xE9es Google Sheets (${response.status}). V\xE9rifiez que la feuille est publique et accessible.`
        });
      }
      const csvData = await response.text();
      const workbook = XLSX.read(csvData, { type: "string" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      if (jsonData.length === 0) {
        return res.status(400).json({ message: "Aucune donn\xE9e trouv\xE9e dans la feuille Google Sheets" });
      }
      let imported = 0;
      let errors = 0;
      for (const row of jsonData) {
        try {
          const rowData = row;
          const findValue = (possibleColumns) => {
            for (const col of possibleColumns) {
              if (rowData[col] !== void 0 && rowData[col] !== null && String(rowData[col]).trim() !== "") {
                return String(rowData[col]).trim();
              }
            }
            return "";
          };
          const immatriculation = findValue(["Immatriculation", "immatriculation", "Plaque", "plaque", "License", "license"]);
          if (!immatriculation) {
            console.log("Ligne ignor\xE9e - pas d'immatriculation:", rowData);
            continue;
          }
          const filialeNom = findValue(["Filiale", "filiale", "Soci\xE9t\xE9", "soci\xE9t\xE9", "Company", "company"]) || "D\xE9faut";
          let filiale = await storage.getFilialeByCode(filialeNom);
          if (!filiale) {
            filiale = await storage.createFiliale({
              nom: filialeNom,
              code: filialeNom.toUpperCase().replace(/\s+/g, "_"),
              actif: true
            });
          }
          const truckData = {
            immatriculation,
            filialeId: filiale.id,
            marque: findValue(["Marque", "marque", "Brand", "brand"]),
            modele: findValue(["Modele", "mod\xE8le", "Model", "model"]),
            // immatriculation déjà définie plus haut
            status: mapStatus(findValue(["Status", "status", "Statut", "statut", "\xC9tat", "\xE9tat"])),
            truckStatus: mapTruckStatus(findValue(["TruckStatus", "truckstatus", "StatutCamion", "statut_camion"])),
            presence: mapPresence(findValue(["Presence", "pr\xE9sence", "Pr\xE9sent", "pr\xE9sent"])),
            compatibility: mapCompatibility(findValue(["Compatibility", "compatibilit\xE9", "Compatible", "compatible"])),
            appStatus: mapAppStatus(findValue(["AppStatus", "appstatus", "StatutApp", "statut_app"])),
            material: mapMaterial(findValue(["Material", "mat\xE9riel", "Mat\xE9riel", "material"])),
            materialStatus: mapMaterialStatus(findValue(["MaterialStatus", "materialstatus", "StatutMat\xE9riel", "statut_mat\xE9riel"])),
            testStatus: mapTestStatus(findValue(["TestStatus", "teststatus", "StatutTest", "statut_test"])),
            notes: findValue(["Notes", "notes", "Commentaires", "commentaires", "Remarks", "remarks"]),
            updatedAt: /* @__PURE__ */ new Date()
          };
          const existingTruck = await storage.getTruckByImmatriculation(truckData.immatriculation, truckData.filialeId);
          if (existingTruck) {
            await storage.updateTruck(existingTruck.id, truckData);
          } else {
            await storage.createTruck(truckData);
          }
          imported++;
        } catch (error) {
          console.error("Erreur lors du traitement d'une ligne:", error);
          errors++;
        }
      }
      res.json({
        success: true,
        message: `Import Google Sheets r\xE9ussi: ${imported} camions trait\xE9s, ${errors} erreurs`,
        imported,
        errors
      });
    } catch (error) {
      console.error("Erreur d'import Google Sheets:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'import Google Sheets",
        error: error instanceof Error ? error.message : "Erreur inconnue",
        imported: 0,
        errors: 1
      });
    }
  });
  app2.get("/api/trucks/export", async (req, res) => {
    try {
      console.log("\u{1F504} Starting Excel export...");
      const trucks5 = await storage.getAllTrucks();
      console.log(`\u{1F4CA} Found ${trucks5.length} trucks to export`);
      const XLSX2 = __require("xlsx");
      const workbook = XLSX2.utils.book_new();
      const exportData = trucks5.map((truck) => ({
        "Num\xE9ro": truck.numero || "",
        "Filiale": truck.filialeId || "",
        "Marque": truck.marque || "",
        "Mod\xE8le": truck.modele || "",
        "Immatriculation": truck.immatriculation || truck.numero || "",
        "Statut": truck.status || "Actif",
        "Date de cr\xE9ation": truck.dateCreation ? new Date(truck.dateCreation).toLocaleDateString("fr-FR") : "",
        "Derni\xE8re modification": truck.dateModification ? new Date(truck.dateModification).toLocaleDateString("fr-FR") : ""
      }));
      const worksheet = XLSX2.utils.json_to_sheet(exportData);
      const columnWidths = [
        { wch: 15 },
        // Numéro
        { wch: 20 },
        // Filiale
        { wch: 15 },
        // Marque
        { wch: 20 },
        // Modèle
        { wch: 15 },
        // Immatriculation
        { wch: 12 },
        // Statut
        { wch: 15 },
        // Date de création
        { wch: 15 }
        // Dernière modification
      ];
      worksheet["!cols"] = columnWidths;
      XLSX2.utils.book_append_sheet(workbook, worksheet, "Camions");
      const buffer = XLSX2.write(workbook, { type: "buffer", bookType: "xlsx" });
      const filename = `camions_export_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`;
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Length", buffer.length);
      console.log(`\u2705 Export completed: ${trucks5.length} trucks exported to ${filename}`);
      res.send(buffer);
    } catch (error) {
      console.error("\u274C Export error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'export Excel",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });
  app2.post("/api/users/upload-avatar", upload.single("avatar"), handleMulterError, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier t\xE9l\xE9charg\xE9" });
      }
      const userId = req.body.userId;
      if (!userId) {
        return res.status(400).json({ error: "ID utilisateur manquant" });
      }
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      console.log(`Avatar uploaded for user ${userId}: ${avatarUrl}`);
      res.json({
        success: true,
        avatarUrl,
        message: "Avatar t\xE9l\xE9charg\xE9 avec succ\xE8s"
      });
    } catch (error) {
      console.error("Erreur lors du t\xE9l\xE9chargement de l'avatar:", error);
      res.status(500).json({
        success: false,
        error: "Erreur lors du t\xE9l\xE9chargement de l'avatar",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });
  return httpServer;
}

// server/index.ts
init_vite();

// server/services/audit.service.ts
var AuditService = class {
  /**
   * Enregistre un événement d'audit générique
   */
  async logEvent(userId, action, entityType, entityId, entityName, oldValues, newValues, metadata, req) {
    await auditController.logAuditEvent(userId || "system", {
      action,
      entityType,
      entityId,
      entityName,
      oldValues,
      newValues,
      metadata
    }, req);
  }
  // Méthodes pratiques pour les actions courantes
  async logLogin(userId, email, success, req) {
    await this.logEvent(
      userId,
      "login",
      "user",
      userId,
      email,
      void 0,
      { success },
      { ipAddress: req.ip, userAgent: req.headers["user-agent"] },
      req
    );
  }
  async logLogout(userId, email, req) {
    await this.logEvent(
      userId,
      "logout",
      "user",
      userId,
      email,
      void 0,
      void 0,
      { ipAddress: req.ip, userAgent: req.headers["user-agent"] },
      req
    );
  }
  async logUserCreation(adminId, newUser, req) {
    await this.logEvent(
      adminId,
      "create",
      "user",
      newUser.id,
      newUser.email,
      void 0,
      { email: newUser.email },
      void 0,
      req
    );
  }
  async logUserUpdate(adminId, userId, email, changes, req) {
    await this.logEvent(
      adminId,
      "update",
      "user",
      userId,
      email,
      void 0,
      changes,
      void 0,
      req
    );
  }
  async logRoleAssignment(adminId, userId, email, roleId, roleName, req) {
    await this.logEvent(
      adminId,
      "role_assign",
      "role",
      roleId,
      roleName,
      void 0,
      { userId, email },
      void 0,
      req
    );
  }
  async logFeatureToggle(adminId, featureId, featureName, enabled, req) {
    await this.logEvent(
      adminId,
      "feature_toggle",
      "feature",
      featureId,
      featureName,
      { enabled: !enabled },
      { enabled },
      void 0,
      req
    );
  }
  async logDataImport(userId, entityType, count2, source, req) {
    await this.logEvent(
      userId,
      "import_data",
      entityType,
      void 0,
      `${count2} ${entityType} imported`,
      void 0,
      { count: count2, source },
      void 0,
      req
    );
  }
  async logDataExport(userId, entityType, count2, format, req) {
    await this.logEvent(
      userId,
      "export_data",
      entityType,
      void 0,
      `${count2} ${entityType} exported`,
      void 0,
      { count: count2, format },
      void 0,
      req
    );
  }
  async logTruckOperation(userId, action, truckId, immatriculation, changes, req) {
    await this.logEvent(
      userId,
      action,
      "truck",
      truckId,
      immatriculation,
      action === "update" ? changes : void 0,
      action === "create" ? changes : void 0,
      void 0,
      req
    );
  }
  async logFilialeOperation(userId, action, filialeId, filialeName, changes, req) {
    await this.logEvent(
      userId,
      action,
      "filiale",
      filialeId,
      filialeName,
      action === "update" ? changes : void 0,
      action === "create" ? changes : void 0,
      void 0,
      req
    );
  }
};
var auditService = new AuditService();

// server/middleware/audit.middleware.ts
var AUDITABLE_ROUTES = {
  // Routes utilisateurs
  "POST /api/users": { action: "create", entityType: "user" },
  "PUT /api/users/:id": { action: "update", entityType: "user" },
  "DELETE /api/users/:id": { action: "delete", entityType: "user" },
  // Rôles et permissions
  "POST /api/roles": { action: "create", entityType: "role" },
  "PUT /api/roles/:id": { action: "update", entityType: "role" },
  "POST /api/manager/permissions/assign": { action: "permission_grant", entityType: "permission" },
  "PUT /api/manager/roles/:roleId/permissions": { action: "permission_grant", entityType: "role" },
  // Fonctionnalités
  "POST /api/manager/features/toggle": { action: "feature_toggle", entityType: "feature" },
  // Camions
  "POST /api/trucks": { action: "create", entityType: "truck" },
  "PUT /api/trucks/:id": { action: "update", entityType: "truck" },
  "DELETE /api/trucks/:id": { action: "delete", entityType: "truck" },
  "POST /api/trucks/import": { action: "import_data", entityType: "truck" },
  "POST /api/trucks/import-with-mapping": { action: "import_data", entityType: "truck" },
  "POST /api/trucks/import-google-sheet": { action: "import_data", entityType: "truck" },
  // Filiales
  "POST /api/filiales": { action: "create", entityType: "filiale" },
  "PUT /api/filiales/:id": { action: "update", entityType: "filiale" },
  "DELETE /api/filiales/:id": { action: "delete", entityType: "filiale" }
};
function auditMiddleware() {
  return async (req, res, next) => {
    const startTime = Date.now();
    const logResponse = async () => {
      try {
        if (!req.user?.id) {
          return;
        }
        const routeKey = `${req.method} ${req.path}`;
        let routeConfig = AUDITABLE_ROUTES[routeKey];
        if (!routeConfig) {
          const routeParts = req.path.split("/");
          const baseRoute = routeParts.slice(0, -1).join("/") + "/:id";
          const dynamicRoute = `${req.method} ${baseRoute}`;
          if (!AUDITABLE_ROUTES[dynamicRoute]) {
            return;
          }
          routeConfig = AUDITABLE_ROUTES[dynamicRoute];
        }
        const { action, entityType } = routeConfig;
        const { id: userId, email } = req.user;
        const entityId = req.params.id || req.body.id;
        const entityName = req.body.name || req.body.email || req.body.immatriculation || entityId;
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const success = statusCode >= 200 && statusCode < 400;
        await auditService.logEvent(
          userId,
          action,
          entityType,
          entityId,
          entityName,
          void 0,
          // oldValues (peut être ajouté si nécessaire)
          {
            statusCode,
            duration: `${duration}ms`,
            success,
            ...req.method !== "GET" && req.method !== "DELETE" ? { data: req.body } : {}
          },
          {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
          },
          req
        );
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'audit:", error);
      }
    };
    const originalEnd = res.end;
    res.end = function(chunk, encoding, callback) {
      logResponse().finally(() => {
        originalEnd.call(res, chunk, encoding, callback);
      });
    };
    next();
  };
}
function auditFailedLogin() {
  return async (req, res, next) => {
    const originalJson = res.json;
    res.json = function(body) {
      if (req.path === "/api/auth/login" && (!body.success || body.error === "Invalid credentials")) {
        const email = req.body.email;
        auditService.logEvent(
          null,
          // Aucun utilisateur connecté
          "login",
          "user",
          void 0,
          email,
          void 0,
          { success: false, reason: body.error || "Invalid credentials" },
          {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
          },
          req
        ).catch(console.error);
      }
      return originalJson.call(this, body);
    };
    next();
  };
}
function auditUnauthorizedAccess() {
  return async (req, res, next) => {
    const originalStatus = res.status;
    res.status = function(statusCode) {
      if (statusCode === 401 || statusCode === 403) {
        auditService.logEvent(
          req.user?.id || null,
          "login",
          "settings",
          void 0,
          "Unauthorized Access",
          void 0,
          {
            statusCode,
            path: req.path,
            method: req.method,
            authenticated: !!req.user?.id,
            requiredRole: req.user?.role || "none"
          },
          {
            ip: req.ip,
            userAgent: req.headers["user-agent"]
          },
          req
        ).catch(console.error);
      }
      return originalStatus.call(this, statusCode);
    };
    next();
  };
}

// server/index.ts
dotenv2.config();
var app = express2();
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5002", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(auditMiddleware());
app.use(auditFailedLogin());
app.use(auditUnauthorizedAccess());
app.use((req, res, next) => {
  console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  if (Object.keys(req.body).length > 0) {
    console.log("Body:", JSON.stringify(req.body, null, 2));
  }
  next();
});
var uploadsDir = path4.join(process.cwd(), "uploads");
app.use("/uploads", express2.static(uploadsDir, {
  setHeaders: (res) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  }
}));
app.use((req, res, next) => {
  console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  if (Object.keys(req.body).length > 0) {
    console.log("Body:", JSON.stringify(req.body, null, 2));
  }
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] Response:`, JSON.stringify(bodyJson, null, 2));
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5001", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
