import { collection, getDocs, writeBatch, doc, deleteDoc, query } from 'firebase/firestore';
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
        if (familleDoc.id === '_metadata') continue;
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
    }

    // Si on n'a trouvé aucun produit via la structure /familles (même si la collection existe),
    // on tente le fallback vers les collections racines
    if (allProducts.length === 0) {
      console.log('⚠️ Aucun produit trouvé dans /familles, tentative fallback sur collections racines...');
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

// Récupérer les produits pour le plan de stockage
export async function getAllStorageProducts() {
  try {
    console.log('🔍 Début fetch produits stockage...');
    const produitsRef = collection(db, 'stockage_produits');
    const produits = await getDocs(produitsRef);
    console.log(`✓ Stockage: ${produits.size} produits trouvés`);

    const storageProducts = produits.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return storageProducts;
  } catch (error) {
    console.error('❌ Erreur récupération produits stockage:', error);
    return [];
  }
}

// Récupérer tous les produits de picking depuis Firestore
export async function getAllPickingProducts() {
  try {
    console.log('🔍 Début fetch produits picking...');
    const produitsRef = collection(db, 'pickingProducts');
    const produits = await getDocs(produitsRef);
    console.log(`✓ Picking: ${produits.size} produits trouvés`);
    return produits.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Erreur récupération produits picking:', error);
    return [];
  }
}

// Récupérer les prévisions festif 2025 depuis Firestore
export async function getPrevisionsFestif2025() {
  try {
    console.log('🔍 Début fetch prévisions festif 2025...');
    const previsionsRef = collection(db, 'previsions_festif_2025');
    const previsions = await getDocs(previsionsRef);
    console.log(`✓ Prévisions festif 2025: ${previsions.size} produits trouvés`);
    return previsions.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Erreur récupération prévisions festif 2025:', error);
    return [];
  }
}

// Sauvegarder un plan de stockage nommé dans Firestore
export async function saveStorageMap(planName, locations) {
  try {
    console.log(`💾 Début sauvegarde plan de stockage: ${planName}...`);
    const storageMapRef = collection(db, 'storage_maps');

    // Filtrer uniquement les emplacements assignés
    const assignedLocations = locations.filter(loc => loc.assignedProductId);

    // Créer ou mettre à jour le plan
    const planDocRef = doc(storageMapRef, planName);
    const batch = writeBatch(db);
    batch.set(planDocRef, {
      name: planName,
      locations: assignedLocations.map(loc => ({
        aisle: loc.aisle,
        row: loc.row,
        code: loc.code,
        assignedProductId: loc.assignedProductId
      })),
      saved_at: new Date().toISOString(),
      location_count: assignedLocations.length
    });
    await batch.commit();

    console.log(`✅ Plan "${planName}" sauvegardé: ${assignedLocations.length} emplacements`);
    return { success: true, count: assignedLocations.length };
  } catch (error) {
    console.error('❌ Erreur sauvegarde plan de stockage:', error);
    throw error;
  }
}

// Charger un plan de stockage spécifique depuis Firestore
export async function loadStorageMap(planName) {
  try {
    console.log(`🔍 Début chargement plan de stockage: ${planName}...`);
    const storageMapRef = collection(db, 'storage_maps');
    const planDocRef = doc(storageMapRef, planName);

    const snapshot = await getDocs(storageMapRef);
    const plan = snapshot.docs.find(d => d.id === planName);

    if (plan && plan.exists()) {
      const data = plan.data();
      console.log(`✓ Plan "${planName}": ${data.locations?.length || 0} emplacements trouvés`);
      return data.locations || [];
    }

    console.log(`⚠️ Plan "${planName}" non trouvé`);
    return [];
  } catch (error) {
    console.error('❌ Erreur chargement plan de stockage:', error);
    return [];
  }
}

// Récupérer la liste de tous les plans de stockage
export async function getAllStorageMaps() {
  try {
    console.log('🔍 Récupération de tous les plans de stockage...');
    const storageMapRef = collection(db, 'storage_maps');
    const snapshot = await getDocs(storageMapRef);

    const plans = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      saved_at: doc.data().saved_at,
      location_count: doc.data().location_count
    }));

    console.log(`✓ ${plans.length} plans trouvés`);
    return plans;
  } catch (error) {
    console.error('❌ Erreur récupération plans:', error);
    return [];
  }
}
