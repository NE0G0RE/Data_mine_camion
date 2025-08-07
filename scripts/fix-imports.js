const fs = require('fs');
const path = require('path');

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remplacer les imports @/ par des chemins relatifs
  content = content.replace(/from ["']@\/(.*?)["']/g, (match, p1) => {
    const relativePath = path.relative(path.dirname(filePath), path.resolve('client/src')).replace(/\\/g, '/');
    return `from "${relativePath}/${p1}"`;
  });

  // Remplacer les imports @shared/ par des chemins relatifs
  content = content.replace(/from ["']@shared\/(.*?)["']/g, (match, p1) => {
    const relativePath = path.relative(path.dirname(filePath), path.resolve('shared')).replace(/\\/g, '/');
    return `from "${relativePath}/${p1}"`;
  });

  fs.writeFileSync(filePath, content);
}

// Liste des fichiers à traiter
const files = [
  'client/src/components/truck-table.tsx',
  'client/src/components/simple-truck-modal.tsx',
  'client/src/components/truck-detail-view.tsx',
  'client/src/components/ui/select.tsx',
  'client/src/components/ui/table.tsx',
  'client/src/components/ui/checkbox.tsx',
  'client/src/lib/queryClient.ts',
  'client/src/lib/utils.ts',
  'client/src/hooks/use-toast.ts',
  'client/src/pages/dashboard.tsx',
  'client/src/pages/truck-detail.tsx',
  'client/src/pages/not-found.tsx',
  'client/src/App.tsx'
];

files.forEach(file => {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath)) {
    fixImports(fullPath);
    console.log(`Fixed imports in ${file}`);
  }
});
