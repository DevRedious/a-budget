import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export default function DebugInfo() {
  const [info, setInfo] = useState({
    familles: 0,
    produits: 0,
    error: null,
  });

  useEffect(() => {
    const checkData = async () => {
      try {
        // Check familles
        const famillesSnap = await getDocs(collection(db, 'familles'));
        let totalProduits = 0;

        for (const familleDoc of famillesSnap.docs) {
          const produitsRef = collection(db, 'familles', familleDoc.id, 'produits');
          const produitsSnap = await getDocs(produitsRef);
          totalProduits += produitsSnap.size;
        }

        setInfo({
          familles: famillesSnap.size,
          produits: totalProduits,
          error: null,
        });
      } catch (error) {
        setInfo({
          familles: 0,
          produits: 0,
          error: error.message,
        });
      }
    };

    checkData();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs max-w-xs z-50">
      <p>Debug Info:</p>
      <p>Familles: {info.familles}</p>
      <p>Produits: {info.produits}</p>
      {info.error && <p className="text-red-400">Error: {info.error}</p>}
    </div>
  );
}
