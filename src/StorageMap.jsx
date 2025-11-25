import React, { useState, useMemo } from 'react';
import { Printer, Save, X, Search } from 'lucide-react';

const StorageMap = ({ products, darkMode }) => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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

    // Helper to get product details
    const getProduct = (code) => products.find(p => p.prod_code === code);

    // Filter products for modal
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products.slice(0, 50);
        return products.filter(p =>
            p.prod_lib.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.prod_code.toString().includes(searchTerm)
        ).slice(0, 50);
    }, [products, searchTerm]);

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

        const product = loc.assignedProductId ? getProduct(loc.assignedProductId) : null;

        let bgColor = darkMode ? 'bg-gray-700' : 'bg-gray-100';
        if (product) {
            const rotation = parseInt(product.prod_code) % 3;
            if (rotation === 0) bgColor = 'bg-red-500 text-white';
            else if (rotation === 1) bgColor = 'bg-blue-500 text-white';
            else bgColor = 'bg-green-500 text-white';
        }

        return (
            <div
                key={key}
                onClick={() => handleLocationClick(loc)}
                className={`
          w-full flex-1 min-h-0 text-[9px] flex items-center justify-center cursor-pointer border 
          ${bgColor}
          ${darkMode ? 'border-gray-600 hover:border-gray-400' : 'border-gray-300 hover:border-gray-500'}
          transition-colors duration-150 overflow-hidden px-1 text-center leading-tight
        `}
                title={product ? `${product.prod_lib} (${product.prod_code})` : `Loc ${loc.code}`}
            >
                {product ? (
                    <span className="truncate">{product.prod_code}</span>
                ) : (
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{loc.label}</span>
                )}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900">
            <div className="flex justify-between items-center px-6 py-4 print:hidden bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plan de Stockage Interactif</h2>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Printer className="w-4 h-4" />
                    Imprimer le plan
                </button>
            </div>

            {/* Map Container */}
            <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 print:p-0 print:shadow-none print:overflow-visible">
                <style type="text/css" media="print">
                    {`
            @page {
              size: A4 landscape;
              margin: 5mm;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                overflow: hidden;
              }
              .print-container {
                width: 100%;
                max-width: 100%;
                margin: 0;
                padding: 0;
                transform: scale(0.55);
                transform-origin: top left;
                page-break-inside: avoid;
              }
              .print-container > div > div > div > div {
                height: 6px !important;
                font-size: 6px !important;
                min-height: 6px !important;
              }
              nav, header, footer, .no-print {
                display: none !important;
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
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Assigner un produit
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                    ({selectedLocation?.code})
                                </span>
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 border-b dark:border-gray-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un produit..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                {filteredProducts.map(product => (
                                    <button
                                        key={product.id || product.prod_code}
                                        onClick={() => handleAssignProduct(product)}
                                        className="w-full text-left px-4 py-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">{product.prod_lib}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Code: {product.prod_code}</div>
                                        </div>
                                        {product.quantity && (
                                            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                                                {product.quantity}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StorageMap;
