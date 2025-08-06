import type { Express } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { storage } from "./storage";
import { insertTruckSchema, insertFilialeSchema, insertUtilisateurSchema, insertRoleSchema, insertPermissionSchema } from "@shared/schema";
import { z } from "zod";
import { authService } from "./auth";

const upload = multer({ storage: multer.memoryStorage() });

import { mapStatus, mapTruckStatus, mapPresence, mapCompatibility, mapAppStatus, mapMaterial, mapMaterialStatus, mapTestStatus } from "./utils/excel-mapper.js";

export function registerRoutes(app: Express) {
  // ===== ROUTES D'AUTHENTIFICATION =====
  
  // Connexion utilisateur
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }
      
      const user = await authService.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Identifiants invalides" });
      }
      
      const token = authService.generateToken(user.id);
      const permissions = await authService.getUserPermissions(user.id);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
        },
        token,
        permissions,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la connexion" });
    }
  });

  // Vérifier le token
  app.get("/api/auth/verify", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Token manquant" });
      }
      
      const user = await authService.authenticateToken(token);
      if (!user) {
        return res.status(401).json({ message: "Token invalide" });
      }
      
      const permissions = await authService.getUserPermissions(user.id);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
        },
        permissions,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de la vérification" });
    }
  });

  // ===== ROUTES POUR LES UTILISATEURS =====
  
  // Récupérer tous les utilisateurs
  app.get("/api/utilisateurs", async (req, res) => {
    try {
      const utilisateurs = await storage.getAllUtilisateurs();
      res.json(utilisateurs);
    } catch (error: any) {
      res.status(500).json({ message: "Échec de récupération des utilisateurs" });
    }
  });

  // Créer un utilisateur
  app.post("/api/utilisateurs", async (req, res) => {
    try {
      const validatedData = insertUtilisateurSchema.parse(req.body);
      
      // Hasher le mot de passe
      const hashedPassword = await authService.hashPassword(validatedData.motDePasse);
      
      const utilisateur = await storage.createUtilisateur({
        ...validatedData,
        motDePasse: hashedPassword,
      });
      
      res.status(201).json({
        id: utilisateur.id,
        email: utilisateur.email,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Échec de création de l'utilisateur" });
    }
  });

  // ===== ROUTES POUR LES RÔLES =====
  
  // Récupérer tous les rôles
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error: any) {
      res.status(500).json({ message: "Échec de récupération des rôles" });
    }
  });

  // Créer un rôle
  app.post("/api/roles", async (req, res) => {
    try {
      const validatedData = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(validatedData);
      res.status(201).json(role);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Échec de création du rôle" });
    }
  });

  // ===== ROUTES POUR LES PERMISSIONS =====
  
  // Récupérer les permissions d'un utilisateur
  app.get("/api/utilisateurs/:id/permissions", async (req, res) => {
    try {
      const permissions = await storage.getPermissionsByUtilisateur(req.params.id);
      res.json(permissions);
    } catch (error: any) {
      res.status(500).json({ message: "Échec de récupération des permissions" });
    }
  });

  // Attribuer une permission
  app.post("/api/permissions", async (req, res) => {
    try {
      const validatedData = insertPermissionSchema.parse(req.body);
      const permission = await storage.createPermission(validatedData);
      res.status(201).json(permission);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Échec d'attribution de la permission" });
    }
  });

  // ===== ROUTES POUR LES FILIALES =====
  
  // Récupérer toutes les filiales
  app.get("/api/filiales", async (req, res) => {
    try {
      const filiales = await storage.getAllFiliales();
      res.json(filiales);
    } catch (error) {
      res.status(500).json({ message: "Échec de récupération des filiales" });
    }
  });

  // Récupérer une filiale spécifique
  app.get("/api/filiales/:id", async (req, res) => {
    try {
      const filiale = await storage.getFiliale(req.params.id);
      if (!filiale) {
        return res.status(404).json({ message: "Filiale non trouvée" });
      }
      res.json(filiale);
    } catch (error) {
      res.status(500).json({ message: "Échec de récupération de la filiale" });
    }
  });

  // Créer une filiale
  app.post("/api/filiales", async (req, res) => {
    try {
      const validatedData = insertFilialeSchema.parse(req.body);
      const filiale = await storage.createFiliale(validatedData);
      res.status(201).json(filiale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Échec de création de la filiale" });
    }
  });

  // Mettre à jour une filiale
  app.patch("/api/filiales/:id", async (req, res) => {
    try {
      const partialSchema = insertFilialeSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const filiale = await storage.updateFiliale(req.params.id, validatedData);
      if (!filiale) {
        return res.status(404).json({ message: "Filiale non trouvée" });
      }
      res.json(filiale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Échec de mise à jour de la filiale" });
    }
  });

  // Supprimer une filiale
  app.delete("/api/filiales/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFiliale(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Filiale non trouvée" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Échec de suppression de la filiale" });
    }
  });

  // ===== ROUTES POUR LES CAMIONS =====

  // Récupérer tous les camions (optionnellement filtrés par filiale)
  app.get("/api/trucks", async (req, res) => {
    try {
      const filialeId = req.query.filialeId as string;
      const trucks = await storage.getAllTrucks(filialeId);
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
      const filialeId = req.query.filialeId as string;
      const trucks = await storage.searchTrucks(req.params.query, filialeId);
      res.json(trucks);
    } catch (error) {
      res.status(500).json({ message: "Échec de recherche des camions" });
    }
  });

  // ===== ROUTES D'IMPORT (avec filiale) =====

  // Importer des camions depuis un fichier Excel
  app.post("/api/trucks/import", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier téléchargé" });
      }

      const filialeId = req.body.filialeId;
      if (!filialeId) {
        return res.status(400).json({ message: "ID de filiale requis" });
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
          const rowData = row as Record<string, any>;

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
            filialeId: filialeId,
            numero: findValue([
              "N° Camion", "Numero", "Numéro", "Immatriculation", "immatriculation", 
              "N°Camion", "Numero Camion", "Numéro Camion", "ID", "Camion", 
              "Plaque", "Registration", "Vehicle Number", "Truck Number"
            ]),

            modele: findValue([
              "Modèle", "Modele", "Modèle Camion", "Model", "Type", "Marque", 
              "Brand", "Vehicle Model", "Truck Model", "Make"
            ]),

            numeroDA: findValue([
              "N° DA", "Numero DA", "Numéro DA", "DA", "N°DA", "Numero_DA", 
              "DA Number", "Document Authorization", "Authorization Number"
            ]),

            dateDA: findValue([
              "Date DA", "Date_DA", "DA Date", "Date Authorization", 
              "Authorization Date", "Date du DA"
            ]),

            daValide: mapStatus(findValueWithDefault([
              "DA Validé", "DA Valide", "DA Validée", "DA_Valide", "DA Valid", 
              "Authorization Valid", "DA OK", "Validation DA", "DA Status"
            ], "na")),

            numeroCA: findValue([
              "N° CA", "Numero CA", "Numéro CA", "CA", "N°CA", "Numero_CA", 
              "CA Number", "Contract Number", "Commande"
            ]),

            dateCA: findValue([
              "Date CA", "Date_CA", "CA Date", "Contract Date", 
              "Date Commande", "Date du CA"
            ]),

            dateReception: findValue([
              "Date Réception", "Date Reception", "Date_Reception", "Reception Date", 
              "Delivery Date", "Date Livraison", "Date de Réception"
            ]),

            validationReception: mapStatus(findValueWithDefault([
              "Validation Réception", "Validation Reception", "Reception Valid", 
              "Delivery Valid", "Réception OK", "Reception Status"
            ], "na")),

            installePar: findValueWithDefault([
              "Installé par", "Installe par", "Technicien", "Installed by", 
              "Installer", "Tech", "Responsable Installation", "Intervenant"
            ], "technicien1"),

            dateInstallation: findValue([
              "Date Installation", "Date_Installation", "Installation Date", 
              "Date Pose", "Date de Pose", "Install Date"
            ]),

            parametrageRealise: mapStatus(findValueWithDefault([
              "Paramétrage Réalisé", "Parametrage Realise", "Paramétrage", "Configuration", 
              "Setup Done", "Config OK", "Paramètres", "Settings"
            ], "non")),

            localisationFonctionnelle: findValue([
              "Localisation Fonctionnelle", "Localisation", "Location", "Site", 
              "Depot", "Agence", "Base", "Functional Location"
            ]),

            statutConduite: mapTruckStatus(findValueWithDefault([
              "Statut Conduite", "Status Conduite", "Driving Status", "Conduite", 
              "Drive Status", "Système Conduite", "Driving System"
            ], "test_requis")),

            telechargementMemoireMasse: mapTruckStatus(findValueWithDefault([
              "Téléchargement Mémoire Masse", "Telechargement Memoire Masse", "Mémoire Masse", 
              "Memory Download", "Data Download", "Tachograph Download", "Tacho"
            ], "test_requis")),

            numeroTruck4U: findValue([
              "N° Truck4U", "Numero Truck4U", "Truck4U", "T4U", "Truck4U ID", 
              "Truck4U Number", "System ID"
            ]),

            presenceTablette: mapPresence(findValueWithDefault([
              "Présence Tablette", "Presence Tablette", "Tablette", "Tablet Present", 
              "Tablet", "MDT", "Terminal", "Device"
            ], "non")),

            typeTablette: findValueWithDefault([
              "Type Tablette", "Type de Tablette", "Tablet Type", "Device Type", 
              "Modèle Tablette", "Tablet Model", "Terminal Type"
            ], "samsung").toLowerCase(),

            imei: findValue([
              "IMEI", "IMEI Tablette", "IMEI Tablet", "Serial Number", 
              "Device ID", "Terminal IMEI", "SIM ID"
            ]),

            fonctionnelle: mapStatus(findValueWithDefault([
              "Tablette Fonctionnelle", "Fonctionnelle", "Tablet Working", "Working", 
              "Functional", "Tablet OK", "Device OK", "Terminal OK"
            ], "non")),

            compatibilite: mapCompatibility(findValueWithDefault([
              "Compatibilité", "Compatibilite", "Compatibility", "Compatible", 
              "System Compatibility", "Compat"
            ], "test_requis")),

            deliverup: mapAppStatus(findValueWithDefault([
              "DeliverUp", "Deliver Up", "Application DeliverUp", "DeliverUp App", 
              "App DeliverUp", "DeliverUp Status", "Application"
            ], "non_installe")),

            applicationsSpecifiques: findValue([
              "Applications Spécifiques", "Applications Specifiques", "Apps Spécifiques", 
              "Specific Apps", "Other Apps", "Custom Apps", "Additional Apps"
            ]),

            raisonsNonInstalle: findValue([
              "Raisons Non Installé", "Raisons Non Installe", "Raisons", "Reasons", 
              "Install Issues", "Problems", "Blockers", "Issues"
            ]),

            cameraCabineTelematics: mapMaterial(findValueWithDefault([
              "Caméra Cabine", "Camera Cabine", "Caméra", "Camera", "Cab Camera", 
              "Driver Camera", "Interior Camera", "Caméra Conducteur"
            ], "pas_besoin")),

            dashcam: mapMaterial(findValueWithDefault([
              "Dashcam", "Dash Cam", "Dashboard Camera", "Front Camera", 
              "Road Camera", "Caméra Route", "Caméra Avant"
            ], "pas_besoin")),

            numeroPDA: findValue([
              "N° PDA", "Numero PDA", "PDA", "PDA Number", "Handheld", 
              "Scanner", "Mobile Device", "Portable"
            ]),

            materielRequis: mapMaterialStatus(findValueWithDefault([
              "Matériel Requis", "Materiel Requis", "Matériel", "Material Required", 
              "Equipment", "Hardware", "Material Status", "Equipment Status"
            ], "complet")),

            testsOK: mapTestStatus(findValueWithDefault([
              "Tests OK", "Tests", "Test OK", "Testing", "Tests Status", 
              "Validation", "Vérification", "QC", "Quality Check"
            ], "non")),

            champAction: findValue([
              "Actions", "Champ Action", "Action", "Action Required", "Next Steps", 
              "Todo", "À Faire", "Action Items", "Work Required"
            ]),

            observations: findValue([
              "Observations", "Observation", "Commentaires", "Comments", "Notes", 
              "Remarks", "Description", "Details", "Additional Info", "Info"
            ]),
          };

          // Ignorer les lignes vides
          if (!truckData.numero && !truckData.modele) {
            continue;
          }

          // S'assurer que les champs obligatoires ont des valeurs par défaut
          if (!truckData.numero) {
            truckData.numero = `CAMION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          }
          if (!truckData.modele) {
            truckData.modele = "Modèle non spécifié";
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