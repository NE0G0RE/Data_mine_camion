import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function updateImports(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        let updatedContent = content;
        
        // Update component imports
        updatedContent = updatedContent.replace(
            /from ["']@\/components\/(.*?)["']/g,
            (match, p1) => `from "../${p1}"`
        );

        // Update lib imports
        updatedContent = updatedContent.replace(
            /from ["']@\/lib\/(.*?)["']/g,
            (match, p1) => `from "../../lib/${p1}"`
        );

        // Update hooks imports
        updatedContent = updatedContent.replace(
            /from ["']@\/hooks\/(.*?)["']/g,
            (match, p1) => `from "../../hooks/${p1}"`
        );

        if (content !== updatedContent) {
            await fs.writeFile(filePath, updatedContent, 'utf-8');
            console.log(`Updated imports in \n${path.basename(filePath)}`);
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
}

async function findAndUpdateFiles(dir) {
    const files = await fs.readdir(dir, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
            await findAndUpdateFiles(filePath);
        } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
            await updateImports(filePath);
        }
    }
}

const componentsDir = path.join(projectRoot, 'client', 'src', 'components');
findAndUpdateFiles(componentsDir);
