import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const ITEMS_PER_PAGE = 30;

export default function BudgetComparison({ darkMode }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('ecart_ca_pct'); // tri par écart CA
  const [selectedFamily, setSelectedFamily] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const allProducts = [];
        const familles = await getDocs(collection(db, 'familles'));

        for (const familleDoc of familles.docs) {
          const produitsRef = collection(db, 'familles', familleDoc.id, 'produits');
          const produits = await getDocs(produitsRef);
          produits.forEach(doc => allProducts.push({ id: doc.id, ...doc.data() }));
        }

        setProducts(allProducts);
      } catch (err) {
        console.error('Erreur fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const families = useMemo(() => {
    const unique = new Set();
    products.forEach(p => unique.add(p.famille_appro_lib));
    return Array.from(unique).sort();
  }, [products]);

  const filteredData = useMemo(() => {
    let data = products;
    if (selectedFamily) {
      data = data.filter(p => p.famille_appro_lib === selectedFamily);
    }
    return data.sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      return Math.abs(bVal) - Math.abs(aVal);
    });
  }, [products, selectedFamily, sortBy]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const getAlertColor = (ecartPct) => {
    if (Math.abs(ecartPct) > 15) return 'text-red-600 dark:text-red-400';
    if (Math.abs(ecartPct) > 10) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getAlertBg = (ecartPct) => {
    if (Math.abs(ecartPct) > 15) return 'bg-red-50 dark:bg-red-900/20';
    if (Math.abs(ecartPct) > 10) return 'bg-orange-50 dark:bg-orange-900/20';
    return 'bg-green-50 dark:bg-green-900/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Filtres</h3>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => setSelectedFamily(null)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              !selectedFamily
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            Tous ({filteredData.length})
          </button>
          {families.map(family => (
            <button
              key={family}
              onClick={() => setSelectedFamily(family)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedFamily === family
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              {family} ({products.filter(p => p.famille_appro_lib === family).length})
            </button>
          ))}
        </div>
      </div>

      {/* Tri */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">
          Trier par :
        </label>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="ecart_ca_pct">Écart CA %</option>
          <option value="ecart_qte_pct">Écart Quantité %</option>
          <option value="evolution_prix_pct">Évolution Prix %</option>
          <option value="evolution_volume_pct">Évolution Volume %</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Produit</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">Budget N-1</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">PIC N+1</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">Écart %</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">Évol Prix</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">Évol Vol</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((product, idx) => (
                <tr key={idx} className={`border-b dark:border-gray-700 ${getAlertBg(product.ecart_ca_pct)}`}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-xs">{product.prod_lib}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{product.famille_appro_lib}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                    {product.ca_n1_budget?.toFixed(0)}€
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                    {product.ca_prev_n1?.toFixed(0)}€
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${getAlertColor(product.ecart_ca_pct)}`}>
                    {product.ecart_ca_pct > 0 ? '+' : ''}{product.ecart_ca_pct?.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {product.evolution_prix_pct > 5 ? (
                        <TrendingUp className="w-4 h-4 text-red-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-green-600" />
                      )}
                      <span className="text-gray-700 dark:text-gray-300">
                        {product.evolution_prix_pct > 0 ? '+' : ''}{product.evolution_prix_pct?.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {product.evolution_volume_pct > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-gray-700 dark:text-gray-300">
                        {product.evolution_volume_pct > 0 ? '+' : ''}{product.evolution_volume_pct?.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-700">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" /> Précédent
            </button>
            <span className="text-gray-700 dark:text-gray-300">
              Page {currentPage}/{totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              Suivant <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
