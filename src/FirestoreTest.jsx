import React, { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export default function FirestoreTest() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const testFamilies = async () => {
    setLoading(true);
    try {
      console.log('🔧 Testing /familles collection...');
      const snap = await getDocs(collection(db, 'familles'));
      console.log('✓ Familles found:', snap.size);

      const familyIds = snap.docs.map(doc => doc.id);
      console.log('Family IDs:', familyIds);

      let totalProducts = 0;
      const familyDetails = [];

      for (const familleDoc of snap.docs) {
        const produitsSnap = await getDocs(
          collection(db, 'familles', familleDoc.id, 'produits')
        );
        const prodCount = produitsSnap.size;
        totalProducts += prodCount;
        familyDetails.push({
          id: familleDoc.id,
          products: prodCount,
        });
        console.log(`✓ ${familleDoc.id}: ${prodCount} products`);
      }

      setResults({
        familiesCount: snap.size,
        totalProducts,
        familyDetails,
      });
    } catch (error) {
      console.error('❌ Error:', error);
      setResults({
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-4 left-4 bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Firestore Test</h3>
      <button
        onClick={testFamilies}
        disabled={loading}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm mb-2 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Collections'}
      </button>
      {results && (
        <div className="text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded mt-2 font-mono">
          {results.error ? (
            <p className="text-red-600">Error: {results.error}</p>
          ) : (
            <>
              <p>Families: {results.familiesCount}</p>
              <p>Total Products: {results.totalProducts}</p>
              {results.familyDetails.map((f, i) => (
                <p key={i}>{f.id}: {f.products} products</p>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
