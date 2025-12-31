import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, ArrowUpDown, Download, AlertTriangle } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { loadPickingProducts } from './loadPickingProducts';
import { getPrevisionsFestif2025 } from './firebaseHelpers';

export default function ProductsManager({ darkMode }) {
    const [products, setProducts] = useState([]);
    const [previsions, setPrevisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'festif', 'non_festif'
    const [filterPrevision, setFilterPrevision] = useState('all'); // 'all', 'with', 'without'
    const [sortBy, setSortBy] = useState('code'); // 'code', 'name', 'prevision-asc', 'prevision-desc'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showNewTypeInput, setShowNewTypeInput] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');
    const [formData, setFormData] = useState({
        prod_code: '',
        prod_lib: '',
        type: 'festif',
        prevision_colis: 0,
        quantity: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsData, previsionsData] = await Promise.all([
                loadPickingProducts(),
                getPrevisionsFestif2025()
            ]);
            console.log('📦 Produits chargés:', productsData.length);
            console.log('📊 Types trouvés:', [...new Set(productsData.map(p => p.type))]);
            setProducts(productsData);
            setPrevisions(previsionsData);
        } catch (error) {
            console.error('Erreur chargement données:', error);
        } finally {
            setLoading(false);
        }
    };

    // Détecter les doublons
    const duplicates = useMemo(() => {
        const codeMap = new Map();
        products.forEach(p => {
            const code = String(p.prod_code || '').trim();
            if (!code) return;
            if (!codeMap.has(code)) {
                codeMap.set(code, []);
            }
            codeMap.get(code).push(p);
        });

        const dupes = [];
        codeMap.forEach((prods, code) => {
            if (prods.length > 1) {
                dupes.push({ code, products: prods });
            }
        });

        return dupes;
    }, [products]);

    // Liste unique des types de produits
    const availableTypes = useMemo(() => {
        const types = new Set(['festif', 'non_festif']); // Types par défaut
        products.forEach(p => {
            if (p.type) types.add(p.type);
        });
        return Array.from(types).sort();
    }, [products]);

    const filteredProducts = useMemo(() => {
        let filtered = products.filter(p => {
            const matchSearch = p.prod_lib?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.prod_code?.toString().includes(searchTerm);
            const matchType = filterType === 'all' || p.type === filterType;

            // Filtre par prévision
            let matchPrevision = true;
            if (filterPrevision !== 'all') {
                const hasPrevision = previsions.some(prev => String(prev.prod_code).trim() === String(p.prod_code).trim());
                matchPrevision = filterPrevision === 'with' ? hasPrevision : !hasPrevision;
            }

            return matchSearch && matchType && matchPrevision;
        });

        // Tri
        filtered.sort((a, b) => {
            if (sortBy === 'code') {
                return String(a.prod_code).localeCompare(String(b.prod_code));
            } else if (sortBy === 'name') {
                return a.prod_lib.localeCompare(b.prod_lib);
            } else if (sortBy === 'prevision-asc' || sortBy === 'prevision-desc') {
                const aPrev = previsions.find(p => String(p.prod_code).trim() === String(a.prod_code).trim())?.prevision_colis || 0;
                const bPrev = previsions.find(p => String(p.prod_code).trim() === String(b.prod_code).trim())?.prevision_colis || 0;
                return sortBy === 'prevision-asc' ? aPrev - bPrev : bPrev - aPrev;
            }
            return 0;
        });

        return filtered;
    }, [products, searchTerm, filterType, filterPrevision, sortBy, previsions]);

    const handleOpenModal = (product = null) => {
        if (product) {
            // Édition
            const prevision = previsions.find(p => String(p.prod_code).trim() === String(product.prod_code).trim());
            setEditingProduct(product);
            setFormData({
                prod_code: product.prod_code,
                prod_lib: product.prod_lib,
                type: product.type || 'festif',
                prevision_colis: prevision?.prevision_colis || 0,
                quantity: product.quantity || 0
            });
        } else {
            // Nouveau produit
            setEditingProduct(null);
            setFormData({
                prod_code: '',
                prod_lib: '',
                type: availableTypes.length > 0 ? availableTypes[0] : 'festif',
                prevision_colis: 0,
                quantity: 0
            });
        }
        setShowNewTypeInput(false);
        setNewTypeName('');
        setIsModalOpen(true);
    };

    const handleTypeChange = (value) => {
        if (value === '__new__') {
            setShowNewTypeInput(true);
            setNewTypeName('');
        } else {
            setShowNewTypeInput(false);
            setFormData({ ...formData, type: value });
        }
    };

    const handleAddNewType = () => {
        const trimmedType = newTypeName.trim();
        if (!trimmedType) {
            alert('Le nom du type ne peut pas être vide');
            return;
        }
        setFormData({ ...formData, type: trimmedType });
        setShowNewTypeInput(false);
        setNewTypeName('');
    };

    const handleSave = async () => {
        try {
            if (!formData.prod_code || !formData.prod_lib) {
                alert('Code et libellé obligatoires');
                return;
            }

            console.log('💾 Sauvegarde produit avec type:', formData.type);

            if (editingProduct) {
                // Mise à jour produit existant
                const productRef = doc(db, 'pickingProducts', editingProduct.id);
                await updateDoc(productRef, {
                    prod_code: formData.prod_code,
                    prod_lib: formData.prod_lib,
                    type: formData.type,
                    quantity: Number(formData.quantity)
                });
                console.log('✅ Produit mis à jour avec type:', formData.type);

                // Si festif, mettre à jour prévision
                if (formData.type === 'festif') {
                    const prevision = previsions.find(p => String(p.prod_code).trim() === String(formData.prod_code).trim());
                    if (prevision) {
                        const prevRef = doc(db, 'previsions_festif_2025', prevision.id);
                        await updateDoc(prevRef, {
                            prod_lib: formData.prod_lib,
                            prevision_colis: Number(formData.prevision_colis)
                        });
                    } else {
                        // Créer nouvelle prévision
                        await addDoc(collection(db, 'previsions_festif_2025'), {
                            prod_code: formData.prod_code,
                            prod_lib: formData.prod_lib,
                            prevision_colis: Number(formData.prevision_colis)
                        });
                    }
                }
            } else {
                // Nouveau produit
                await addDoc(collection(db, 'pickingProducts'), {
                    prod_code: formData.prod_code,
                    prod_lib: formData.prod_lib,
                    type: formData.type,
                    quantity: Number(formData.quantity)
                });
                console.log('✅ Nouveau produit créé avec type:', formData.type);

                // Si festif, ajouter prévision
                if (formData.type === 'festif') {
                    await addDoc(collection(db, 'previsions_festif_2025'), {
                        prod_code: formData.prod_code,
                        prod_lib: formData.prod_lib,
                        prevision_colis: Number(formData.prevision_colis)
                    });
                }
            }

            await loadData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    const handleDelete = async (product) => {
        if (!window.confirm(`Supprimer le produit ${product.prod_lib} ?`)) return;

        try {
            await deleteDoc(doc(db, 'pickingProducts', product.id));

            // Supprimer aussi de prévisions si festif
            if (product.type === 'festif') {
                const prevision = previsions.find(p => String(p.prod_code).trim() === String(product.prod_code).trim());
                if (prevision) {
                    await deleteDoc(doc(db, 'previsions_festif_2025', prevision.id));
                }
            }

            await loadData();
        } catch (error) {
            console.error('Erreur suppression:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const getTypeColor = (type) => {
        // Couleurs prédéfinies pour certains types
        const colorMap = {
            'festif': { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-900 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
            'non_festif': { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-900 dark:text-green-300', border: 'border-green-200 dark:border-green-800' }
        };

        // Si le type a une couleur prédéfinie, l'utiliser
        if (colorMap[type]) {
            return colorMap[type];
        }

        // Sinon, utiliser une couleur neutre (bleu/slate)
        return {
            bg: 'bg-blue-50 dark:bg-blue-950',
            text: 'text-blue-900 dark:text-blue-300',
            border: 'border-blue-200 dark:border-blue-800'
        };
    };

    const exportDuplicatesToCSV = () => {
        if (duplicates.length === 0) {
            alert('Aucun doublon détecté');
            return;
        }

        // En-tête CSV
        let csv = 'Code Produit,Libellé,Type,ID Firebase,Prévision Colis\n';

        // Ajouter chaque doublon
        duplicates.forEach(({ code, products: prods }) => {
            prods.forEach(p => {
                const prevision = previsions.find(prev => String(prev.prod_code).trim() === String(p.prod_code).trim());
                csv += `"${p.prod_code}","${p.prod_lib}","${p.type}","${p.id}","${prevision?.prevision_colis || ''}"\n`;
            });
        });

        // Créer le fichier et le télécharger
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `doublons_produits_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-600 dark:text-slate-400">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 min-h-screen">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Gestion des Produits</h2>
                        {duplicates.length > 0 && (
                            <div className="flex items-center gap-2 px-2 py-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-300 text-xs font-mono">
                                <AlertTriangle className="w-3 h-3" />
                                {duplicates.length} doublon{duplicates.length > 1 ? 's' : ''} détecté{duplicates.length > 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {duplicates.length > 0 && (
                            <button
                                onClick={exportDuplicatesToCSV}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 dark:bg-amber-700 text-white hover:bg-amber-700 dark:hover:bg-amber-600 border border-amber-600 dark:border-amber-700 transition text-sm"
                                title="Exporter les doublons en CSV"
                            >
                                <Download className="w-4 h-4" />
                                Exporter doublons
                            </button>
                        )}
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 dark:bg-slate-600 text-white hover:bg-slate-800 dark:hover:bg-slate-500 border border-slate-700 dark:border-slate-600 transition text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Nouveau produit
                        </button>
                    </div>
                </div>

                {/* Filtres */}
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher par code ou nom..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500"
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 font-mono"
                        >
                            <option value="all">TOUS</option>
                            {availableTypes.map(type => (
                                <option key={type} value={type}>{type.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterPrevision}
                            onChange={(e) => setFilterPrevision(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 font-mono"
                        >
                            <option value="all">TOUTES PRÉVISIONS</option>
                            <option value="with">AVEC PRÉVISION</option>
                            <option value="without">SANS PRÉVISION</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 font-mono"
                        >
                            <option value="code">TRI: CODE</option>
                            <option value="name">TRI: NOM</option>
                            <option value="prevision-desc">TRI: PRÉV. ↓</option>
                            <option value="prevision-asc">TRI: PRÉV. ↑</option>
                        </select>
                    </div>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {filteredProducts.length} / {products.length} produits affichés
                    </div>
                </div>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-300 dark:border-slate-600">
                        <tr>
                            <th className="text-left px-3 py-2 font-mono font-bold text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">Code</th>
                            <th className="text-left px-3 py-2 font-mono font-bold text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">Produit</th>
                            <th className="text-center px-3 py-2 font-mono font-bold text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">Type</th>
                            <th className="text-right px-3 py-2 font-mono font-bold text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">Prév. Colis</th>
                            <th className="text-right px-3 py-2 font-mono font-bold text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => {
                            const prevision = previsions.find(p => String(p.prod_code).trim() === String(product.prod_code).trim());
                            return (
                                <tr
                                    key={product.id}
                                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <td className="px-3 py-2 font-mono text-xs text-slate-600 dark:text-slate-400">{product.prod_code}</td>
                                    <td className="px-3 py-2 text-slate-900 dark:text-slate-100">{product.prod_lib}</td>
                                    <td className="px-3 py-2 text-center">
                                        {(() => {
                                            const colors = getTypeColor(product.type);
                                            return (
                                                <span className={`inline-block px-2 py-0.5 text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                                                    {product.type}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-slate-100">
                                        {prevision ? prevision.prevision_colis.toLocaleString() : '—'}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <div className="flex gap-1 justify-end">
                                            <button
                                                onClick={() => handleOpenModal(product)}
                                                className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
                                                title="Modifier"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product)}
                                                className="p-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-100 transition"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal Ajout/Édition */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm w-full max-w-lg mx-4">
                        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-4 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Code produit *</label>
                                <input
                                    type="text"
                                    value={formData.prod_code}
                                    onChange={(e) => setFormData({ ...formData, prod_code: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500"
                                    placeholder="Ex: 12345"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Libellé produit *</label>
                                <input
                                    type="text"
                                    value={formData.prod_lib}
                                    onChange={(e) => setFormData({ ...formData, prod_lib: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500"
                                    placeholder="Ex: Champagne Brut"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Type *</label>
                                {!showNewTypeInput ? (
                                    <select
                                        value={formData.type}
                                        onChange={(e) => handleTypeChange(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500"
                                    >
                                        {availableTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                        <option value="__new__">+ Ajouter un type</option>
                                    </select>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newTypeName}
                                            onChange={(e) => setNewTypeName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddNewType();
                                                if (e.key === 'Escape') setShowNewTypeInput(false);
                                            }}
                                            className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500"
                                            placeholder="Nom du nouveau type..."
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleAddNewType}
                                            className="px-3 py-2 text-sm bg-slate-700 dark:bg-slate-600 text-white hover:bg-slate-800 dark:hover:bg-slate-500 border border-slate-700 dark:border-slate-600"
                                            title="Ajouter"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setShowNewTypeInput(false)}
                                            className="px-3 py-2 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600"
                                            title="Annuler"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {formData.type === 'festif' && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Prévision colis</label>
                                    <input
                                        type="number"
                                        value={formData.prevision_colis}
                                        onChange={(e) => setFormData({ ...formData, prevision_colis: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500"
                                        placeholder="Ex: 1500"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-3 py-1.5 text-sm text-white bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 border border-slate-700 dark:border-slate-600 transition flex items-center gap-1.5"
                            >
                                <Save className="w-4 h-4" />
                                Sauvegarder
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
