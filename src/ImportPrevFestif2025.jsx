import React, { useState } from 'react';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import * as XLSX from 'xlsx';

const ImportPrevFestif2025 = () => {
    const [status, setStatus] = useState('En attente...');
    const [progress, setProgress] = useState(0);
    const [importing, setImporting] = useState(false);

    const startImport = async () => {
        setImporting(true);
        setProgress(0);

        try {
            setStatus('📂 Lecture du fichier Excel prev_festif_2025.xlsx...');

            // Charger le fichier Excel depuis /data
            const response = await fetch('/data/prev_festif_2025.xlsx');
            if (!response.ok) throw new Error('Impossible de charger le fichier');

            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Parser les données (skip header)
            // eslint-disable-next-line no-unused-vars
            const [header, ...rows] = rawData;

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

            setStatus(`✅ ${products.length} produits trouvés. Importation dans Firestore...`);

            // Import dans Firestore par batch (max 500 opérations par batch)
            const collectionRef = collection(db, 'previsions_festif_2025');
            const batchSize = 500;
            let batch = writeBatch(db);
            let count = 0;
            let totalImported = 0;

            for (const product of products) {
                const docRef = doc(collectionRef);
                batch.set(docRef, product);
                count++;
                totalImported++;

                if (count >= batchSize) {
                    await batch.commit();
                    batch = writeBatch(db);
                    count = 0;
                    setProgress(Math.round((totalImported / products.length) * 100));
                    setStatus(`💾 Import en cours... ${totalImported}/${products.length} produits`);
                }
            }

            // Commit le dernier batch
            if (count > 0) {
                await batch.commit();
            }

            setProgress(100);
            setStatus(`✅ Import terminé ! ${totalImported} produits festifs 2025 importés dans Firestore.`);

        } catch (error) {
            console.error('Erreur import:', error);
            setStatus(`❌ Erreur: ${error.message}`);
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md mx-auto mt-10">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Import Prévisions Festif 2025
            </h2>

            <p className="mb-4 text-gray-600 dark:text-gray-300">
                Importe les 92 produits festifs avec prévisions de colis depuis
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded ml-1">
                    prev_festif_2025.xlsx
                </code>
            </p>

            <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Collection Firestore :</strong> previsions_festif_2025
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    Données: code, libellé, prévision colis, type, année
                </p>
            </div>

            <div className="mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                    {progress}%
                </p>
            </div>

            <p className="mb-4 font-mono text-sm text-gray-700 dark:text-gray-300 min-h-[3rem] p-2 bg-gray-50 dark:bg-gray-900 rounded">
                {status}
            </p>

            <button
                onClick={startImport}
                disabled={importing}
                className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                    importing
                        ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
                {importing ? '⏳ Import en cours...' : '🚀 Lancer l\'import'}
            </button>

            {progress === 100 && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                    <p className="text-sm text-green-800 dark:text-green-200 text-center">
                        ✅ Import réussi ! Les données sont maintenant dans Firebase.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ImportPrevFestif2025;
