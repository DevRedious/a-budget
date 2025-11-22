const XLSX = require('xlsx');
const path = require('path');

// Lire le fichier Excel
const filePath = path.join(__dirname, 'data', 'personnal_budget.xlsx');
console.log(`Analyse du fichier: ${filePath}\n`);

const workbook = XLSX.readFile(filePath, { cellStyles: true, cellDates: true, cellNF: true });

console.log('═══════════════════════════════════════════════════════════════');
console.log('1. STRUCTURE GÉNÉRALE');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`Nombre de feuilles: ${workbook.SheetNames.length}`);
console.log(`Noms des feuilles: ${workbook.SheetNames.join(', ')}\n`);

// Analyser la première feuille
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const range = XLSX.utils.decode_range(sheet['!ref']);

console.log(`Feuille principale: "${sheetName}"`);
console.log(`Dimensions: ${range.e.r + 1} lignes × ${range.e.c + 1} colonnes`);
console.log(`Plage: ${sheet['!ref']}\n`);

// Lire les données brutes (ligne par ligne)
const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });

console.log('═══════════════════════════════════════════════════════════════');
console.log('2. DÉTECTION DES EN-TÊTES');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('Lignes 1 à 5 (pour identifier la ligne d\'en-tête):\n');

for (let i = 0; i < Math.min(5, rawData.length); i++) {
    console.log(`─── LIGNE ${i + 1} ─── (${rawData[i].filter(v => v !== '').length} cellules non vides)`);
    const row = rawData[i];
    for (let j = 0; j < Math.min(15, row.length); j++) {
        const colLetter = XLSX.utils.encode_col(j);
        const value = row[j];
        if (value !== '') {
            console.log(`  ${colLetter}: "${value}"`);
        }
    }
    console.log('');
}

// Déterminer quelle ligne contient les vrais en-têtes
let headerRowIndex = -1;
for (let i = 0; i < Math.min(10, rawData.length); i++) {
    const row = rawData[i];
    const hasTypicalHeaders = row.some(cell =>
        typeof cell === 'string' && (
            cell.toLowerCase().includes('prod') ||
            cell.toLowerCase().includes('lib') ||
            cell.toLowerCase().includes('code') ||
            cell.toLowerCase().includes('famille') ||
            cell.toLowerCase().includes('qte')
        )
    );

    if (hasTypicalHeaders) {
        headerRowIndex = i;
        break;
    }
}

if (headerRowIndex === -1) {
    console.log('⚠️  Impossible de détecter automatiquement la ligne d\'en-tête.');
    console.log('   Analyse manuelle nécessaire.\n');
    headerRowIndex = 1; // Par défaut ligne 2
}

console.log(`➤ En-têtes détectés à la ligne ${headerRowIndex + 1}\n`);

const headers = rawData[headerRowIndex];

console.log('═══════════════════════════════════════════════════════════════');
console.log('3. EN-TÊTES DE COLONNES (LISTE COMPLÈTE)');
console.log('═══════════════════════════════════════════════════════════════\n');

headers.forEach((header, idx) => {
    const colLetter = XLSX.utils.encode_col(idx);
    const cellAddress = `${colLetter}${headerRowIndex + 1}`;
    const cell = sheet[cellAddress];

    const cellInfo = cell ? ` [Type: ${cell.t}]` : '';
    console.log(`  ${String(idx + 1).padStart(3, '0')}. Colonne ${colLetter.padEnd(3, ' ')}: "${header}"${cellInfo}`);
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('4. APERÇU DES DONNÉES (5 premières lignes complètes)');
console.log('═══════════════════════════════════════════════════════════════\n');

const dataStartRow = headerRowIndex + 1;
for (let i = dataStartRow; i < Math.min(dataStartRow + 5, rawData.length); i++) {
    console.log(`─── LIGNE ${i + 1} (Données ligne ${i - headerRowIndex}) ───`);
    const row = rawData[i];

    for (let j = 0; j < headers.length; j++) {
        if (headers[j] !== '' && row[j] !== '') {
            const colLetter = XLSX.utils.encode_col(j);
            const cellAddress = `${colLetter}${i + 1}`;
            const cell = sheet[cellAddress];
            const type = cell ? cell.t : 'undefined';

            console.log(`  ${headers[j]}: "${row[j]}" [${type}]`);
        }
    }
    console.log('');
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('5. ANALYSE DES TYPES DE DONNÉES PAR COLONNE');
console.log('═══════════════════════════════════════════════════════════════\n');

const columnAnalysis = {};

headers.forEach((header, colIdx) => {
    if (header === '') return;

    const values = [];
    const types = new Set();
    let numericCount = 0;
    let textCount = 0;
    let dateCount = 0;
    let emptyCount = 0;

    for (let rowIdx = dataStartRow; rowIdx < rawData.length; rowIdx++) {
        const value = rawData[rowIdx][colIdx];
        const cellAddress = XLSX.utils.encode_cell({ r: rowIdx, c: colIdx });
        const cell = sheet[cellAddress];

        if (!value || value === '') {
            emptyCount++;
        } else {
            values.push(value);

            if (cell) {
                types.add(cell.t);
                if (cell.t === 'n') numericCount++;
                else if (cell.t === 's') textCount++;
                else if (cell.t === 'd') dateCount++;
            }
        }
    }

    columnAnalysis[header] = {
        colIdx,
        types: Array.from(types),
        numericCount,
        textCount,
        dateCount,
        emptyCount,
        totalRows: rawData.length - dataStartRow,
        sampleValues: values.slice(0, 5)
    };
});

Object.keys(columnAnalysis).forEach(header => {
    const analysis = columnAnalysis[header];
    const colLetter = XLSX.utils.encode_col(analysis.colIdx);

    console.log(`  ${colLetter}. "${header}"`);
    console.log(`      Types: ${analysis.types.join(', ') || 'vide'}`);
    console.log(`      Nombre: ${analysis.numericCount}, Texte: ${analysis.textCount}, Date: ${analysis.dateCount}`);
    console.log(`      Vides: ${analysis.emptyCount}/${analysis.totalRows} (${(analysis.emptyCount / analysis.totalRows * 100).toFixed(1)}%)`);
    console.log(`      Exemples: ${analysis.sampleValues.slice(0, 3).join(', ')}`);
    console.log('');
});

console.log('═══════════════════════════════════════════════════════════════');
console.log('6. ANALYSE DES COULEURS DE CELLULES');
console.log('═══════════════════════════════════════════════════════════════\n');

const colorMap = new Map();

// Scanner les 20 premières lignes pour trouver les couleurs
for (let R = 0; R < Math.min(20, range.e.r + 1); R++) {
    for (let C = 0; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = sheet[cellAddress];

        if (cell && cell.s && cell.s.fgColor) {
            const color = cell.s.fgColor.rgb || cell.s.fgColor.theme || 'unknown';
            const value = cell.v;
            const header = headers[C] || `Col ${XLSX.utils.encode_col(C)}`;

            if (!colorMap.has(color)) {
                colorMap.set(color, []);
            }

            colorMap.get(color).push({
                cell: cellAddress,
                header: header,
                value: value,
                row: R + 1
            });
        }
    }
}

if (colorMap.size > 0) {
    console.log('Couleurs détectées:\n');

    colorMap.forEach((cells, color) => {
        console.log(`  Couleur RGB: ${color} (${cells.length} cellules)`);
        console.log(`  Exemples:`);
        cells.slice(0, 5).forEach(c => {
            console.log(`    - ${c.cell} (${c.header}, ligne ${c.row}): "${c.value}"`);
        });
        console.log('');
    });
} else {
    console.log('⚠️  Aucune couleur de cellule détectée (ou non supporté par cette méthode)\n');
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('7. STATISTIQUES GLOBALES');
console.log('═══════════════════════════════════════════════════════════════\n');

const totalDataRows = rawData.length - dataStartRow;
const nonEmptyColumns = headers.filter(h => h !== '').length;

console.log(`Total de lignes de données: ${totalDataRows}`);
console.log(`Total de colonnes avec en-tête: ${nonEmptyColumns}`);
console.log(`Total de colonnes dans le fichier: ${headers.length}`);
console.log(`Ligne d'en-tête: ${headerRowIndex + 1}`);
console.log(`Première ligne de données: ${dataStartRow + 1}`);

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('ANALYSE TERMINÉE');
console.log('═══════════════════════════════════════════════════════════════');
