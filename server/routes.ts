import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import * as XLSX from "xlsx";

import { storage as dbStorage } from "./storage.js";
import { insertTruckSchema, insertFilialeSchema } from "../shared/schema.js";
import { z } from "zod";
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import type { Request, Response, NextFunction } from 'express';

// Get the current directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import des contrôleurs
import { userController } from './controllers/user.controller.js';
import { roleController } from './controllers/role.controller.js';
import { dashboardController } from './controllers/dashboard.controller.js';
import { managerController } from './controllers/manager.controller.js';
import { auditController } from './controllers/audit.controller.js';
import { isAuthenticated, isAdmin, isManager, loadUserPermissions } from './middleware/auth.middleware.js';

// Configuration pour le stockage des fichiers uploadés
const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');

// Créer le dossier de destination s'il n'existe pas
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

// Types pour les requêtes Express avec utilisateur authentifié
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roleId: string;
        isAdmin: boolean;
        isManager: boolean;
        permissions?: Record<string, boolean>;
      };
    }
  }
}

// Configuration du stockage pour les fichiers uploadés
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

// Configuration de multer pour le téléchargement de fichiers
const upload = multer({ 
  storage: fileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Seuls les fichiers JPG, PNG et GIF sont acceptés.'));
    }
  }
});

// Middleware pour gérer les erreurs de multer
const handleMulterError = (err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'La taille du fichier dépasse la limite autorisée (5MB)' });
    }
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

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
  const httpServer = createServer(app);
  
  // Middleware d'authentification global pour les routes API
  app.use('/api', isAuthenticated);
  app.use('/api', loadUserPermissions);
  
  // Routes d'authentification (publiques)
  app.post('/api/auth/register', userController.createUser);
  
  // Routes protégées pour les utilisateurs
  app.get('/api/users/me', userController.getMyProfile);
  app.put('/api/users/me/password', userController.updateMyPassword);
  
  // Routes protégées pour les administrateurs
  app.get('/api/admin/users', isAdmin, userController.getAllUsers);
  app.get('/api/admin/users/:id', isAdmin, userController.getUserById);
  app.put('/api/admin/users/:id', isAdmin, userController.updateUser);
  app.delete('/api/admin/users/:id', isAdmin, userController.deactivateUser);
  
  // Routes pour la gestion des rôles (admin uniquement)
  app.get('/api/admin/roles', isAdmin, roleController.getAllRoles);
  app.post('/api/admin/roles', isAdmin, roleController.createRole);
  app.get('/api/admin/roles/:id', isAdmin, roleController.getRoleById);
  app.put('/api/admin/roles/:id', isAdmin, roleController.updateRole);
  app.delete('/api/admin/roles/:id', isAdmin, roleController.deactivateRole);
  
  // Routes pour le tableau de bord d'administration
  app.get('/api/dashboard/stats', isAdmin, dashboardController.getDashboardStats);
  app.get('/api/dashboard/stats/features', isAdmin, dashboardController.getFeatureUsageStats);
  app.get('/api/dashboard/stats/roles', isAdmin, dashboardController.getRoleUsageStats);
  app.get('/api/dashboard/activity/users', isAdmin, dashboardController.getUserActivity);
  
  // Routes pour les fonctionnalités du gestionnaire
  app.get('/api/manager/features', isManager, managerController.getAllFeatures);
  app.post('/api/manager/features/toggle', isManager, managerController.toggleFeature);
  app.post('/api/manager/permissions/assign', isManager, managerController.assignFeatureToRole);
  app.put('/api/manager/roles/:roleId/permissions', isManager, managerController.updateRolePermissions);
  app.get('/api/manager/roles/:roleId/permissions', isManager, managerController.getRolePermissions);
  app.get('/api/manager/roles/:roleId/users', isManager, managerController.getUsersByRole);
  
  // Routes pour les journaux d'audit (admin uniquement)
  app.get('/api/audit/logs', isAdmin, auditController.getAuditLogs);
  app.get('/api/audit/stats', isAdmin, auditController.getAuditStats);
  
  // Route pour l'upload d'avatar
  app.post('/api/users/upload-avatar', upload.single('avatar'), handleMulterError, async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier téléchargé' });
      }

      // Ici, vous pourriez ajouter une logique pour sauvegarder le chemin du fichier dans la base de données
      // Par exemple: await storage.updateUserAvatar(req.body.userId, req.file.filename);
      
      // Retourner l'URL de l'avatar (à adapter selon votre configuration de serveur)
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      
      res.status(200).json({ 
        success: true, 
        avatarUrl,
        message: 'Photo de profil mise à jour avec succès.'
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'avatar:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Une erreur est survenue lors du téléchargement de la photo de profil.'
      });
    }
  });
  
  // Route pour mettre à jour les informations du profil utilisateur
  app.patch('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Ici, vous pourriez ajouter une validation des données avec Zod
      // Par exemple: const validatedData = userUpdateSchema.parse(updateData);
      
      // Mettre à jour l'utilisateur dans la base de données
      // const updatedUser = await storage.updateUser(id, validatedData);
      
      // Pour l'instant, on simule une mise à jour réussie
      res.status(200).json({
        success: true,
        message: 'Profil mis à jour avec succès',
        user: { id, ...updateData }
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      res.status(500).json({
        success: false,
        error: 'Une erreur est survenue lors de la mise à jour du profil.'
      });
    }
  });

  // ===== ROUTES POUR LES CAMIONS =====
  
  // Récupérer tous les camions
  app.get("/api/trucks", async (req, res) => {
    try {
      const { filialeId } = req.query;
      const trucks = await dbStorage.getAllTrucks(filialeId as string | undefined);
      
      // Récupérer toutes les filiales pour le mapping
      const filiales = await dbStorage.getAllFiliales();
      const filialeMap = new Map(filiales.map(f => [f.id, f.nom]));
      
      // Formater les données pour correspondre au format attendu par le frontend
      const formattedTrucks = trucks.map(truck => {
        // Déterminer le statut en fonction des champs disponibles
        let status = 'Inactif';
        if (truck.statutConduite === 'fonctionnel' && truck.testsOK === 'oui') {
          status = 'Actif';
        } else if (truck.statutConduite === 'non_fonctionnel' || truck.testsOK === 'non') {
          status = 'En maintenance';
        }
        
        return {
          id: truck.id,
          numero: truck.immatriculation, // Utiliser immatriculation
          filiale: filialeMap.get(truck.filialeId) || truck.filialeId, // Nom de la filiale si disponible, sinon ID
          marque: truck.modele ? truck.modele.split(' ')[0] : 'Inconnue', // Extraire la marque du modèle
          modele: truck.modele || 'Modèle inconnu',
          status: status
        };
      });
      
      res.json(formattedTrucks);
    } catch (error) {
      console.error("Erreur lors de la récupération des camions :", error);
      res.status(500).json({ error: "Erreur serveur lors de la récupération des camions" });
    }
  });

  // ===== ROUTES POUR LES FILIALES =====
  
  // Récupérer toutes les filiales
  app.get("/api/filiales", async (_req, res) => {
    try {
      const filiales = await dbStorage.getAllFiliales();
      res.json(filiales);
    } catch (error) {
      console.error("Erreur lors de la récupération des filiales :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Récupérer une filiale spécifique
  app.get("/api/filiales/:id", async (req, res) => {
    try {
      const filiale = await dbStorage.getFiliale(req.params.id);
      if (!filiale) {
        return res.status(404).json({ message: "Filiale non trouvée" });
      }
      res.json(filiale);
    } catch (error) {
      res.status(500).json({ message: "Échec de récupération de la filiale" });
    }
  });

  // Mettre à jour une filiale existante
  app.put("/api/filiales/:id", async (req, res) => {
    try {
      const updatedFiliale = await dbStorage.updateFiliale(req.params.id, req.body);
      if (!updatedFiliale) {
        return res.status(404).json({ message: "Filiale non trouvée" });
      }
      res.json(updatedFiliale);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la filiale :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Créer une nouvelle filiale
  app.post("/api/filiales", async (req, res) => {
    try {
      const validatedData = insertFilialeSchema.parse(req.body);
      const newFiliale = await dbStorage.createFiliale(validatedData);
      res.status(201).json(newFiliale);
    } catch (error) {
      console.error("Erreur lors de la création de la filiale :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Supprimer une filiale
  app.delete("/api/filiales/:id", async (req, res) => {
    try {
      const success = await dbStorage.deleteFiliale(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Filiale non trouvée" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Erreur lors de la suppression de la filiale :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ===== ROUTES POUR LES CAMIONS =====

  // Récupérer tous les camions (optionnellement filtrés par filiale)
  app.get("/api/trucks", async (_req, res) => {
    try {
      const trucks = await dbStorage.getAllTrucks();
      res.json(trucks);
    } catch (error) {
      console.error("Erreur lors de la récupération des camions :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Récupérer un camion spécifique
  app.get("/api/trucks/:id", async (req, res) => {
    try {
      const truck = await dbStorage.getTruck(req.params.id);
      if (!truck) {
        return res.status(404).json({ message: "Camion non trouvé" });
      }
      res.json(truck);
    } catch (error) {
      console.error("Erreur lors de la récupération du camion :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Créer un camion
  app.post("/api/trucks", async (req, res) => {
    console.log('🔵 POST /api/trucks - Données reçues:', JSON.stringify(req.body, null, 2));
    
    try {
      // Valider les données avec le schéma
      const validatedData = insertTruckSchema.parse(req.body);
      console.log('✅ Données validées avec succès');
      
      // Créer le camion
      const truck = await dbStorage.createTruck(validatedData);
      console.log('✅ Camion créé avec succès:', truck.id);
      
      // Répondre avec succès
      res.status(201).json({
        success: true,
        message: 'Camion créé avec succès',
        data: truck
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de la création du camion:', error);
      
      // Gestion des erreurs de validation Zod
      if (error instanceof z.ZodError) {
        const errorDetails = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        console.error('❌ Erreur de validation:', errorDetails);
        return res.status(400).json({ 
          success: false,
          message: "Données invalides",
          errors: errorDetails
        });
      }
      
      // Gestion des autres erreurs
      res.status(500).json({ 
        success: false,
        message: "Erreur serveur lors de la création du camion",
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  });

  // Mettre à jour un camion
  app.patch("/api/trucks/:id", async (req, res) => {
    try {
      const partialSchema = insertTruckSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const truck = await dbStorage.updateTruck(req.params.id, validatedData);
      if (!truck) {
        return res.status(404).json({ message: "Camion non trouvé" });
      }
      res.json(truck);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      console.error("Erreur lors de la mise à jour du camion :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Supprimer un camion
  app.delete("/api/trucks/:id", async (req, res) => {
    try {
      const deleted = await dbStorage.deleteTruck(req.params.id);
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
      const trucks = await dbStorage.searchTrucks(req.params.query, filialeId);
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
            immatriculation: findValue([
              "Immatriculation", "immatriculation", "N° Camion", "Numero", "Numéro", 
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
          if (!truckData.immatriculation && !truckData.modele) {
            continue;
          }

          // S'assurer que les champs obligatoires ont des valeurs par défaut
          if (!truckData.immatriculation) {
            truckData.immatriculation = `IMMAT_${Date.now().toString(36).toUpperCase().substr(4, 6)}`;
          }
          if (!truckData.modele) {
            truckData.modele = "Modèle non spécifié";
          }

          const validatedData = insertTruckSchema.parse(truckData);
          await dbStorage.createTruck(validatedData);
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

  // Nouvelle route d'import Excel avec mappage des champs
  app.post("/api/trucks/import-with-mapping", upload.single("file"), async (req, res) => {
    console.log('🔵 POST /api/trucks/import-with-mapping - Début du traitement');
    
    try {
      if (!req.file) {
        console.error('❌ Aucun fichier téléchargé');
        return res.status(400).json({ 
          success: false,
          message: "Aucun fichier téléchargé" 
        });
      }

      console.log(`📂 Fichier reçu: ${req.file.originalname} (${req.file.size} octets)`);
      
      // Parser le mappage des champs
      let fieldMapping;
      try {
        fieldMapping = JSON.parse(req.body.fieldMapping || '{}');
        console.log('🔍 Mappage des champs:', JSON.stringify(fieldMapping, null, 2));
      } catch (e) {
        console.error('❌ Erreur de parsing du mappage des champs:', e);
        return res.status(400).json({ 
          success: false,
          message: "Format de mappage des champs invalide" 
        });
      }
      
      // Validation du mappage des champs obligatoires
      if (!fieldMapping.numero) {
        console.error('❌ Champ obligatoire non mappé: numero');
        return res.status(400).json({ 
          success: false,
          message: "Le mappage du champ 'numero' est obligatoire" 
        });
      }

      // Lire le fichier Excel
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let processed = 0;
      let inserted = 0;
      let updated = 0;
      let failed = 0;
      const errors: Array<{ row: number; error: string }> = [];

      for (let i = 0; i < jsonData.length; i++) {
        try {
          const rowData = jsonData[i] as Record<string, any>;
          processed++;

          // Fonction pour extraire la valeur mappée
          const getMappedValue = (fieldKey: string): string => {
            const columnName = fieldMapping[fieldKey];
            if (!columnName || !rowData[columnName]) return "";
            return String(rowData[columnName]).trim();
          };

          // Extraire les données selon le mappage
          const numero = getMappedValue('numero');
          if (!numero) {
            errors.push({ row: i + 1, error: "Numéro de camion manquant" });
            failed++;
            continue;
          }

          // Gérer la filiale - soit mappée, soit par défaut
          let filialeId = getMappedValue('filiale');
          if (!filialeId) {
            // Si pas de mappage de filiale, essayer de trouver une filiale par défaut
            const allFiliales = await dbStorage.getAllFiliales();
            const defaultFiliale = allFiliales.length > 0 ? allFiliales[0] : null;
            if (!defaultFiliale) {
              errors.push({ row: i + 1, error: "Aucune filiale trouvée ou mappée" });
              failed++;
              continue;
            }
            filialeId = defaultFiliale.id;
          } else {
            // Vérifier si la filiale existe
            const filiale = await dbStorage.getFilialeByCode(filialeId);
            if (filiale) {
              filialeId = filiale.id;
            } else {
              // Créer une nouvelle filiale si elle n'existe pas
              const newFiliale = await dbStorage.createFiliale({
                nom: filialeId,
                code: filialeId.toLowerCase().replace(/\s+/g, '_'),
                actif: true,
                adresse: "",
                telephone: "",
                email: ""
              });
              filialeId = newFiliale.id;
            }
          }

          const truckData = {
            filialeId,
            numero,
            modele: getMappedValue('modele') || "",
            imei: getMappedValue('imei') || "",
            numeroTruck4U: getMappedValue('numeroTruck4U') || "",
            statutConduite: mapTruckStatus(getMappedValue('statutConduite') || "test_requis"),
            equipement: mapStatus(getMappedValue('equipement') || "na"),
            compatibilite: mapCompatibility(getMappedValue('compatibilite') || "test_requis"),
            deliverup: mapAppStatus(getMappedValue('deliverup') || "non_installe"),
            testsOK: mapTestStatus(getMappedValue('testsOK') || "non"),
            commentaires: getMappedValue('commentaires') || "",
            
            // Champs avec valeurs par défaut
            numeroDA: "",
            dateDA: "",
            daValide: "na",
            numeroCA: "",
            dateCA: "",
            dateReception: "",
            validationReception: "na",
            installePar: "technicien1",
            dateInstallation: "",
            parametrageRealise: "non",
            localisationFonctionnelle: "",
            telechargementMemoireMasse: "test_requis",
            presenceTablette: "non",
            typeTablette: "standard",
            modeleTablette: "",
            numeroSerieTablette: "",
            versionLogicielTablette: "",
            compatibiliteTablette: "test_requis",
            installationDeliverupTablette: "non_installe",
            testsTablette: "non",
            presenceCamera: "non",
            typeCamera: "",
            modeleCamera: "",
            numeroSerieCamera: "",
            compatibiliteCamera: "test_requis",
            installationDeliverupCamera: "non_installe",
            testsCamera: "non",
            presenceMaterielComplementaire: "non",
            typeMaterielComplementaire: "",
            modeleMaterielComplementaire: "",
            numeroSerieMaterielComplementaire: "",
            compatibiliteMaterielComplementaire: "test_requis",
            installationDeliverupMaterielComplementaire: "non_installe",
            testsMaterielComplementaire: "non",
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Vérifier si le camion existe déjà
          const immatriculation = getMappedValue('immatriculation') || getMappedValue('numero');
          if (!immatriculation) {
            throw new Error("Immatriculation manquante");
          }
          
          // S'assurer que l'immatriculation est définie dans truckData
          const truckDataWithImmatriculation = {
            ...truckData,
            immatriculation: immatriculation
          };
          
          const existingTruck = await dbStorage.getTruckByImmatriculation(immatriculation, truckData.filialeId);
          
          if (existingTruck) {
            // Mettre à jour le camion existant
            await dbStorage.updateTruck(existingTruck.id, truckDataWithImmatriculation);
            updated++;
          } else {
            // Créer un nouveau camion
            await dbStorage.createTruck(truckDataWithImmatriculation);
            inserted++;
          }

        } catch (error) {
          console.error(`Erreur ligne ${i + 1}:`, error);
          errors.push({ 
            row: i + 1, 
            error: error instanceof Error ? error.message : "Erreur inconnue" 
          });
          failed++;
        }
      }

      res.json({
        success: true,
        message: `Import terminé: ${inserted} créés, ${updated} mis à jour, ${failed} échecs`,
        processed,
        inserted,
        updated,
        failed,
        errors: errors.slice(0, 10) // Limiter à 10 erreurs pour éviter une réponse trop lourde
      });

    } catch (error) {
      console.error("Erreur d'import Excel:", error);
      res.status(500).json({ 
        message: "Erreur lors de l'import Excel",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });

  // Importer des camions depuis Google Sheets
  app.post("/api/trucks/import-google-sheet", async (req, res) => {
    // S'assurer que la réponse est toujours en JSON
    res.setHeader('Content-Type', 'application/json');
    
    console.log('🔵 POST /api/trucks/import-google-sheet - Début du traitement');
    console.log('📡 Données reçues:', JSON.stringify(req.body, null, 2));
    
    try {
      // Accepter à la fois sheetUrl (pour rétrocompatibilité) et spreadsheetUrl
      const { spreadsheetUrl, sheetUrl, sheetName } = req.body;
      
      // Utiliser spreadsheetUrl en priorité, sinon sheetUrl pour la rétrocompatibilité
      const effectiveSpreadsheetUrl = spreadsheetUrl || sheetUrl;
      
      if (!effectiveSpreadsheetUrl) {
        console.error('❌ Aucune URL de feuille Google Sheets fournie');
        return res.status(400).json({ 
          success: false,
          message: "URL de la feuille Google Sheets requise (spreadsheetUrl ou sheetUrl)" 
        });
      }
      
      console.log(`🌐 URL de la feuille: ${effectiveSpreadsheetUrl}`);
      if (sheetName) {
        console.log(`📋 Nom de l'onglet spécifié: ${sheetName}`);
      }

      // Convertir l'URL Google Sheets en URL CSV exportable
      let csvUrl = effectiveSpreadsheetUrl;
      
      // Si c'est une URL Google Sheets normale, la convertir en URL CSV
      if (effectiveSpreadsheetUrl.includes('docs.google.com/spreadsheets')) {
        const match = effectiveSpreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (match) {
          const spreadsheetId = match[1];
          const gid = sheetName || '0'; // Utiliser le nom de feuille ou 0 par défaut
          csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
          console.log('Converted to CSV URL:', csvUrl);
        } else {
          console.log('Failed to extract spreadsheet ID from URL');
          return res.status(400).json({
            success: false,
            message: "URL Google Sheets invalide. Vérifiez que l'URL est correcte."
          });
        }
      }

      // Récupérer les données CSV depuis Google Sheets
      console.log('Fetching CSV data from:', csvUrl);
      const response = await fetch(csvUrl);
      console.log('CSV fetch response status:', response.status);
      
      if (!response.ok) {
        console.log('Failed to fetch CSV data:', response.status, response.statusText);
        return res.status(400).json({
          success: false,
          message: `Erreur lors de la récupération des données Google Sheets (${response.status}). Vérifiez que la feuille est publique et accessible.`
        });
      }

      const csvData = await response.text();
      
      // Convertir CSV en JSON en utilisant XLSX
      const workbook = XLSX.read(csvData, { type: 'string' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        return res.status(400).json({ message: "Aucune donnée trouvée dans la feuille Google Sheets" });
      }

      let imported = 0;
      let errors = 0;

      // Traiter chaque ligne comme dans l'import Excel
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

          // Récupérer l'immatriculation (champ obligatoire)
          const immatriculation = findValue(["Immatriculation", "immatriculation", "Plaque", "plaque", "License", "license"]);
          if (!immatriculation) {
            console.log("Ligne ignorée - pas d'immatriculation:", rowData);
            continue;
          }

          // Chercher ou créer la filiale
          const filialeNom = findValue(["Filiale", "filiale", "Société", "société", "Company", "company"]) || "Défaut";
          let filiale = await dbStorage.getFilialeByCode(filialeNom);
          if (!filiale) {
            filiale = await dbStorage.createFiliale({ 
              nom: filialeNom,
              code: filialeNom.toUpperCase().replace(/\s+/g, '_'),
              actif: true 
            });
          }

          const truckData = {
            immatriculation,
            filialeId: filiale.id,
            marque: findValue(["Marque", "marque", "Brand", "brand"]),
            modele: findValue(["Modele", "modèle", "Model", "model"]),
            // immatriculation déjà définie plus haut
            status: mapStatus(findValue(["Status", "status", "Statut", "statut", "État", "état"])),
            truckStatus: mapTruckStatus(findValue(["TruckStatus", "truckstatus", "StatutCamion", "statut_camion"])),
            presence: mapPresence(findValue(["Presence", "présence", "Présent", "présent"])),
            compatibility: mapCompatibility(findValue(["Compatibility", "compatibilité", "Compatible", "compatible"])),
            appStatus: mapAppStatus(findValue(["AppStatus", "appstatus", "StatutApp", "statut_app"])),
            material: mapMaterial(findValue(["Material", "matériel", "Matériel", "material"])),
            materialStatus: mapMaterialStatus(findValue(["MaterialStatus", "materialstatus", "StatutMatériel", "statut_matériel"])),
            testStatus: mapTestStatus(findValue(["TestStatus", "teststatus", "StatutTest", "statut_test"])),
            notes: findValue(["Notes", "notes", "Commentaires", "commentaires", "Remarks", "remarks"]),
            updatedAt: new Date()
          };

          // Vérifier si le camion existe déjà
          const existingTruck = await dbStorage.getTruckByImmatriculation(truckData.immatriculation, truckData.filialeId);
          
          if (existingTruck) {
            await dbStorage.updateTruck(existingTruck.id, truckData);
          } else {
            await dbStorage.createTruck(truckData);
          }
          imported++;

        } catch (error) {
          console.error("Erreur lors du traitement d'une ligne:", error);
          errors++;
        }
      }

      res.json({
        success: true,
        message: `Import Google Sheets réussi: ${imported} camions traités, ${errors} erreurs`,
        imported,
        errors
      });

    } catch (error) {
      console.error("Erreur d'import Google Sheets:", error);
      res.status(500).json({ 
        success: false,
        message: "Erreur lors de l'import Google Sheets",
        error: error instanceof Error ? error.message : "Erreur inconnue",
        imported: 0,
        errors: 1
      });
    }
  });

  // Export Excel endpoint
  app.get('/api/trucks/export', async (req, res) => {
    try {
      console.log('🔄 Starting Excel export...');
      
      const trucks = await dbStorage.getAllTrucks();
      console.log(`📊 Found ${trucks.length} trucks to export`);

      // Créer un nouveau workbook
      const XLSX = require('xlsx');
      const workbook = XLSX.utils.book_new();

      // Préparer les données pour l'export
      const exportData = trucks.map((truck: any) => ({
        'Numéro': truck.numero || '',
        'Filiale': truck.filialeId || '',
        'Marque': truck.marque || '',
        'Modèle': truck.modele || '',
        'Immatriculation': truck.immatriculation || truck.numero || '',
        'Statut': truck.status || 'Actif',
        'Date de création': truck.dateCreation ? new Date(truck.dateCreation).toLocaleDateString('fr-FR') : '',
        'Dernière modification': truck.dateModification ? new Date(truck.dateModification).toLocaleDateString('fr-FR') : ''
      }));

      // Créer la feuille de calcul
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Ajuster la largeur des colonnes
      const columnWidths = [
        { wch: 15 }, // Numéro
        { wch: 20 }, // Filiale
        { wch: 15 }, // Marque
        { wch: 20 }, // Modèle
        { wch: 15 }, // Immatriculation
        { wch: 12 }, // Statut
        { wch: 15 }, // Date de création
        { wch: 15 }  // Dernière modification
      ];
      worksheet['!cols'] = columnWidths;

      // Ajouter la feuille au workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Camions');

      // Générer le buffer Excel
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Définir les headers pour le téléchargement
      const filename = `camions_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Length', buffer.length);

      console.log(`✅ Export completed: ${trucks.length} trucks exported to ${filename}`);
      res.send(buffer);

    } catch (error) {
      console.error('❌ Export error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'export Excel',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  });

  // Route pour l'upload d'avatar
  app.post('/api/users/upload-avatar', upload.single('avatar'), handleMulterError, async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier téléchargé' });
      }

      const userId = req.body.userId;
      if (!userId) {
        return res.status(400).json({ error: 'ID utilisateur manquant' });
      }

      // Construire l'URL de l'avatar
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      // Ici, vous devriez mettre à jour l'utilisateur dans votre base de données avec le nouvel avatarUrl
      // Par exemple: await dbStorage.updateUserAvatar(userId, avatarUrl);
      
      console.log(`Avatar uploaded for user ${userId}: ${avatarUrl}`);
      
      res.json({
        success: true,
        avatarUrl,
        message: 'Avatar téléchargé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'avatar:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors du téléchargement de l\'avatar',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  });

  return httpServer;
}