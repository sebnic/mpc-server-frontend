# Génération de Graphiques ECharts par IA

## 🎨 Nouvelle Fonctionnalité

L'application permet maintenant de **générer des graphiques ECharts en langage naturel** ! Il suffit de décrire le graphique souhaité, et l'agent IA utilisera automatiquement les outils MCP appropriés.

## 📝 Comment Utiliser

### 1. Connexion et Initialisation

1. Démarrer l'application : `npm run dev`
2. Ouvrir http://127.0.0.1:5173/
3. Cliquer sur "Connect to Server"
4. **Initialiser Gemini** (recommandé pour cette fonctionnalité) :
   - Sélectionner "Gemini"
   - Entrer votre clé API
   - Cliquer "Initialize LLM"

### 2. Générer un Graphique avec l'IA

Scroller jusqu'à la section **"📊 ECharts Generator with AI"**

#### Exemples de Prompts

**Graphiques en Ligne (Line Charts)** :
- "Crée un graphique en ligne montrant les ventes de janvier à juin : 120, 200, 150, 180, 220, 250"
- "Génère un line chart avec les températures de la semaine : Lun 15°, Mar 18°, Mer 20°, Jeu 17°, Ven 19°, Sam 22°, Dim 21°"
- "Fait un graphique montrant l'évolution du chiffre d'affaires mensuel"

**Graphiques en Barres (Bar Charts)** :
- "Crée un bar chart avec les revenus trimestriels : Q1=1500, Q2=1800, Q3=2100, Q4=2400"
- "Génère un graphique à barres comparant les ventes de 3 produits"
- "Fait un histogramme des résultats par département"

**Graphiques Circulaires (Pie Charts)** :
- "Crée un pie chart pour la répartition : Produit A 35%, Produit B 45%, Produit C 20%"
- "Génère un camembert montrant les parts de marché"
- "Fait un graphique circulaire des dépenses mensuelles"

### 3. Résultat

L'IA va :
1. Analyser votre demande
2. Choisir le type de graphique approprié
3. Appeler l'outil MCP correspondant
4. Générer la configuration ECharts
5. Afficher le graphique rendu

## 🤖 Comment ça Marche

### Architecture

```
User Prompt → Agent IA (Gemini/WebLLM)
                 ↓
          Analyse du prompt
                 ↓
     Sélection de l'outil MCP
                 ↓
    generate_line_chart / generate_bar_chart / generate_pie_chart
                 ↓
       Configuration ECharts JSON
                 ↓
     Rendu avec echarts@6.0
```

### Système Prompt Enrichi

L'agent dispose d'exemples spécifiques pour les graphiques :

```typescript
CHART GENERATION EXAMPLES:
- Line chart: {"tool": "generate_line_chart", "arguments": {...}}
- Bar chart: {"tool": "generate_bar_chart", "arguments": {...}}
- Pie chart: {"tool": "generate_pie_chart", "arguments": {...}}
```

### Extraction Intelligente

Le code extrait automatiquement la configuration JSON de la réponse de l'agent et rend le graphique.

## 💡 Conseils pour de Meilleurs Résultats

### ✅ Bons Prompts

```
"Crée un graphique en ligne avec les ventes de janvier à juin : 120, 200, 150, 180, 220, 250"
```
→ **Clair**, données précises, type spécifié

```
"Génère un bar chart comparant les revenus : Produit A 1500€, Produit B 2200€, Produit C 1800€"
```
→ **Structuré**, valeurs explicites

```
"Fait un pie chart pour les parts : Marketing 30%, Développement 45%, Support 25%"
```
→ **Format clair**, pourcentages donnés

### ❌ Prompts à Améliorer

```
"Fais un graphique"
```
→ Trop vague, manque de données

```
"Montre les ventes"
```
→ Pas de type de graphique, pas de données

```
"Graphique complexe avec plein de données"
```
→ Pas assez spécifique

## 🎯 Exemples Complets

### Exemple 1 : Ventes Mensuelles

**Prompt** :
```
Crée un graphique en ligne montrant les ventes mensuelles de janvier à juin : 
Jan 1200€, Fev 1350€, Mar 980€, Avr 1450€, Mai 1600€, Jun 1750€
```

**Résultat** : Line chart avec courbe lisse, titre, tooltip et légende

### Exemple 2 : Revenus par Trimestre

**Prompt** :
```
Génère un bar chart avec les revenus trimestriels 2024 :
Q1: 15000€, Q2: 18000€, Q3: 21000€, Q4: 24000€
Titre: "Revenus Trimestriels 2024"
```

**Résultat** : Bar chart avec barres colorées et ombres

### Exemple 3 : Parts de Marché

**Prompt** :
```
Crée un pie chart pour les parts de marché :
- Entreprise A: 35%
- Entreprise B: 28%
- Entreprise C: 22%
- Autres: 15%
Titre: "Parts de Marché 2025"
```

**Résultat** : Pie chart interactif avec légende

## 🔍 Debugging

### Voir la Configuration Générée

Cliquez sur "View Configuration JSON" sous le graphique pour voir la configuration ECharts complète générée par l'IA.

### Logs dans la Console

Ouvrez la console du navigateur (F12) pour voir :
- `[Agent] 💬 Starting new chat` : Début de l'analyse
- `[Agent] 🔧 LLM decided to use a tool` : Outil sélectionné
- `[MCP Server] Received tool call` : Appel MCP reçu
- `[Agent] ✅ Tool execution completed` : Génération terminée

### Erreurs Communes

**"Could not extract chart configuration"**
→ L'IA n'a pas généré de JSON valide. Soyez plus spécifique.

**"Make sure the LLM is initialized first"**
→ Initialisez Gemini ou WebLLM avant d'utiliser cette fonction.

**Graphique vide**
→ Vérifiez que les données sont bien formatées dans votre prompt.

## 🚀 Améliorations Futures

- [ ] Support de plus de types de graphiques (scatter, radar, gauge)
- [ ] Édition interactive des graphiques générés
- [ ] Historique des graphiques créés
- [ ] Export PNG/SVG
- [ ] Templates personnalisables
- [ ] Support multi-séries automatique

## 📚 Ressources

- [ECharts Documentation](https://echarts.apache.org/)
- [Guide Complet ECharts](./ECHART_INTEGRATION.md)
- [Documentation Agent IA](./README.md#-agent-ia-function-calling)
