import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as schema from '../shared/dist/schema.js';

// Configure environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from project root
dotenv.config({ path: path.join(process.cwd(), '.env') });
console.log('Environment file loaded from:', path.join(process.cwd(), '.env'));

if (!process.env.DATABASE_URL) {
  console.error('Available environment variables:', Object.keys(process.env).join(', '));
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create the database connection
let dbConnection: mysql.Connection | null = null;

export async function getConnection() {
  if (!dbConnection) {
    dbConnection = await mysql.createConnection(process.env.DATABASE_URL!);
  }
  return dbConnection;
}

// Create the database instance with the schema
export const db = drizzle(await getConnection(), { 
  schema,
  mode: 'default' 
});

// Export individual tables for convenience
export const {
  trucks,
  filiales,
  roles,
  utilisateurs,
  permissionsUtilisateur,
} = schema;

// Export types
export type * from '../shared/schema.js';

// Helper function to get the database instance
export async function getDb() {
  return db;
}

// Close the database connection when the application exits
process.on('exit', async () => {
  if (dbConnection) {
    await dbConnection.end();
  }
});