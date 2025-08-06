import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const trucks = pgTable("trucks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  numero: text("numero").notNull().unique(),
  modele: text("modele").notNull(),
  
  // État section
  numeroDA: text("numero_da"),
  dateDA: date("date_da"),
  daValide: text("da_valide"), // "oui", "non", "na"
  numeroCA: text("numero_ca"),
  dateCA: date("date_ca"),
  dateReception: date("date_reception"),
  validationReception: text("validation_reception"), // "oui", "non", "na"
  
  // Truck4U section
  installePar: text("installe_par"),
  dateInstallation: date("date_installation"),
  parametrageRealise: text("parametrage_realise"), // "oui", "non", "partiel"
  localisationFonctionnelle: text("localisation_fonctionnelle"),
  statutConduite: text("statut_conduite"), // "fonctionnel", "non_fonctionnel", "test_requis"
  telechargementMemoireMasse: text("telechargement_memoire_masse"),
  numeroTruck4U: text("numero_truck4u"),
  
  // Tablette section
  presenceTablette: text("presence_tablette"), // "oui", "non"
  typeTablette: text("type_tablette"),
  imei: text("imei"),
  fonctionnelle: text("fonctionnelle"), // "oui", "non", "partiel"
  compatibilite: text("compatibilite"), // "compatible", "incompatible", "test_requis"
  deliverup: text("deliverup"), // "installe", "non_installe", "erreur"
  applicationsSpecifiques: text("applications_specifiques"),
  raisonsNonInstalle: text("raisons_non_installe"),
  
  // Matériel section
  cameraCabineTelematics: text("camera_cabine_telematics"), // "oui", "non", "pas_besoin"
  dashcam: text("dashcam"), // "oui", "non", "pas_besoin"
  numeroPDA: text("numero_pda"),
  materielRequis: text("materiel_requis"), // "complet", "partiel", "manquant"
  testsOK: text("tests_ok"), // "oui", "non", "en_cours"
  
  // Action fields
  champAction: text("champ_action"),
  observations: text("observations"),
});

export const insertTruckSchema = createInsertSchema(trucks).omit({
  id: true,
});

export type InsertTruck = z.infer<typeof insertTruckSchema>;
export type Truck = typeof trucks.$inferSelect;
