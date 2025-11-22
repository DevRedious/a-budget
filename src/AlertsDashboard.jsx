import React, { useState, useEffect, useMemo } from 'react';
import { TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { getAllBudgetProducts } from './firebaseHelpers';

export default function AlertsDashboard({ darkMode }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await getAllBudgetProducts();
        console.log('AlertsDashboard: Chargé', allProducts.length, 'produits');
        setProducts(allProducts);
      } catch (err) {
        console.error('Erreur fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Rafraîchir toutes les 3 secondes
    const interval = setInterval(fetchProducts, 3000);
    return () => clearInterval(interval);
  }, []);

  // Calculer les alertes
  const alerts = useMemo(() => {
    const alertsList = [];

    products.forEach(product => {
      // Alerte inflation (prix +10%)
      if (product.evolution_prix_pct > 10) {
        alertsList.push({
          id: `${product.prod_code}_prix`,
          type: 'inflation',
          level: 'critical',
          product,
          message: `Inflation critique : +${product.evolution_prix_pct.toFixed(1)}%`,
          value: product.evolution_prix_pct,
          icon: '🔴',
        });
      }

      // Alerte baisse volume (-10%)
      if (product.evolution_volume_pct < -10) {
        alertsList.push({
          id: `${product.prod_code}_volume`,
          type: 'volume',
          level: 'critical',
          product,
          message: `Baisse volume critique : ${product.evolution_volume_pct.toFixed(1)}%`,
          value: product.evolution_volume_pct,
          icon: '🔴',
        });
      }

      // Alerte écart budget >15%
      if (Math.abs(product.ecart_ca_pct) > 15) {
        alertsList.push({
          id: `${product.prod_code}_budget`,
          type: 'budget',
          level: 'warning',
          product,
          message: `Écart budget élevé : ${product.ecart_ca_pct > 0 ? '+' : ''}${product.ecart_ca_pct.toFixed(1)}%`,
          value: product.ecart_ca_pct,
          icon: '🟡',
        });
      }
    });

    return alertsList.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }, [products]);

  const filteredAlerts = useMemo(() => {
    if (filterType === 'all') return alerts;
    return alerts.filter(a => a.type === filterType);
  }, [alerts, filterType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const alertCounts = {
    all: alerts.length,
    inflation: alerts.filter(a => a.type === 'inflation').length,
    volume: alerts.filter(a => a.type === 'volume').length,
    budget: alerts.filter(a => a.type === 'budget').length,
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', count: alertCounts.all, color: 'bg-blue-100 dark:bg-blue-900/20 border-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
          { label: 'Inflation', count: alertCounts.inflation, color: 'bg-red-100 dark:bg-red-900/20 border-red-500', textColor: 'text-red-600 dark:text-red-400' },
          { label: 'Baisse Volume', count: alertCounts.volume, color: 'bg-orange-100 dark:bg-orange-900/20 border-orange-500', textColor: 'text-orange-600 dark:text-orange-400' },
          { label: 'Écart Budget', count: alertCounts.budget, color: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-500', textColor: 'text-yellow-600 dark:text-yellow-400' },
        ].map(item => (
          <div key={item.label} className={`${item.color} border-l-4 rounded-lg p-4`}>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
            <p className={`text-2xl font-bold ${item.textColor} mt-2`}>{item.count}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'inflation', 'volume', 'budget'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            {type === 'all' ? 'Tous' : type === 'inflation' ? '🔴 Inflation' : type === 'volume' ? '🔴 Volume' : '🟡 Budget'}
          </button>
        ))}
      </div>

      {/* Alertes List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">Aucune alerte pour ce filtre</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`rounded-lg p-4 shadow-lg border-l-4 ${
                alert.level === 'critical'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl">{alert.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 dark:text-white">{alert.product.prod_lib}</h4>
                    <span className="text-xs bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                      {alert.product.famille_appro_lib}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{alert.message}</p>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <p>• Budget N-1 : {alert.product.ca_n1_budget?.toFixed(0)}€</p>
                    <p>• PIC N+1 : {alert.product.ca_prev_n1?.toFixed(0)}€</p>
                    <p>• Code : {alert.product.prod_code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {alert.value > 0 ? '+' : ''}{alert.value.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
