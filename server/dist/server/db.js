import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as schema from '../../shared/dist/index.js';
// Configure environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}
// Create the database connection
let dbConnection = null;
export async function getConnection() {
    if (!dbConnection) {
        dbConnection = await mysql.createConnection(process.env.DATABASE_URL);
    }
    return dbConnection;
}
// Create the database instance with the schema
export const db = drizzle(await getConnection(), {
    schema,
    mode: 'default'
});
// Export individual tables for convenience
export const { trucks, filiales, roles, utilisateurs, permissionsUtilisateur, } = schema;
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
//# sourceMappingURL=db.js.map