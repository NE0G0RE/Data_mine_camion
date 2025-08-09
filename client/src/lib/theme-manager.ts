export type Theme = 'charlesandre' | 'classique' | 'sombre';

export const themes = {
  charlesandre: {
    name: 'Charles André',
    description: 'Thème professionnel aux couleurs du groupe Charles André',
    colors: {
      primary: '#1e40af', // Bleu professionnel
      secondary: '#dc2626', // Rouge Charles André
      accent: '#059669', // Vert transport
      neutral: '#64748b', // Gris moderne
      background: '#f8fafc', // Fond clair
      surface: '#ffffff', // Surface blanche
      text: '#1f2937' // Texte principal
    }
  },
  classique: {
    name: 'Classique',
    description: 'Thème clair standard avec des couleurs neutres',
    colors: {
      primary: '#2563eb', // Bleu vif
      secondary: '#4f46e5', // Violet
      accent: '#0ea5e9', // Bleu clair
      neutral: '#6b7280', // Gris neutre
      background: '#ffffff', // Blanc pur
      surface: '#f9fafb', // Gris très clair
      text: '#111827' // Noir profond
    }
  },
  sombre: {
    name: 'Sombre',
    description: 'Thème sombre pour un confort visuel optimal',
    colors: {
      primary: '#3b82f6', // Bleu vif
      secondary: '#8b5cf6', // Violet
      accent: '#10b981', // Vert émeraude
      neutral: '#6b7280', // Gris neutre
      background: '#0f172a', // Bleu nuit très foncé
      surface: '#1e293b', // Bleu nuit foncé
      text: '#f8fafc' // Blanc cassé
    }
  }
};

class ThemeManager {
  private currentTheme: Theme = 'charlesandre';
  private listeners: Array<(theme: Theme) => void> = [];

  constructor() {
    // Load saved theme from localStorage (toujours Charles André)
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('app-theme') as Theme;
      if (savedTheme === 'charlesandre') {
        this.currentTheme = savedTheme;
      } else {
        // Force Charles André theme
        this.currentTheme = 'charlesandre';
      }
      this.applyTheme(this.currentTheme);
    }
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  setTheme(theme: Theme): void {
    if (!themes[theme]) {
      console.warn(`Theme "${theme}" not found`);
      return;
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveTheme(theme);
    this.notifyListeners(theme);
  }

  private applyTheme(theme: Theme): void {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    
    // Remove all theme classes
    Object.keys(themes).forEach(t => {
      root.classList.remove(`theme-${t}`);
    });
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
    
    console.log(`Theme applied: theme-${theme}`);
  }

  private saveTheme(theme: Theme): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-theme', theme);
    }
  }

  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(theme: Theme): void {
    this.listeners.forEach(listener => listener(theme));
  }
}

// Create singleton instance
export const themeManager = new ThemeManager();

// Simple theme utilities for direct DOM manipulation
export function initializeTheme(): void {
  themeManager.getCurrentTheme();
}

// For non-React usage
export function getCurrentTheme(): Theme {
  return themeManager.getCurrentTheme();
}

export function setTheme(theme: Theme): void {
  themeManager.setTheme(theme);
}
