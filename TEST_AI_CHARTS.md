# 🧪 Test de la Génération de Graphiques par IA

## ✅ Fonctionnalité Ajoutée !

Un champ de texte permet maintenant de **décrire le graphique souhaité en langage naturel**, et l'agent IA le génère automatiquement.

## 🚀 Test Rapide

### Étape 1 : Accès
Ouvrez http://127.0.0.1:5173/ dans votre navigateur

### Étape 2 : Connexion
1. Cliquez sur **"Connect to Server"**
2. Vérifiez que les outils ECharts apparaissent dans la liste

### Étape 3 : Initialisation LLM
1. Sélectionnez **"Gemini"** (recommandé)
2. Entrez votre clé API Gemini
3. Cliquez **"Initialize LLM"**
4. Attendez "LLM initialized successfully!"

### Étape 4 : Génération de Graphique

Scrollez jusqu'à **"📊 ECharts Generator with AI"**

#### Test 1 : Line Chart Simple

**Dans le champ de texte, entrez** :
```
Crée un graphique en ligne montrant les ventes de janvier à juin : 120, 200, 150, 180, 220, 250
```

**Cliquez sur** "🎨 Generate Chart with AI"

**Résultat attendu** :
- Le bouton affiche "🤖 Generating..."
- L'agent appelle automatiquement `generate_line_chart`
- Un graphique en ligne apparaît avec les données
- La configuration JSON est visible sous le graphique

#### Test 2 : Bar Chart

**Entrez** :
```
Génère un bar chart avec les revenus trimestriels : Q1 1500€, Q2 1800€, Q3 2100€, Q4 2400€
Titre: "Revenus Trimestriels 2024"
```

**Résultat attendu** :
- Graphique à barres avec 4 barres
- Titre "Revenus Trimestriels 2024"

#### Test 3 : Pie Chart

**Entrez** :
```
Crée un pie chart pour les parts de marché : Produit A 35%, Produit B 28%, Produit C 22%, Autres 15%
```

**Résultat attendu** :
- Graphique circulaire avec 4 sections
- Pourcentages affichés au survol

### Étape 5 : Boutons d'Exemple

Si vous préférez tester rapidement sans l'IA :
- **📈 Sales Example** : Line chart pré-configuré
- **📊 Revenue Example** : Bar chart pré-configuré
- **🥧 Market Share Example** : Pie chart pré-configuré

## 🔍 Vérification

### Console du Navigateur (F12)

Vous devriez voir :
```
[Agent] 💬 Starting new chat: { message: "Crée un graphique...", availableTools: [...] }
[Agent] 🔧 LLM decided to use a tool: { tool: "generate_line_chart", ... }
[MCP Server] Received tool call: { tool: "generate_line_chart", ... }
[Agent] ✅ Tool execution completed
✨ Chart generated successfully by AI!
```

### Interface

- ✅ Zone de texte visible et stylée
- ✅ Bouton "Generate Chart with AI" actif
- ✅ Séparateur "OR try these examples"
- ✅ Boutons d'exemple toujours présents
- ✅ Graphique rendu dans un conteneur blanc
- ✅ Configuration JSON expandable

## ❌ Résolution de Problèmes

### "Please enter a chart description"
→ Le champ de texte est vide, entrez une description

### "Make sure the LLM is initialized first"
→ Initialisez Gemini ou WebLLM avant de générer

### "Could not extract chart configuration"
→ L'IA n'a pas généré de JSON. Essayez un prompt plus spécifique avec :
- Type de graphique clair (line, bar, pie)
- Données concrètes (nombres, labels)
- Format structuré

### Le graphique ne s'affiche pas
→ Ouvrez F12 et vérifiez les erreurs
→ Vérifiez que echarts est bien chargé

## 📸 Capture d'Écran de Test

**Prompt testé avec succès** :
```
Crée un graphique en ligne avec les températures de la semaine : 
Lundi 15°C, Mardi 18°C, Mercredi 20°C, Jeudi 17°C, Vendredi 19°C, Samedi 22°C, Dimanche 21°C
```

**Résultat** : Line chart avec courbe lisse, 7 points de données, axes propres

## 🎯 Prochains Tests Suggérés

### Tests Avancés

1. **Multi-séries** :
   ```
   Crée un line chart comparant les ventes 2024 et 2025 :
   2024: Jan 100, Fev 120, Mar 110
   2025: Jan 150, Fev 180, Mar 170
   ```

2. **Données complexes** :
   ```
   Génère un bar chart avec 3 produits sur 4 trimestres
   ```

3. **Prompt vague** (pour tester la robustesse) :
   ```
   Fais un graphique
   ```

## ✨ Nouvelle UI

L'interface de la section ECharts a été mise à jour :

**Avant** :
- Sélection de type de graphique (dropdown)
- 3 boutons d'exemple
- Zone d'affichage

**Après** :
- ✨ **Zone de prompt texte** avec placeholder informatif
- ✨ **Bouton "Generate Chart with AI"** avec animation
- ✨ **Divider "OR try these examples"**
- 3 boutons d'exemple (conservés)
- Zone d'affichage
- Configuration JSON

## 📖 Documentation

- Guide complet : [AI_CHART_GENERATION.md](./AI_CHART_GENERATION.md)
- Guide d'intégration : [ECHART_INTEGRATION.md](./ECHART_INTEGRATION.md)
- README principal : [README.md](./README.md)
