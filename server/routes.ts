import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import * as XLSX from "xlsx";
import { google } from "googleapis";
import { storage } from "./storage";
import { insertTruckSchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({ storage: multer.memoryStorage() });

// Fonctions utilitaires pour mapper les valeurs Excel vers notre schéma
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
  // Récupérer tous les camions
  app.get("/api/trucks", async (req, res) => {
    try {
      const trucks = await storage.getAllTrucks();
      res.json(trucks);
    } catch (error) {
      res.status(500).json({ message: "Échec de récupération des camions" });
    }
  });

  // Récupérer un camion spécifique
  app.get("/api/trucks/:id", async (req, res) => {
    try {
      const truck = await storage.getTruck(req.params.id);
      if (!truck) {
        return res.status(404).json({ message: "Camion non trouvé" });
      }
      res.json(truck);
    } catch (error) {
      res.status(500).json({ message: "Échec de récupération du camion" });
    }
  });

  // Créer un camion
  app.post("/api/trucks", async (req, res) => {
    try {
      const validatedData = insertTruckSchema.parse(req.body);
      const truck = await storage.createTruck(validatedData);
      res.status(201).json(truck);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Échec de création du camion" });
    }
  });

  // Mettre à jour un camion
  app.patch("/api/trucks/:id", async (req, res) => {
    try {
      const partialSchema = insertTruckSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const truck = await storage.updateTruck(req.params.id, validatedData);
      if (!truck) {
        return res.status(404).json({ message: "Camion non trouvé" });
      }
      res.json(truck);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Échec de mise à jour du camion" });
    }
  });

  // Supprimer un camion
  app.delete("/api/trucks/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTruck(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Camion non trouvé" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Échec de suppression du camion" });
    }
  });

  // Rechercher des camions
  app.get("/api/trucks/search/:query", async (req, res) => {
    try {
      const trucks = await storage.searchTrucks(req.params.query);
      res.json(trucks);
    } catch (error) {
      res.status(500).json({ message: "Échec de recherche des camions" });
    }
  });

  // Importer des camions depuis Google Sheets
  app.post("/api/trucks/import-google-sheet", async (req, res) => {
    try {
      const { spreadsheetUrl, sheetName = 0 } = req.body;

      if (!spreadsheetUrl) {
        return res.status(400).json({ message: "URL du Google Sheet requise" });
      }

      // Extraire l'ID du spreadsheet depuis l'URL
      const spreadsheetIdMatch = spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!spreadsheetIdMatch) {
        return res.status(400).json({ message: "URL du Google Sheet invalide" });
      }

      const spreadsheetId = spreadsheetIdMatch[1];

      // Configuration de l'API Google Sheets avec clé API
      const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

      if (!GOOGLE_API_KEY) {
        return res.status(500).json({ 
          message: "Clé API Google non configurée. Veuillez ajouter GOOGLE_API_KEY dans les secrets." 
        });
      }

      const sheets = google.sheets({ 
        version: 'v4',
        auth: GOOGLE_API_KEY
      });

      // Récupérer les données du sheet
      let range = sheetName;
      if (typeof sheetName === 'number') {
        // Si c'est un index, récupérer le nom du sheet
        try {
          const spreadsheetInfo = await sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId,
          });
          range = spreadsheetInfo.data.sheets?.[sheetName]?.properties?.title || 'Sheet1';
        } catch (error) {
          // Si on ne peut pas récupérer les infos du spreadsheet, utiliser un nom par défaut
          range = 'Sheet1';
        }
      } else if (!range) {
        range = 'Sheet1';
      }

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return res.status(400).json({ message: "Aucune donnée trouvée dans le Google Sheet" });
      }

      // Première ligne = en-têtes
      const headers = rows[0];
      const dataRows = rows.slice(1);

      let imported = 0;
      let errors = 0;

      for (const row of dataRows) {
        try {
          // Créer un objet avec les en-têtes comme clés
          const rowData: Record<string, any> = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index] || "";
          });

          // Fonction pour trouver une valeur dans plusieurs colonnes possibles
          const findValue = (possibleColumns: string[]): string => {
            for (const col of possibleColumns) {
              if (rowData[col] !== undefined && rowData[col] !== null && String(rowData[col]).trim() !== "") {
                return String(rowData[col]).trim();
              }
            }
            return "";
          };

          const findValueWithDefault = (possibleColumns: string[], defaultValue: string): string => {
            const value = findValue(possibleColumns);
            return value || defaultValue;
          };

          const truckData = {
            // Numéro/Immatriculation du camion
            numero: findValue([
              "N° Camion", "Numero", "Numéro", "Immatriculation", "immatriculation", 
              "N°Camion", "Numero Camion", "Numéro Camion", "ID", "Camion", 
              "Plaque", "Registration", "Vehicle Number", "Truck Number"
            ]),

            // Modèle du camion
            modele: findValue([
              "Modèle", "Modele", "Modèle Camion", "Model", "Type", "Marque", 
              "Brand", "Vehicle Model", "Truck Model", "Make"
            ]),

            // Numéro DA
            numeroDA: findValue([
              "N° DA", "Numero DA", "Numéro DA", "DA", "N°DA", "Numero_DA", 
              "DA Number", "Document Authorization", "Authorization Number"
            ]),

            // Date DA
            dateDA: findValue([
              "Date DA", "Date_DA", "DA Date", "Date Authorization", 
              "Authorization Date", "Date du DA"
            ]),

            // DA Validé
            daValide: mapStatus(findValueWithDefault([
              "DA Validé", "DA Valide", "DA Validée", "DA_Valide", "DA Valid", 
              "Authorization Valid", "DA OK", "Validation DA", "DA Status"
            ], "na")),

            // Numéro CA
            numeroCA: findValue([
              "N° CA", "Numero CA", "Numéro CA", "CA", "N°CA", "Numero_CA", 
              "CA Number", "Contract Number", "Commande"
            ]),

            // Date CA
            dateCA: findValue([
              "Date CA", "Date_CA", "CA Date", "Contract Date", 
              "Date Commande", "Date du CA"
            ]),

            // Date Réception
            dateReception: findValue([
              "Date Réception", "Date Reception", "Date_Reception", "Reception Date", 
              "Delivery Date", "Date Livraison", "Date de Réception"
            ]),

            // Validation Réception
            validationReception: mapStatus(findValueWithDefault([
              "Validation Réception", "Validation Reception", "Reception Valid", 
              "Delivery Valid", "Réception OK", "Reception Status"
            ], "na")),

            // Installé par
            installePar: findValueWithDefault([
              "Installé par", "Installe par", "Technicien", "Installed by", 
              "Installer", "Tech", "Responsable Installation", "Intervenant"
            ], "technicien1"),

            // Date Installation
            dateInstallation: findValue([
              "Date Installation", "Date_Installation", "Installation Date", 
              "Date Pose", "Date de Pose", "Install Date"
            ]),

            // Paramétrage Réalisé
            parametrageRealise: mapStatus(findValueWithDefault([
              "Paramétrage Réalisé", "Parametrage Realise", "Paramétrage", "Configuration", 
              "Setup Done", "Config OK", "Paramètres", "Settings"
            ], "non")),

            // Localisation Fonctionnelle
            localisationFonctionnelle: findValue([
              "Localisation Fonctionnelle", "Localisation", "Location", "Site", 
              "Depot", "Agence", "Base", "Functional Location"
            ]),

            // Statut Conduite
            statutConduite: mapTruckStatus(findValueWithDefault([
              "Statut Conduite", "Status Conduite", "Driving Status", "Conduite", 
              "Drive Status", "Système Conduite", "Driving System"
            ], "test_requis")),

            // Téléchargement Mémoire Masse
            telechargementMemoireMasse: mapTruckStatus(findValueWithDefault([
              "Téléchargement Mémoire Masse", "Telechargement Memoire Masse", "Mémoire Masse", 
              "Memory Download", "Data Download", "Tachograph Download", "Tacho"
            ], "test_requis")),

            // Numéro Truck4U
            numeroTruck4U: findValue([
              "N° Truck4U", "Numero Truck4U", "Truck4U", "T4U", "Truck4U ID", 
              "Truck4U Number", "System ID"
            ]),

            // Présence Tablette
            presenceTablette: mapPresence(findValueWithDefault([
              "Présence Tablette", "Presence Tablette", "Tablette", "Tablet Present", 
              "Tablet", "MDT", "Terminal", "Device"
            ], "non")),

            // Type Tablette
            typeTablette: findValueWithDefault([
              "Type Tablette", "Type de Tablette", "Tablet Type", "Device Type", 
              "Modèle Tablette", "Tablet Model", "Terminal Type"
            ], "samsung").toLowerCase(),

            // IMEI
            imei: findValue([
              "IMEI", "IMEI Tablette", "IMEI Tablet", "Serial Number", 
              "Device ID", "Terminal IMEI", "SIM ID"
            ]),

            // Tablette Fonctionnelle
            fonctionnelle: mapStatus(findValueWithDefault([
              "Tablette Fonctionnelle", "Fonctionnelle", "Tablet Working", "Working", 
              "Functional", "Tablet OK", "Device OK", "Terminal OK"
            ], "non")),

            // Compatibilité
            compatibilite: mapCompatibility(findValueWithDefault([
              "Compatibilité", "Compatibilite", "Compatibility", "Compatible", 
              "System Compatibility", "Compat"
            ], "test_requis")),

            // DeliverUp
            deliverup: mapAppStatus(findValueWithDefault([
              "DeliverUp", "Deliver Up", "Application DeliverUp", "DeliverUp App", 
              "App DeliverUp", "DeliverUp Status", "Application"
            ], "non_installe")),

            // Applications Spécifiques
            applicationsSpecifiques: findValue([
              "Applications Spécifiques", "Applications Specifiques", "Apps Spécifiques", 
              "Specific Apps", "Other Apps", "Custom Apps", "Additional Apps"
            ]),

            // Raisons Non Installé
            raisonsNonInstalle: findValue([
              "Raisons Non Installé", "Raisons Non Installe", "Raisons", "Reasons", 
              "Install Issues", "Problems", "Blockers", "Issues"
            ]),

            // Caméra Cabine Telematics
            cameraCabineTelematics: mapMaterial(findValueWithDefault([
              "Caméra Cabine", "Camera Cabine", "Caméra", "Camera", "Cab Camera", 
              "Driver Camera", "Interior Camera", "Caméra Conducteur"
            ], "pas_besoin")),

            // Dashcam
            dashcam: mapMaterial(findValueWithDefault([
              "Dashcam", "Dash Cam", "Dashboard Camera", "Front Camera", 
              "Road Camera", "Caméra Route", "Caméra Avant"
            ], "pas_besoin")),

            // Numéro PDA
            numeroPDA: findValue([
              "N° PDA", "Numero PDA", "PDA", "PDA Number", "Handheld", 
              "Scanner", "Mobile Device", "Portable"
            ]),

            // Matériel Requis
            materielRequis: mapMaterialStatus(findValueWithDefault([
              "Matériel Requis", "Materiel Requis", "Matériel", "Material Required", 
              "Equipment", "Hardware", "Material Status", "Equipment Status"
            ], "complet")),

            // Tests OK
            testsOK: mapTestStatus(findValueWithDefault([
              "Tests OK", "Tests", "Test OK", "Testing", "Tests Status", 
              "Validation", "Vérification", "QC", "Quality Check"
            ], "non")),

            // Champ Action
            champAction: findValue([
              "Actions", "Champ Action", "Action", "Action Required", "Next Steps", 
              "Todo", "À Faire", "Action Items", "Work Required"
            ]),

            // Observations
            observations: findValue([
              "Observations", "Observation", "Commentaires", "Comments", "Notes", 
              "Remarks", "Description", "Details", "Additional Info", "Info"
            ]),
          };

          // Ignorer les lignes vides
          if (!truckData.numero && !truckData.modele) {
            continue;
          }

          const validatedData = insertTruckSchema.parse(truckData);
          await storage.createTruck(validatedData);
          imported++;
        } catch (error) {
          console.error("Erreur d'importation ligne:", error);
          errors++;
        }
      }

      res.json({
        message: `Import Google Sheet terminé: ${imported} camions importés, ${errors} erreurs`,
        imported,
        errors,
      });
    } catch (error) {
      console.error("Erreur import Google Sheet:", error);
      if (error.message?.includes('Unable to parse range')) {
        res.status(400).json({ message: "Nom de feuille invalide ou sheet introuvable" });
      } else if (error.message?.includes('The caller does not have permission')) {
        res.status(400).json({ message: "Google Sheet privé ou non accessible publiquement" });
      } else {
        res.status(500).json({ message: "Échec d'importation depuis Google Sheet" });
      }
    }
  });

  // Importer des camions depuis un fichier Excel
  app.post("/api/trucks/import", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier téléchargé" });
      }

      // Lire le fichier Excel
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let imported = 0;
      let errors = 0;

      for (const row of jsonData) {
        try {
          // Mapper les colonnes Excel vers notre schéma - ajuster ces mappings selon la structure Excel réelle
          const rowData = row as Record<string, any>;

          // Fonction pour trouver une valeur dans plusieurs colonnes possibles
          const findValue = (possibleColumns: string[]): string => {
            for (const col of possibleColumns) {
              if (rowData[col] !== undefined && rowData[col] !== null && String(rowData[col]).trim() !== "") {
                return String(rowData[col]).trim();
              }
            }
            return "";
          };

          const findValueWithDefault = (possibleColumns: string[], defaultValue: string): string => {
            const value = findValue(possibleColumns);
            return value || defaultValue;
          };

          const truckData = {
            // Numéro/Immatriculation du camion
            numero: findValue([
              "N° Camion", "Numero", "Numéro", "Immatriculation", "immatriculation", 
              "N°Camion", "Numero Camion", "Numéro Camion", "ID", "Camion", 
              "Plaque", "Registration", "Vehicle Number", "Truck Number"
            ]),

            // Modèle du camion
            modele: findValue([
              "Modèle", "Modele", "Modèle Camion", "Model", "Type", "Marque", 
              "Brand", "Vehicle Model", "Truck Model", "Make"
            ]),

            // Numéro DA
            numeroDA: findValue([
              "N° DA", "Numero DA", "Numéro DA", "DA", "N°DA", "Numero_DA", 
              "DA Number", "Document Authorization", "Authorization Number"
            ]),

            // Date DA
            dateDA: findValue([
              "Date DA", "Date_DA", "DA Date", "Date Authorization", 
              "Authorization Date", "Date du DA"
            ]),

            // DA Validé
            daValide: mapStatus(findValueWithDefault([
              "DA Validé", "DA Valide", "DA Validée", "DA_Valide", "DA Valid", 
              "Authorization Valid", "DA OK", "Validation DA", "DA Status"
            ], "na")),

            // Numéro CA
            numeroCA: findValue([
              "N° CA", "Numero CA", "Numéro CA", "CA", "N°CA", "Numero_CA", 
              "CA Number", "Contract Number", "Commande"
            ]),

            // Date CA
            dateCA: findValue([
              "Date CA", "Date_CA", "CA Date", "Contract Date", 
              "Date Commande", "Date du CA"
            ]),

            // Date Réception
            dateReception: findValue([
              "Date Réception", "Date Reception", "Date_Reception", "Reception Date", 
              "Delivery Date", "Date Livraison", "Date de Réception"
            ]),

            // Validation Réception
            validationReception: mapStatus(findValueWithDefault([
              "Validation Réception", "Validation Reception", "Reception Valid", 
              "Delivery Valid", "Réception OK", "Reception Status"
            ], "na")),

            // Installé par
            installePar: findValueWithDefault([
              "Installé par", "Installe par", "Technicien", "Installed by", 
              "Installer", "Tech", "Responsable Installation", "Intervenant"
            ], "technicien1"),

            // Date Installation
            dateInstallation: findValue([
              "Date Installation", "Date_Installation", "Installation Date", 
              "Date Pose", "Date de Pose", "Install Date"
            ]),

            // Paramétrage Réalisé
            parametrageRealise: mapStatus(findValueWithDefault([
              "Paramétrage Réalisé", "Parametrage Realise", "Paramétrage", "Configuration", 
              "Setup Done", "Config OK", "Paramètres", "Settings"
            ], "non")),

            // Localisation Fonctionnelle
            localisationFonctionnelle: findValue([
              "Localisation Fonctionnelle", "Localisation", "Location", "Site", 
              "Depot", "Agence", "Base", "Functional Location"
            ]),

            // Statut Conduite
            statutConduite: mapTruckStatus(findValueWithDefault([
              "Statut Conduite", "Status Conduite", "Driving Status", "Conduite", 
              "Drive Status", "Système Conduite", "Driving System"
            ], "test_requis")),

            // Téléchargement Mémoire Masse
            telechargementMemoireMasse: mapTruckStatus(findValueWithDefault([
              "Téléchargement Mémoire Masse", "Telechargement Memoire Masse", "Mémoire Masse", 
              "Memory Download", "Data Download", "Tachograph Download", "Tacho"
            ], "test_requis")),

            // Numéro Truck4U
            numeroTruck4U: findValue([
              "N° Truck4U", "Numero Truck4U", "Truck4U", "T4U", "Truck4U ID", 
              "Truck4U Number", "System ID"
            ]),

            // Présence Tablette
            presenceTablette: mapPresence(findValueWithDefault([
              "Présence Tablette", "Presence Tablette", "Tablette", "Tablet Present", 
              "Tablet", "MDT", "Terminal", "Device"
            ], "non")),

            // Type Tablette
            typeTablette: findValueWithDefault([
              "Type Tablette", "Type de Tablette", "Tablet Type", "Device Type", 
              "Modèle Tablette", "Tablet Model", "Terminal Type"
            ], "samsung").toLowerCase(),

            // IMEI
            imei: findValue([
              "IMEI", "IMEI Tablette", "IMEI Tablet", "Serial Number", 
              "Device ID", "Terminal IMEI", "SIM ID"
            ]),

            // Tablette Fonctionnelle
            fonctionnelle: mapStatus(findValueWithDefault([
              "Tablette Fonctionnelle", "Fonctionnelle", "Tablet Working", "Working", 
              "Functional", "Tablet OK", "Device OK", "Terminal OK"
            ], "non")),

            // Compatibilité
            compatibilite: mapCompatibility(findValueWithDefault([
              "Compatibilité", "Compatibilite", "Compatibility", "Compatible", 
              "System Compatibility", "Compat"
            ], "test_requis")),

            // DeliverUp
            deliverup: mapAppStatus(findValueWithDefault([
              "DeliverUp", "Deliver Up", "Application DeliverUp", "DeliverUp App", 
              "App DeliverUp", "DeliverUp Status", "Application"
            ], "non_installe")),

            // Applications Spécifiques
            applicationsSpecifiques: findValue([
              "Applications Spécifiques", "Applications Specifiques", "Apps Spécifiques", 
              "Specific Apps", "Other Apps", "Custom Apps", "Additional Apps"
            ]),

            // Raisons Non Installé
            raisonsNonInstalle: findValue([
              "Raisons Non Installé", "Raisons Non Installe", "Raisons", "Reasons", 
              "Install Issues", "Problems", "Blockers", "Issues"
            ]),

            // Caméra Cabine Telematics
            cameraCabineTelematics: mapMaterial(findValueWithDefault([
              "Caméra Cabine", "Camera Cabine", "Caméra", "Camera", "Cab Camera", 
              "Driver Camera", "Interior Camera", "Caméra Conducteur"
            ], "pas_besoin")),

            // Dashcam
            dashcam: mapMaterial(findValueWithDefault([
              "Dashcam", "Dash Cam", "Dashboard Camera", "Front Camera", 
              "Road Camera", "Caméra Route", "Caméra Avant"
            ], "pas_besoin")),

            // Numéro PDA
            numeroPDA: findValue([
              "N° PDA", "Numero PDA", "PDA", "PDA Number", "Handheld", 
              "Scanner", "Mobile Device", "Portable"
            ]),

            // Matériel Requis
            materielRequis: mapMaterialStatus(findValueWithDefault([
              "Matériel Requis", "Materiel Requis", "Matériel", "Material Required", 
              "Equipment", "Hardware", "Material Status", "Equipment Status"
            ], "complet")),

            // Tests OK
            testsOK: mapTestStatus(findValueWithDefault([
              "Tests OK", "Tests", "Test OK", "Testing", "Tests Status", 
              "Validation", "Vérification", "QC", "Quality Check"
            ], "non")),

            // Champ Action
            champAction: findValue([
              "Actions", "Champ Action", "Action", "Action Required", "Next Steps", 
              "Todo", "À Faire", "Action Items", "Work Required"
            ]),

            // Observations
            observations: findValue([
              "Observations", "Observation", "Commentaires", "Comments", "Notes", 
              "Remarks", "Description", "Details", "Additional Info", "Info"
            ]),
          };

          // Ignorer les lignes vides
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
      res.status(500).json({ message: "Échec d'importation des camions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}