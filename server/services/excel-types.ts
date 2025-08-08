import { z } from 'zod';

export const excelRowSchema = z.object({
  'N° Camion': z.string().optional(),
  'Numero': z.string().optional(),
  'N°': z.string().optional(),
  'Filiale': z.string().optional(),
  'Modèle': z.string().optional(),
  'Modele': z.string().optional(),
  'IMEI': z.string().optional(),
  'N° Truck4U': z.string().optional(),
  'Numero Truck4U': z.string().optional(),
  'Statut Conduite': z.string().optional(),
  'Truck4U': z.string().optional(),
  'Equipement Present': z.string().optional(),
  'Materiel': z.string().optional(),
  'Compatibilite Tablette': z.string().optional(),
  'Tablette': z.string().optional(),
  'Tablette Presente': z.string().optional(),
  'Installation': z.string().optional(),
  'App Installee': z.string().optional(),
  'Tests OK': z.string().optional(),
  'Tests': z.string().optional(),
  'Formation': z.string().optional(),
  'Materiel Manquant': z.string().optional(),
  'Commentaires': z.string().optional(),
}).passthrough();

export type ExcelRow = z.infer<typeof excelRowSchema>;
