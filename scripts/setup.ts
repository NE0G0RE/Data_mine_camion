import { getDb, roles, utilisateurs, permissionsUtilisateur } from "../server/db";
import { authService } from "../server/auth";
import { eq } from "drizzle-orm";

async function setupDefaultRoles() {
  const db = await getDb();
  
  console.log("🔧 Création des rôles par défaut...");
  
  const defaultRoles = [
    // Rôles Groupe
    {
      nom: "Admin Groupe",
      description: "Administrateur avec accès à toutes les filiales",
      niveau: 1,
      type: "groupe" as const,
    },
    {
      nom: "Responsable Groupe", 
      description: "Responsable avec accès à toutes les filiales",
      niveau: 2,
      type: "groupe" as const,
    },
    {
      nom: "Lecteur Groupe",
      description: "Lecteur avec accès à toutes les filiales", 
      niveau: 3,
      type: "groupe" as const,
    },
    // Rôles Filiale
    {
      nom: "Admin Filiale",
      description: "Administrateur d'une filiale spécifique",
      niveau: 1,
      type: "filiale" as const,
    },
    {
      nom: "Responsable Filiale",
      description: "Responsable d'une filiale spécifique",
      niveau: 2, 
      type: "filiale" as const,
    },
    {
      nom: "Lecteur Filiale",
      description: "Lecteur d'une filiale spécifique",
      niveau: 3,
      type: "filiale" as const,
    },
  ];

  for (const role of defaultRoles) {
    const existingRole = await db.select().from(roles).where(eq(roles.nom, role.nom)).limit(1);
    
    if (existingRole.length === 0) {
      await db.insert(roles).values(role);
      console.log(`✅ Rôle créé: ${role.nom}`);
    } else {
      console.log(`⏭️  Rôle existant: ${role.nom}`);
    }
  }
}

async function createAdminUser() {
  const db = await getDb();
  
  console.log("👤 Création de l'utilisateur administrateur...");
  
  const adminEmail = "admin@datamine.com";
  const adminPassword = "Admin123!";
  
  // Vérifier si l'admin existe déjà
  const existingAdmin = await db.select().from(utilisateurs).where(eq(utilisateurs.email, adminEmail)).limit(1);
  
  if (existingAdmin.length > 0) {
    console.log("⏭️  Utilisateur admin existe déjà");
    return existingAdmin[0];
  }
  
  // Créer l'utilisateur admin
  const hashedPassword = await authService.hashPassword(adminPassword);
  
  const adminUser = await db.insert(utilisateurs).values({
    email: adminEmail,
    nom: "Administrateur",
    prenom: "Système",
    motDePasse: hashedPassword,
    actif: true,
  });
  
  console.log("✅ Utilisateur admin créé");
  console.log(`📧 Email: ${adminEmail}`);
  console.log(`🔑 Mot de passe: ${adminPassword}`);
  
  // Récupérer l'utilisateur créé
  const createdAdmin = await db.select().from(utilisateurs).where(eq(utilisateurs.email, adminEmail)).limit(1);
  return createdAdmin[0];
}

async function assignAdminRole(adminUser: any) {
  const db = await getDb();
  
  console.log("🔐 Attribution du rôle admin...");
  
  // Récupérer le rôle Admin Groupe
  const adminRole = await db.select().from(roles).where(eq(roles.nom, "Admin Groupe")).limit(1);
  
  if (adminRole.length === 0) {
    throw new Error("Rôle Admin Groupe non trouvé");
  }
  
  // Vérifier si la permission existe déjà
  const existingPermission = await db.select().from(permissionsUtilisateur).where(
    eq(permissionsUtilisateur.utilisateurId, adminUser.id)
  ).limit(1);
  
  if (existingPermission.length === 0) {
    // Créer la permission admin
    await db.insert(permissionsUtilisateur).values({
      utilisateurId: adminUser.id,
      roleId: adminRole[0].id,
      filialeId: null, // null pour les rôles groupe
      attribuePar: adminUser.id, // L'admin s'attribue le rôle lui-même
      actif: true,
    });
    
    console.log("✅ Rôle admin attribué");
  } else {
    console.log("⏭️  Permission admin existe déjà");
  }
}

async function main() {
  try {
    console.log("🚀 Initialisation du système...");
    
    // Créer les rôles par défaut
    await setupDefaultRoles();
    
    // Créer l'utilisateur admin
    const adminUser = await createAdminUser();
    
    // Attribuer le rôle admin
    await assignAdminRole(adminUser);
    
    console.log("\n🎉 Configuration terminée avec succès!");
    console.log("\n📋 Informations de connexion:");
    console.log("URL: http://localhost:3000");
    console.log("Email: admin@datamine.com");
    console.log("Mot de passe: Admin123!");
    console.log("\n⚠️  IMPORTANT: Changez le mot de passe après la première connexion!");
    
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error);
    process.exit(1);
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  main();
} 