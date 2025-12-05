# 🎯 Démonstration de la Hiérarchie d'Outils MCP

## Concept

Au lieu d'envoyer les spécifications complètes de 100+ configurations ECharts à chaque requête, nous utilisons une **hiérarchie en 3 niveaux** :

### Niveau 1 : Découverte (`get_chart_types`)
- Liste tous les types de graphiques disponibles
- Description de chaque type
- Cas d'usage recommandés
- **Coût** : ~200 tokens (déclaration) + ~500 tokens (réponse)

### Niveau 2 : Schéma Détaillé (`get_chart_config_schema`)
- Schéma JSON complet pour un type spécifique
- Exemples concrets
- Documentation des paramètres
- **Coût** : ~150 tokens (déclaration) + ~400 tokens (réponse)

### Niveau 3 : Génération (`generate_xxx_chart`)
- Génère la configuration ECharts finale
- Utilise le schéma appris en Niveau 2
- **Coût** : ~200 tokens (déclaration) + ~800 tokens (config)

## Comparaison des Approches

### ❌ Approche Monolithique (AVANT)
```
Prompt système = 15 outils ECharts détaillés = ~3000 tokens
Requête utilisateur = ~100 tokens
Réponse LLM = ~800 tokens
────────────────────────────────────────────
TOTAL par requête = ~3900 tokens
```

### ✅ Approche Hiérarchique (MAINTENANT)

**Cas 1 : Graphique simple (line/bar/pie connu)**
```
Prompt système = 5 outils (get_chart_types + 3 generate) = ~800 tokens
Requête utilisateur = ~100 tokens
Réponse LLM = ~800 tokens (génère directement)
────────────────────────────────────────────
TOTAL = ~1700 tokens (économie de 56%)
```

**Cas 2 : Graphique complexe nécessitant découverte**
```
Prompt système = 5 outils = ~800 tokens
Requête utilisateur = ~100 tokens

Itération 1 (découverte):
  - LLM appelle get_chart_types = ~500 tokens
  
Itération 2 (schéma):
  - LLM appelle get_chart_config_schema = ~400 tokens
  
Itération 3 (génération):
  - LLM génère config = ~800 tokens
────────────────────────────────────────────
TOTAL = ~2600 tokens (économie de 33%)
```

## Tests Pratiques

### Test 1 : Bouton "🔍 Test Discovery"
Cliquez sur ce bouton pour voir la hiérarchie en action :

1. **Step 1** : Appel `get_chart_types` → Découvre 8 types disponibles
2. **Step 2** : Appel `get_chart_config_schema` avec `chartType: "pie"` → Obtient schéma détaillé
3. **Step 3** : Appel `generate_pie_chart` avec les paramètres → Génère le graphique

**Logs attendus** :
```
🔍 Step 1: Discovering available chart types...
📋 Available types: line, bar, pie, scatter, radar, gauge, funnel, heatmap
🔍 Step 2: Getting detailed schema for "pie" chart...
📐 Schema retrieved. Tool to use: generate_pie_chart
🔍 Step 3: Generating pie chart using discovered schema...
✅ Hierarchy demonstration complete!
```

### Test 2 : Prompt AI avec découverte
```
"Je veux créer un graphique mais je ne sais pas quel type utiliser. 
J'ai des données de ventes mensuelles sur 12 mois."
```

**Comportement attendu** :
1. Agent appelle `get_chart_types` pour découvrir les options
2. Analyse : "ventes mensuelles" → "trends over time" → choisit `line`
3. Appelle `get_chart_config_schema` avec `chartType: "line"`
4. Génère le line chart avec les bonnes données

### Test 3 : Prompt AI direct (path rapide)
```
"Line chart : Jan 100, Feb 150, Mar 200"
```

**Comportement attendu** :
- Agent reconnaît "line chart" directement
- Appelle `generate_line_chart` sans découverte
- Plus rapide et moins coûteux

## Avantages de l'Approche

### 💰 Économie de Coûts
- **56% d'économie** pour les cas simples
- **33% d'économie** même avec découverte complète
- Mise en cache possible des résultats de découverte

### 📈 Scalabilité
- Ajout de nouveaux types de graphiques sans augmenter la taille du prompt système
- `get_chart_types` retourne la liste complète dynamiquement
- Chaque nouveau type ajoute seulement ~50 tokens à la réponse de découverte

### 🧠 Intelligence de l'Agent
- L'agent apprend la structure lors de la découverte
- Peut comparer les options avant de choisir
- Meilleure compréhension du contexte

## Extension Future

### Ajout d'un Nouveau Type (ex: Scatter)

**1. Ajouter dans `get_chart_types`** (worker.ts)
```typescript
{
  name: 'scatter',
  description: 'Scatter plot for correlation',
  useCases: ['Correlation', 'Distribution'],
  example: 'Height vs weight'
}
```

**2. Ajouter le schéma dans `get_chart_config_schema`**
```typescript
case 'scatter':
  schema = { /* structure détaillée */ };
  break;
```

**3. Créer la fonction de génération**
```typescript
function generateScatterChart(args) { /* ... */ }
```

**Coût ajouté** : +50 tokens à la découverte, 0 tokens au prompt système !

## Ressources MCP (Niveau Avancé)

Pour aller encore plus loin, MCP supporte aussi les **Resources** :

```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "echarts://docs/full-api",
        name: "ECharts Complete API",
        mimeType: "text/markdown"
      }
    ]
  };
});
```

L'agent peut alors faire :
```
"Read resource echarts://docs/full-api for advanced options"
```

Cela permet d'avoir une documentation complète sans l'inclure dans chaque prompt !

## Conclusion

La hiérarchie d'outils est la solution recommandée pour :
- ✅ Librairies complexes (ECharts, D3.js, etc.)
- ✅ APIs avec de nombreux endpoints
- ✅ Systèmes avec configuration riche
- ✅ Optimisation des coûts LLM

**Résultat** : Économie de 33-56% de tokens tout en gardant toute la puissance d'ECharts ! 🚀
