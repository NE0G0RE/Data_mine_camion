import type { Request, Response } from 'express';
import { z } from 'zod';
import { getDb } from '../db.js';
import { users, utilisateurs, type Utilisateur, type NewUtilisateur } from '../../shared/schema/user.schema.js';
import { roles } from '../../shared/schema/role.schema.js';
import { userRoles, type NewUserRole } from '../../shared/schema/user-role.schema.js';
import { and, eq, sql } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { featureService } from '../services/feature.service.js';
import crypto from 'crypto';

// Schémas de validation avec Zod
const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  nom: z.string().min(1, 'Le nom est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
  telephone: z.string().optional(),
  photoProfil: z.string().optional(),
  actif: z.boolean().default(true),
  roleIds: z.array(z.string().uuid('ID de rôle invalide')).optional(),
});

const updateUserSchema = createUserSchema
  .omit({ motDePasse: true })
  .extend({
    motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional(),
    currentPassword: z.string().optional(),
  });

/**
 * Contrôleur pour la gestion des utilisateurs
 */
class UserController {
  /**
   * Récupère le profil de l'utilisateur connecté
   */
  async getMyProfile(req: Request, res: Response) {
    try {
      // Vérifier si l'utilisateur est connecté
      if (!req.user) {
        return res.status(401).json({ message: 'Non autorisé' });
      }

      const db = getDb();
      
      // Récupérer les informations de base de l'utilisateur
      const user = await db.query.utilisateurs.findFirst({
        where: (utilisateurs, { eq }) => eq(utilisateurs.id, req.user!.id),
        with: {
          role: {
            columns: {
              id: true,
              nom: true,
              description: true,
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Ne pas renvoyer le mot de passe
      const { motDePasse, ...userWithoutPassword } = user;

      res.json({
        ...userWithoutPassword,
        isAdmin: user.role?.nom === 'admin',
        isManager: user.role?.nom === 'manager'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * Met à jour le mot de passe de l'utilisateur connecté
   */
  async updateMyPassword(req: Request, res: Response) {
    try {
      // Vérifier si l'utilisateur est connecté
      if (!req.user) {
        return res.status(401).json({ message: 'Non autorisé' });
      }

      const { currentPassword, newPassword } = req.body as {
        currentPassword: string;
        newPassword: string;
      };

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Les mots de passe actuels et nouveaux sont requis' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
      }

      const db = getDb();
      
      // Récupérer l'utilisateur avec son mot de passe actuel
      const user = await db.query.utilisateurs.findFirst({
        where: (utilisateurs, { eq }) => eq(utilisateurs.id, req.user!.id)
      });

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Vérifier le mot de passe actuel
      const isPasswordValid = await bcrypt.compare(currentPassword, user.motDePasse);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Mettre à jour le mot de passe
      await db.update(utilisateurs)
        .set({ 
          motDePasse: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(utilisateurs.id, req.user!.id));

      res.json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * Récupère tous les utilisateurs (admin seulement)
   */
  async getAllUsers(_req: Request, res: Response) {
    try {
      const db = await getDb();
      
      const users = await db.query.utilisateurs.findMany({
        with: {
          role: {
            columns: {
              id: true,
              nom: true,
              description: true,
            }
          }
        },
        orderBy: (utilisateurs, { asc }) => [asc(utilisateurs.nom), asc(utilisateurs.prenom)]
      });

      // Ne pas renvoyer les mots de passe
      const usersWithoutPasswords = users.map(({ motDePasse, ...user }) => ({
        ...user,
        isAdmin: user.role?.nom === 'admin',
        isManager: user.role?.nom === 'manager'
      }));

      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * Récupère un utilisateur par son ID (admin seulement)
   */
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const db = await getDb();
      
      const user = await db.query.utilisateurs.findFirst({
        where: (utilisateurs, { eq }) => eq(utilisateurs.id, id),
        with: {
          role: {
            columns: {
              id: true,
              nom: true,
              description: true,
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Ne pas renvoyer le mot de passe
      const { motDePasse, ...userWithoutPassword } = user;

      res.json({
        ...userWithoutPassword,
        isAdmin: user.role?.nom === 'admin',
        isManager: user.role?.nom === 'manager'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * Met à jour un utilisateur (admin seulement)
   */
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userData = req.body as {
        email: string;
        nom: string;
        prenom: string;
        telephone?: string;
        photoProfil?: string;
        actif: boolean;
        roleIds?: string[];
      };

      // Valider les données
      const validation = updateUserSchema.safeParse(userData);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Données utilisateur invalides',
          errors: validation.error.errors,
        });
      }

      const db = await getDb();
      
      // Vérifier si l'utilisateur existe
      const existingUser = await db.query.utilisateurs.findFirst({
        where: (utilisateurs, { eq }) => eq(utilisateurs.id, id)
      });

      if (!existingUser) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Mettre à jour l'utilisateur
      await db.update(utilisateurs)
        .set({
          email: userData.email,
          nom: userData.nom,
          prenom: userData.prenom,
          telephone: userData.telephone || null,
          photoProfil: userData.photoProfil || null,
          actif: userData.actif,
          updatedAt: new Date()
        })
        .where(eq(utilisateurs.id, id));

      // Mettre à jour les rôles si fournis
      if (userData.roleIds) {
        // Supprimer les rôles existants
        await db.delete(userRoles).where(eq(userRoles.userId, id));
        
        // Ajouter les nouveaux rôles
        if (userData.roleIds.length > 0) {
          const newUserRoles: NewUserRole[] = userData.roleIds.map(roleId => ({
            userId: id,
            roleId,
            dateAttribution: new Date(),
            attribuePar: req.user?.id || 'system',
            isActive: true
          }));
          
          await db.insert(userRoles).values(newUserRoles);
        }
      }

      res.json({ success: true, message: 'Utilisateur mis à jour avec succès' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * Désactive un utilisateur (admin seulement)
   */
  async deactivateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (id === req.user?.id) {
        return res.status(400).json({ message: 'Vous ne pouvez pas désactiver votre propre compte' });
      }

      const db = await getDb();
      
      // Vérifier si l'utilisateur existe
      const existingUser = await db.query.utilisateurs.findFirst({
        where: (utilisateurs, { eq }) => eq(utilisateurs.id, id)
      });

      if (!existingUser) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Désactiver l'utilisateur
      await db.update(utilisateurs)
        .set({ 
          actif: false,
          updatedAt: new Date()
        })
        .where(eq(utilisateurs.id, id));

      res.json({ success: true, message: 'Utilisateur désactivé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la désactivation de l\'utilisateur:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * Crée un nouvel utilisateur
   */
  async createUser(req: Request, res: Response) {
    try {
      const userData = req.body as {
        email: string;
        motDePasse: string;
        nom: string;
        prenom: string;
        telephone?: string;
        photoProfil?: string;
        actif: boolean;
        roleIds?: string[];
      };

      // Valider les données
      const validation = createUserSchema.safeParse(userData);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Données utilisateur invalides',
          errors: validation.error.errors,
        });
      }

      // Vérifier si l'email existe déjà
      const db = await getDb();
      const existingUser = await db
        .select()
        .from(utilisateurs)
        .where(eq(utilisateurs.email, userData.email));

      if (existingUser.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Un utilisateur avec cet email existe déjà',
        });
      }

      // Vérifier les rôles fournis
      const validRoleIds: string[] = [];
      if (userData.roleIds && userData.roleIds.length > 0) {
        const roleRecords = await db
          .select()
          .from(roles)
          .where(sql`${roles.id} IN (${userData.roleIds.join(',')})`);
        validRoleIds.push(...roleRecords.map((r) => r.id));
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(userData.motDePasse, 10);
      const userId = crypto.randomUUID();

      // Créer l'utilisateur dans une transaction
      await db.transaction(async (tx) => {
        // Map the fields to match the utilisateurs schema
        const newUser: NewUtilisateur = {
          id: userId,
          email: userData.email,
          motDePasse: hashedPassword,
          nom: userData.nom,
          prenom: userData.prenom,
          telephone: userData.telephone,
          photoProfil: userData.photoProfil,
          actif: userData.actif,
          dateCreation: new Date(),
          updatedAt: new Date(),
        };

        // Insert the user
        await tx.insert(utilisateurs).values(newUser);

        // Handle role assignments if provided
        if (validRoleIds.length > 0) {
          // Create user-role mappings
          const userRoleMappings = validRoleIds.map(roleId => ({
            id: crypto.randomUUID(),
            userId: userId,
            roleId,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }));
          
          await tx.insert(userRoles).values(userRoleMappings);
        }
      });

      // Récupérer l'utilisateur créé avec ses rôles
      const createdUser = await db
        .select()
        .from(utilisateurs)
        .where(eq(utilisateurs.id, userId));

      if (!createdUser.length) {
        throw new Error('Erreur lors de la création de l\'utilisateur');
      }

      // Ne pas renvoyer le mot de passe dans la réponse
      const { motDePasse, ...userWithoutPassword } = createdUser[0];
      
      return res.status(201).json({
        success: true,
        data: userWithoutPassword
      });
      
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur :', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de l\'utilisateur',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
}

export const userController = new UserController();
