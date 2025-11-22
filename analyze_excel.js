const XLSX = require('xlsx');
const path = require('path');

// Lire le fichier Excel
const filePath = path.join(__dirname, 'data', 'personnal_budget.xlsx');
console.log(`Analyse du fichier: ${filePath}\n`);

const workbook = XLSX.readFile(filePath, { cellStyles: true, cellDates: true });

console.log('═══════════════════════════════════════════════════════════════');
console.log('1. STRUCTURE GÉNÉRALE');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`Nombre de feuilles: ${workbook.SheetNames.length}`);
console.log(`Noms des feuilles: ${workbook.SheetNames.join(', ')}\n`);

// Analyser chaque feuille
workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`FEUILLE ${index + 1}: "${sheetName}"`);
    console.log('='.repeat(70));

    const sheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(sheet['!ref']);

    const numRows = range.e.r - range.s.r + 1;
    const numCols = range.e.c - range.s.c + 1;

    console.log(`\nDimensions: ${numRows} lignes × ${numCols} colonnes`);
    console.log(`Plage: ${sheet['!ref']}`);

    // Convertir en JSON pour l'analyse
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });
    const dataWithHeaders = XLSX.utils.sheet_to_json(sheet, { raw: false, dateNF: 'yyyy-mm-dd' });

    if (data.length === 0) {
        console.log('\n⚠️  Feuille vide');
        return;
    }

    // 2. EN-TÊTES DE COLONNES
    console.log('\n───────────────────────────────────────────────────────────────');
    console.log('2. EN-TÊTES DE COLONNES');
    console.log('───────────────────────────────────────────────────────────────\n');

    const headers = data[0] || [];
    headers.forEach((header, idx) => {
        const colLetter = XLSX.utils.encode_col(idx);
        console.log(`  ${String(idx + 1).padStart(2, '0')}. Colonne ${colLetter}: "${header}"`);
    });

    // 3. TYPES DE DONNÉES
    console.log('\n───────────────────────────────────────────────────────────────');
    console.log('3. TYPES DE DONNÉES');
    console.log('───────────────────────────────────────────────────────────────\n');

    const columnTypes = {};
    const columnStats = {};

    headers.forEach((header, colIdx) => {
        const values = [];
        const types = new Set();

        for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
            const value = data[rowIdx][colIdx];
            if (value !== undefined && value !== null && value !== '') {
                values.push(value);

                // Détecter le type
                const cellAddress = XLSX.utils.encode_cell({ r: rowIdx, c: colIdx });
                const cell = sheet[cellAddress];

                if (cell) {
                    if (cell.t === 'n') types.add('nombre');
                    else if (cell.t === 's') types.add('texte');
                    else if (cell.t === 'd') types.add('date');
                    else if (cell.t === 'b') types.add('booléen');
                    else types.add(cell.t);
                }

                // Détecter format monétaire
                if (typeof value === 'string' && (value.includes('€') || value.includes('EUR'))) {
                    types.add('monétaire');
                }
            }
        }

        columnTypes[header] = Array.from(types);
        columnStats[header] = { values, nonEmptyCount: values.length };

        console.log(`  "${header}"`);
        console.log(`    Type(s): ${Array.from(types).join(', ') || 'vide'}`);
        console.log(`    Valeurs non-vides: ${values.length}/${data.length - 1}`);
    });

    // 4. QUALITÉ DES DONNÉES
    console.log('\n───────────────────────────────────────────────────────────────');
    console.log('4. QUALITÉ DES DONNÉES');
    console.log('───────────────────────────────────────────────────────────────\n');

    console.log(`Nombre de lignes de données (hors en-tête): ${data.length - 1}`);

    // Cellules vides par colonne
    console.log('\nCellules vides par colonne:');
    headers.forEach((header, idx) => {
        const emptyCount = (data.length - 1) - columnStats[header].nonEmptyCount;
        const percentage = ((emptyCount / (data.length - 1)) * 100).toFixed(1);
        console.log(`  "${header}": ${emptyCount} vides (${percentage}%)`);
    });

    // 5. DONNÉES SPÉCIFIQUES
    console.log('\n───────────────────────────────────────────────────────────────');
    console.log('5. DONNÉES SPÉCIFIQUES - Premières lignes');
    console.log('───────────────────────────────────────────────────────────────\n');

    // Afficher les 5 premières lignes de données
    const displayRows = Math.min(5, dataWithHeaders.length);
    console.log(`Affichage des ${displayRows} premières lignes:\n`);

    for (let i = 0; i < displayRows; i++) {
        console.log(`─── Ligne ${i + 1} ───`);
        const row = dataWithHeaders[i];
        Object.keys(row).forEach(key => {
            console.log(`  ${key}: ${row[key]}`);
        });
        console.log('');
    }

    // Statistiques pour colonnes numériques
    console.log('───────────────────────────────────────────────────────────────');
    console.log('STATISTIQUES NUMÉRIQUES');
    console.log('───────────────────────────────────────────────────────────────\n');

    headers.forEach((header, colIdx) => {
        const numericValues = [];

        for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
            const value = data[rowIdx][colIdx];
            const cellAddress = XLSX.utils.encode_cell({ r: rowIdx, c: colIdx });
            const cell = sheet[cellAddress];

            if (cell && cell.t === 'n') {
                numericValues.push(cell.v);
            } else if (typeof value === 'string') {
                // Essayer de parser les nombres avec €
                const cleanValue = value.replace(/[€\s,]/g, '').replace(',', '.');
                const num = parseFloat(cleanValue);
                if (!isNaN(num)) {
                    numericValues.push(num);
                }
            }
        }

        if (numericValues.length > 0) {
            const min = Math.min(...numericValues);
            const max = Math.max(...numericValues);
            const sum = numericValues.reduce((a, b) => a + b, 0);
            const avg = sum / numericValues.length;

            console.log(`  "${header}"`);
            console.log(`    Min: ${min}`);
            console.log(`    Max: ${max}`);
            console.log(`    Moyenne: ${avg.toFixed(2)}`);
            console.log(`    Somme: ${sum.toFixed(2)}`);
            console.log(`    Nombre de valeurs: ${numericValues.length}\n`);
        }
    });

    // Valeurs uniques pour colonnes texte
    console.log('───────────────────────────────────────────────────────────────');
    console.log('VALEURS UNIQUES (colonnes texte)');
    console.log('───────────────────────────────────────────────────────────────\n');

    headers.forEach((header, colIdx) => {
        const uniqueValues = new Set();

        for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
            const value = data[rowIdx][colIdx];
            if (value !== undefined && value !== null && value !== '') {
                uniqueValues.add(value);
            }
        }

        // Afficher seulement si moins de 50 valeurs uniques (pour éviter trop de détails)
        if (uniqueValues.size > 0 && uniqueValues.size <= 50) {
            console.log(`  "${header}" (${uniqueValues.size} valeurs uniques):`);
            const sortedValues = Array.from(uniqueValues).sort();
            sortedValues.forEach(val => {
                console.log(`    - ${val}`);
            });
            console.log('');
        } else if (uniqueValues.size > 50) {
            console.log(`  "${header}": ${uniqueValues.size} valeurs uniques (trop nombreuses pour afficher)\n`);
        }
    });

    // 6. CODE COULEUR
    console.log('───────────────────────────────────────────────────────────────');
    console.log('6. FORMATAGE ET COULEURS');
    console.log('───────────────────────────────────────────────────────────────\n');

    console.log('Analyse des styles de cellules:\n');

    const coloredCells = [];

    for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = sheet[cellAddress];

            if (cell && cell.s) {
                const colName = headers[C] || `Colonne ${C}`;
                const value = cell.v;

                coloredCells.push({
                    address: cellAddress,
                    row: R + 1,
                    column: colName,
                    value: value,
                    style: JSON.stringify(cell.s)
                });
            }
        }
    }

    if (coloredCells.length > 0) {
        console.log(`${coloredCells.length} cellules avec style détecté`);
        console.log('\nExemples de cellules stylées (10 premières):');
        coloredCells.slice(0, 10).forEach(c => {
            console.log(`  ${c.address} (${c.column}, ligne ${c.row}): "${c.value}"`);
            console.log(`    Style: ${c.style}\n`);
        });
    } else {
        console.log('⚠️  Aucun style de cellule détecté dans cette version de lecture.');
        console.log('   Note: Les couleurs Excel peuvent nécessiter une lecture plus avancée.');
    }
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('ANALYSE TERMINÉE');
console.log('═══════════════════════════════════════════════════════════════');
