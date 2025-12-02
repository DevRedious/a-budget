const XLSX = require('xlsx');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, writeBatch, doc } = require('firebase/firestore');

// Import de la config Firebase depuis le projet
const firebaseConfig = {
  apiKey: "AIzaSyB0JrvOLh1JwV6RLjfXqLUaozxYzPUqFes",
  authDomain: "budget-dashboard-cb982.firebaseapp.com",
  projectId: "budget-dashboard-cb982",
  storageBucket: "budget-dashboard-cb982.firebasestorage.app",
  messagingSenderId: "854550473033",
  appId: "1:854550473033:web:5d37b46e2f12dfc52ffe4d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importPrevFestif2025() {
  console.log('🚀 Démarrage de l\'import prev_festif_2025...\n');

  try {
    // Lecture du fichier Excel
    const filePath = path.join(__dirname, '../data/prev_festif_2025.xlsx');
    console.log('📂 Lecture du fichier:', filePath);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`✅ Fichier lu: ${rawData.length - 1} lignes de données\n`);

    // Parser les données (skip header)
    const [header, ...rows] = rawData;
    console.log('📋 Colonnes détectées:', header);

    const products = rows
      .filter(row => row[0] && row[1]) // Code et produit doivent exister
      .map(row => ({
        prod_code: String(row[0]),
        prod_lib: String(row[1]),
        prevision_colis: Number(row[2]) || 0,
        type: 'festif',
        annee: 2025,
        imported_at: new Date().toISOString()
      }));

    console.log(`📦 ${products.length} produits valides à importer\n`);

    // Import dans Firestore par batch (max 500 opérations par batch)
    const collectionRef = collection(db, 'previsions_festif_2025');
    const batchSize = 500;
    let batch = writeBatch(db);
    let count = 0;
    let totalImported = 0;

    console.log('💾 Import dans Firestore (collection: previsions_festif_2025)...');

    for (const product of products) {
      const docRef = doc(collectionRef);
      batch.set(docRef, product);
      count++;
      totalImported++;

      if (count >= batchSize) {
        await batch.commit();
        console.log(`  ✓ ${totalImported} produits importés...`);
        batch = writeBatch(db);
        count = 0;
      }
    }

    // Commit le dernier batch
    if (count > 0) {
      await batch.commit();
    }

    console.log(`\n✅ Import terminé avec succès !`);
    console.log(`📊 Total: ${totalImported} produits festifs 2025`);
    console.log(`\n🔥 Collection Firestore: previsions_festif_2025`);

    // Afficher un aperçu
    console.log('\n📋 Aperçu des données importées:');
    products.slice(0, 5).forEach((p, i) => {
      console.log(`  ${i + 1}. [${p.prod_code}] ${p.prod_lib} → ${p.prevision_colis} colis`);
    });

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'import:', error);
    process.exit(1);
  }
}

// Lancer l'import
importPrevFestif2025();
