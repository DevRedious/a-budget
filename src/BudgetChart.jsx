import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function BudgetChart({ products, darkMode }) {
  // Générer des données simulées d'évolution mensuelle
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const totalCA = products.reduce((sum, p) => sum + (p.ca || 0), 0);

    return months.map((month, idx) => {
      // Simulation d'une courbe réaliste avec variation
      const baseValue = totalCA * (0.7 + Math.random() * 0.6);
      const trend = totalCA * (0.5 + (idx / 12) * 0.8);
      return {
        month,
        ca: Math.round((baseValue + trend) / 1000000 * 10) / 10, // En millions
        quantity: Math.round((products.reduce((sum, p) => sum + (p.quantity || 0), 0) * (0.6 + Math.random() * 0.8)) / 1000),
      };
    });
  }, [products]);

  // Top produits avec évolution
  const topProductsData = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.ca || 0) - (a.ca || 0))
      .slice(0, 5)
      .map((p, idx) => ({
        name: p.prod_lib.substring(0, 20),
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
      {/* Graphique d'évolution CA mensuel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          📈 Évolution du CA Mensuel
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Tendance annuelle du chiffre d'affaires
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} label={{ value: 'CA (M€)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => `${value.toFixed(2)}M€`}
              labelFormatter={(label) => `Mois: ${label}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="ca"
              stroke="#3B82F6"
              fillOpacity={1}
              fill="url(#colorCA)"
              strokeWidth={2}
              name="CA (M€)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique de comparaison CA vs Quantité */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          💹 CA vs Quantité Vendus
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Corrélation entre volume et chiffre d'affaires
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
            <YAxis yAxisId="left" stroke={darkMode ? '#9ca3af' : '#6b7280'} label={{ value: 'CA (M€)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" stroke={darkMode ? '#9ca3af' : '#6b7280'} label={{ value: 'Quantité (K)', angle: 90, position: 'insideRight' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ca"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 4 }}
              activeDot={{ r: 6 }}
              name="CA (M€)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="quantity"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ fill: '#F59E0B', r: 4 }}
              activeDot={{ r: 6 }}
              name="Quantité (K)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tableau Top 5 avec indicateurs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          ⭐ Top 5 Produits Performance
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
                    className="w-2 h-12 bg-gradient-to-t from-blue-500 to-blue-300 rounded-full"
                    style={{ height: `${Math.min(48, (product.ca / 10000000) * 48)}px` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
