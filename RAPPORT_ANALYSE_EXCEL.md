# RAPPORT D'ANALYSE COMPLET - personnal_budget.xlsx

**Date d'analyse**: 2025-11-22
**Fichier**: `c:\CODE\budget\dashboard-agroalimentaire\data\personnal_budget.xlsx`

---

## 1. STRUCTURE GÉNÉRALE

### Feuilles Excel
- **Nombre de feuilles**: 1
- **Nom de la feuille**: `Feuil1`

### Dimensions
- **Total de lignes**: 353 lignes
- **Total de colonnes**: 54 colonnes
- **Plage Excel**: A1:BB353

### Organisation des données
- **Ligne 1**: Totaux/sommes (ligne de calcul)
- **Ligne 2**: Valeurs additionnelles/sous-totaux
- **Ligne 3**: EN-TÊTES DE COLONNES (première ligne de données utiles)
- **Lignes 4-353**: DONNÉES (350 lignes de données)

---

## 2. EN-TÊTES DE COLONNES - LISTE EXACTE ET ORDONNÉE

**Total de colonnes avec en-tête**: 47 colonnes nommées + 7 colonnes vides

### Colonnes d'identification et classification (A-E)

| # | Colonne | Nom exact | Type |
|---|---------|-----------|------|
| 1 | A | `Famille Appro code` | Numérique |
| 2 | B | `Famille Appro lib` | Texte |
| 3 | C | `Prod code` | Numérique |
| 4 | D | `Prod lib` | Texte |
| 5 | E | `Famille Compta` | Texte |

### Données N-1 (2024-2025) - Colonnes F-O

| # | Colonne | Nom exact | Type |
|---|---------|-----------|------|
| 6 | F | `Qte N-1 24-25` | Numérique |
| 7 | G | *(vide)* | - |
| 8 | H | ` PMP N-1 24-25 ` | Numérique (€) |
| 9 | I | `Unité` | Texte |
| 10 | J | `CA N-1 24-25` | Numérique (€) |
| 11 | K | *(vide)* | - |
| 12 | L | ` Budget N-1 24-25 ` | Numérique (€) |
| 13 | M | *(vide)* | - |
| 14 | N | `CA Budget N-1 24-25 (Stock déduit)` | Numérique (€) |
| 15 | O | *(vide)* | - |

### Prévisionnel Budget N+1 (2025-2026) - Colonnes P-U

| # | Colonne | Nom exact | Type |
|---|---------|-----------|------|
| 16 | P | `Previsonnel budget N+1 25-26` | Numérique |
| 17 | Q | `Unité` | Texte |
| 18 | R | ` Prev PA N+1 25-26 ` | Numérique (€) |
| 19 | S | `Unité` | Texte |
| 20 | T | `PMP 04/25-09/25` | Mixte (nombre/texte) |
| 21 | U | `Evo vs prix budget` | Numérique (%) |

### Achats réalisés au 30/09 - Colonnes V-AC

| # | Colonne | Nom exact | Type |
|---|---------|-----------|------|
| 22 | V | `QTE achat au 30/09` | Numérique |
| 23 | W | `Valo Achats déjà realisés au 30/09` | Numérique (€) |
| 24 | X | `Dernier prix achat 25/26` | Numérique (€) |
| 25 | Y | `Projection avec Besoin stock déduit - achat réalisés au 30/09/25` | Numérique |
| 26 | Z | `Valo Achats restant au 30/09 au dernier prix achat` | Numérique (€) |
| 27 | AA | *(vide)* | - |
| 28 | AB | *(vide)* | - |
| 29 | AC | `REEL + PREV AU 30/09` | Numérique (€) |

### PIC N+1 et projections - Colonnes AD-AJ

| # | Colonne | Nom exact | Type |
|---|---------|-----------|------|
| 30 | AD | `PIC N+1` | Numérique |
| 31 | AE | `Unité Fact` | Texte |
| 32 | AF | `Ca Prev Budget N+1 PIC 25-26` | Numérique (€) |
| 33 | AG | `Unité` | Texte |
| 34 | AH | `Ca Budget N-1 PIC 24-25 PBesoinsBruts*ColprixbudgetLigVal` | Numérique (€) |
| 35 | AI | `Unité` | Texte |
| 36 | AJ | `Projection budget 26/27` | Numérique (€) |

### Stock et besoins - Colonnes AK-AP

| # | Colonne | Nom exact | Type |
|---|---------|-----------|------|
| 37 | AK | `Stock à date` | Numérique |
| 38 | AL | `Unité Fact` | Texte |
| 39 | AM | `Besoin Stock deduit (PIC-stock)` | Numérique |
| 40 | AN | `Unité ` | Texte |
| 41 | AO | `N-1 (PMP) * PIC 25-26 (stock déduit)` | Numérique (€) |
| 42 | AP | ` CA previsonnel stock deduit ` | Numérique (€) |
| 43 | AQ | `Unité` | Texte |

### Évolutions et analyses - Colonnes AR-BB

| # | Colonne | Nom exact | Type |
|---|---------|-----------|------|
| 44 | AR | `Évolution PA` | Numérique (%) |
| 45 | AS | `Delta Prix achat` | Numérique (€) |
| 46 | AT | `Évolution volume (stock déduit)` | Numérique (%) |
| 47 | AU | `Delta lié à la variation volume` | Numérique (€) |
| 48 | AV | `Évolution CA 24-25 vs PIC (SD) 25 26` | Numérique (%) |
| 49 | AW | `Delta budget / budget*` | Numérique (€) |
| 50 | AX | *(vide)* | - |
| 51 | AY | `Evol prix catégorie` | Vide (100%) |
| 52 | AZ | `EVOLUTION DES VOLUMES KG (pic 24/25 sur pic 25-26-stock)` | Numérique (%) |
| 53 | BA | `EVOLUTION CA` | Numérique (%) |
| 54 | BB | `CA : qte 24-25*buget 25-26` | Numérique (€) |

---

## 3. TYPES DE DONNÉES PAR COLONNE

### Colonnes de TYPE TEXTE

| Colonne | Nom | Valeurs uniques | Taux de remplissage |
|---------|-----|-----------------|---------------------|
| B | `Famille Appro lib` | 38 valeurs | 99.1% |
| D | `Prod lib` | ~330 valeurs | 94.3% |
| E | `Famille Compta` | 17 valeurs | 92.9% |
| I, Q, S, AG, AI, AQ | `Unité` | 1 valeur ("€") | 92-94% |
| AE, AL | `Unité Fact` | 2 valeurs (KG, PI) | Variable |
| AN | `Unité ` | 3 valeurs (KG, " KG ", PI) | 99.1% |

### Colonnes de TYPE NUMÉRIQUE (Quantités)

| Colonne | Nom | Min | Max | Moyenne | Médiane |
|---------|-----|-----|-----|---------|---------|
| A | `Famille Appro code` | 1 | 19 | - | - |
| C | `Prod code` | - | - | - | - |
| F | `Qte N-1 24-25` | 0 | 1 397 101 | 27 655 | 4 980 |
| AD | `PIC N+1` | 0 | 1 455 232 | 30 551 | 5 065 |
| AK | `Stock à date` | 0 | 128 708 | 2 432 | 486 |
| AM | `Besoin Stock deduit (PIC-stock)` | -3.38 | 1 326 906 | 28 268 | 4 321 |
| V | `QTE achat au 30/09` | - | - | - | - |
| Y | `Projection avec Besoin stock déduit` | - | - | - | - |

### Colonnes de TYPE MONÉTAIRE (€)

| Colonne | Nom | Min | Max | Somme totale |
|---------|-----|-----|-----|--------------|
| H | ` PMP N-1 24-25 ` | 0 € | 1 630 € | 3 818 € |
| J | `CA N-1 24-25` | -490 € | 2 991 990 € | 37 565 303 € |
| N | `CA Budget N-1 24-25 (Stock déduit)` | 0 € | 3 174 931 € | 42 828 511 € |
| R | ` Prev PA N+1 25-26 ` | - | - | - |
| W | `Valo Achats déjà realisés au 30/09` | - | - | 20 408 747 € |
| Z | `Valo Achats restant au 30/09` | - | - | 22 283 631 € |
| AC | `REEL + PREV AU 30/09` | - | - | 42 692 378 € |
| AF | `Ca Prev Budget N+1 PIC 25-26` | 0 € | 3 354 353 € | 40 317 632 € |
| AH | `Ca Budget N-1 PIC 24-25` | 81 € | 3 425 778 € | 44 857 460 € |
| AJ | `Projection budget 26/27` | -18.45 € | 4 013 442 € | 43 083 561 € |
| AO | `N-1 (PMP) * PIC 25-26 (stock déduit)` | 0 € | 2 997 685 € | 38 733 723 € |
| AP | ` CA previsonnel stock deduit ` | 0 € | 3 285 162 € | 41 663 790 € |
| BB | `CA : qte 24-25*buget 25-26` | 0 € | 20 081 304 € | 60 243 912 € |

### Colonnes de TYPE POURCENTAGE (%)

| Colonne | Nom | Min | Max | Moyenne |
|---------|-----|-----|-----|---------|
| U | `Evo vs prix budget` | -100% | 1 027% | 8% |
| AR | `Évolution PA` | -100% | 1 127% | 71% |
| AT | `Évolution volume (stock déduit)` | -100% | 2 086% | 4% |
| AV | `Évolution CA 24-25 vs PIC (SD) 25 26` | -100% | 2 155% | 5% |
| AZ | `EVOLUTION DES VOLUMES KG` | -11.6% | 48.1% | 7% |
| BA | `EVOLUTION CA` | Valeurs diverses | - | - |

### Colonnes quasi VIDES (>90% vides)

| Colonne | Nom | Taux de vides |
|---------|-----|---------------|
| AS | `Delta Prix achat` | 97.4% |
| AU | `Delta lié à la variation volume` | 94.3% |
| AW | `Delta budget / budget*` | 94.3% |
| AY | `Evol prix catégorie` | 100% |
| AZ | `EVOLUTION DES VOLUMES KG` | 94.6% |
| BA | `EVOLUTION CA` | 94.6% |

---

## 4. QUALITÉ DES DONNÉES

### Statistiques générales
- **Total de lignes de données**: 350 lignes (hors en-têtes)
- **Lignes complètes estimées**: ~325 lignes (92.9%)
- **Lignes de totaux/sous-totaux**: ~25 lignes (7.1%)

### Colonnes OBLIGATOIRES (>95% remplies)
Les colonnes suivantes sont quasi-toujours renseignées :

- `Famille Appro lib` (99.1%)
- `Prod lib` (94.3%)
- `Qte N-1 24-25` (99.1%)
- `CA N-1 24-25` (99.1%)
- `CA Budget N-1 24-25 (Stock déduit)` (99.1%)
- `PIC N+1` (99.1%)
- `Stock à date` (99.1%)
- `Besoin Stock deduit (PIC-stock)` (99.1%)
- `CA previsonnel stock deduit` (99.1%)
- `Projection budget 26/27` (99.7%)
- `CA : qte 24-25*buget 25-26` (99.4%)

### Colonnes OPTIONNELLES (taux de vides entre 10-30%)
- `Previsonnel budget N+1 25-26` (16.6% vides)
- `Ca Prev Budget N+1 PIC 25-26` (16.3% vides)
- `Evo vs prix budget` (24.6% vides)

### Cellules vides par section

| Section | Taux de vides moyen |
|---------|---------------------|
| Identification (A-E) | 0.9-7.1% |
| Données N-1 (F-O) | 0.9-7.4% |
| Prévisionnel N+1 (P-U) | 5.7-24.6% |
| Achats 30/09 (V-AC) | 0.3-2.6% |
| PIC et projections (AD-AJ) | 0.3-16.3% |
| Stock (AK-AP) | 0.9-8.0% |
| Évolutions (AR-BB) | 1.7-100% |

### Doublons de produits
**Aucun doublon détecté** - Les codes produits (colonne C) sont uniques.

---

## 5. VALEURS UNIQUES - COLONNES CLÉS

### Famille Appro code (Colonne A)
**19 catégories** numérotées de 1 à 19 :

| Code | Famille Appro lib | Nombre de produits |
|------|-------------------|-------------------|
| 1 | Champignons | 10 |
| 2 | Epicerie-Additif | 66 |
| 3 | Féculent | 24 |
| 4 | Fruits-Légumes | 94 |
| 5 | Liquides | 20 |
| 6 | Produits d'oeuf | 2 |
| 7 | Produits de la mer-Céphalopode | 3 |
| 8 | Produits de la mer-Coquillage | 2 |
| 9 | Produits de la mer-Crustacé | 8 |
| 10 | Produits de la mer-Poisson | 13 |
| 11 | Produits laitiers | 14 |
| 12 | Produits-Négoce | 3 |
| 13 | Viande-Agneau | 2 |
| 14 | Viande-Bœuf | 11 |
| 15 | Viande-Charcuterie | 16 |
| 16 | Viande-Gibier | 4 |
| 17 | Viande-Porc | 9 |
| 18 | Viande-Veau | 5 |
| 19 | Viande-Volaille | 22 |

**Note**: Les lignes commençant par "T" (ex: "T Champignons") sont des **lignes de TOTAUX** par famille.

### Famille Compta (Colonne E)
**17 codes comptables** :

| Code | Nombre de produits |
|------|-------------------|
| ACH003 | 2 |
| ACH101 | 1 |
| ACH103 | 3 |
| ACH104 | 16 |
| ACH105 | 16 |
| ACH106 | 5 |
| ACH107 | 23 |
| ACH108 | 5 |
| ACH109 | 78 |
| ACH110 | 13 |
| ACH111 | 10 |
| ACH112 | 10 |
| ACH113 | 134 |
| ACH133 | 4 |
| ACH136 | 1 |
| ACH137 | 3 |
| ACH203 | 1 |

### Unités de mesure

**Unité Fact** (Colonne AE, AL) :
- `KG` (Kilogramme) : 75 occurrences
- `PI` (Pièce) : 1 occurrence

**Unité** (Colonne AN) :
- `KG` : 322 occurrences
- ` KG ` (avec espaces) : 19 occurrences
- `PI` : 6 occurrences

---

## 6. CODE COULEUR ET FORMATAGE

### Couleurs détectées dans Excel

Le fichier utilise un système de couleurs pour catégoriser les colonnes :

| Couleur | RGB | Colonnes concernées | Signification probable |
|---------|-----|---------------------|----------------------|
| **Rouge** | FF0000 | F, J, N, P, W | Données historiques N-1 / Totaux |
| **Jaune** | FFFF00 | H | Prix moyen pondéré N-1 |
| **Bleu clair** | 00B0F0 | R | Prix d'achat prévisionnel N+1 |
| **Orange** | E97132 | T, U | PMP période 04-09/25 et évolution |
| **Violet clair** | F2CFEE | V, X, Y | Achats réalisés au 30/09 |
| **Orange foncé** | FFC000 | AR | Évolution prix d'achat |
| **Vert clair** | B4E5A2 | AX, AY | (Colonnes quasi vides) |
| **Bleu** | 61CBF4 | N (ligne 2) | Sous-total/valeur spéciale |
| **Bleu foncé** | 156082 | W-AB (ligne 2) | Section achats (en-têtes) |
| **Vert foncé** | 4EA72E | AO, AP | CA prévisionnel stock déduit |
| **Vert moyen** | 8ED973 | Lignes totaux | Lignes de sous-totaux par famille |

### Interprétation des couleurs

1. **Rouge** : Données de référence N-1 (2024-2025)
2. **Jaune** : Prix unitaires historiques
3. **Bleu** : Prix prévisionnels futurs
4. **Orange** : Données de suivi en cours (avril-septembre 2025)
5. **Violet** : Achats réalisés et projections
6. **Vert** : Analyses et calculs dérivés
7. **Lignes vertes** : Totaux par catégorie de produits

**Important** : Les couleurs ne sont PAS stockées dans des colonnes de données, mais comme **formatage conditionnel Excel** sur les cellules.

---

## 7. EXEMPLES DE DONNÉES RÉELLES

### Exemple 1 - Ligne 4 (premier produit)
```
Prod code: 360018
Prod lib: CEPES MORCEAUX NON BLANCHI 2/3CM IQF CAT A 1X10KG (CCE10005)
Famille Appro lib: Champignons (code: 1)
Famille Compta: ACH111

Qte N-1 24-25: 21,280 KG
PMP N-1 24-25: 7.92 €
CA N-1 24-25: 168,638 €

PIC N+1: 28,687 KG
Stock à date: 2,559 KG
Besoin Stock deduit: 26,127.81 KG
Ca Prev Budget N+1 PIC 25-26: 220,317 €
CA previsonnel stock deduit: 209,023 €

Évolution PA: 1%
Évolution volume (stock déduit): 23%
Évolution CA 24-25 vs PIC (SD) 25 26: 24%
```

### Exemple 2 - Ligne 5
```
Prod code: 343163
Prod lib: CHAMPIGNON DE PARIS QUARTIER SURGELE S02 INF ORIG POLOGNE
Famille Appro lib: Champignons (code: 1)
Famille Compta: ACH111

Qte N-1 24-25: 79,900 KG
PMP N-1 24-25: 2.05 €
CA N-1 24-25: 163,638 €

PIC N+1: 73,852 KG
Stock à date: 9,910 KG
Besoin Stock deduit: 63,941.24 KG
Ca Prev Budget N+1 PIC 25-26: 164,766 €
CA previsonnel stock deduit: 147,065 €

Évolution PA: 12%
Évolution volume (stock déduit): -20%
Évolution CA 24-25 vs PIC (SD) 25 26: -10%
```

### Exemple 3 - Ligne 14 (TOTAL Champignons)
```
Famille Appro lib: T Champignons
Prod lib: (vide)
Qte N-1 24-25: 205,830

→ Ligne de SOUS-TOTAL pour la catégorie Champignons
```

---

## 8. STATISTIQUES NUMÉRIQUES DÉTAILLÉES

### Distribution des quantités

| Indicateur | Qte N-1 24-25 | PIC N+1 | Stock à date | Besoin Stock déduit |
|------------|---------------|---------|--------------|---------------------|
| **Min** | 0 | 0 | 0 | -3.38 |
| **Q1 (25%)** | 900 | 694 | 64 | 537 |
| **Médiane** | 4 980 | 5 065 | 486 | 4 321 |
| **Moyenne** | 27 655 | 30 551 | 2 432 | 28 268 |
| **Q3 (75%)** | 19 992 | 20 038 | 1 439 | 18 216 |
| **Max** | 1 397 101 | 1 455 232 | 128 708 | 1 326 906 |
| **Somme** | 9 596 336 | 10 601 124 | 844 010 | 9 809 134 |

### Distribution des chiffres d'affaires

| Indicateur | CA N-1 24-25 | CA Prev Budget N+1 | CA previsonnel SD | CA Budget 26-27 |
|------------|--------------|-------------------|-------------------|-----------------|
| **Min** | -490 € | 0 € | 0 € | 0 € |
| **Q1 (25%)** | 3 500 € | 4 716 € | 2 195 € | - |
| **Médiane** | 18 818 € | 26 013 € | 15 544 € | - |
| **Moyenne** | 108 257 € | 137 603 € | 120 069 € | - |
| **Q3 (75%)** | 71 794 € | 102 657 € | 81 466 € | - |
| **Max** | 2 991 990 € | 3 354 353 € | 3 285 162 € | 4 013 442 € |
| **Somme** | 37 565 303 € | 40 317 632 € | 41 663 790 € | 43 083 561 € |

### Distribution des évolutions

| Indicateur | Évolution PA | Évolution volume | Évolution CA |
|------------|-------------|------------------|--------------|
| **Min** | -100% | -100% | -100% |
| **Q1 (25%)** | -1% | -25% | -25% |
| **Médiane** | 4% | -5% | -4% |
| **Moyenne** | 71% | 4% | 5% |
| **Q3 (75%)** | 13% | 10% | 12% |
| **Max** | 1 127% | 2 086% | 2 155% |

**Note** : Les valeurs extrêmes (>100%) indiquent probablement des nouveaux produits ou des erreurs de données.

---

## 9. RÉSUMÉ POUR L'IMPORT

### Structure à importer

**Fichier** : `personnal_budget.xlsx`
**Feuille** : `Feuil1`
**Ligne d'en-tête** : **Ligne 3** (index 2 en base 0)
**Première ligne de données** : **Ligne 4** (index 3)
**Dernière ligne de données** : **Ligne 353** (index 352)
**Total de lignes à importer** : **350 lignes**

### Colonnes ESSENTIELLES à importer

Pour un dashboard fonctionnel, importer prioritairement :

**Identification** :
- `Famille Appro code` (A)
- `Famille Appro lib` (B)
- `Prod code` (C)
- `Prod lib` (D)
- `Famille Compta` (E)

**Quantités et stocks** :
- `Qte N-1 24-25` (F)
- `PIC N+1` (AD)
- `Stock à date` (AK)
- `Besoin Stock deduit (PIC-stock)` (AM)

**Chiffres d'affaires** :
- `CA N-1 24-25` (J)
- `CA Budget N-1 24-25 (Stock déduit)` (N)
- `Ca Prev Budget N+1 PIC 25-26` (AF)
- `CA previsonnel stock deduit` (AP)
- `Projection budget 26/27` (AJ)

**Prix** :
- ` PMP N-1 24-25 ` (H)
- ` Prev PA N+1 25-26 ` (R)
- `PMP 04/25-09/25` (T)

**Évolutions** :
- `Évolution PA` (AR)
- `Évolution volume (stock déduit)` (AT)
- `Évolution CA 24-25 vs PIC (SD) 25 26` (AV)

**Unités** :
- `Unité Fact` (AE ou AL)
- `Unité ` (AN)

### Colonnes à EXCLURE (optionnel)

Ces colonnes sont largement vides et peuvent être ignorées dans un premier temps :
- `Delta Prix achat` (AS) - 97.4% vide
- `Delta lié à la variation volume` (AU) - 94.3% vide
- `Delta budget / budget*` (AW) - 94.3% vide
- `Evol prix catégorie` (AY) - 100% vide
- `EVOLUTION DES VOLUMES KG` (AZ) - 94.6% vide
- `EVOLUTION CA` (BA) - 94.6% vide

### Lignes de totaux à filtrer

Les lignes de sous-totaux commencent par "T " dans `Famille Appro lib`.
Pour obtenir uniquement les produits, filtrer :
```javascript
data.filter(row => !row['Famille Appro lib'].startsWith('T '))
```

### Transformations nécessaires

1. **Supprimer les espaces superflus** dans les noms de colonnes et valeurs
2. **Convertir les pourcentages** : retirer le symbole "%" et diviser par 100
3. **Convertir les montants** : retirer "€" et parser en nombre
4. **Unifier les unités** : "KG" vs " KG " → standardiser
5. **Gérer les valeurs vides** : remplacer par `null` ou `0` selon le contexte
6. **Détecter les totaux** : marquer les lignes commençant par "T " comme `isTotal: true`

---

## 10. RECOMMANDATIONS POUR LE DASHBOARD

### Vue par défaut
- Afficher uniquement les lignes de produits (exclure les totaux)
- Grouper par `Famille Appro lib`
- Permettre le drill-down vers les détails produit

### KPIs principaux
1. **CA Total N-1 vs CA Prévisionnel N+1** (évolution globale)
2. **Top 10 produits par CA** (classement)
3. **Évolution moyenne des volumes** par famille
4. **Taux de rotation du stock** (Stock / Besoin)
5. **Évolution des prix d'achat** (inflation)

### Filtres recommandés
- Par famille (dropdown avec les 19 catégories)
- Par famille comptable (ACH...)
- Par évolution CA (positive/négative/stable)
- Par unité (KG/PI)
- Recherche par nom de produit

### Graphiques suggérés
1. **Treemap** : CA par famille et produit
2. **Line chart** : Évolution CA N-1 → Prév N+1 → Projection 26-27
3. **Bar chart** : Top/Flop produits par évolution volume
4. **Scatter plot** : Évolution prix vs évolution volume
5. **Gauge** : Taux de couverture stock / besoin

---

## ANNEXE - Scripts d'analyse utilisés

Les scripts Node.js suivants ont été créés pour cette analyse :

1. `analyze_excel.js` - Analyse structure générale
2. `analyze_excel_v2.js` - Détection des en-têtes et types
3. `analyze_excel_details.js` - Statistiques et valeurs uniques

Tous les scripts sont disponibles dans le répertoire `c:\CODE\budget\dashboard-agroalimentaire\`.

---

**Fin du rapport**
