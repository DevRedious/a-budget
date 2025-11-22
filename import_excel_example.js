/**
 * EXEMPLE DE CODE D'IMPORT POUR personnal_budget.xlsx
 *
 * Basé sur le rapport d'analyse du 2025-11-22
 * Ce code montre comment lire et transformer les données Excel
 * pour les utiliser dans votre dashboard.
 */

const XLSX = require('xlsx');
const path = require('path');

/**
 * Configuration de l'import
 */
const CONFIG = {
    filePath: path.join(__dirname, 'data', 'personnal_budget.xlsx'),
    sheetName: 'Feuil1',
    headerRow: 2, // Ligne 3 en base 0
    dataStartRow: 3, // Ligne 4 en base 0
};

/**
 * Colonnes essentielles à extraire
 */
const ESSENTIAL_COLUMNS = [
    // Identification
    'Famille Appro code',
    'Famille Appro lib',
    'Prod code',
    'Prod lib',
    'Famille Compta',

    // Quantités et stocks
    'Qte N-1 24-25',
    'PIC N+1',
    'Stock à date',
    'Besoin Stock deduit (PIC-stock)',

    // Chiffres d'affaires
    'CA N-1 24-25',
    'CA Budget N-1 24-25 (Stock déduit)',
    'Ca Prev Budget N+1 PIC 25-26',
    ' CA previsonnel stock deduit ',
    'Projection budget 26/27',

    // Prix
    ' PMP N-1 24-25 ',
    ' Prev PA N+1 25-26 ',
    'PMP 04/25-09/25',

    // Évolutions
    'Évolution PA',
    'Évolution volume (stock déduit)',
    'Évolution CA 24-25 vs PIC (SD) 25 26',

    // Unités
    'Unité Fact',
    'Unité ',
];

/**
 * Utilitaires de transformation
 */
const cleanValue = (value) => {
    if (value === null || value === undefined || value === '') return null;
    return value;
};

const parseMonetary = (value) => {
    if (!value) return 0;
    if (typeof value === 'number') return value;

    // Retirer €, espaces et virgules
    const cleaned = String(value).replace(/[€\s]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
};

const parsePercentage = (value) => {
    if (!value) return 0;
    if (typeof value === 'number') return value;

    // Retirer % et parser
    const cleaned = String(value).replace('%', '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num / 100; // Convertir en décimal
};

const normalizeUnit = (value) => {
    if (!value) return null;
    return String(value).trim(); // "KG" ou " KG " → "KG"
};

/**
 * Fonction principale d'import
 */
function importBudgetData() {
    console.log('Début de l\'import...\n');

    // 1. Lire le fichier Excel
    const workbook = XLSX.readFile(CONFIG.filePath, {
        cellDates: true,
        cellNF: true
    });

    const sheet = workbook.Sheets[CONFIG.sheetName];

    // 2. Convertir en tableau
    const rawData = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        raw: false,
        defval: ''
    });

    // 3. Extraire les en-têtes
    const headers = rawData[CONFIG.headerRow];
    console.log(`En-têtes trouvés: ${headers.filter(h => h !== '').length} colonnes`);

    // 4. Extraire et transformer les données
    const products = [];
    let totalCount = 0;
    let subtotalCount = 0;

    for (let i = CONFIG.dataStartRow; i < rawData.length; i++) {
        const row = rawData[i];
        const familleLib = row[headers.indexOf('Famille Appro lib')];

        // Identifier les lignes de sous-totaux
        const isSubtotal = familleLib && familleLib.startsWith('T ');

        if (isSubtotal) {
            subtotalCount++;
            // Optionnel : stocker les sous-totaux séparément
            continue;
        }

        // Créer l'objet produit
        const product = {
            // Identification
            familleApproCode: parseInt(row[headers.indexOf('Famille Appro code')]) || null,
            familleApproLib: cleanValue(familleLib),
            prodCode: parseInt(row[headers.indexOf('Prod code')]) || null,
            prodLib: cleanValue(row[headers.indexOf('Prod lib')]),
            familleCompta: cleanValue(row[headers.indexOf('Famille Compta')]),

            // Quantités et stocks
            qteN1: parseFloat(row[headers.indexOf('Qte N-1 24-25')]) || 0,
            picN1: parseFloat(row[headers.indexOf('PIC N+1')]) || 0,
            stock: parseFloat(row[headers.indexOf('Stock à date')]) || 0,
            besoinStockDeduit: parseFloat(row[headers.indexOf('Besoin Stock deduit (PIC-stock)')]) || 0,

            // Chiffres d'affaires (en €)
            caA1: parseMonetary(row[headers.indexOf('CA N-1 24-25')]),
            caBudgetN1StockDeduit: parseMonetary(row[headers.indexOf('CA Budget N-1 24-25 (Stock déduit)')]),
            caPrevBudgetN1PIC: parseMonetary(row[headers.indexOf('Ca Prev Budget N+1 PIC 25-26')]),
            caPrevStockDeduit: parseMonetary(row[headers.indexOf(' CA previsonnel stock deduit ')]),
            projectionBudget2627: parseMonetary(row[headers.indexOf('Projection budget 26/27')]),

            // Prix (en €)
            pmpN1: parseMonetary(row[headers.indexOf(' PMP N-1 24-25 ')]),
            prevPAN1: parseMonetary(row[headers.indexOf(' Prev PA N+1 25-26 ')]),
            pmp0425_0925: parseMonetary(row[headers.indexOf('PMP 04/25-09/25')]),

            // Évolutions (en décimal 0-1)
            evolutionPA: parsePercentage(row[headers.indexOf('Évolution PA')]),
            evolutionVolume: parsePercentage(row[headers.indexOf('Évolution volume (stock déduit)')]),
            evolutionCA: parsePercentage(row[headers.indexOf('Évolution CA 24-25 vs PIC (SD) 25 26')]),

            // Unités
            uniteFact: normalizeUnit(row[headers.indexOf('Unité Fact')]),
            unite: normalizeUnit(row[headers.indexOf('Unité ')]),

            // Métadonnées
            rowIndex: i + 1,
        };

        // Validations basiques
        if (product.prodCode && product.prodLib) {
            products.push(product);
            totalCount++;
        }
    }

    console.log(`\nImport terminé:`);
    console.log(`  - Produits importés: ${totalCount}`);
    console.log(`  - Sous-totaux ignorés: ${subtotalCount}`);
    console.log(`  - Total de lignes: ${rawData.length - CONFIG.dataStartRow}\n`);

    return products;
}

/**
 * Analyses post-import
 */
function analyzeImportedData(products) {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('ANALYSES POST-IMPORT');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 1. Distribution par famille
    const byFamily = {};
    products.forEach(p => {
        const family = p.familleApproLib || 'Sans famille';
        byFamily[family] = (byFamily[family] || 0) + 1;
    });

    console.log('Distribution par famille:');
    Object.entries(byFamily)
        .sort((a, b) => b[1] - a[1])
        .forEach(([family, count]) => {
            console.log(`  ${family}: ${count} produits`);
        });

    // 2. Statistiques CA
    const caValues = products.map(p => p.caA1).filter(v => v > 0);
    const totalCA = caValues.reduce((sum, v) => sum + v, 0);

    console.log(`\nChiffre d'affaires N-1:`);
    console.log(`  Total: ${totalCA.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`);
    console.log(`  Moyenne: ${(totalCA / caValues.length).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`);

    // 3. Top 10 produits par CA
    console.log(`\nTop 10 produits par CA N-1:`);
    products
        .sort((a, b) => b.caA1 - a.caA1)
        .slice(0, 10)
        .forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.prodLib.substring(0, 50)}... : ${p.caA1.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`);
        });

    // 4. Évolution moyenne
    const evolutionsCA = products.map(p => p.evolutionCA).filter(v => v !== 0);
    const avgEvolution = evolutionsCA.reduce((sum, v) => sum + v, 0) / evolutionsCA.length;

    console.log(`\nÉvolution CA moyenne: ${(avgEvolution * 100).toFixed(2)}%`);

    // 5. Alertes stock
    const lowStock = products.filter(p => p.stock < p.besoinStockDeduit * 0.2);
    console.log(`\nProduits en stock bas (<20% du besoin): ${lowStock.length}`);
    if (lowStock.length > 0) {
        console.log('  Exemples:');
        lowStock.slice(0, 5).forEach(p => {
            console.log(`    - ${p.prodLib.substring(0, 40)}: ${p.stock} / ${p.besoinStockDeduit.toFixed(0)} requis`);
        });
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');
}

/**
 * Export vers JSON
 */
function exportToJSON(products, outputPath) {
    const fs = require('fs');

    const output = {
        metadata: {
            source: CONFIG.filePath,
            exportDate: new Date().toISOString(),
            totalProducts: products.length,
        },
        products: products,
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`Données exportées vers: ${outputPath}`);
}

/**
 * Exécution
 */
if (require.main === module) {
    try {
        // Import
        const products = importBudgetData();

        // Analyses
        analyzeImportedData(products);

        // Export (optionnel)
        const outputPath = path.join(__dirname, 'data', 'imported_budget.json');
        exportToJSON(products, outputPath);

        console.log('\n✓ Import réussi!');

    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        process.exit(1);
    }
}

module.exports = {
    importBudgetData,
    analyzeImportedData,
    exportToJSON,
};
