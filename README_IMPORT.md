# Guide d'Import - Budget Agroalimentaire

## Fichiers d'analyse

Ce dossier contient l'analyse complète du fichier Excel `personnal_budget.xlsx` et les outils pour l'importer.

### Fichiers générés

| Fichier | Description |
|---------|-------------|
| `RAPPORT_ANALYSE_EXCEL.md` | **Rapport complet** de l'analyse du fichier Excel (structure, colonnes, types, statistiques) |
| `import_excel_example.js` | **Exemple de code** Node.js pour importer les données |
| `data/imported_budget.json` | **Données exportées** au format JSON (330 produits) |
| `analyze_excel.js` | Script d'analyse - structure générale |
| `analyze_excel_v2.js` | Script d'analyse - détection des en-têtes |
| `analyze_excel_details.js` | Script d'analyse - statistiques détaillées |

---

## Résumé rapide

### Structure du fichier Excel

- **Fichier** : `data/personnal_budget.xlsx`
- **Feuille** : `Feuil1`
- **Lignes** : 353 lignes (350 lignes de données + 3 lignes d'en-têtes/totaux)
- **Colonnes** : 54 colonnes (47 nommées + 7 vides)

### Organisation

```
Ligne 1:  Totaux généraux (sommes)
Ligne 2:  Sous-totaux
Ligne 3:  EN-TÊTES ← Utiliser cette ligne comme header
Ligne 4+: DONNÉES (330 produits + 19 lignes de sous-totaux par famille)
```

### Colonnes principales

| Section | Colonnes clés |
|---------|---------------|
| **Identification** | Famille Appro code/lib, Prod code/lib, Famille Compta |
| **Quantités N-1** | Qte N-1 24-25, PMP N-1, CA N-1 |
| **Prévisions N+1** | PIC N+1, Ca Prev Budget N+1, Projection 26/27 |
| **Stock** | Stock à date, Besoin Stock déduit |
| **Évolutions** | Évolution PA, Évolution volume, Évolution CA |

---

## Utilisation

### 1. Installer les dépendances

```bash
npm install xlsx
```

### 2. Exécuter l'import

```bash
node import_excel_example.js
```

Ceci va :
- Lire le fichier Excel
- Filtrer les lignes de totaux (commençant par "T ")
- Transformer les données (nettoyage, parsing)
- Afficher des statistiques
- Exporter au format JSON

### 3. Utiliser les données dans votre code

```javascript
const { importBudgetData } = require('./import_excel_example');

const products = importBudgetData();

// Filtrer par famille
const champignons = products.filter(p => p.familleApproLib === 'Champignons');

// Top 10 par CA
const top10 = products
    .sort((a, b) => b.caA1 - a.caA1)
    .slice(0, 10);

// Produits en croissance
const enCroissance = products.filter(p => p.evolutionCA > 0.1); // +10%
```

---

## Données disponibles

### 330 produits répartis en 19 familles

| Famille | Nb produits |
|---------|-------------|
| Fruits-Légumes | 94 |
| Epicerie-Additif | 66 |
| Féculent | 24 |
| Viande-Volaille | 22 |
| Liquides | 20 |
| Viande-Charcuterie | 16 |
| Produits laitiers | 14 |
| Produits de la mer-Poisson | 13 |
| Viande-Bœuf | 11 |
| Champignons | 10 |
| Autres (9 familles) | 40 |

### Exemple de produit (JSON)

```json
{
  "familleApproCode": 1,
  "familleApproLib": "Champignons",
  "prodCode": 360018,
  "prodLib": "CEPES MORCEAUX NON BLANCHI 2/3CM IQF CAT A 1X10KG",
  "familleCompta": "ACH111",
  "qteN1": 21280,
  "picN1": 28687,
  "stock": 2559,
  "besoinStockDeduit": 26127.81,
  "caA1": 168.64,
  "caBudgetN1StockDeduit": 188.33,
  "caPrevBudgetN1PIC": 220.32,
  "caPrevStockDeduit": 209.02,
  "projectionBudget2627": 212.48,
  "pmpN1": 7.92,
  "prevPAN1": 8,
  "pmp0425_0925": 8.05,
  "evolutionPA": 0.01,
  "evolutionVolume": 0.23,
  "evolutionCA": 0.24,
  "uniteFact": "KG",
  "unite": "KG"
}
```

---

## Points importants

### Lignes de totaux

Les lignes de sous-totaux par famille sont identifiables car leur `Famille Appro lib` commence par "T " :
- `T Champignons`
- `T Epicerie-Additif`
- etc.

Le script `import_excel_example.js` les filtre automatiquement.

### Colonnes vides

7 colonnes sont vides dans le fichier Excel (G, K, M, O, AA, AB, AX).
Ces colonnes sont utilisées comme **séparateurs visuels** dans Excel.

### Colonnes quasi-vides

Certaines colonnes sont remplies à moins de 10% :
- `Delta Prix achat` (2.6%)
- `Delta lié à la variation volume` (5.7%)
- `Delta budget / budget*` (5.7%)
- `Evol prix catégorie` (0%)

Ces colonnes peuvent être ignorées ou utilisées pour des cas spécifiques.

### Formats de données

- **Monétaires** : Stockés comme nombres (pas de symbole €)
- **Pourcentages** : Stockés comme décimaux (0.23 = 23%)
- **Quantités** : Nombres décimaux
- **Unités** : Texte ("KG" ou "PI")

---

## Analyses disponibles

Le rapport complet (`RAPPORT_ANALYSE_EXCEL.md`) contient :

1. Structure générale du fichier
2. Liste exacte et ordonnée de tous les en-têtes
3. Types de données par colonne
4. Qualité des données (taux de remplissage)
5. Valeurs uniques pour les colonnes clés
6. Code couleur et formatage Excel
7. Exemples de données réelles
8. Statistiques numériques détaillées (min, max, médiane, quartiles)
9. Résumé pour l'import
10. Recommandations pour le dashboard

**Total : 15 pages** de documentation complète.

---

## Prochaines étapes suggérées

### Pour le dashboard

1. **Import automatique** : Adapter le script pour votre stack technique (React, Vue, etc.)
2. **Base de données** : Stocker les données dans une BDD (SQLite, PostgreSQL, etc.)
3. **API** : Créer des endpoints pour servir les données
4. **Visualisations** : Créer des graphiques avec Chart.js, D3.js, Recharts, etc.

### Visualisations recommandées

- **Treemap** : CA par famille et produit
- **Line chart** : Évolution CA N-1 → Prév N+1 → Projection 26-27
- **Bar chart** : Top/Flop produits par évolution
- **Scatter plot** : Évolution prix vs évolution volume
- **Gauge** : Taux de couverture stock / besoin
- **Table** : Liste détaillée avec filtres et tri

### KPIs principaux

1. CA Total N-1 vs CA Prévisionnel N+1
2. Top 10 produits par CA
3. Évolution moyenne des volumes par famille
4. Taux de rotation du stock
5. Évolution des prix d'achat (inflation)
6. Produits en alerte stock (<20% du besoin)

---

## Support

Pour toute question sur l'analyse ou l'import, référez-vous au rapport complet :
`RAPPORT_ANALYSE_EXCEL.md`

Les scripts d'analyse sont disponibles et réutilisables :
- `analyze_excel.js`
- `analyze_excel_v2.js`
- `analyze_excel_details.js`
