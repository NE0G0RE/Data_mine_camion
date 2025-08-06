import { type Truck, type InsertTruck, type Filiale, type InsertFiliale, type Role, type InsertRole, type Utilisateur, type InsertUtilisateur, type PermissionUtilisateur, type InsertPermission } from "@shared/schema";
import { getDb, trucks, filiales, roles, utilisateurs, permissionsUtilisateur } from "./db";
import { eq, like, or, and } from "drizzle-orm";

export interface IStorage {
  // Méthodes pour les rôles
  getRole(id: string): Promise<Role | undefined>;
  getAllRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: string, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: string): Promise<boolean>;

  // Méthodes pour les utilisateurs
  getUtilisateur(id: string): Promise<Utilisateur | undefined>;
  getUtilisateurByEmail(email: string): Promise<Utilisateur | undefined>;
  getAllUtilisateurs(): Promise<Utilisateur[]>;
  createUtilisateur(utilisateur: InsertUtilisateur): Promise<Utilisateur>;
  updateUtilisateur(id: string, utilisateur: Partial<InsertUtilisateur>): Promise<Utilisateur | undefined>;
  deleteUtilisateur(id: string): Promise<boolean>;

  // Méthodes pour les permissions
  getPermission(id: string): Promise<PermissionUtilisateur | undefined>;
  getPermissionsByUtilisateur(utilisateurId: string): Promise<PermissionUtilisateur[]>;
  createPermission(permission: InsertPermission): Promise<PermissionUtilisateur>;
  updatePermission(id: string, permission: Partial<InsertPermission>): Promise<PermissionUtilisateur | undefined>;
  deletePermission(id: string): Promise<boolean>;

  // Méthodes pour les filiales
  getFiliale(id: string): Promise<Filiale | undefined>;
  getAllFiliales(): Promise<Filiale[]>;
  getFilialeByCode(code: string): Promise<Filiale | undefined>;
  createFiliale(filiale: InsertFiliale): Promise<Filiale>;
  updateFiliale(id: string, filiale: Partial<InsertFiliale>): Promise<Filiale | undefined>;
  deleteFiliale(id: string): Promise<boolean>;
  
  // Méthodes pour les camions (avec filiale)
  getTruck(id: string): Promise<Truck | undefined>;
  getAllTrucks(filialeId?: string): Promise<Truck[]>;
  getTruckByNumero(numero: string, filialeId?: string): Promise<Truck | undefined>;
  createTruck(truck: InsertTruck): Promise<Truck>;
  updateTruck(id: string, truck: Partial<InsertTruck>): Promise<Truck | undefined>;
  deleteTruck(id: string): Promise<boolean>;
  searchTrucks(query: string, filialeId?: string): Promise<Truck[]>;
  filterTrucksByStatus(status: string, filialeId?: string): Promise<Truck[]>;
}

export class MySQLStorage implements IStorage {
  // Méthodes pour les rôles
  async getRole(id: string): Promise<Role | undefined> {
    const db = await getDb();
    const result = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    return result[0];
  }

  async getAllRoles(): Promise<Role[]> {
    const db = await getDb();
    return await db.select().from(roles).where(eq(roles.actif, true));
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const db = await getDb();
    await db.insert(roles).values(insertRole);
    const createdRole = await this.getRole(insertRole.nom);
    if (!createdRole) {
      throw new Error("Erreur lors de la création du rôle");
    }
    return createdRole;
  }

  async updateRole(id: string, updateData: Partial<InsertRole>): Promise<Role | undefined> {
    const db = await getDb();
    await db.update(roles).set(updateData).where(eq(roles.id, id));
    return await this.getRole(id);
  }

  async deleteRole(id: string): Promise<boolean> {
    const db = await getDb();
    await db.update(roles).set({ actif: false }).where(eq(roles.id, id));
    return true;
  }

  // Méthodes pour les utilisateurs
  async getUtilisateur(id: string): Promise<Utilisateur | undefined> {
    const db = await getDb();
    const result = await db.select().from(utilisateurs).where(eq(utilisateurs.id, id)).limit(1);
    return result[0];
  }

  async getUtilisateurByEmail(email: string): Promise<Utilisateur | undefined> {
    const db = await getDb();
    const result = await db.select().from(utilisateurs).where(eq(utilisateurs.email, email)).limit(1);
    return result[0];
  }

  async getAllUtilisateurs(): Promise<Utilisateur[]> {
    const db = await getDb();
    return await db.select().from(utilisateurs).where(eq(utilisateurs.actif, true));
  }

  async createUtilisateur(insertUtilisateur: InsertUtilisateur): Promise<Utilisateur> {
    const db = await getDb();
    await db.insert(utilisateurs).values(insertUtilisateur);
    const createdUtilisateur = await this.getUtilisateurByEmail(insertUtilisateur.email);
    if (!createdUtilisateur) {
      throw new Error("Erreur lors de la création de l'utilisateur");
    }
    return createdUtilisateur;
  }

  async updateUtilisateur(id: string, updateData: Partial<InsertUtilisateur>): Promise<Utilisateur | undefined> {
    const db = await getDb();
    await db.update(utilisateurs).set(updateData).where(eq(utilisateurs.id, id));
    return await this.getUtilisateur(id);
  }

  async deleteUtilisateur(id: string): Promise<boolean> {
    const db = await getDb();
    await db.update(utilisateurs).set({ actif: false }).where(eq(utilisateurs.id, id));
    return true;
  }

  // Méthodes pour les permissions
  async getPermission(id: string): Promise<PermissionUtilisateur | undefined> {
    const db = await getDb();
    const result = await db.select().from(permissionsUtilisateur).where(eq(permissionsUtilisateur.id, id)).limit(1);
    return result[0];
  }

  async getPermissionsByUtilisateur(utilisateurId: string): Promise<PermissionUtilisateur[]> {
    const db = await getDb();
    return await db.select().from(permissionsUtilisateur).where(
      and(
        eq(permissionsUtilisateur.utilisateurId, utilisateurId),
        eq(permissionsUtilisateur.actif, true)
      )
    );
  }

  async createPermission(insertPermission: InsertPermission): Promise<PermissionUtilisateur> {
    const db = await getDb();
    await db.insert(permissionsUtilisateur).values(insertPermission);
    const createdPermission = await this.getPermission(insertPermission.utilisateurId);
    if (!createdPermission) {
      throw new Error("Erreur lors de la création de la permission");
    }
    return createdPermission;
  }

  async updatePermission(id: string, updateData: Partial<InsertPermission>): Promise<PermissionUtilisateur | undefined> {
    const db = await getDb();
    await db.update(permissionsUtilisateur).set(updateData).where(eq(permissionsUtilisateur.id, id));
    return await this.getPermission(id);
  }

  async deletePermission(id: string): Promise<boolean> {
    const db = await getDb();
    await db.update(permissionsUtilisateur).set({ actif: false }).where(eq(permissionsUtilisateur.id, id));
    return true;
  }

  // Méthodes pour les filiales
  async getFiliale(id: string): Promise<Filiale | undefined> {
    const db = await getDb();
    const result = await db.select().from(filiales).where(eq(filiales.id, id)).limit(1);
    return result[0];
  }

  async getAllFiliales(): Promise<Filiale[]> {
    const db = await getDb();
    return await db.select().from(filiales).where(eq(filiales.actif, true));
  }

  async getFilialeByCode(code: string): Promise<Filiale | undefined> {
    const db = await getDb();
    const result = await db.select().from(filiales).where(eq(filiales.code, code)).limit(1);
    return result[0];
  }

  async createFiliale(insertFiliale: InsertFiliale): Promise<Filiale> {
    const db = await getDb();
    await db.insert(filiales).values(insertFiliale);
    const createdFiliale = await this.getFilialeByCode(insertFiliale.code);
    if (!createdFiliale) {
      throw new Error("Erreur lors de la création de la filiale");
    }
    return createdFiliale;
  }

  async updateFiliale(id: string, updateData: Partial<InsertFiliale>): Promise<Filiale | undefined> {
    const db = await getDb();
    await db.update(filiales).set(updateData).where(eq(filiales.id, id));
    return await this.getFiliale(id);
  }

  async deleteFiliale(id: string): Promise<boolean> {
    const db = await getDb();
    await db.update(filiales).set({ actif: false }).where(eq(filiales.id, id));
    return true;
  }

  // Méthodes pour les camions
  async getTruck(id: string): Promise<Truck | undefined> {
    const db = await getDb();
    const result = await db.select().from(trucks).where(eq(trucks.id, id)).limit(1);
    return result[0];
  }

  async getAllTrucks(filialeId?: string): Promise<Truck[]> {
    const db = await getDb();
    if (filialeId) {
      return await db.select().from(trucks).where(eq(trucks.filialeId, filialeId));
    }
    return await db.select().from(trucks);
  }

  async getTruckByNumero(numero: string, filialeId?: string): Promise<Truck | undefined> {
    const db = await getDb();
    if (filialeId) {
      const result = await db.select().from(trucks).where(
        and(eq(trucks.numero, numero), eq(trucks.filialeId, filialeId))
      ).limit(1);
      return result[0];
    }
    const result = await db.select().from(trucks).where(eq(trucks.numero, numero)).limit(1);
    return result[0];
  }

  async createTruck(insertTruck: InsertTruck): Promise<Truck> {
    const db = await getDb();
    
    // Préparer les données en gérant les types
    const truckData = {
      filialeId: insertTruck.filialeId,
      numero: insertTruck.numero,
      modele: insertTruck.modele,
      numeroDA: insertTruck.numeroDA || null,
      dateDA: insertTruck.dateDA ? new Date(insertTruck.dateDA) : null,
      daValide: insertTruck.daValide || null,
      numeroCA: insertTruck.numeroCA || null,
      dateCA: insertTruck.dateCA ? new Date(insertTruck.dateCA) : null,
      dateReception: insertTruck.dateReception ? new Date(insertTruck.dateReception) : null,
      validationReception: insertTruck.validationReception || null,
      installePar: insertTruck.installePar || null,
      dateInstallation: insertTruck.dateInstallation ? new Date(insertTruck.dateInstallation) : null,
      parametrageRealise: insertTruck.parametrageRealise || null,
      localisationFonctionnelle: insertTruck.localisationFonctionnelle || null,
      statutConduite: insertTruck.statutConduite || null,
      telechargementMemoireMasse: insertTruck.telechargementMemoireMasse || null,
      numeroTruck4U: insertTruck.numeroTruck4U || null,
      presenceTablette: insertTruck.presenceTablette || null,
      typeTablette: insertTruck.typeTablette || null,
      imei: insertTruck.imei || null,
      fonctionnelle: insertTruck.fonctionnelle || null,
      compatibilite: insertTruck.compatibilite || null,
      deliverup: insertTruck.deliverup || null,
      applicationsSpecifiques: insertTruck.applicationsSpecifiques || null,
      raisonsNonInstalle: insertTruck.raisonsNonInstalle || null,
      cameraCabineTelematics: insertTruck.cameraCabineTelematics || null,
      dashcam: insertTruck.dashcam || null,
      numeroPDA: insertTruck.numeroPDA || null,
      materielRequis: insertTruck.materielRequis || null,
      testsOK: insertTruck.testsOK || null,
      champAction: insertTruck.champAction || null,
      observations: insertTruck.observations || null,
    };

    await db.insert(trucks).values(truckData);
    
    // Récupérer le camion créé
    const createdTruck = await this.getTruckByNumero(insertTruck.numero, insertTruck.filialeId);
    if (!createdTruck) {
      throw new Error("Erreur lors de la création du camion");
    }
    return createdTruck;
  }

  async updateTruck(id: string, updateData: Partial<InsertTruck>): Promise<Truck | undefined> {
    const db = await getDb();
    
    // Préparer les données de mise à jour
    const updateValues: any = {};
    
    if (updateData.filialeId !== undefined) updateValues.filialeId = updateData.filialeId;
    if (updateData.numero !== undefined) updateValues.numero = updateData.numero;
    if (updateData.modele !== undefined) updateValues.modele = updateData.modele;
    if (updateData.numeroDA !== undefined) updateValues.numeroDA = updateData.numeroDA || null;
    if (updateData.dateDA !== undefined) updateValues.dateDA = updateData.dateDA ? new Date(updateData.dateDA) : null;
    if (updateData.daValide !== undefined) updateValues.daValide = updateData.daValide || null;
    if (updateData.numeroCA !== undefined) updateValues.numeroCA = updateData.numeroCA || null;
    if (updateData.dateCA !== undefined) updateValues.dateCA = updateData.dateCA ? new Date(updateData.dateCA) : null;
    if (updateData.dateReception !== undefined) updateValues.dateReception = updateData.dateReception ? new Date(updateData.dateReception) : null;
    if (updateData.validationReception !== undefined) updateValues.validationReception = updateData.validationReception || null;
    if (updateData.installePar !== undefined) updateValues.installePar = updateData.installePar || null;
    if (updateData.dateInstallation !== undefined) updateValues.dateInstallation = updateData.dateInstallation ? new Date(updateData.dateInstallation) : null;
    if (updateData.parametrageRealise !== undefined) updateValues.parametrageRealise = updateData.parametrageRealise || null;
    if (updateData.localisationFonctionnelle !== undefined) updateValues.localisationFonctionnelle = updateData.localisationFonctionnelle || null;
    if (updateData.statutConduite !== undefined) updateValues.statutConduite = updateData.statutConduite || null;
    if (updateData.telechargementMemoireMasse !== undefined) updateValues.telechargementMemoireMasse = updateData.telechargementMemoireMasse || null;
    if (updateData.numeroTruck4U !== undefined) updateValues.numeroTruck4U = updateData.numeroTruck4U || null;
    if (updateData.presenceTablette !== undefined) updateValues.presenceTablette = updateData.presenceTablette || null;
    if (updateData.typeTablette !== undefined) updateValues.typeTablette = updateData.typeTablette || null;
    if (updateData.imei !== undefined) updateValues.imei = updateData.imei || null;
    if (updateData.fonctionnelle !== undefined) updateValues.fonctionnelle = updateData.fonctionnelle || null;
    if (updateData.compatibilite !== undefined) updateValues.compatibilite = updateData.compatibilite || null;
    if (updateData.deliverup !== undefined) updateValues.deliverup = updateData.deliverup || null;
    if (updateData.applicationsSpecifiques !== undefined) updateValues.applicationsSpecifiques = updateData.applicationsSpecifiques || null;
    if (updateData.raisonsNonInstalle !== undefined) updateValues.raisonsNonInstalle = updateData.raisonsNonInstalle || null;
    if (updateData.cameraCabineTelematics !== undefined) updateValues.cameraCabineTelematics = updateData.cameraCabineTelematics || null;
    if (updateData.dashcam !== undefined) updateValues.dashcam = updateData.dashcam || null;
    if (updateData.numeroPDA !== undefined) updateValues.numeroPDA = updateData.numeroPDA || null;
    if (updateData.materielRequis !== undefined) updateValues.materielRequis = updateData.materielRequis || null;
    if (updateData.testsOK !== undefined) updateValues.testsOK = updateData.testsOK || null;
    if (updateData.champAction !== undefined) updateValues.champAction = updateData.champAction || null;
    if (updateData.observations !== undefined) updateValues.observations = updateData.observations || null;

    await db.update(trucks).set(updateValues).where(eq(trucks.id, id));
    return await this.getTruck(id);
  }

  async deleteTruck(id: string): Promise<boolean> {
    const db = await getDb();
    await db.delete(trucks).where(eq(trucks.id, id));
    return true;
  }

  async searchTrucks(query: string, filialeId?: string): Promise<Truck[]> {
    const db = await getDb();
    const searchTerm = `%${query}%`;
    
    if (filialeId) {
      return await db.select().from(trucks).where(
        and(
          eq(trucks.filialeId, filialeId),
          or(
            like(trucks.numero, searchTerm),
            like(trucks.modele, searchTerm),
            like(trucks.imei, searchTerm),
            like(trucks.numeroTruck4U, searchTerm),
            like(trucks.numeroPDA, searchTerm)
          )
        )
      );
    }
    
    return await db.select().from(trucks).where(
      or(
        like(trucks.numero, searchTerm),
        like(trucks.modele, searchTerm),
        like(trucks.imei, searchTerm),
        like(trucks.numeroTruck4U, searchTerm),
        like(trucks.numeroPDA, searchTerm)
      )
    );
  }

  async filterTrucksByStatus(status: string, filialeId?: string): Promise<Truck[]> {
    const db = await getDb();
    
    if (filialeId) {
      return await db.select().from(trucks).where(
        and(
          eq(trucks.filialeId, filialeId),
          or(
            eq(trucks.daValide, status),
            eq(trucks.validationReception, status),
            eq(trucks.parametrageRealise, status),
            eq(trucks.statutConduite, status),
            eq(trucks.presenceTablette, status),
            eq(trucks.fonctionnelle, status),
            eq(trucks.compatibilite, status),
            eq(trucks.deliverup, status),
            eq(trucks.cameraCabineTelematics, status),
            eq(trucks.dashcam, status),
            eq(trucks.materielRequis, status),
            eq(trucks.testsOK, status)
          )
        )
      );
    }
    
    return await db.select().from(trucks).where(
      or(
        eq(trucks.daValide, status),
        eq(trucks.validationReception, status),
        eq(trucks.parametrageRealise, status),
        eq(trucks.statutConduite, status),
        eq(trucks.presenceTablette, status),
        eq(trucks.fonctionnelle, status),
        eq(trucks.compatibilite, status),
        eq(trucks.deliverup, status),
        eq(trucks.cameraCabineTelematics, status),
        eq(trucks.dashcam, status),
        eq(trucks.materielRequis, status),
        eq(trucks.testsOK, status)
      )
    );
  }
}

// Utiliser le stockage MySQL
export const storage = new MySQLStorage();
