import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { trucks, filiales, roles, utilisateurs, permissionsUtilisateur } from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

let db: ReturnType<typeof drizzle>;

// Fonction pour initialiser la connexion à la base de données
export async function initDatabase() {
  if (!db) {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    db = drizzle(connection);
  }
  return db;
}

// Fonction pour obtenir l'instance de la base de données
export async function getDb() {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

export { trucks, filiales, roles, utilisateurs, permissionsUtilisateur }; 