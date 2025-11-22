import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import { PRODUITS_DATA } from './produitsImport';

export async function importProducts() {
  try {
    console.log('🚀 Début de l\'import des 330 produits...');
    console.log(`📊 Nombre de produits: ${PRODUITS_DATA.length}`);
    
    const batch = writeBatch(db);
    const productsCollection = collection(db, 'produits');
    
    PRODUITS_DATA.forEach((product, index) => {
      const docRef = doc(productsCollection);
      batch.set(docRef, {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      if ((index + 1) % 100 === 0) {
        console.log(`⏳ ${index + 1}/${PRODUITS_DATA.length} produits prêts...`);
      }
    });
    
    console.log('📤 Envoi vers Firestore...');
    await batch.commit();
    console.log(`✅ ${PRODUITS_DATA.length} produits importés avec succès !`);
    return { success: true, count: PRODUITS_DATA.length };
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
    return { success: false, error: error.message };
  }
}

// À appeler UNE SEULE FOIS pour importer les données
// importProducts();