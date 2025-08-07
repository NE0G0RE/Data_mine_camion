import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const componentsDir = path.resolve(projectRoot, 'client/src/components/ui');

// Lecture de tous les fichiers .tsx dans le dossier components/ui
const files = fs.readdirSync(componentsDir).filter(file => file.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(componentsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remplacement de l'import @/lib/utils par le chemin relatif
    content = content.replace(
        /from "@\/lib\/utils"/g,
        'from "../../lib/utils"'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated imports in ${file}`);
});
