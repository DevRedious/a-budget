import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1', '#14B8A6', '#F97316'];

export default function BudgetChart({ products, darkMode }) {
  // Données par famille (vraies données)
  const familyData = useMemo(() => {
    const stats = {};
    products.forEach(p => {
      if (!stats[p.family_lib]) {
        stats[p.family_lib] = { name: p.family_lib, ca: 0, quantity: 0, products: 0 };
      }
      stats[p.family_lib].ca += p.ca || 0;
      stats[p.family_lib].quantity += p.quantity || 0;
      stats[p.family_lib].products += 1;
    });
    return Object.values(stats).sort((a, b) => b.ca - a.ca);
  }, [products]);

  // Top 10 produits
  const topProductsData = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.ca || 0) - (a.ca || 0))
      .slice(0, 10)
      .map((p) => ({
        name: p.prod_lib.substring(0, 25),
        ca: p.ca,
        quantity: p.quantity,
        family: p.family_lib,
      }));
  }, [products]);

  const tooltipStyle = {
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    color: darkMode ? '#ffffff' : '#000000',
    borderRadius: '8px',
  };

  return (
    <div className="space-y-8">
      {/* Graphique CA par Famille */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Chiffre d'Affaires par Famille
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Répartition du CA selon les familles de produits
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={familyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
              interval={0}
            />
            <YAxis
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
              label={{ value: 'CA (€)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => `${(value / 1000000).toFixed(2)}M€`}
              labelFormatter={(label) => `Famille: ${label}`}
            />
            <Legend />
            <Bar dataKey="ca" fill="#3B82F6" name="CA (€)" radius={[8, 8, 0, 0]}>
              {familyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique Quantité par Famille */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          📦 Quantité Vendue par Famille
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Volume de produits vendus par catégorie
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={familyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
              interval={0}
            />
            <YAxis
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
              label={{ value: 'Quantité', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => value.toLocaleString('fr-FR')}
              labelFormatter={(label) => `Famille: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="quantity"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 5 }}
              activeDot={{ r: 7 }}
              name="Quantité"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top 10 Produits */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🏆 Top 10 Produits par CA
        </h3>
        <div className="space-y-3">
          {topProductsData.map((product, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 w-8">#{idx + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{product.family}</p>
              </div>
              <div className="text-right">
                <div className="inline-flex gap-4 items-center">
                  <div>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">
                      {(product.ca / 1000000).toFixed(2)}M€
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {product.quantity.toLocaleString('fr-FR')} u.
                    </p>
                  </div>
                  <div
                    className="w-2 bg-gradient-to-t from-blue-500 to-blue-300 rounded-full"
                    style={{ height: `${Math.min(48, (product.ca / Math.max(...topProductsData.map(p => p.ca))) * 48)}px` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de familles</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{familyData.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">CA Total</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {(familyData.reduce((sum, f) => sum + f.ca, 0) / 1000000).toFixed(1)}M€
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6 border-l-4 border-orange-500">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantité Totale</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
            {(familyData.reduce((sum, f) => sum + f.quantity, 0) / 1000).toFixed(0)}K
          </p>
        </div>
      </div>
    </div>
  );
}
