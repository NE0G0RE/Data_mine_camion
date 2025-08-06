export interface TruckStats {
  totalTrucks: number;
  installationsOk: number;
  pending: number;
  issues: number;
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
