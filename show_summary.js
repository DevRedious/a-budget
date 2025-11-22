/**
 * RÉSUMÉ VISUEL DE L'ANALYSE
 * Affiche un aperçu rapide des données importées
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║         ANALYSE FICHIER EXCEL - BUDGET AGROALIMENTAIRE         ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Lire le fichier JSON
const jsonPath = path.join(__dirname, 'data', 'imported_budget.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const { metadata, products } = data;

console.log('📊 STATISTIQUES GÉNÉRALES');
console.log('─'.repeat(65));
console.log(`  Nombre de produits       : ${metadata.totalProducts}`);
console.log(`  Date d'export            : ${new Date(metadata.exportDate).toLocaleString('fr-FR')}`);
console.log(`  Source                   : ${path.basename(metadata.source)}\n`);

// Distribution par famille
console.log('🏷️  DISTRIBUTION PAR FAMILLE');
console.log('─'.repeat(65));
const byFamily = {};
products.forEach(p => {
    const family = p.familleApproLib || 'Sans famille';
    byFamily[family] = (byFamily[family] || 0) + 1;
});

Object.entries(byFamily)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([family, count], idx) => {
        const bar = '█'.repeat(Math.floor(count / 2));
        console.log(`  ${String(idx + 1).padStart(2, ' ')}. ${family.padEnd(35, ' ')} ${String(count).padStart(3, ' ')} ${bar}`);
    });
console.log('');

// CA Total
console.log('💰 CHIFFRE D\'AFFAIRES');
console.log('─'.repeat(65));
const caValues = products.map(p => p.caA1).filter(v => v > 0);
const totalCA = caValues.reduce((sum, v) => sum + v, 0);
const avgCA = totalCA / caValues.length;

console.log(`  CA Total N-1             : ${totalCA.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`);
console.log(`  CA Moyen par produit     : ${avgCA.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`);
console.log(`  Produits avec CA > 0     : ${caValues.length}/${products.length}\n`);

// Top 5 produits
console.log('🏆 TOP 5 PRODUITS (CA N-1)');
console.log('─'.repeat(65));
products
    .sort((a, b) => b.caA1 - a.caA1)
    .slice(0, 5)
    .forEach((p, i) => {
        const name = p.prodLib.length > 40 ? p.prodLib.substring(0, 37) + '...' : p.prodLib;
        const ca = p.caA1.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
        console.log(`  ${i + 1}. ${name.padEnd(40, ' ')} ${ca.padStart(12, ' ')}`);
    });
console.log('');

// Évolutions
console.log('📈 ÉVOLUTIONS MOYENNES');
console.log('─'.repeat(65));
const evolutionsCA = products.map(p => p.evolutionCA).filter(v => v !== 0 && Math.abs(v) < 1);
const evolutionsPA = products.map(p => p.evolutionPA).filter(v => v !== 0 && Math.abs(v) < 1);
const evolutionsVol = products.map(p => p.evolutionVolume).filter(v => v !== 0 && Math.abs(v) < 1);

const avgEvCA = (evolutionsCA.reduce((sum, v) => sum + v, 0) / evolutionsCA.length) * 100;
const avgEvPA = (evolutionsPA.reduce((sum, v) => sum + v, 0) / evolutionsPA.length) * 100;
const avgEvVol = (evolutionsVol.reduce((sum, v) => sum + v, 0) / evolutionsVol.length) * 100;

console.log(`  Évolution CA             : ${avgEvCA.toFixed(2)}%`);
console.log(`  Évolution Prix d'achat   : ${avgEvPA.toFixed(2)}%`);
console.log(`  Évolution Volume         : ${avgEvVol.toFixed(2)}%\n`);

// Stock
console.log('📦 ALERTES STOCK');
console.log('─'.repeat(65));
const lowStock = products.filter(p => p.besoinStockDeduit > 0 && p.stock < p.besoinStockDeduit * 0.2);
const criticalStock = products.filter(p => p.besoinStockDeduit > 0 && p.stock === 0);

console.log(`  Produits en stock bas    : ${lowStock.length} (<20% du besoin)`);
console.log(`  Produits en rupture      : ${criticalStock.length} (stock = 0)`);

if (criticalStock.length > 0) {
    console.log('\n  Exemples de ruptures:');
    criticalStock.slice(0, 3).forEach(p => {
        const name = p.prodLib.length > 45 ? p.prodLib.substring(0, 42) + '...' : p.prodLib;
        console.log(`    - ${name.padEnd(45, ' ')} (besoin: ${p.besoinStockDeduit.toFixed(0)} ${p.unite})`);
    });
}
console.log('');

// Unités
console.log('📏 UNITÉS DE MESURE');
console.log('─'.repeat(65));
const byUnit = {};
products.forEach(p => {
    const unit = p.unite || 'Non spécifié';
    byUnit[unit] = (byUnit[unit] || 0) + 1;
});

Object.entries(byUnit).forEach(([unit, count]) => {
    console.log(`  ${unit.padEnd(20, ' ')} : ${count} produits`);
});
console.log('');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║                      FICHIERS DISPONIBLES                      ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

const files = [
    { name: 'RAPPORT_ANALYSE_EXCEL.md', desc: 'Rapport complet (19 KB)' },
    { name: 'README_IMPORT.md', desc: 'Guide d\'import (6.4 KB)' },
    { name: 'import_excel_example.js', desc: 'Script d\'import (9.9 KB)' },
    { name: 'data/imported_budget.json', desc: 'Données JSON (218 KB)' },
];

files.forEach(f => {
    const exists = fs.existsSync(path.join(__dirname, f.name)) ? '✓' : '✗';
    console.log(`  ${exists} ${f.name.padEnd(35, ' ')} ${f.desc}`);
});

console.log('\n' + '─'.repeat(65));
console.log('  Pour plus de détails, consultez RAPPORT_ANALYSE_EXCEL.md');
console.log('─'.repeat(65) + '\n');
