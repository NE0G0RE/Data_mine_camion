import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import * as XLSX from "xlsx";
import { storage } from "./storage";
import { insertTruckSchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({ storage: multer.memoryStorage() });

// Helper functions to map Excel values to our schema values
function mapStatus(value: string): string {
  const v = value.toLowerCase().trim();
  if (v.includes("oui") || v.includes("yes") || v.includes("ok") || v === "1") return "oui";
  if (v.includes("non") || v.includes("no") || v.includes("ko") || v === "0") return "non";
  return "na";
}

function mapTruckStatus(value: string): string {
  const v = value.toLowerCase().trim();
  if (v.includes("fonctionnel") || v.includes("ok")) return "fonctionnel";
  if (v.includes("non") || v.includes("ko")) return "non_fonctionnel";
  return "test_requis";
}

function mapPresence(value: string): string {
  const v = value.toLowerCase().trim();
  if (v.includes("oui") || v.includes("yes") || v.includes("présent")) return "oui";
  return "non";
}

function mapCompatibility(value: string): string {
  const v = value.toLowerCase().trim();
  if (v.includes("compatible") || v.includes("ok")) return "compatible";
  if (v.includes("incompatible") || v.includes("ko")) return "incompatible";
  return "test_requis";
}

function mapAppStatus(value: string): string {
  const v = value.toLowerCase().trim();
  if (v.includes("installé") || v.includes("ok")) return "installe";
  if (v.includes("erreur")) return "erreur";
  return "non_installe";
}

function mapMaterial(value: string): string {
  const v = value.toLowerCase().trim();
  if (v.includes("oui") || v.includes("présent")) return "oui";
  if (v.includes("non") && !v.includes("besoin")) return "non";
  return "pas_besoin";
}

function mapMaterialStatus(value: string): string {
  const v = value.toLowerCase().trim();
  if (v.includes("complet") || v.includes("ok")) return "complet";
  if (v.includes("manquant")) return "manquant";
  return "partiel";
}

function mapTestStatus(value: string): string {
  const v = value.toLowerCase().trim();
  if (v.includes("oui") || v.includes("ok") || v.includes("validé")) return "oui";
  if (v.includes("cours") || v.includes("progress")) return "en_cours";
  return "non";
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all trucks
  app.get("/api/trucks", async (req, res) => {
    try {
      const trucks = await storage.getAllTrucks();
      res.json(trucks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trucks" });
    }
  });

  // Get single truck
  app.get("/api/trucks/:id", async (req, res) => {
    try {
      const truck = await storage.getTruck(req.params.id);
      if (!truck) {
        return res.status(404).json({ message: "Truck not found" });
      }
      res.json(truck);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch truck" });
    }
  });

  // Create truck
  app.post("/api/trucks", async (req, res) => {
    try {
      const validatedData = insertTruckSchema.parse(req.body);
      const truck = await storage.createTruck(validatedData);
      res.status(201).json(truck);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create truck" });
    }
  });

  // Update truck
  app.patch("/api/trucks/:id", async (req, res) => {
    try {
      const partialSchema = insertTruckSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const truck = await storage.updateTruck(req.params.id, validatedData);
      if (!truck) {
        return res.status(404).json({ message: "Truck not found" });
      }
      res.json(truck);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update truck" });
    }
  });

  // Delete truck
  app.delete("/api/trucks/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTruck(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Truck not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete truck" });
    }
  });

  // Search trucks
  app.get("/api/trucks/search/:query", async (req, res) => {
    try {
      const trucks = await storage.searchTrucks(req.params.query);
      res.json(trucks);
    } catch (error) {
      res.status(500).json({ message: "Failed to search trucks" });
    }
  });

  // Import trucks from Excel file
  app.post("/api/trucks/import", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Read Excel file
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let imported = 0;
      let errors = 0;

      for (const row of jsonData) {
        try {
          // Map Excel columns to our schema - adjust these mappings based on actual Excel structure
          const rowData = row as Record<string, any>;
          const truckData = {
            numero: String(rowData["N° Camion"] || rowData["Numero"] || "").trim(),
            modele: String(rowData["Modèle"] || rowData["Modele"] || "").trim(),
            numeroDA: String(rowData["N° DA"] || rowData["Numero DA"] || "").trim(),
            dateDA: rowData["Date DA"] ? String(rowData["Date DA"]).trim() : "",
            daValide: mapStatus(String(rowData["DA Validé"] || rowData["DA Valide"] || "na")),
            numeroCA: String(rowData["N° CA"] || rowData["Numero CA"] || "").trim(),
            dateCA: rowData["Date CA"] ? String(rowData["Date CA"]).trim() : "",
            dateReception: rowData["Date Réception"] ? String(rowData["Date Réception"]).trim() : "",
            validationReception: mapStatus(String(rowData["Validation Réception"] || "na")),
            installePar: String(rowData["Installé par"] || "technicien1").trim(),
            dateInstallation: rowData["Date Installation"] ? String(rowData["Date Installation"]).trim() : "",
            parametrageRealise: mapStatus(String(rowData["Paramétrage Réalisé"] || "non")),
            localisationFonctionnelle: String(rowData["Localisation Fonctionnelle"] || "").trim(),
            statutConduite: mapTruckStatus(String(rowData["Statut Conduite"] || "test_requis")),
            telechargementMemoireMasse: mapTruckStatus(String(rowData["Téléchargement Mémoire Masse"] || "test_requis")),
            numeroTruck4U: String(rowData["N° Truck4U"] || "").trim(),
            presenceTablette: mapPresence(String(rowData["Présence Tablette"] || "non")),
            typeTablette: String(rowData["Type Tablette"] || "samsung").trim().toLowerCase(),
            imei: String(rowData["IMEI"] || "").trim(),
            fonctionnelle: mapStatus(String(rowData["Tablette Fonctionnelle"] || "non")),
            compatibilite: mapCompatibility(String(rowData["Compatibilité"] || "test_requis")),
            deliverup: mapAppStatus(String(rowData["DeliverUp"] || "non_installe")),
            applicationsSpecifiques: String(rowData["Applications Spécifiques"] || "").trim(),
            raisonsNonInstalle: String(rowData["Raisons Non Installé"] || "").trim(),
            cameraCabineTelematics: mapMaterial(String(rowData["Caméra Cabine"] || "pas_besoin")),
            dashcam: mapMaterial(String(rowData["Dashcam"] || "pas_besoin")),
            numeroPDA: String(rowData["N° PDA"] || "").trim(),
            materielRequis: mapMaterialStatus(String(rowData["Matériel Requis"] || "complet")),
            testsOK: mapTestStatus(String(rowData["Tests OK"] || "non")),
            champAction: String(rowData["Actions"] || rowData["Champ Action"] || "").trim(),
            observations: String(rowData["Observations"] || "").trim(),
          };

          // Skip empty rows
          if (!truckData.numero && !truckData.modele) {
            continue;
          }

          const validatedData = insertTruckSchema.parse(truckData);
          await storage.createTruck(validatedData);
          imported++;
        } catch (error) {
          console.error("Error importing row:", error);
          errors++;
        }
      }

      res.json({
        message: `Import terminé: ${imported} camions importés, ${errors} erreurs`,
        imported,
        errors,
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ message: "Failed to import trucks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
