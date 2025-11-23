import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { firebaseConfig } from './firebase.js';

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS_TO_DELETE = [
    'champignons',
    'epicerie_additif',
    'viande_boeuf',
    'viande_veau',
    'viande_porc',
    'viande_agneau',
    'volaille',
    'gibier',
    'charcuterie',
    'produits_laitiers',
    'beurre_oeuf_fromage',
    'fruits_legumes',
    'surgeles',
    'epicerie_sucree',
    'epicerie_salee',
    'boissons',
    'non_alimentaire'
];

async function deleteCollection(collectionName) {
    console.log(`Suppression de la collection : ${collectionName}...`);
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
        console.log(`Collection ${collectionName} déjà vide ou inexistante.`);
        return;
    }

    const batch = writeBatch(db);
    let count = 0;

    snapshot.docs.forEach((document) => {
        batch.delete(doc(db, collectionName, document.id));
        count++;
    });

    await batch.commit();
    console.log(`✅ ${count} documents supprimés de ${collectionName}.`);
}

async function cleanup() {
    console.log('Démarrage du nettoyage des anciennes collections...');

    for (const col of COLLECTIONS_TO_DELETE) {
        await deleteCollection(col);
    }

    console.log('🎉 Nettoyage terminé !');
    process.exit(0);
}

cleanup().catch(console.error);
