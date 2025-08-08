// FICHIER OBSOLÈTE - REMPLACÉ PAR theme-manager.ts
// Ce fichier n'est plus utilisé depuis la refactorisation vers le système de thème simplifié
// Conservé temporairement pour éviter les erreurs d'import, mais sera supprimé

export const ThemeProvider = ({ children }: { children: any }) => children;
export const useTheme = () => ({ theme: 'default', setTheme: () => {} });
