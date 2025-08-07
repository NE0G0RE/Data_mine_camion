import dotenv from 'dotenv';
dotenv.config();

console.log('Variables d\'environnement chargées :');
console.log(process.env);

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL non trouvée !');
} else {
  console.log('DATABASE_URL =', process.env.DATABASE_URL);
}
