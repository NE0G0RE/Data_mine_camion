import { type Truck, type InsertTruck } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getTruck(id: string): Promise<Truck | undefined>;
  getAllTrucks(): Promise<Truck[]>;
  getTruckByNumero(numero: string): Promise<Truck | undefined>;
  createTruck(truck: InsertTruck): Promise<Truck>;
  updateTruck(id: string, truck: Partial<InsertTruck>): Promise<Truck | undefined>;
  deleteTruck(id: string): Promise<boolean>;
  searchTrucks(query: string): Promise<Truck[]>;
  filterTrucksByStatus(status: string): Promise<Truck[]>;
}

export class MemStorage implements IStorage {
  private trucks: Map<string, Truck>;

  constructor() {
    this.trucks = new Map();
  }

  async getTruck(id: string): Promise<Truck | undefined> {
    return this.trucks.get(id);
  }

  async getAllTrucks(): Promise<Truck[]> {
    return Array.from(this.trucks.values());
  }

  async getTruckByNumero(numero: string): Promise<Truck | undefined> {
    return Array.from(this.trucks.values()).find(
      (truck) => truck.numero === numero,
    );
  }

  async createTruck(insertTruck: InsertTruck): Promise<Truck> {
    const id = randomUUID();
    const truck: Truck = { 
      ...insertTruck, 
      id,
      // Convert undefined values to null for database compatibility
      numeroDA: insertTruck.numeroDA ?? null,
      dateDA: insertTruck.dateDA ?? null,
      daValide: insertTruck.daValide ?? null,
      numeroCA: insertTruck.numeroCA ?? null,
      dateCA: insertTruck.dateCA ?? null,
      dateReception: insertTruck.dateReception ?? null,
      validationReception: insertTruck.validationReception ?? null,
      installePar: insertTruck.installePar ?? null,
      dateInstallation: insertTruck.dateInstallation ?? null,
      parametrageRealise: insertTruck.parametrageRealise ?? null,
      localisationFonctionnelle: insertTruck.localisationFonctionnelle ?? null,
      statutConduite: insertTruck.statutConduite ?? null,
      telechargementMemoireMasse: insertTruck.telechargementMemoireMasse ?? null,
      numeroTruck4U: insertTruck.numeroTruck4U ?? null,
      presenceTablette: insertTruck.presenceTablette ?? null,
      typeTablette: insertTruck.typeTablette ?? null,
      imei: insertTruck.imei ?? null,
      fonctionnelle: insertTruck.fonctionnelle ?? null,
      compatibilite: insertTruck.compatibilite ?? null,
      deliverup: insertTruck.deliverup ?? null,
      applicationsSpecifiques: insertTruck.applicationsSpecifiques ?? null,
      raisonsNonInstalle: insertTruck.raisonsNonInstalle ?? null,
      cameraCabineTelematics: insertTruck.cameraCabineTelematics ?? null,
      dashcam: insertTruck.dashcam ?? null,
      numeroPDA: insertTruck.numeroPDA ?? null,
      materielRequis: insertTruck.materielRequis ?? null,
      testsOK: insertTruck.testsOK ?? null,
      champAction: insertTruck.champAction ?? null,
      observations: insertTruck.observations ?? null,
    };
    this.trucks.set(id, truck);
    return truck;
  }

  async updateTruck(id: string, updateData: Partial<InsertTruck>): Promise<Truck | undefined> {
    const existingTruck = this.trucks.get(id);
    if (!existingTruck) return undefined;

    const updatedTruck: Truck = { ...existingTruck, ...updateData };
    this.trucks.set(id, updatedTruck);
    return updatedTruck;
  }

  async deleteTruck(id: string): Promise<boolean> {
    return this.trucks.delete(id);
  }

  async searchTrucks(query: string): Promise<Truck[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.trucks.values()).filter(truck =>
      truck.numero?.toLowerCase().includes(lowercaseQuery) ||
      truck.modele?.toLowerCase().includes(lowercaseQuery) ||
      truck.imei?.toLowerCase().includes(lowercaseQuery) ||
      truck.numeroTruck4U?.toLowerCase().includes(lowercaseQuery) ||
      truck.numeroPDA?.toLowerCase().includes(lowercaseQuery)
    );
  }

  async filterTrucksByStatus(status: string): Promise<Truck[]> {
    // This is a simplified status filter - in practice you'd implement business logic
    // to determine overall status based on all the different fields
    return Array.from(this.trucks.values());
  }
}

export const storage = new MemStorage();
