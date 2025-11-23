import { writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import budgetData from './imported_budget.json';

export async function importBudgetDataToFirestore() {
  try {
    console.log('🚀 Démarrage import 330 produits...');

    const batch = writeBatch(db);
    let batchCount = 0;
    const BATCH_SIZE = 100;
    const familyNames = [];

    // Grouper par famille
    const byFamily = {};
    budgetData.products.forEach(product => {
      const family = product.familleApproLib;
      if (!byFamily[family]) byFamily[family] = [];
      byFamily[family].push(product);
    });

    console.log(`📦 ${Object.keys(byFamily).length} familles identifiées:`, Object.keys(byFamily));

    // Import par famille - créer la collection /familles d'abord
    const famillesRef = doc(db, 'familles', '_metadata');
    batch.set(famillesRef, { created: new Date() }, { merge: true });

    Object.entries(byFamily).forEach(([familyName, products]) => {
      const familyId = familyName.toLowerCase().replace(/[- ]/g, '_');
      familyNames.push(familyId);
      console.log(`📂 Ajout famille: ${familyId} (${products.length} produits)`);

      // CRUCIAL: Créer le document parent de la famille pour qu'il soit listable
      const familyRef = doc(db, 'familles', familyId);
      batch.set(familyRef, {
        name: familyName,
        id: familyId,
        productCount: products.length,
        updatedAt: new Date()
      }, { merge: true });

      products.forEach(product => {
        const prodId = `prod_${product.prodCode}`;
        const ref = doc(db, 'familles', familyId, 'produits', prodId);

        const ecartQte = product.picN1 - product.qteN1;
        const ecartQtePct = product.qteN1 ? (ecartQte / product.qteN1) * 100 : 0;
        const ecartCA = product.caPrevBudgetN1PIC - product.caA1;
        const ecartCAPct = product.caA1 ? (ecartCA / product.caA1) * 100 : 0;

        batch.set(ref, {
          // Identification
          prod_code: product.prodCode,
          prod_lib: product.prodLib,
          famille_appro_lib: familyName,
          famille_compta: product.familleCompta,

          // Budget N-1
          qte_n1_budget: product.qteN1,
          ca_n1_budget: product.caA1,
          pmp_n1: product.pmpN1,

          // Prévision N+1
          pic_n1: product.picN1,
          ca_prev_n1: product.caPrevBudgetN1PIC,
          prev_pa_n1: product.prevPAN1,

          // Stock
          stock_actuel: product.stock,
          besoin_stock_deduit: product.besoinStockDeduit,

          // Écarts
          ecart_qte: ecartQte,
          ecart_qte_pct: Math.round(ecartQtePct * 100) / 100,
          ecart_ca: ecartCA,
          ecart_ca_pct: Math.round(ecartCAPct * 100) / 100,

          // Évolutions
          evolution_prix_pct: Math.round(product.evolutionPA * 10000) / 100,
          evolution_volume_pct: Math.round(product.evolutionVolume * 10000) / 100,
          evolution_ca_pct: Math.round(product.evolutionCA * 10000) / 100,

          // Alertes auto
          has_alert: false,
          alert_type: null,
          alert_level: null,

          // Métadonnées
          unite: product.unite || product.uniteFact,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        batchCount++;
        if (batchCount % BATCH_SIZE === 0) {
          console.log(`✓ ${batchCount} produits préparés...`);
        }
      });
    });

    console.log(`🚀 Envoi du batch avec ${batchCount} produits à Firestore...`);
    await batch.commit();
    console.log(`✅ Import complet ! ${batchCount} produits importés dans familles:`, familyNames);
    return true;
  } catch (error) {
    console.error('❌ Erreur import:', error);
    throw error;
  }
}
