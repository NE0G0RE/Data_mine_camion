// server/index.ts
import dotenv2 from "dotenv";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import multer from "multer";
import * as XLSX from "xlsx";

// server/db.ts
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// shared/schema.ts
import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, date, boolean, int } from "drizzle-orm/mysql-core";
import { z } from "zod";
var roles = mysqlTable("roles", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  nom: varchar("nom", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 500 }),
  niveau: int("niveau").notNull(),
  // 1=admin, 2=responsable, 3=lecteur
  type: varchar("type", { length: 50 }).notNull(),
  // "groupe" ou "filiale"
  actif: boolean("actif").default(true)
});
var utilisateurs = mysqlTable("utilisateurs", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  nom: varchar("nom", { length: 255 }).notNull(),
  prenom: varchar("prenom", { length: 255 }).notNull(),
  motDePasse: varchar("mot_de_passe", { length: 255 }).notNull(),
  actif: boolean("actif").default(true),
  dateCreation: date("date_creation").default(sql`(CURRENT_DATE)`)
});
var permissionsUtilisateur = mysqlTable("permissions_utilisateur", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  utilisateurId: varchar("utilisateur_id", { length: 255 }).notNull(),
  roleId: varchar("role_id", { length: 255 }).notNull(),
  filialeId: varchar("filiale_id", { length: 255 }),
  // null pour les rôles groupe
  dateAttribution: date("date_attribution").default(sql`(CURRENT_DATE)`),
  attribuePar: varchar("attribue_par", { length: 255 }).notNull(),
  // ID de l'admin qui a attribué le rôle
  actif: boolean("actif").default(true)
});
var filiales = mysqlTable("filiales", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  nom: varchar("nom", { length: 255 }).notNull().unique(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  adresse: varchar("adresse", { length: 500 }),
  telephone: varchar("telephone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  responsable: varchar("responsable", { length: 255 }),
  dateCreation: date("date_creation").default(sql`(CURRENT_DATE)`),
  actif: boolean("actif").default(true)
});
var trucks = mysqlTable("trucks", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  filialeId: varchar("filiale_id", { length: 255 }).notNull(),
  numero: varchar("numero", { length: 255 }).notNull(),
  modele: varchar("modele", { length: 255 }).notNull(),
  // Section État
  numeroDA: varchar("numero_da", { length: 255 }),
  dateDA: date("date_da"),
  daValide: varchar("da_valide", { length: 50 }),
  // "oui", "non", "na"
  numeroCA: varchar("numero_ca", { length: 255 }),
  dateCA: date("date_ca"),
  dateReception: date("date_reception"),
  validationReception: varchar("validation_reception", { length: 50 }),
  // "oui", "non", "na"
  // Section Truck4U
  installePar: varchar("installe_par", { length: 255 }),
  dateInstallation: date("date_installation"),
  parametrageRealise: varchar("parametrage_realise", { length: 50 }),
  // "oui", "non", "partiel"
  localisationFonctionnelle: varchar("localisation_fonctionnelle", { length: 255 }),
  statutConduite: varchar("statut_conduite", { length: 50 }),
  // "fonctionnel", "non_fonctionnel", "test_requis"
  telechargementMemoireMasse: varchar("telechargement_memoire_masse", { length: 255 }),
  numeroTruck4U: varchar("numero_truck4u", { length: 255 }),
  // Section Tablette
  presenceTablette: varchar("presence_tablette", { length: 50 }),
  // "oui", "non"
  typeTablette: varchar("type_tablette", { length: 255 }),
  imei: varchar("imei", { length: 255 }),
  fonctionnelle: varchar("fonctionnelle", { length: 50 }),
  // "oui", "non", "partiel"
  compatibilite: varchar("compatibilite", { length: 50 }),
  // "compatible", "incompatible", "test_requis"
  deliverup: varchar("deliverup", { length: 50 }),
  // "installe", "non_installe", "erreur"
  applicationsSpecifiques: text("applications_specifiques"),
  raisonsNonInstalle: text("raisons_non_installe"),
  // Section Matériel
  cameraCabineTelematics: varchar("camera_cabine_telematics", { length: 50 }),
  // "oui", "non", "pas_besoin"
  dashcam: varchar("dashcam", { length: 50 }),
  // "oui", "non", "pas_besoin"
  numeroPDA: varchar("numero_pda", { length: 255 }),
  materielRequis: varchar("materiel_requis", { length: 50 }),
  // "complet", "partiel", "manquant"
  testsOK: varchar("tests_ok", { length: 50 }),
  // "oui", "non", "en_cours"
  // Champs d'action
  champAction: text("champ_action"),
  observations: text("observations")
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
  filialeId: z.string().min(1, "La filiale est obligatoire"),
  numero: z.string().min(1, "Le num\xE9ro est obligatoire"),
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
dotenv.config();
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}
var db;
async function initDatabase() {
  if (!db) {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    db = drizzle(connection);
  }
  return db;
}
async function getDb() {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

// server/storage.ts
import { eq, like, or, and } from "drizzle-orm";
var MySQLStorage = class {
  // Méthodes pour les rôles
  async getRole(id) {
    const db2 = await getDb();
    const result = await db2.select().from(roles).where(eq(roles.id, id)).limit(1);
    return result[0];
  }
  async getAllRoles() {
    const db2 = await getDb();
    return await db2.select().from(roles).where(eq(roles.actif, true));
  }
  async createRole(insertRole) {
    const db2 = await getDb();
    await db2.insert(roles).values(insertRole);
    const createdRole = await this.getRole(insertRole.nom);
    if (!createdRole) {
      throw new Error("Erreur lors de la cr\xE9ation du r\xF4le");
    }
    return createdRole;
  }
  async updateRole(id, updateData) {
    const db2 = await getDb();
    await db2.update(roles).set(updateData).where(eq(roles.id, id));
    return await this.getRole(id);
  }
  async deleteRole(id) {
    const db2 = await getDb();
    await db2.update(roles).set({ actif: false }).where(eq(roles.id, id));
    return true;
  }
  // Méthodes pour les utilisateurs
  async getUtilisateur(id) {
    const db2 = await getDb();
    const result = await db2.select().from(utilisateurs).where(eq(utilisateurs.id, id)).limit(1);
    return result[0];
  }
  async getUtilisateurByEmail(email) {
    const db2 = await getDb();
    const result = await db2.select().from(utilisateurs).where(eq(utilisateurs.email, email)).limit(1);
    return result[0];
  }
  async getAllUtilisateurs() {
    const db2 = await getDb();
    return await db2.select().from(utilisateurs).where(eq(utilisateurs.actif, true));
  }
  async createUtilisateur(insertUtilisateur) {
    const db2 = await getDb();
    await db2.insert(utilisateurs).values(insertUtilisateur);
    const createdUtilisateur = await this.getUtilisateurByEmail(insertUtilisateur.email);
    if (!createdUtilisateur) {
      throw new Error("Erreur lors de la cr\xE9ation de l'utilisateur");
    }
    return createdUtilisateur;
  }
  async updateUtilisateur(id, updateData) {
    const db2 = await getDb();
    await db2.update(utilisateurs).set(updateData).where(eq(utilisateurs.id, id));
    return await this.getUtilisateur(id);
  }
  async deleteUtilisateur(id) {
    const db2 = await getDb();
    await db2.update(utilisateurs).set({ actif: false }).where(eq(utilisateurs.id, id));
    return true;
  }
  // Méthodes pour les permissions
  async getPermission(id) {
    const db2 = await getDb();
    const result = await db2.select().from(permissionsUtilisateur).where(eq(permissionsUtilisateur.id, id)).limit(1);
    return result[0];
  }
  async getPermissionsByUtilisateur(utilisateurId) {
    const db2 = await getDb();
    return await db2.select().from(permissionsUtilisateur).where(
      and(
        eq(permissionsUtilisateur.utilisateurId, utilisateurId),
        eq(permissionsUtilisateur.actif, true)
      )
    );
  }
  async createPermission(insertPermission) {
    const db2 = await getDb();
    await db2.insert(permissionsUtilisateur).values(insertPermission);
    const createdPermission = await this.getPermission(insertPermission.utilisateurId);
    if (!createdPermission) {
      throw new Error("Erreur lors de la cr\xE9ation de la permission");
    }
    return createdPermission;
  }
  async updatePermission(id, updateData) {
    const db2 = await getDb();
    await db2.update(permissionsUtilisateur).set(updateData).where(eq(permissionsUtilisateur.id, id));
    return await this.getPermission(id);
  }
  async deletePermission(id) {
    const db2 = await getDb();
    await db2.update(permissionsUtilisateur).set({ actif: false }).where(eq(permissionsUtilisateur.id, id));
    return true;
  }
  // Méthodes pour les filiales
  async getFiliale(id) {
    const db2 = await getDb();
    const result = await db2.select().from(filiales).where(eq(filiales.id, id)).limit(1);
    return result[0];
  }
  async getAllFiliales() {
    const db2 = await getDb();
    return await db2.select().from(filiales).where(eq(filiales.actif, true));
  }
  async getFilialeByCode(code) {
    const db2 = await getDb();
    const result = await db2.select().from(filiales).where(eq(filiales.code, code)).limit(1);
    return result[0];
  }
  async createFiliale(insertFiliale) {
    const db2 = await getDb();
    await db2.insert(filiales).values(insertFiliale);
    const createdFiliale = await this.getFilialeByCode(insertFiliale.code);
    if (!createdFiliale) {
      throw new Error("Erreur lors de la cr\xE9ation de la filiale");
    }
    return createdFiliale;
  }
  async updateFiliale(id, updateData) {
    const db2 = await getDb();
    await db2.update(filiales).set(updateData).where(eq(filiales.id, id));
    return await this.getFiliale(id);
  }
  async deleteFiliale(id) {
    const db2 = await getDb();
    await db2.update(filiales).set({ actif: false }).where(eq(filiales.id, id));
    return true;
  }
  // Méthodes pour les camions
  async getTruck(id) {
    const db2 = await getDb();
    const result = await db2.select().from(trucks).where(eq(trucks.id, id)).limit(1);
    return result[0];
  }
  async getAllTrucks(filialeId) {
    const db2 = await getDb();
    if (filialeId) {
      return await db2.select().from(trucks).where(eq(trucks.filialeId, filialeId));
    }
    return await db2.select().from(trucks);
  }
  async getTruckByNumero(numero, filialeId) {
    const db2 = await getDb();
    if (filialeId) {
      const result2 = await db2.select().from(trucks).where(
        and(eq(trucks.numero, numero), eq(trucks.filialeId, filialeId))
      ).limit(1);
      return result2[0];
    }
    const result = await db2.select().from(trucks).where(eq(trucks.numero, numero)).limit(1);
    return result[0];
  }
  async createTruck(insertTruck) {
    const db2 = await getDb();
    const truckData = {
      filialeId: insertTruck.filialeId,
      numero: insertTruck.numero,
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
    await db2.insert(trucks).values(truckData);
    const createdTruck = await this.getTruckByNumero(insertTruck.numero, insertTruck.filialeId);
    if (!createdTruck) {
      throw new Error("Erreur lors de la cr\xE9ation du camion");
    }
    return createdTruck;
  }
  async updateTruck(id, updateData) {
    const db2 = await getDb();
    const updateValues = {};
    if (updateData.filialeId !== void 0) updateValues.filialeId = updateData.filialeId;
    if (updateData.numero !== void 0) updateValues.numero = updateData.numero;
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
    await db2.update(trucks).set(updateValues).where(eq(trucks.id, id));
    return await this.getTruck(id);
  }
  async deleteTruck(id) {
    const db2 = await getDb();
    await db2.delete(trucks).where(eq(trucks.id, id));
    return true;
  }
  async searchTrucks(query, filialeId) {
    const db2 = await getDb();
    const searchTerm = `%${query}%`;
    if (filialeId) {
      return await db2.select().from(trucks).where(
        and(
          eq(trucks.filialeId, filialeId),
          or(
            like(trucks.numero, searchTerm),
            like(trucks.modele, searchTerm),
            like(trucks.imei, searchTerm),
            like(trucks.numeroTruck4U, searchTerm),
            like(trucks.numeroPDA, searchTerm)
          )
        )
      );
    }
    return await db2.select().from(trucks).where(
      or(
        like(trucks.numero, searchTerm),
        like(trucks.modele, searchTerm),
        like(trucks.imei, searchTerm),
        like(trucks.numeroTruck4U, searchTerm),
        like(trucks.numeroPDA, searchTerm)
      )
    );
  }
  async filterTrucksByStatus(status, filialeId) {
    const db2 = await getDb();
    if (filialeId) {
      return await db2.select().from(trucks).where(
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
    return await db2.select().from(trucks).where(
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

// server/routes.ts
import { z as z2 } from "zod";
var upload = multer({ storage: multer.memoryStorage() });
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
  app2.get("/api/filiales", async (req, res) => {
    try {
      const filiales2 = await storage.getAllFiliales();
      res.json(filiales2);
    } catch (error) {
      res.status(500).json({ message: "\xC9chec de r\xE9cup\xE9ration des filiales" });
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
  app2.post("/api/filiales", async (req, res) => {
    try {
      const validatedData = insertFilialeSchema.parse(req.body);
      const filiale = await storage.createFiliale(validatedData);
      res.status(201).json(filiale);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Donn\xE9es invalides", errors: error.errors });
      }
      res.status(500).json({ message: "\xC9chec de cr\xE9ation de la filiale" });
    }
  });
  app2.patch("/api/filiales/:id", async (req, res) => {
    try {
      const partialSchema = insertFilialeSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const filiale = await storage.updateFiliale(req.params.id, validatedData);
      if (!filiale) {
        return res.status(404).json({ message: "Filiale non trouv\xE9e" });
      }
      res.json(filiale);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Donn\xE9es invalides", errors: error.errors });
      }
      res.status(500).json({ message: "\xC9chec de mise \xE0 jour de la filiale" });
    }
  });
  app2.delete("/api/filiales/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFiliale(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Filiale non trouv\xE9e" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "\xC9chec de suppression de la filiale" });
    }
  });
  app2.get("/api/trucks", async (req, res) => {
    try {
      const filialeId = req.query.filialeId;
      const trucks2 = await storage.getAllTrucks(filialeId);
      res.json(trucks2);
    } catch (error) {
      res.status(500).json({ message: "\xC9chec de r\xE9cup\xE9ration des camions" });
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
      res.status(500).json({ message: "\xC9chec de r\xE9cup\xE9ration du camion" });
    }
  });
  app2.post("/api/trucks", async (req, res) => {
    try {
      const validatedData = insertTruckSchema.parse(req.body);
      const truck = await storage.createTruck(validatedData);
      res.status(201).json(truck);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Donn\xE9es invalides", errors: error.errors });
      }
      res.status(500).json({ message: "\xC9chec de cr\xE9ation du camion" });
    }
  });
  app2.patch("/api/trucks/:id", async (req, res) => {
    try {
      const partialSchema = insertTruckSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const truck = await storage.updateTruck(req.params.id, validatedData);
      if (!truck) {
        return res.status(404).json({ message: "Camion non trouv\xE9" });
      }
      res.json(truck);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Donn\xE9es invalides", errors: error.errors });
      }
      res.status(500).json({ message: "\xC9chec de mise \xE0 jour du camion" });
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
      const trucks2 = await storage.searchTrucks(req.params.query, filialeId);
      res.json(trucks2);
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
            numero: findValue([
              "N\xB0 Camion",
              "Numero",
              "Num\xE9ro",
              "Immatriculation",
              "immatriculation",
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
          if (!truckData.numero && !truckData.modele) {
            continue;
          }
          if (!truckData.numero) {
            truckData.numero = `CAMION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          }
          if (!truckData.modele) {
            truckData.modele = "Mod\xE8le non sp\xE9cifi\xE9";
          }
          const validatedData = insertTruckSchema.parse(truckData);
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
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
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
dotenv2.config();
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
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
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "localhost", () => {
    log(`serving on port ${port}`);
  });
})();
