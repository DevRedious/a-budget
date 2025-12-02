const XLSX = require('xlsx');

const wb = XLSX.readFile('data/prev_festif_2025.xlsx');
console.log('📊 Feuilles:', wb.SheetNames.join(', '));

const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, {header: 1});

console.log('\n📋 Colonnes:', data[0]);
console.log('\n📦 Nombre de lignes:', data.length - 1);
console.log('\n🔍 Aperçu (10 premières lignes):');
data.slice(0, 11).forEach((row, i) => {
    if (i === 0) {
        console.log('  HEADER:', JSON.stringify(row));
    } else {
        console.log(`  Row ${i}:`, JSON.stringify(row));
    }
});
