import { readFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { importExcelFile, type FieldMapping } from './services/excel-import.service';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration du mappage personnalisé
const customMapping: FieldMapping = {
  numero: ['Immatriculation', 'N° Camion', 'Numero', 'N°'],
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

async function testImport() {
  try {
    const filePath = resolve(__dirname, '../attached_assets/Suivi_Informatique_Camions_1754486096209.xlsx');
    const buffer = await readFile(filePath);
    const result = await importExcelFile(buffer, customMapping);

    console.log('Résultats de l\'import:');
    console.log(`Total: ${result.total} lignes`);
    console.log(`Importés/mis à jour: ${result.processed}`);
    console.log(`Erreurs: ${result.failed}`);

    if (result.errors.length > 0) {
      console.log('\nErreurs rencontrées:');
      for (const error of result.errors) {
        console.log(`Ligne ${error.row}: ${error.error}`);
      }
    }

    if (result.results.length > 0) {
      console.log('\nCamions traités:');
      for (const truck of result.results) {
        console.log(`${truck.numero} - ${truck.status}`);
      }
    }

  } catch (error) {
    console.error('Erreur lors du test:', error);
  }
}

testImport().catch(console.error);
