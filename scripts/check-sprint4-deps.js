// scripts/check-sprint4-deps.js
// Ce script vérifie si toutes les dépendances nécessaires pour le Sprint 4 sont installées

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

console.log('🔍 Vérification des dépendances pour le Sprint 4...');

// Obtenir le chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Charger package.json
const packageJsonPath = path.join(projectRoot, 'package.json');
let packageJson;

try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (err) {
  console.error('❌ Erreur lors du chargement de package.json:', err.message);
  process.exit(1);
}

// Liste des dépendances nécessaires pour le Sprint 4
const requiredDependencies = {
  '@dnd-kit/core': '^6.0.0',
  '@dnd-kit/sortable': '^7.0.0',
  '@dnd-kit/utilities': '^3.2.0',
  'reactflow': '^11.0.0',
};

const allDependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};

// Vérifier chaque dépendance
let missingDeps = [];
let outdatedDeps = [];

Object.entries(requiredDependencies).forEach(([dep, version]) => {
  const minVersion = version.replace(/[\^~]/, '');
  
  if (!allDependencies[dep]) {
    missingDeps.push(dep);
  } else {
    const currentVersion = allDependencies[dep].replace(/[\^~]/, '');
    if (compareVersions(currentVersion, minVersion) < 0) {
      outdatedDeps.push({ name: dep, current: allDependencies[dep], required: version });
    }
  }
});

// Afficher les résultats
if (missingDeps.length === 0 && outdatedDeps.length === 0) {
  console.log(chalk.green('✅ Toutes les dépendances requises sont installées et à jour !'));
} else {
  if (missingDeps.length > 0) {
    console.log(chalk.red(`❌ Dépendances manquantes (${missingDeps.length}):`));
    missingDeps.forEach(dep => console.log(`   - ${dep}`));
    
    // Commande d'installation
    const installCmd = `npm install ${missingDeps.join(' ')} --save`;
    console.log('\nCommande d\'installation:');
    console.log(chalk.yellow(installCmd));
  }
  
  if (outdatedDeps.length > 0) {
    console.log(chalk.red(`⚠️ Dépendances à mettre à jour (${outdatedDeps.length}):`));
    outdatedDeps.forEach(dep => {
      console.log(`   - ${dep.name}: ${dep.current} → ${dep.required}`);
    });
    
    // Commande de mise à jour
    const updateDeps = outdatedDeps.map(dep => `${dep.name}@${dep.required}`).join(' ');
    const updateCmd = `npm install ${updateDeps} --save`;
    console.log('\nCommande de mise à jour:');
    console.log(chalk.yellow(updateCmd));
  }
}

// Vérifier si les fichiers nécessaires existent
console.log('\n🔍 Vérification des fichiers de composants...');

const requiredFiles = [
  'src/components/ui/draggable-list.tsx',
  'src/components/ui/draggable-item.tsx',
  'src/components/ui/workflow-builder/workflow-builder.tsx',
  'src/components/ui/workflow-builder/workflow-node.tsx',
  'src/components/ui/workflow-builder/workflow-controls.tsx',
  'src/components/ui/workflow-builder/workflow-edge.tsx',
];

const missingFiles = [];
requiredFiles.forEach(file => {
  const filePath = path.join(projectRoot, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length === 0) {
  console.log(chalk.green('✅ Tous les fichiers de composants sont présents !'));
} else {
  console.log(chalk.red(`❌ Fichiers manquants (${missingFiles.length}):`));
  missingFiles.forEach(file => console.log(`   - ${file}`));
}

// Fonction utilitaire pour comparer les versions
function compareVersions(a, b) {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const partA = partsA[i] || 0;
    const partB = partsB[i] || 0;
    
    if (partA > partB) return 1;
    if (partA < partB) return -1;
  }
  
  return 0;
}
