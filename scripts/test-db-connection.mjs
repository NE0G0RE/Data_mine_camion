import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL non défini');
  process.exit(1);
}

const match = url.match(/^mysql:\/\/(.*?)(:(.*?))?@(.*?):(\d+)\/(.*?)$/);
if (!match) {
  console.error('Format DATABASE_URL invalide');
  process.exit(1);
}

const user = match[1];
const password = match[3] || '';
const host = match[4];
const port = match[5];
const database = match[6];

const connection = mysql.createConnection({
  host,
  port,
  user,
  password,
  database
});

connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err.message);
    process.exit(1);
  }
  console.log('Connexion à la base de données réussie!');
  connection.end();
});
