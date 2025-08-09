import * as XLSX from 'xlsx';
import { eq, sql } from 'drizzle-orm';
import { filiales, trucks } from "../../shared/schema.js";
import { getDb } from '../db.js';
// Types de statut possibles
export const statusConduite = ['fonctionnel', 'non_fonctionnel', 'test_requis'];
export const statusPresence = ['oui', 'non', 'na'];
export const statusCompatibilite = ['compatible', 'incompatible', 'test_requis'];
export const statusTests = ['oui', 'non', 'en_cours'];
export const statusApp = ['installe', 'non_installe', 'erreur'];
// Mappage par défaut
export const defaultFieldMapping = {
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
export const defaultImportOptions = {
    fieldMapping: defaultFieldMapping,
    skipMissingFields: true,
    requireFiliale: true
};
// Normalisation des valeurs
function normalizeString(value) {
    if (value == null)
        return '';
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
};
// Helper pour trouver le statut correspondant
function findMatchingStatus(value, type) {
    const normalizedValue = normalizeString(value);
    const statusMap = mappings[type];
    for (const [status, matches] of Object.entries(statusMap)) {
        if (matches.some((match) => normalizedValue.includes(match))) {
            return status;
        }
    }
    // Valeur par défaut selon le type
    const defaults = {
        conduite: 'test_requis',
        presence: 'non',
        compatibilite: 'test_requis',
        app: 'non_installe',
        tests: 'en_cours'
    };
    return defaults[type];
}
// Helper pour trouver une valeur à partir du mappage
function findFieldValue(row, fieldNames) {
    for (const name of fieldNames) {
        if (row[name]) {
            return String(row[name]).trim();
        }
    }
    return '';
}
// Fonction principale d'importation
export async function importExcelFile(buffer, fieldMapping = defaultFieldMapping) {
    const db = await getDb();
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet);
    const results = [];
    const errors = [];
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
                    dateModification: sql `CURRENT_TIMESTAMP`
                }) // TODO: Fix type
                    .where(eq(trucks.immatriculation, immatriculation));
                results.push({ status: 'updated', immatriculation });
            }
            else {
                await db.insert(trucks).values({
                    ...truckData,
                    dateCreation: sql `CURRENT_TIMESTAMP`,
                    dateModification: sql `CURRENT_TIMESTAMP`
                }); // TODO: Fix type
                results.push({ status: 'inserted', immatriculation });
            }
        }
        catch (error) {
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
//# sourceMappingURL=excel-import.service.js.map