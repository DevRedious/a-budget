# Quick Reference - Import Budget Excel

## Commandes rapides

```bash
# Afficher le résumé
node show_summary.js

# Importer les données
node import_excel_example.js

# Analyser le fichier Excel
node analyze_excel_v2.js
```

## Structure du fichier Excel

| Élément | Valeur |
|---------|--------|
| Fichier | `data/personnal_budget.xlsx` |
| Feuille | `Feuil1` |
| Ligne d'en-têtes | **Ligne 3** (index 2) |
| Données | Lignes 4-353 (350 lignes) |
| Produits | 330 (hors 19 lignes de totaux) |

## Import rapide

```javascript
const XLSX = require('xlsx');
const wb = XLSX.readFile('./data/personnal_budget.xlsx');
const sheet = wb.Sheets['Feuil1'];
const data = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    range: 2, // Commencer à la ligne 3 (en-têtes)
});

// En-têtes
const headers = data[0];

// Données (sans totaux)
const products = data.slice(1).filter(row => {
    const familleLib = row[headers.indexOf('Famille Appro lib')];
    return familleLib && !familleLib.startsWith('T ');
});
```

## Colonnes essentielles (indices)

| Colonne | Index | Nom |
|---------|-------|-----|
| A | 0 | Famille Appro code |
| B | 1 | Famille Appro lib |
| C | 2 | Prod code |
| D | 3 | Prod lib |
| E | 4 | Famille Compta |
| F | 5 | Qte N-1 24-25 |
| J | 9 | CA N-1 24-25 |
| N | 13 | CA Budget N-1 (Stock déduit) |
| AD | 29 | PIC N+1 |
| AK | 36 | Stock à date |
| AM | 38 | Besoin Stock déduit |
| AP | 41 | CA previsonnel stock deduit |

## Filtrer les totaux

Les lignes commençant par "T " dans `Famille Appro lib` sont des sous-totaux :

```javascript
const isTotal = row['Famille Appro lib'].startsWith('T ');
const produits = data.filter(row => !isTotal);
```

## 19 Familles de produits

1. Champignons (10)
2. Epicerie-Additif (66)
3. Féculent (24)
4. Fruits-Légumes (94)
5. Liquides (20)
6. Produits d'oeuf (2)
7. Produits de la mer-Céphalopode (3)
8. Produits de la mer-Coquillage (2)
9. Produits de la mer-Crustacé (8)
10. Produits de la mer-Poisson (13)
11. Produits laitiers (14)
12. Produits-Négoce (3)
13. Viande-Agneau (2)
14. Viande-Bœuf (11)
15. Viande-Charcuterie (16)
16. Viande-Gibier (4)
17. Viande-Porc (9)
18. Viande-Veau (5)
19. Viande-Volaille (22)

## Transformations nécessaires

| Type | Transformation |
|------|----------------|
| Monétaire | `parseFloat(value.replace(/[€\s,]/g, ''))` |
| Pourcentage | `parseFloat(value.replace('%', '')) / 100` |
| Unité | `value.trim()` (KG ou PI) |
| Vide | `value || null` |

## Statistiques clés

- **Produits** : 330
- **CA Total N-1** : 33 122 €
- **CA Moyen** : 101,92 €
- **Stock bas** : 130 produits (<20% besoin)
- **Rupture** : 15 produits (stock = 0)
- **Évolution CA** : -4.14%
- **Évolution Prix** : +4.22%
- **Évolution Volume** : -5.03%

## Fichiers générés

| Fichier | Taille | Description |
|---------|--------|-------------|
| `RAPPORT_ANALYSE_EXCEL.md` | 19 KB | Analyse complète |
| `README_IMPORT.md` | 6.4 KB | Guide d'import |
| `import_excel_example.js` | 9.9 KB | Code d'import |
| `data/imported_budget.json` | 218 KB | Données JSON |

## Documentation complète

Voir `RAPPORT_ANALYSE_EXCEL.md` pour :
- Liste complète des 54 colonnes
- Types de données détaillés
- Statistiques (min, max, médiane, quartiles)
- Code couleur Excel
- Exemples de données
- Recommandations pour le dashboard
