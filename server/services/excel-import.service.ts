import * as XLSX from 'xlsx';
import { eq, sql } from 'drizzle-orm';
import { filiales, trucks, type InsertTruck, type InsertFiliale } from "../../shared/dist/schema.js";
import { getDb } from '../db.js';

// Types de statut possibles
export const statusConduite = ['fonctionnel', 'non_fonctionnel', 'test_requis'] as const;
export const statusPresence = ['oui', 'non', 'na'] as const;
export const statusCompatibilite = ['compatible', 'incompatible', 'test_requis'] as const;
export const statusTests = ['oui', 'non', 'en_cours'] as const;
export const statusApp = ['installe', 'non_installe', 'erreur'] as const;

// Types pour les statuts
export type StatusConduite = typeof statusConduite[number];
export type StatusPresence = typeof statusPresence[number];
export type StatusCompatibilite = typeof statusCompatibilite[number];
export type StatusTests = typeof statusTests[number];
export type StatusApp = typeof statusApp[number];

// Interface pour les options d'import
export interface ImportOptions {
  fieldMapping: FieldMapping;      // Mappage des champs
  defaultFilialeId?: string;      // ID de la filiale par défaut si non trouvée dans le fichier
  skipMissingFields?: boolean;    // Ignorer les champs manquants non obligatoires
  requireFiliale?: boolean;       // Si true, une filiale doit être trouvée ou spécifiée
}

// Interface pour les options de mappage des champs
export interface FieldMapping {
  immatriculation: string[];   // Noms possibles pour l'immatriculation du camion
  modele: string[];          // Noms possibles pour le modèle
  filiale: string[];         // Noms possibles pour la filiale
  imei: string[];            // Noms possibles pour l'IMEI
  numeroTruck4U: string[];   // Noms possibles pour le numéro Truck4U
  statutConduite: string[];  // Noms possibles pour le statut de conduite
  equipement: string[];      // Noms possibles pour l'équipement
  compatibilite: string[];   // Noms possibles pour la compatibilité
  deliverup: string[];      // Noms possibles pour Deliverup
  testsOK: string[];        // Noms possibles pour les tests
  commentaires: string[];    // Noms possibles pour les commentaires
}

// Mappage par défaut
export const defaultFieldMapping: FieldMapping = {
  immatriculation: ['Immatriculation', 'N° Immatriculation', 'Immat', 'Camion', 'N° Camion'],
  modele: ['Modèle', 'Modele', 'Type'],
  filiale: ['Filiale', 'Site'],
  imei: ['IMEI', 'N° IMEI'],
  numeroTruck4U: ['N° TRUCK4U', 'Numero Truck4U', 'Truck4U'],
  statutConduite: ['Statut conduite', 'Statut', 'Etat conduite'],
  equipement: ['Equipement présent', 'Présence équipement', 'Matériel présent'],
  compatibilite: ['Compatibilité tablette', 'Compatibilité'],
  deliverup: ['App installée et fonctionnelle', 'Deliverup', 'Application'],
  testsOK: ['Tests OK', 'Tests', 'Validation tests'],
  commentaires: ['Commentaires', 'Notes', 'Observations']
};

// Options d'import par défaut
export const defaultImportOptions: ImportOptions = {
  fieldMapping: defaultFieldMapping,
  skipMissingFields: true,
  requireFiliale: true
};

// Interface pour les données brutes Excel avec index signature
export interface ExcelRow {
  [key: string]: string | undefined;
}

// Interface pour les résultats d'importation
export interface ImportResult {
  success: boolean;
  results: Array<{
    status: 'inserted' | 'updated';
    immatriculation: string;
  }>;
  errors: Array<{
    row: number;
    error: string;
  }>;
  total: number;
  processed: number;
  failed: number;
}

// Normalisation des valeurs
function normalizeString(value: unknown): string {
  if (value == null) return '';
  return String(value).toLowerCase().trim();
}

// Mappings de normalisation
const mappings = {
  conduite: {
    fonctionnel: ['oui', 'ok', 'fonctionnel'],
    non_fonctionnel: ['non', 'ko', 'non fonctionnel'],
    test_requis: ['test', 'à tester', 'a tester', 'test requis']
  },
  presence: {
    oui: ['oui', 'ok', 'présent', 'present', 'installé', 'installe'],
    non: ['non', 'ko', 'absent'],
    na: ['n/a', 'na', 'sans objet']
  },
  compatibilite: {
    compatible: ['compatible', 'ok', 'oui'],
    incompatible: ['non compatible', 'incompatible', 'ko', 'non'],
    test_requis: ['test', 'à tester', 'a tester', 'test requis']
  },
  app: {
    installe: ['installé', 'installe', 'ok'],
    non_installe: ['non installé', 'non installe', 'non'],
    erreur: ['erreur', 'ko', 'problème', 'probleme']
  },
  tests: {
    oui: ['oui', 'ok', 'validé', 'valide'],
    non: ['non', 'ko', 'échec', 'echec'],
    en_cours: ['en cours', 'test', 'à faire', 'a faire']
  }
} as const;

// Helper pour trouver le statut correspondant
function findMatchingStatus<T extends keyof typeof mappings>(
  value: string,
  type: T
): typeof mappings[T] extends Record<infer K, string[]> ? K : never {
  const normalizedValue = normalizeString(value);
  const statusMap = mappings[type];
  
  for (const [status, matches] of Object.entries(statusMap)) {
    if (matches.some((match: string) => normalizedValue.includes(match))) {
      return status as any;
    }
  }
  
  // Valeur par défaut selon le type
  const defaults: Record<keyof typeof mappings, string> = {
    conduite: 'test_requis',
    presence: 'non',
    compatibilite: 'test_requis',
    app: 'non_installe',
    tests: 'en_cours'
  };
  
  return defaults[type] as any;
}

// Helper pour trouver une valeur à partir du mappage
function findFieldValue(row: ExcelRow, fieldNames: string[]): string {
  for (const name of fieldNames) {
    if (row[name]) {
      return String(row[name]).trim();
    }
  }
  return '';
}

// Fonction principale d'importation
export async function importExcelFile(
  buffer: Buffer,
  fieldMapping: FieldMapping = defaultFieldMapping
): Promise<ImportResult> {
  const db = await getDb();
  const workbook = XLSX.read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

  const results: ImportResult['results'] = [];
  const errors: ImportResult['errors'] = [];

  for (const [index, row] of rows.entries()) {
    try {
      // Extraction du numéro de camion (champ obligatoire)
      const immatriculation = findFieldValue(row, fieldMapping.immatriculation);
      if (!immatriculation) {
        throw new Error('Numéro de camion manquant');
      }

      // Recherche de la filiale
      const filialeName = normalizeString(findFieldValue(row, fieldMapping.filiale));
      const filiale = filialeName 
        ? (await db.select().from(filiales).where(eq(filiales.nom, filialeName)).limit(1))[0]
        : null;

      if (!filiale) {
        throw new Error(`Filiale non trouvée: ${filialeName}`);
      }

      // Construction des données du camion
      const truckData = {
        immatriculation,
        modele: findFieldValue(row, fieldMapping.modele),
        imei: findFieldValue(row, fieldMapping.imei) || null,
        numeroTruck4U: findFieldValue(row, fieldMapping.numeroTruck4U) || null,
        statutConduite: findMatchingStatus(findFieldValue(row, fieldMapping.statutConduite), 'conduite'),
        presenceTablette: findMatchingStatus(findFieldValue(row, fieldMapping.equipement), 'presence'),
        compatibilite: findMatchingStatus(findFieldValue(row, fieldMapping.compatibilite), 'compatibilite'),
        deliverup: findMatchingStatus(findFieldValue(row, fieldMapping.deliverup), 'app'),
        testsOK: findMatchingStatus(findFieldValue(row, fieldMapping.testsOK), 'tests'),
        observations: findFieldValue(row, fieldMapping.commentaires) || null,
        filialeId: filiale.id
      };

      // Mise à jour ou insertion du camion
      const existingTrucks = await db.select().from(trucks).where(eq(trucks.immatriculation, immatriculation)).limit(1);
      const existingTruck = existingTrucks[0];

      if (existingTruck) {
        await db
          .update(trucks)
          .set({
            ...truckData,
            dateModification: sql`CURRENT_TIMESTAMP` 
          } as any) // TODO: Fix type
          .where(eq(trucks.immatriculation, immatriculation));
        results.push({ status: 'updated', immatriculation });
      } else {
        await db.insert(trucks).values({
          ...truckData,
          dateCreation: sql`CURRENT_TIMESTAMP`,
          dateModification: sql`CURRENT_TIMESTAMP`
        } as any); // TODO: Fix type
        results.push({ status: 'inserted', immatriculation });
      }

    } catch (error) {
      errors.push({
        row: index + 2, // +2 pour compenser l'en-tête et l'index 0-based
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  return {
    success: errors.length === 0,
    results,
    errors,
    total: rows.length,
    processed: results.length,
    failed: errors.length
  };
}
