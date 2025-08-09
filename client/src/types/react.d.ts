// Fichier de déclaration de types pour résoudre les problèmes avec React et ses hooks
import * as React from 'react';

declare module 'react' {
  // Déclarer explicitement les types des hooks React
  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
  
  // Déclarer d'autres hooks si nécessaire
  export function useEffect(effect: EffectCallback, deps?: DependencyList): void;
  export function useContext<T>(context: Context<T>): T;
  // ... autres hooks
}
