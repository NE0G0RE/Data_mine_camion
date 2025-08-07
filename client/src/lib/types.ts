import type { Truck } from '@shared/schema';

export interface TruckStats {
  totalTrucks: number;
  installationsOk: number;
  pending: number;
  issues: number;
}

export interface FilterState {
  query: string;
  status: string;
  filiale: string;
}

export interface TruckFormData {
  numero: string;
  modele: string;
  imei?: string;
  numeroTruck4U?: string;
  filialeId: string;
  statutConduite: 'fonctionnel' | 'non_fonctionnel' | 'test_requis';
  equipementPresent: 'oui' | 'non' | 'na';
  compatibiliteTablette: 'compatible' | 'incompatible' | 'test_requis';
  tablettePresenteInstallation: 'oui' | 'non';
  appInstalleeEtFonctionnelle: 'installe' | 'non_installe' | 'erreur';
  testsOK: 'oui' | 'non' | 'en_cours';
  formation: 'oui' | 'non' | 'na';
  materielManquant: string[];
  commentaires?: string;
}

export type TruckUpdateData = Partial<TruckFormData>;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface StatusBadgeProps {
  status: string | null | undefined;
  label?: string;
}

export interface TruckStatus {
  etat: 'ok' | 'nok' | 'pending' | 'na';
  truck4u: 'ok' | 'nok' | 'pending' | 'na';
  tablette: 'ok' | 'nok' | 'pending' | 'na';
  materiel: 'ok' | 'nok' | 'pending' | 'na';
  overall: 'ok' | 'nok' | 'pending' | 'na';
}
