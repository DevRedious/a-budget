import React, { useState, useMemo, useEffect } from 'react';
import { Printer, X, Search, Trash2, Save, ChevronDown, Plus } from 'lucide-react';
import { loadPickingProducts } from './loadPickingProducts';
import { getPrevisionsFestif2025, saveStorageMap, loadStorageMap, getAllStorageMaps } from './firebaseHelpers';

const StorageMap = ({ darkMode }) => {
    const [products, setProducts] = useState([]);
    const [previsions, setPrevisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalTab, setModalTab] = useState('festif'); // 'festif' ou 'non_festif'
    const [saveStatus, setSaveStatus] = useState(''); // Pour afficher le statut de sauvegarde
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [savePlanName, setSavePlanName] = useState('');
    const [availablePlans, setAvailablePlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [showPlanDropdown, setShowPlanDropdown] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsData, previsionsData, plans] = await Promise.all([
                    loadPickingProducts(),
                    getPrevisionsFestif2025(),
                    getAllStorageMaps()
                ]);
                setProducts(productsData);
                setPrevisions(previsionsData);
                setAvailablePlans(plans);

                // Charger le dernier plan si disponible
                if (plans.length > 0) {
                    const lastPlan = plans.sort((a, b) => new Date(b.saved_at) - new Date(a.saved_at))[0];
                    setSelectedPlan(lastPlan.name);
                    const savedMap = await loadStorageMap(lastPlan.name);

                    if (savedMap.length > 0) {
                        const newLocations = locations.map(loc => {
                            const saved = savedMap.find(s => s.aisle === loc.aisle && s.row === loc.row);
                            if (saved) {
                                return { ...loc, assignedProductId: saved.assignedProductId };
                            }
                            return loc;
                        });
                        setLocations(newLocations);
                        console.log(`✓ Plan "${lastPlan.name}" chargé: ${savedMap.length} assignations`);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    // Configuration based on the specific layout image
    // A, B, C: Top aligned (Physical rows 17-24), Labels 5-12 (Inverted: 5 at top)
    // D-K: Serpentine pattern (Physical rows 1-24)
    // L: Standard (Physical rows 1-28), Labels 1-28

    const aisleConfig = [
        {
            id: 'A', type: 'single', label: 'A',
            rows: { start: 17, end: 24 },
            getLabel: (r) => 5 + (24 - r) // Row 24 -> 5, Row 17 -> 12
        },
        {
            id: 'B', type: 'single', label: 'B',
            rows: { start: 17, end: 24 },
            getLabel: (r) => r - 13 // Row 17 -> 4, Row 24 -> 11
        },
        {
            id: 'C', type: 'single', label: 'C',
            rows: { start: 17, end: 24 },
            getLabel: (r) => 29 - r // Row 17 -> 12, Row 24 -> 5
        },
        {
            id: 'D', type: 'single', label: 'D',
            rows: { start: 1, end: 24 },
            getLabel: (r) => r // Row 1 -> 1, Row 24 -> 24 (Ascending)
        },
        {
            id: 'E', type: 'single', label: 'E',
            rows: { start: 1, end: 24 },
            getLabel: (r) => 29 - r // Row 1 -> 28, Row 24 -> 5 (Descending)
        },
        {
            id: 'F', type: 'single', label: 'F',
            rows: { start: 1, end: 24 },
            getLabel: (r) => r // Row 1 -> 1, Row 24 -> 24 (Ascending)
        },
        {
            id: 'G', type: 'single', label: 'G',
            rows: { start: 1, end: 24 },
            getLabel: (r) => 29 - r // Row 1 -> 28, Row 24 -> 5 (Descending)
        },
        {
            id: 'H', type: 'single', label: 'H',
            rows: { start: 1, end: 24 },
            getLabel: (r) => r // Row 1 -> 1, Row 24 -> 24 (Ascending)
        },
        {
            id: 'I', type: 'single', label: 'I',
            rows: { start: 1, end: 24 },
            getLabel: (r) => 29 - r // Row 1 -> 28, Row 24 -> 5 (Descending)
        },
        {
            id: 'J', type: 'single', label: 'J',
            rows: { start: 1, end: 24 },
            getLabel: (r) => r // Row 1 -> 1, Row 24 -> 24 (Ascending)
        },
        {
            id: 'K', type: 'single', label: 'K',
            rows: { start: 1, end: 24 },
            getLabel: (r) => 29 - r // Row 1 -> 28, Row 24 -> 5 (Descending)
        },
        {
            id: 'L', type: 'single', label: 'L',
            rows: { start: 1, end: 28 },
            getLabel: (r) => r // Row 1 -> 1, Row 28 -> 28
        },
    ];

    const [locations, setLocations] = useState(() => {
        const locs = [];

        aisleConfig.forEach(config => {
            for (let r = config.rows.start; r <= config.rows.end; r++) {
                const label = config.getLabel(r);
                locs.push({
                    id: `${config.id}-${label}`,
                    aisle: config.id,
                    row: r,
                    label: label,
                    side: null,
                    type: 'standard',
                    assignedProductId: null,
                    code: `${config.id}-${label}`
                });
            }
        });
        return locs;
    });

    const handleLocationClick = (loc) => {
        setSelectedLocation(loc);
        setSearchTerm('');
        setIsModalOpen(true);
    };

    const handleAssignProduct = (product) => {
        setLocations(prev => prev.map(l =>
            l.id === selectedLocation.id ? { ...l, assignedProductId: product.prod_code } : l
        ));
        setIsModalOpen(false);
        setSelectedLocation(null);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleClearAll = () => {
        const clearedLocations = locations.map(loc => ({ ...loc, assignedProductId: null }));
        setLocations(clearedLocations);
        setIsDeleteModalOpen(false);
        setSaveStatus('🗑️ Tous les emplacements ont été effacés');
        setTimeout(() => setSaveStatus(''), 3000);
    };

    const handleSaveClick = () => {
        // Si un plan est déjà sélectionné, sauvegarder directement
        if (selectedPlan) {
            handleSaveExisting();
        } else {
            // Sinon, demander un nom via le modal
            setIsSaveModalOpen(true);
        }
    };

    const handleSaveExisting = async () => {
        try {
            setSaveStatus('💾 Sauvegarde en cours...');
            const result = await saveStorageMap(selectedPlan, locations);

            // Recharger la liste des plans
            const plans = await getAllStorageMaps();
            setAvailablePlans(plans);

            setSaveStatus(`✅ Plan "${selectedPlan}" mis à jour ! ${result.count} emplacements`);
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            setSaveStatus('❌ Erreur lors de la sauvegarde');
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    const handleSaveNew = async () => {
        if (!savePlanName.trim()) {
            setSaveStatus('❌ Veuillez entrer un nom pour le plan');
            setTimeout(() => setSaveStatus(''), 3000);
            return;
        }

        try {
            setSaveStatus('💾 Sauvegarde en cours...');
            setIsSaveModalOpen(false);
            const result = await saveStorageMap(savePlanName.trim(), locations);

            // Recharger la liste des plans
            const plans = await getAllStorageMaps();
            setAvailablePlans(plans);
            setSelectedPlan(savePlanName.trim());

            setSaveStatus(`✅ Plan "${savePlanName}" sauvegardé ! ${result.count} emplacements`);
            setSavePlanName('');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            setSaveStatus('❌ Erreur lors de la sauvegarde');
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    const handleLoadPlan = async (planName) => {
        try {
            setLoading(true);
            setShowPlanDropdown(false);
            setSaveStatus(`📂 Chargement du plan "${planName}"...`);

            const savedMap = await loadStorageMap(planName);

            if (savedMap.length > 0) {
                const newLocations = locations.map(loc => {
                    const saved = savedMap.find(s => s.aisle === loc.aisle && s.row === loc.row);
                    if (saved) {
                        return { ...loc, assignedProductId: saved.assignedProductId };
                    }
                    return { ...loc, assignedProductId: null };
                });
                setLocations(newLocations);
                setSelectedPlan(planName);
                setSaveStatus(`✅ Plan "${planName}" chargé: ${savedMap.length} emplacements`);
            } else {
                setSaveStatus(`⚠️ Plan "${planName}" vide`);
            }

            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            setSaveStatus('❌ Erreur lors du chargement');
            setTimeout(() => setSaveStatus(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleNewPlan = () => {
        if (window.confirm('Créer un nouveau plan vide ? Les modifications non sauvegardées seront perdues.')) {
            const clearedLocations = locations.map(loc => ({ ...loc, assignedProductId: null }));
            setLocations(clearedLocations);
            setSelectedPlan('');
            setSaveStatus('📝 Nouveau plan créé - N\'oubliez pas de sauvegarder');
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    // Helper to get product details
    const getProduct = (code) => products.find(p => p.prod_code === code);

    // Helper to get product with prevision data
    const getProductWithPrevision = (code) => {
        const product = products.find(p => p.prod_code === code);
        if (!product) return null;

        // Si c'est un produit festif, chercher sa prévision
        if (product.type === 'festif') {
            const prodCode = String(product.prod_code).trim();
            const prevision = previsions.find(prev => String(prev.prod_code).trim() === prodCode);
            return {
                ...product,
                prevision_colis: prevision?.prevision_colis || 0
            };
        }
        return product;
    };

    // Get all assigned product codes
    const assignedProductCodes = useMemo(() => {
        return new Set(locations.filter(loc => loc.assignedProductId).map(loc => loc.assignedProductId));
    }, [locations]);

    // Créer la liste complète basée sur les prévisions Excel
    const festifProductsWithPrevisions = useMemo(() => {
        console.log(`📊 Total prévisions dans Excel: ${previsions.length}`);

        // Partir des prévisions Excel comme source de vérité
        const result = previsions.map(prevision => {
            const prodCode = String(prevision.prod_code).trim();

            // Chercher le produit correspondant dans pickingProducts
            const existingProduct = products.find(p =>
                p.type === 'festif' && String(p.prod_code).trim() === prodCode
            );

            if (existingProduct) {
                // Produit existe dans pickingProducts
                return {
                    ...existingProduct,
                    prevision_colis: prevision.prevision_colis || 0
                };
            } else {
                // Produit n'existe pas dans pickingProducts, créer un produit "virtuel"
                return {
                    id: `virtual_${prodCode}`,
                    prod_code: prevision.prod_code,
                    prod_lib: prevision.prod_lib,
                    type: 'festif',
                    prevision_colis: prevision.prevision_colis || 0,
                    isVirtual: true // Flag pour identifier les produits virtuels
                };
            }
        });

        console.log(`✅ Total produits festifs affichés: ${result.length}`);

        return result.sort((a, b) => b.prevision_colis - a.prevision_colis); // Tri décroissant
    }, [products, previsions]);

    // Filter products for modal based on tab and assignments
    const filteredProducts = useMemo(() => {
        let availableProducts = [];

        if (modalTab === 'festif') {
            availableProducts = festifProductsWithPrevisions;
        } else {
            availableProducts = products.filter(p => p.type === 'non_festif');
        }

        // Exclude already assigned products
        availableProducts = availableProducts.filter(p => !assignedProductCodes.has(p.prod_code));

        // Apply search filter
        if (searchTerm) {
            availableProducts = availableProducts.filter(p =>
                p.prod_lib.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.prod_code.toString().includes(searchTerm)
            );
        }

        // Retourner tous les produits (pas de limite)
        return availableProducts;
    }, [products, previsions, festifProductsWithPrevisions, searchTerm, modalTab, assignedProductCodes]);

    // Render a single cell
    const renderCell = (aisleId, row, aisleIndex, cellIndex) => {
        // Find location by physical row
        const loc = locations.find(l => l.aisle === aisleId && l.row === row);

        const key = `aisle-${aisleIndex}-cell-${cellIndex}`;

        // Check config for empty spaces
        const config = aisleConfig.find(c => c.id === aisleId);
        if (row < config.rows.start || row > config.rows.end) {
            return <div key={key} className="w-full flex-1 min-h-0"></div>; // Empty space
        }

        if (!loc) return <div key={key} className="w-full flex-1 min-h-0"></div>;

        const product = loc.assignedProductId ? getProductWithPrevision(loc.assignedProductId) : null;

        let bgColor = darkMode ? 'bg-slate-800' : 'bg-white';
        let textColor = darkMode ? 'text-gray-300' : 'text-gray-600';
        let borderColor = darkMode ? 'border-slate-700' : 'border-gray-300';

        if (product) {
            // Palette industrielle désaturée pour mode clair/sombre
            if (product.type === 'festif' && product.prevision_colis > 0) {
                const qty = product.prevision_colis;
                if (qty >= 3000) {
                    // Rouge brique désaturé
                    bgColor = darkMode ? 'bg-red-950' : 'bg-red-50';
                    textColor = darkMode ? 'text-red-300' : 'text-red-900';
                    borderColor = darkMode ? 'border-red-800' : 'border-red-200';
                } else if (qty >= 1000) {
                    // Orange industriel mat
                    bgColor = darkMode ? 'bg-orange-950' : 'bg-orange-50';
                    textColor = darkMode ? 'text-orange-300' : 'text-orange-900';
                    borderColor = darkMode ? 'border-orange-800' : 'border-orange-200';
                } else if (qty >= 300) {
                    // Jaune olive désaturé
                    bgColor = darkMode ? 'bg-yellow-950' : 'bg-yellow-50';
                    textColor = darkMode ? 'text-yellow-300' : 'text-yellow-900';
                    borderColor = darkMode ? 'border-yellow-800' : 'border-yellow-200';
                } else {
                    // Vert olive professionnel
                    bgColor = darkMode ? 'bg-green-950' : 'bg-green-50';
                    textColor = darkMode ? 'text-green-300' : 'text-green-900';
                    borderColor = darkMode ? 'border-green-800' : 'border-green-200';
                }
            } else {
                // Produits non-festifs : gris neutre
                bgColor = darkMode ? 'bg-slate-700' : 'bg-slate-100';
                textColor = darkMode ? 'text-slate-300' : 'text-slate-700';
                borderColor = darkMode ? 'border-slate-600' : 'border-slate-300';
            }
        }

        return (
            <div
                key={key}
                onClick={() => handleLocationClick(loc)}
                className={`
          w-full flex-1 min-h-0 text-[10px] flex items-center justify-center cursor-pointer
          ${bgColor} ${textColor} ${borderColor}
          border font-mono
          ${darkMode ? 'hover:border-slate-500' : 'hover:border-slate-400'}
          transition-colors duration-100 overflow-hidden px-0.5 text-center leading-tight
        `}
                title={product ? `${product.prod_lib} (${product.prod_code})` : `Loc ${loc.code}`}
            >
                {product ? (
                    <span className="truncate font-medium">{product.prod_code}</span>
                ) : (
                    <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>{loc.label}</span>
                )}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900">
            <div className="flex justify-between items-center px-6 py-3 print:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100">Plan de Stockage Interactif</h2>
                    {loading && <span className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">Chargement...</span>}
                    {saveStatus && (
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                            {saveStatus}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {/* Menu déroulant pour charger un plan */}
                    <div className="relative flex items-center gap-1">
                        <button
                            onClick={() => setShowPlanDropdown(!showPlanDropdown)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
                        >
                            {selectedPlan ? `${selectedPlan}` : 'Sans plan'}
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={handleNewPlan}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Nouveau plan vide"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        {showPlanDropdown && (
                            <div className="absolute top-full mt-1 right-0 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-sm min-w-[250px] max-h-[300px] overflow-y-auto z-50">
                                {availablePlans.length === 0 ? (
                                    <div className="px-3 py-2 text-slate-500 dark:text-slate-400 text-sm">
                                        Aucun plan sauvegardé
                                    </div>
                                ) : (
                                    availablePlans.map(plan => (
                                        <button
                                            key={plan.id}
                                            onClick={() => handleLoadPlan(plan.name)}
                                            className={`w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-200 dark:border-slate-700 last:border-b-0 ${
                                                selectedPlan === plan.name ? 'bg-slate-100 dark:bg-slate-700' : ''
                                            }`}
                                        >
                                            <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{plan.name}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {plan.location_count} emplacements • {new Date(plan.saved_at).toLocaleString('fr-FR')}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Effacer tout"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleSaveClick}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title={selectedPlan ? `Sauvegarder "${selectedPlan}"` : "Sauvegarder sous..."}
                    >
                        <Save className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handlePrint}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Imprimer le plan"
                    >
                        <Printer className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 print:p-0 print:shadow-none print:overflow-visible">
                <style type="text/css" media="print">
                    {`
            @page {
              size: A3 landscape;
              margin: 8mm;
            }
            @media print {
              /* FORCER MODE CLAIR ABSOLU */
              html {
                filter: none !important;
                background: white !important;
              }

              body {
                background: white !important;
                color: black !important;
              }

              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              /* Masquer TOUT sauf le plan */
              body * {
                visibility: hidden !important;
              }

              /* Rendre visible uniquement le container du plan et ses enfants */
              .print-container,
              .print-container * {
                visibility: visible !important;
              }

              /* Positionner le plan en absolu pour remplir la page */
              .print-container {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                margin: 0 !important;
                padding: 10mm !important;
                background: white !important;
                display: flex !important;
                flex-direction: column !important;
              }

              /* Headers des allées */
              .print-container > div:first-child {
                font-size: 18px !important;
                margin-bottom: 10px !important;
                font-weight: bold !important;
                flex-shrink: 0 !important;
                color: black !important;
                background: white !important;
              }

              /* Grid container */
              .print-container > div:last-child {
                flex: 1 !important;
                display: flex !important;
                background: white !important;
              }

              /* FORCER TOUS LES DIVS EN BLANC */
              .print-container div {
                background-color: white !important;
                background: white !important;
              }

              /* Cellules individuelles - STYLE DES CASES */
              .print-container > div:last-child > div:not(.absolute) > div > div {
                height: 20px !important;
                min-height: 20px !important;
                font-size: 10px !important;
                line-height: 20px !important;
                padding: 2px !important;
                background-color: white !important;
                background: white !important;
                border: 2px solid black !important;
                box-sizing: border-box !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                color: black !important;
                font-weight: 700 !important;
              }

              /* Zone Local de charge - OVERRIDE le blanc */
              .print-container > div:last-child > div.absolute {
                background: repeating-linear-gradient(
                  45deg,
                  #e5e7eb,
                  #e5e7eb 10px,
                  #d1d5db 10px,
                  #d1d5db 20px
                ) !important;
                border: 4px solid black !important;
                z-index: 10 !important;
              }

              /* Pattern de hachures pour Local de charge */
              .print-container > div:last-child > div.absolute > div:first-child {
                background: repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 10px,
                  rgba(0,0,0,0.1) 10px,
                  rgba(0,0,0,0.1) 20px
                ) !important;
              }

              /* Texte "LOCAL DE CHARGE" */
              .print-container > div:last-child > div.absolute div:last-child {
                background: white !important;
                border: 2px solid black !important;
              }

              .print-container > div:last-child > div.absolute span {
                color: black !important;
                background: transparent !important;
                border: none !important;
                padding: 8px 16px !important;
                font-weight: 700 !important;
                font-size: 14px !important;
                text-transform: uppercase !important;
              }

              /* Forcer tous les autres spans en noir */
              .print-container span {
                color: black !important;
                font-weight: 700 !important;
              }
            }
          `}
                </style>

                <div className="w-full h-full flex flex-col print-container print:min-w-0 relative p-2">
                    {/* Header for Aisles */}
                    <div className="flex mb-2 text-center font-bold text-gray-500 dark:text-gray-400 print:text-black text-sm print:text-sm gap-4 print:gap-2">
                        {aisleConfig.map(config => (
                            <div key={config.id} className="flex-1">
                                {config.label}
                            </div>
                        ))}
                    </div>

                    {/* Grid Rows */}
                    <div className="flex-1 flex print:gap-2 relative">
                        {aisleConfig.map((config, aisleIndex) => {
                            // Wide circulation lanes after: A, C, E, G, I, K
                            // Tight spacing after: B, D, F, H, J
                            const hasWideGap = ['A', 'C', 'E', 'G', 'I', 'K'].includes(config.id);
                            const gapClass = hasWideGap ? 'mr-12 print:mr-6' : 'mr-1 print:mr-[2px]';

                            return (
                                <div key={config.id} className={`flex-1 flex flex-col gap-1 print:gap-[1px] ${gapClass}`}>
                                    {/* Render rows 28 down to 1 (max row is 28 for L, others vary) */}
                                    {/* We use 28 as max height to align everything */}
                                    {Array.from({ length: 28 }, (_, i) => renderCell(config.id, 28 - i, aisleIndex, i))}
                                </div>
                            );
                        })}

                        {/* Local de charge Zone - Positioned over the empty space of A and B/C (Rows 1-12) */}
                        <div className="absolute bottom-0 left-0 w-[24.5%] h-[42.8%] border-4 border-gray-800 dark:border-gray-400 flex items-center justify-center print:border-black z-10 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm">
                            <div className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 10px)'
                                }}
                            ></div>
                            <div className="relative border-2 border-gray-800 dark:border-gray-400 p-2 bg-white dark:bg-gray-900 print:bg-white print:border-black">
                                <span className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest text-lg print:text-black">
                                    Local de charge
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Assignment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
                    <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 w-full max-w-4xl flex flex-col max-h-[85vh]">
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-base font-medium text-slate-900 dark:text-slate-100">
                                Assigner un produit
                                <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                                    ({selectedLocation?.code})
                                </span>
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Onglets festif / non-festif */}
                        <div className="px-4 pt-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex gap-1 mb-4">
                                <button
                                    onClick={() => { setModalTab('festif'); setSearchTerm(''); }}
                                    className={`flex-1 py-1.5 px-3 text-sm font-medium transition border ${
                                        modalTab === 'festif'
                                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                                    }`}
                                >
                                    Festif ({festifProductsWithPrevisions.filter(p => !assignedProductCodes.has(p.prod_code)).length})
                                </button>
                                <button
                                    onClick={() => { setModalTab('non_festif'); setSearchTerm(''); }}
                                    className={`flex-1 py-1.5 px-3 text-sm font-medium transition border ${
                                        modalTab === 'non_festif'
                                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                                    }`}
                                >
                                    Non-Festif ({products.filter(p => p.type === 'non_festif' && !assignedProductCodes.has(p.prod_code)).length})
                                </button>
                            </div>
                        </div>

                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un produit..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            <div className="space-y-1">
                                <button
                                    onClick={() => handleAssignProduct({ prod_code: null })}
                                    className="w-full text-left px-4 py-3 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex justify-between items-center group"
                                >
                                    <span>Vider l'emplacement</span>
                                    <X className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                                </button>
                                {filteredProducts.map(product => {
                                    const qty = product.prevision_colis || 0;
                                    let priorityBadge = null;
                                    let priorityColor = '';

                                    if (modalTab === 'festif' && qty > 0) {
                                        if (qty >= 3000) {
                                            priorityBadge = 'CRITIQUE';
                                            priorityColor = 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-300 border border-red-200 dark:border-red-800';
                                        } else if (qty >= 1000) {
                                            priorityBadge = 'ÉLEVÉE';
                                            priorityColor = 'bg-orange-50 dark:bg-orange-950 text-orange-900 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
                                        } else if (qty >= 300) {
                                            priorityBadge = 'MOYENNE';
                                            priorityColor = 'bg-yellow-50 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800';
                                        } else {
                                            priorityBadge = 'STANDARD';
                                            priorityColor = 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
                                        }
                                    }

                                    return (
                                        <button
                                            key={product.id || product.prod_code}
                                            onClick={() => handleAssignProduct(product)}
                                            className="w-full text-left px-4 py-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700 flex gap-4 items-center border-b dark:border-gray-700 last:border-b-0"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-slate-900 dark:text-slate-100 mb-0.5 truncate">
                                                    {product.prod_lib}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                                        {product.prod_code}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                                {modalTab === 'festif' && product.prevision_colis > 0 && (
                                                    <>
                                                        <div className="text-base font-mono bg-slate-50 dark:bg-slate-900 px-3 py-1 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                                                            {product.prevision_colis.toLocaleString()}
                                                        </div>
                                                        {priorityBadge && (
                                                            <div className={`text-[10px] font-medium px-2 py-0.5 uppercase tracking-wide ${priorityColor}`}>
                                                                {priorityBadge}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                {product.quantity && (
                                                    <div className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-600 dark:text-slate-400">
                                                        Stock: {product.quantity}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de sauvegarde */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm max-w-md w-full mx-4">
                        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-base font-medium text-slate-900 dark:text-slate-100">
                                Sauvegarder le plan
                            </h3>
                            <button
                                onClick={() => {
                                    setIsSaveModalOpen(false);
                                    setSavePlanName('');
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Nom du nouveau plan
                            </label>
                            <input
                                type="text"
                                value={savePlanName}
                                onChange={(e) => setSavePlanName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSaveNew()}
                                placeholder="Ex: Plan Festif 2025, Plan Janvier..."
                                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500"
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => {
                                    setIsSaveModalOpen(false);
                                    setSavePlanName('');
                                }}
                                className="px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSaveNew}
                                className="px-3 py-1.5 text-sm text-white bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 border border-slate-700 dark:border-slate-600 transition"
                            >
                                Créer et sauvegarder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de suppression */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm max-w-md w-full mx-4">
                        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-base font-medium text-red-800 dark:text-red-300 flex items-center gap-2">
                                <Trash2 className="w-5 h-5" />
                                Effacer tous les emplacements
                            </h3>
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4">
                            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                                Êtes-vous sûr de vouloir effacer tous les emplacements assignés ?
                            </p>
                            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3">
                                <p className="text-sm text-red-900 dark:text-red-300">
                                    <strong>⚠️ Attention :</strong> Cette action effacera tous les produits assignés aux emplacements du plan actuel.
                                </p>
                                <p className="text-sm text-red-800 dark:text-red-400 mt-2">
                                    Les modifications non sauvegardées seront perdues.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleClearAll}
                                className="px-3 py-1.5 text-sm bg-red-700 dark:bg-red-800 text-white hover:bg-red-800 dark:hover:bg-red-700 border border-red-700 dark:border-red-800 transition flex items-center gap-1.5"
                            >
                                <Trash2 className="w-4 h-4" />
                                Tout effacer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StorageMap;
