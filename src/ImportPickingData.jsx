import React, { useState } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import * as XLSX from 'xlsx';

const ImportPickingData = () => {
    const [status, setStatus] = useState('En attente...');
    const [progress, setProgress] = useState(0);

    const readExcel = async (url, type) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Impossible de charger ${url}`);
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            if (!rows.length) return [];

            const [header, ...data] = rows;

            // Recherche plus souple ou directe des colonnes
            let codeIdx = header.findIndex((h) => /code|prod_code/i.test(String(h)));
            let nameIdx = header.findIndex((h) => /nom|name|lib|prod_lib/i.test(String(h)));

            console.log(`� Headers trouvés pour ${type}: ${JSON.stringify(header)}`);
            console.log(`🎯 Indices: Code=${codeIdx}, Nom=${nameIdx}`);

            return data.map((row) => ({
                prod_code: row[codeIdx],
                prod_lib: row[nameIdx],
                type,
            })).filter(p => p.prod_code && p.prod_lib);
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const startImport = async () => {
        console.log('🚀 Démarrage de l\'import...');
        try {
            setStatus('Lecture des fichiers Excel...');

            console.log('📂 Lecture de festif_products.xlsx...');
            const festif = await readExcel('/festif_products.xlsx', 'festif');
            console.log(`✅ Festif: ${festif.length} produits`);

            console.log('📂 Lecture de non_festif_products.xlsx...');
            const nonFestif = await readExcel('/non_festif_products.xlsx', 'non_festif');
            console.log(`✅ Non-Festif: ${nonFestif.length} produits`);

            const allProducts = [...festif, ...nonFestif];
            console.log(`📦 Total à importer: ${allProducts.length}`);

            setStatus(`Trouvé ${allProducts.length} produits. Suppression de l'ancienne collection...`);

            // Supprimer l'existant (batch delete)
            const ref = collection(db, 'pickingProducts');
            const snapshot = await getDocs(ref);
            const batchSize = 500;
            let batch = writeBatch(db);
            let count = 0;

            for (const d of snapshot.docs) {
                batch.delete(doc(db, 'pickingProducts', d.id));
                count++;
                if (count >= batchSize) {
                    await batch.commit();
                    batch = writeBatch(db);
                    count = 0;
                }
            }
            if (count > 0) await batch.commit();

            setStatus(`Importation de ${allProducts.length} produits...`);

            // Import par batch
            batch = writeBatch(db);
            count = 0;
            let totalImported = 0;

            for (const p of allProducts) {
                const newDocRef = doc(collection(db, 'pickingProducts')); // Auto-ID
                batch.set(newDocRef, p);
                count++;
                totalImported++;

                if (count >= batchSize) {
                    await batch.commit();
                    batch = writeBatch(db);
                    count = 0;
                    setProgress(Math.round((totalImported / allProducts.length) * 100));
                }
            }
            if (count > 0) await batch.commit();

            setStatus('✅ Importation terminée avec succès !');
            setProgress(100);

        } catch (error) {
            console.error(error);
            setStatus(`❌ Erreur: ${error.message}`);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md mx-auto mt-10">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Importer Picking Products</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">Importe festif_products.xlsx et non_festif_products.xlsx vers Firestore (collection: pickingProducts).</p>

            <div className="mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <p className="mb-4 font-mono text-sm text-gray-700 dark:text-gray-300">{status}</p>

            <button
                onClick={startImport}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
                Lancer l'import
            </button>
        </div>
    );
};

export default ImportPickingData;
