const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'personnal_budget.xlsx');
const workbook = XLSX.readFile(filePath, { cellStyles: true, cellDates: true, cellNF: true });

const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });

// En-têtes à la ligne 3 (index 2)
const headerRowIndex = 2;
const headers = rawData[headerRowIndex];
const dataStartRow = headerRowIndex + 1;

console.log('═══════════════════════════════════════════════════════════════');
console.log('VALEURS UNIQUES POUR COLONNES CLÉS');
console.log('═══════════════════════════════════════════════════════════════\n');

// Colonnes texte importantes
const textColumns = [
    'Famille Appro code',
    'Famille Appro lib',
    'Famille Compta',
    'Unité',
    'Unité Fact',
    'Unité '
];

textColumns.forEach(colName => {
    const colIdx = headers.indexOf(colName);
    if (colIdx === -1) return;

    const uniqueValues = new Set();
    let valueCount = 0;

    for (let rowIdx = dataStartRow; rowIdx < rawData.length; rowIdx++) {
        const value = rawData[rowIdx][colIdx];
        if (value !== '') {
            uniqueValues.add(value);
            valueCount++;
        }
    }

    console.log(`\n"${colName}"`);
    console.log(`  Total de valeurs: ${valueCount}`);
    console.log(`  Valeurs uniques: ${uniqueValues.size}`);
    console.log(`  Liste:`);

    const sortedValues = Array.from(uniqueValues).sort((a, b) => {
        // Try numeric sort first
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return String(a).localeCompare(String(b));
    });

    sortedValues.forEach(val => {
        const count = Array.from({ length: rawData.length - dataStartRow }, (_, i) => rawData[dataStartRow + i][colIdx]).filter(v => v === val).length;
        console.log(`    - "${val}" (${count} occurrences)`);
    });
});

console.log('\n\n═══════════════════════════════════════════════════════════════');
console.log('STATISTIQUES DÉTAILLÉES POUR COLONNES NUMÉRIQUES CLÉS');
console.log('═══════════════════════════════════════════════════════════════\n');

const numericColumns = [
    'Qte N-1 24-25',
    ' PMP N-1 24-25 ',
    'CA N-1 24-25',
    'PIC N+1',
    'Stock à date',
    'Besoin Stock deduit (PIC-stock)',
    'Ca Prev Budget N+1 PIC 25-26',
    ' CA previsonnel stock deduit ',
    'Évolution PA',
    'Évolution volume (stock déduit)',
    'Évolution CA 24-25 vs PIC (SD) 25 26'
];

numericColumns.forEach(colName => {
    const colIdx = headers.indexOf(colName);
    if (colIdx === -1) return;

    const values = [];

    for (let rowIdx = dataStartRow; rowIdx < rawData.length; rowIdx++) {
        const value = rawData[rowIdx][colIdx];
        const cellAddress = XLSX.utils.encode_cell({ r: rowIdx, c: colIdx });
        const cell = sheet[cellAddress];

        if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
            let numValue = cell.v;

            // Si c'est un texte, essayer de le parser
            if (typeof numValue === 'string') {
                numValue = numValue.replace(/[€\s,]/g, '').replace('%', '');
                numValue = parseFloat(numValue);
            }

            if (!isNaN(numValue)) {
                values.push(numValue);
            }
        }
    }

    if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const median = sorted[Math.floor(sorted.length / 2)];

        // Quartiles
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];

        console.log(`\n"${colName}"`);
        console.log(`  Nombre de valeurs: ${values.length} / ${rawData.length - dataStartRow}`);
        console.log(`  Min: ${min.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}`);
        console.log(`  Q1 (25%): ${q1.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}`);
        console.log(`  Médiane: ${median.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}`);
        console.log(`  Moyenne: ${avg.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}`);
        console.log(`  Q3 (75%): ${q3.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}`);
        console.log(`  Max: ${max.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}`);
        console.log(`  Somme: ${sum.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}`);
    }
});

console.log('\n\n═══════════════════════════════════════════════════════════════');
console.log('LIGNES AVEC TOTAUX / SOUS-TOTAUX');
console.log('═══════════════════════════════════════════════════════════════\n');

// Chercher les lignes qui semblent être des totaux
const prodLibIdx = headers.indexOf('Prod lib');
const familleLibIdx = headers.indexOf('Famille Appro lib');

for (let rowIdx = dataStartRow; rowIdx < Math.min(dataStartRow + 30, rawData.length); rowIdx++) {
    const prodLib = rawData[rowIdx][prodLibIdx];
    const familleLib = rawData[rowIdx][familleLibIdx];

    // Chercher les lignes de totaux (commencent souvent par "T" ou sont vides)
    if ((familleLib && familleLib.startsWith('T ')) || (prodLib === '' && familleLib !== '')) {
        console.log(`Ligne ${rowIdx + 1}:`);
        console.log(`  Famille: "${familleLib}"`);
        console.log(`  Prod lib: "${prodLib}"`);

        // Afficher les colonnes A-E pour contexte
        for (let c = 0; c < Math.min(6, headers.length); c++) {
            if (headers[c] !== '' && rawData[rowIdx][c] !== '') {
                console.log(`  ${headers[c]}: "${rawData[rowIdx][c]}"`);
            }
        }
        console.log('');
    }
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('ÉCHANTILLON DE 10 LIGNES COMPLÈTES');
console.log('═══════════════════════════════════════════════════════════════\n');

for (let i = 0; i < 10 && (dataStartRow + i) < rawData.length; i++) {
    const rowIdx = dataStartRow + i;
    console.log(`─── Ligne ${rowIdx + 1} (donnée ${i + 1}) ───`);

    const row = rawData[rowIdx];
    const prodCode = row[headers.indexOf('Prod code')];
    const prodLib = row[headers.indexOf('Prod lib')];
    const famille = row[headers.indexOf('Famille Appro lib')];

    console.log(`  Produit: [${prodCode}] ${prodLib}`);
    console.log(`  Famille: ${famille}`);

    // Colonnes importantes à afficher
    const importantCols = [
        'Famille Compta',
        'Qte N-1 24-25',
        ' PMP N-1 24-25 ',
        'CA N-1 24-25',
        'PIC N+1',
        'Stock à date',
        'Ca Prev Budget N+1 PIC 25-26'
    ];

    importantCols.forEach(colName => {
        const idx = headers.indexOf(colName);
        if (idx !== -1 && row[idx] !== '') {
            console.log(`  ${colName}: ${row[idx]}`);
        }
    });

    console.log('');
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('ANALYSE TERMINÉE');
console.log('═══════════════════════════════════════════════════════════════');
