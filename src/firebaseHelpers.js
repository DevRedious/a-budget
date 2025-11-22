import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Récupérer tous les produits du budget depuis Firestore
export async function getAllBudgetProducts() {
  try {
    const allProducts = [];
    const familles = await getDocs(collection(db, 'familles'));

    for (const familleDoc of familles.docs) {
      const produitsRef = collection(db, 'familles', familleDoc.id, 'produits');
      const produits = await getDocs(produitsRef);
      produits.forEach(doc => {
        allProducts.push({
          id: doc.id,
          familleId: familleDoc.id,
          ...doc.data(),
        });
      });
    }

    return allProducts;
  } catch (error) {
    console.error('Erreur récupération produits:', error);
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
