import React from 'react';
import { Wrench, AlertTriangle } from 'lucide-react';

export default function MaintenancePage({ darkMode }) {
    return (
        <div className="bg-white dark:bg-slate-900 min-h-screen flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 p-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 mb-6">
                            <Wrench className="w-10 h-10 text-slate-600 dark:text-slate-400" />
                        </div>

                        <h1 className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider">
                            Page en Maintenance
                        </h1>

                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="text-left">
                                    <p className="text-sm font-medium text-amber-900 dark:text-amber-300 mb-1">
                                        Fonctionnalité temporairement indisponible
                                    </p>
                                    <p className="text-sm text-amber-800 dark:text-amber-400">
                                        L'import de prévisions est actuellement en cours de révision. Utilisez la page "Gestion Produits" pour ajouter ou modifier des produits manuellement.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 text-left">
                            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                Alternatives disponibles
                            </h3>
                            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-slate-400 dark:text-slate-600">•</span>
                                    <span>Utilisez <strong className="text-slate-900 dark:text-slate-100">Gestion Produits</strong> pour ajouter des produits un par un</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-slate-400 dark:text-slate-600">•</span>
                                    <span>Modifiez les quantités et prévisions directement dans l'interface</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-slate-400 dark:text-slate-600">•</span>
                                    <span>Contactez l'administrateur pour l'import en masse de données</span>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-6 text-xs font-mono text-slate-500 dark:text-slate-500 uppercase tracking-widest">
                            Status: En maintenance
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
