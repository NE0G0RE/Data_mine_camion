import { readFile } from 'fs/promises';
import { importExcelFile } from './excel-import.service';
import type { ImportResult } from './excel-import.service';

async function testImport() {
  try {
    const filePath = process.argv[2];
    if (!filePath) {
      console.error('Usage: tsx test-import.ts <chemin_du_fichier_excel>');
      process.exit(1);
    }

    console.log('Lecture du fichier:', filePath);
    const buffer = await readFile(filePath);
    
    console.log('Importation des données...');
    const result = await importExcelFile(buffer);
    
    console.log('\nRésultat de l\'importation:');
    console.log('-------------------------');
    console.log(`Total de lignes: ${result.total}`);
    console.log(`Lignes traitées: ${result.processed}`);
    console.log(`Erreurs: ${result.failed}`);
    console.log('\nDétails:');
    console.log('-------------------------');
    
    if (result.results.length > 0) {
      console.log('\nCamions traités:');
      result.results.forEach(({ status, numero }) => {
        console.log(`- ${numero}: ${status === 'inserted' ? 'Ajouté' : 'Mis à jour'}`);
      });
    }

    if (result.errors.length > 0) {
      console.log('\nErreurs:');
      result.errors.forEach(({ row, error }) => {
        console.log(`- Ligne ${row}: ${error}`);
      });
    }

  } catch (error) {
    console.error('Erreur lors du test:', error);
    process.exit(1);
  }
}

testImport();
