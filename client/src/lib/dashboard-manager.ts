export type DashboardType = 'minimal' | 'standard' | 'transport';

export interface DashboardConfig {
  key: DashboardType;
  name: string;
  description: string;
  icon: string;
  features: string[];
}

export const dashboards: Record<DashboardType, DashboardConfig> = {
  minimal: {
    key: 'minimal',
    name: 'Dashboard Minimal',
    description: 'Interface simple et épurée, idéale pour une utilisation basique',
    icon: '📊',
    features: [
      'Vue liste simple',
      'Fonctionnalités essentielles',
      'Interface claire',
      'Chargement rapide'
    ]
  },
  standard: {
    key: 'standard',
    name: 'Dashboard Standard',
    description: 'Interface équilibrée avec toutes les fonctionnalités principales',
    icon: '💼',
    features: [
      'Vue complète des données',
      'Tableaux détaillés',
      'Graphiques et statistiques',
      'Fonctionnalités avancées',
      'Interface professionnelle'
    ]
  },
  transport: {
    key: 'transport',
    name: 'Dashboard Transport',
    description: 'Interface immersive adaptée au secteur du transport routier',
    icon: '🚛',
    features: [
      'Design industriel moderne',
      'Statistiques visuelles',
      'Cartes interactives',
      'Thème transport routier',
      'Animations et effets'
    ]
  }
};

class DashboardManager {
  private static instance: DashboardManager;
  private currentDashboard: DashboardType = 'transport'; // Par défaut le nouveau dashboard
  private readonly STORAGE_KEY = 'maflotte_dashboard_preference';

  private constructor() {
    this.loadDashboardPreference();
  }

  public static getInstance(): DashboardManager {
    if (!DashboardManager.instance) {
      DashboardManager.instance = new DashboardManager();
    }
    return DashboardManager.instance;
  }

  private loadDashboardPreference(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved && (saved === 'minimal' || saved === 'transport')) {
        this.currentDashboard = saved as DashboardType;
      }
    } catch (error) {
      console.warn('Impossible de charger la préférence de dashboard:', error);
    }
  }

  private saveDashboardPreference(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, this.currentDashboard);
    } catch (error) {
      console.warn('Impossible de sauvegarder la préférence de dashboard:', error);
    }
  }

  public getCurrentDashboard(): DashboardType {
    return this.currentDashboard;
  }

  public setDashboard(dashboard: DashboardType): void {
    if (dashboard !== this.currentDashboard) {
      this.currentDashboard = dashboard;
      this.saveDashboardPreference();
      
      // Recharger la page pour appliquer le nouveau dashboard
      window.location.reload();
    }
  }

  public getDashboardConfig(dashboard?: DashboardType): DashboardConfig {
    const dashboardKey = dashboard || this.currentDashboard;
    return dashboards[dashboardKey];
  }

  public getAllDashboards(): DashboardConfig[] {
    return Object.values(dashboards);
  }
}

export const dashboardManager = DashboardManager.getInstance();
