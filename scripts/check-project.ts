#!/usr/bin/env tsx

import { config } from "../server/config/index.js";
import { getDb } from "../server/db.js";

async function checkProject() {
  console.log("🔍 Vérification du projet Data Mine Camion...\n");

  // Vérification de la configuration
  console.log("📋 Configuration:");
  console.log(`  - Port: ${config.port}`);
  console.log(`  - Environnement: ${config.nodeEnv}`);
  console.log(`  - Base de données: ${config.database.url}`);
  console.log(`  - CORS Origin: ${config.cors.origin}\n`);

  // Vérification de la base de données
  try {
    console.log("🗄️  Test de connexion à la base de données...");
    const db = await getDb();
    console.log("✅ Connexion à la base de données réussie\n");
  } catch (error) {
    console.error("❌ Erreur de connexion à la base de données:", error);
    console.log("\n💡 Solutions possibles:");
    console.log("  1. Vérifiez que MySQL est démarré");
    console.log("  2. Vérifiez la configuration DATABASE_URL dans .env");
    console.log("  3. Créez la base de données: CREATE DATABASE data_mine_camion;");
    console.log("  4. Lancez: npm run db:push");
    return;
  }

  // Vérification des variables d'environnement
  console.log("🔧 Variables d'environnement:");
  const requiredEnvVars = ["DATABASE_URL", "PORT", "NODE_ENV", "JWT_SECRET", "SESSION_SECRET"];
  let allEnvVarsPresent = true;

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`  ✅ ${envVar}: ${envVar === "JWT_SECRET" || envVar === "SESSION_SECRET" ? "***" : process.env[envVar]}`);
    } else {
      console.log(`  ❌ ${envVar}: Manquant`);
      allEnvVarsPresent = false;
    }
  }

  if (!allEnvVarsPresent) {
    console.log("\n⚠️  Certaines variables d'environnement sont manquantes");
    console.log("   Vérifiez votre fichier .env");
  } else {
    console.log("\n✅ Toutes les variables d'environnement sont présentes");
  }

  console.log("\n🚀 Projet prêt pour le développement!");
  console.log("   Pour démarrer: npm run dev");
  console.log("   Pour construire: npm run build");
  console.log("   Pour initialiser l'admin: npm run setup:admin");
}

checkProject().catch(console.error);

