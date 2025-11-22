import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Récupérer tous les produits du budget depuis Firestore
export async function getAllBudgetProducts() {
  try {
    const allProducts = [];
    console.log('🔍 Début fetch familles...');

    // Essayer d'abord /familles
    let familles = await getDocs(collection(db, 'familles'));
    console.log('✓ Familles trouvées:', familles.size, 'collections');

    // Si /familles existe et a des docs (pas juste le __metadata__)
    if (familles.size > 0) {
      for (const familleDoc of familles.docs) {
        if (familleDoc.id === '__metadata__') continue;
        console.log(`🔍 Fetch produits pour famille: ${familleDoc.id}`);
        const produitsRef = collection(db, 'familles', familleDoc.id, 'produits');
        const produits = await getDocs(produitsRef);
        console.log(`✓ ${familleDoc.id}: ${produits.size} produits trouvés`);

        produits.forEach(doc => {
          allProducts.push({
            id: doc.id,
            familleId: familleDoc.id,
            ...doc.data(),
          });
        });
      }
    } else {
      // Sinon chercher les familles à la racine (anciennes données)
      console.log('⚠️ /familles vide, cherchant les familles à la racine...');
      const collectionsSnap = await getDocs(collection(db, ''));
      // Note: Firestore ne permet pas de lister les collections facilement, donc on cherche les collections connues
      const familyNames = ['champignons', 'epicerie_additif', 'fruits_legumes', 'feculent', 'liquides',
                           'produits_d_oeuf', 'produits_de_la_mer_coquillage', 'produits_de_la_mer_crustace',
                           'produits_de_la_mer_cephalopode', 'produits_de_la_mer_poisson', 'produits_laitiers',
                           'produits_negoce', 'viande_agneau', 'viande_boeuf', 'viande_charcuterie', 'viande_gibier',
                           'viande_porc', 'viande_volaille'];

      for (const familyId of familyNames) {
        try {
          const produitsRef = collection(db, familyId);
          const produits = await getDocs(produitsRef);
          console.log(`✓ ${familyId}: ${produits.size} produits trouvés`);

          produits.forEach(doc => {
            allProducts.push({
              id: doc.id,
              familleId: familyId,
              ...doc.data(),
            });
          });
        } catch (err) {
          // Collection n'existe pas, continuer
        }
      }
    }

    console.log('✅ Total produits chargés:', allProducts.length);
    return allProducts;
  } catch (error) {
    console.error('❌ Erreur récupération produits:', error);
    return [];
  }
}

// Récupérer les produits d'une famille spécifique
export async function getFamilyProducts(familleId) {
  try {
    const produitsRef = collection(db, 'familles', familleId, 'produits');
    const produits = await getDocs(produitsRef);
    return produits.docs.map(doc => ({
      id: doc.id,
      familleId,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erreur récupération famille:', error);
    return [];
  }
}

// Compter les produits en alerte
export async function getAlertCounts() {
  const products = await getAllBudgetProducts();

  const inflation = products.filter(p => (p.evolution_prix_pct || 0) > 10).length;
  const volume = products.filter(p => (p.evolution_volume_pct || 0) < -10).length;
  const budget = products.filter(p => Math.abs(p.ecart_ca_pct || 0) > 15).length;

  return {
    total: inflation + volume + budget,
    inflation,
    volume,
    budget,
  };
}
