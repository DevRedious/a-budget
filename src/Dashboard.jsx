import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, TrendingUp, DollarSign, Package, BarChart3, Moon, Sun, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import BudgetChart from './BudgetChart';
import BudgetComparison from './BudgetComparison';
import StorageMap from './StorageMap';
import AlertsDashboard from './AlertsDashboard';
import { getAllBudgetProducts } from './firebaseHelpers';

const ITEMS_PER_PAGE = 50;
const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1', '#14B8A6', '#F97316'];

export default function Dashboard({ darkMode, setDarkMode, user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState('overview');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getAllBudgetProducts();
        console.log('Dashboard: Chargé', data.length, 'produits du budget');
        setProducts(data);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const families = useMemo(() => {
    const unique = {};
    products.forEach(p => {
      const familyKey = p.famille_appro_lib || p.family_code;
      if (!unique[familyKey]) {
        unique[familyKey] = p.famille_appro_lib || p.family_lib;
      }
    });
    return unique;
  }, [products]);

  const filteredData = useMemo(() => {
    return products.filter(product => {
      const matchSearch = product.prod_lib?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.prod_code?.toString().includes(searchTerm);
      const familyKey = product.famille_appro_lib || product.family_code;
      const matchFamily = !selectedFamily || familyKey === selectedFamily;
      return matchSearch && matchFamily;
    });
  }, [searchTerm, selectedFamily, products]);

  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const stats = useMemo(() => {
    const totalCA = filteredData.reduce((sum, p) => sum + (p.ca_n1_budget || p.ca || 0), 0);
    const totalQuantity = filteredData.reduce((sum, p) => sum + (p.qte_n1_budget || p.quantity || 0), 0);
    const avgPrice = filteredData.length > 0 ? totalCA / filteredData.length : 0;
    return { totalCA, totalQuantity, avgPrice, productCount: filteredData.length };
  }, [filteredData]);

  const familyStats = useMemo(() => {
    const stats = {};
    products.forEach(p => {
      const familyKey = p.famille_appro_lib || p.family_lib;
      const familyName = p.famille_appro_lib || p.family_lib;
      if (!stats[familyKey]) {
        stats[familyKey] = { name: familyName, ca: 0, quantity: 0, products: 0 };
      }
      stats[familyKey].ca += p.ca_n1_budget || p.ca || 0;
      stats[familyKey].quantity += p.qte_n1_budget || p.quantity || 0;
      stats[familyKey].products += 1;
    });
    return Object.values(stats).sort((a, b) => b.ca - a.ca);
  }, [products]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFamily]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Chargement des données Firebase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <p className="text-red-600 font-bold mb-2">Erreur</p>
          <p className="text-gray-700">{error}</p>
          <p className="text-sm text-gray-600 mt-4">Vérifiez que la collection "produits" existe dans Firestore et que les données sont importées.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <img
                src="/Logo-LECHEF-Bistronome-1024x711.png"
                alt="L'echef Bistronome"
                className="h-16 w-auto object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budget Agroalimentaire</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Firebase Firestore - {products.length} produits</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-4 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                title={darkMode ? 'Mode clair' : 'Mode sombre'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {['overview', 'products', 'budget', 'alerts', 'analytics', 'storage'].map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${view === v ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {v === 'overview' ? '📊 Vue' : v === 'products' ? '📦 Produits' : v === 'budget' ? '💰 Budget' : v === 'alerts' ? '⚠️ Alertes' : v === 'analytics' ? '📈 Analyses' : '🗺️ Plan Stockage'}
                </button>
              ))}
              {user && onLogout && (
                <button
                  onClick={onLogout}
                  className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <select
              value={selectedFamily || ''}
              onChange={(e) => setSelectedFamily(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="">Toutes ({Object.keys(families).length})</option>
              {Object.entries(families).map(([code, lib]) => (
                <option key={code} value={code}>{lib}</option>
              ))}
            </select>
          </div>
        </div>
      </header >

      <main className="max-w-7xl mx-auto px-6 py-8">
        {view === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">CA Total</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {(stats.totalCA / 1000000).toFixed(2)}M€
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Quantité Totale</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {(stats.totalQuantity / 1000).toFixed(1)}K
                    </p>
                  </div>
                  <Package className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Prix Moyen</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {stats.avgPrice.toFixed(2)}€
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-orange-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Produits</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{products.length}</p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-purple-500 opacity-20" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">CA par Famille</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={familyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, color: darkMode ? '#ffffff' : '#000000' }} formatter={(value) => `${(value / 1000).toFixed(0)}K€`} />
                    <Bar dataKey="ca" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Distribution CA</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={familyStats} dataKey="ca" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                      {familyStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, color: darkMode ? '#ffffff' : '#000000' }} formatter={(value) => `${(value / 1000000).toFixed(1)}M€`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {view === 'products' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Produits ({filteredData.length})</h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage}/{totalPages}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Code</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Produit</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Famille</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">Qté</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">Prix</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">CA</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((product) => (
                    <tr key={product.id} className="border-b dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400">{product.prod_code}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium text-sm">{product.prod_lib}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-sm">{product.family_lib}</td>
                      <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{product.quantity?.toLocaleString('fr-FR')}</td>
                      <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{product.unit_price?.toFixed(2)}€</td>
                      <td className="px-6 py-4 text-right font-semibold text-blue-600 dark:text-blue-400">{(product.ca / 1000).toFixed(1)}K€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-700">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                >
                  <ChevronLeft className="w-4 h-4" /> Précédent
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg ${currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                >
                  Suivant <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
        {view === 'budget' && (
          <BudgetComparison products={products} darkMode={darkMode} />
        )}

        {view === 'alerts' && (
          <AlertsDashboard products={products} darkMode={darkMode} />
        )}

        {view === 'analytics' && (
          <BudgetChart products={products} darkMode={darkMode} />
        )}

        {view === 'storage' && (
          <StorageMap darkMode={darkMode} />
        )}
      </main>
    </div >
  );
}
