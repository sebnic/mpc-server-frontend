# EChart MCP Server

Serveur MCP dédié à la génération de configurations ECharts.

## 🎯 Fonctionnalités

Ce serveur MCP expose des outils pour générer automatiquement des configurations ECharts pour différents types de graphiques :

- **Line Chart** : Graphiques en ligne
- **Bar Chart** : Graphiques en barres
- **Pie Chart** : Graphiques circulaires/camembert
- **Scatter Chart** : Nuages de points
- **Custom Chart** : Configuration personnalisée complète

## 🛠️ Outils Disponibles

### 1. `generate_line_chart`
Génère une configuration pour un graphique en ligne.

**Paramètres** :
- `title` (optionnel) : Titre du graphique
- `xAxisData` (requis) : Labels de l'axe X (array de strings)
- `series` (requis) : Séries de données
  - `name` : Nom de la série
  - `data` : Données (array de numbers)

**Exemple** :
```json
{
  "title": "Ventes mensuelles",
  "xAxisData": ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun"],
  "series": [
    {
      "name": "2024",
      "data": [120, 132, 101, 134, 90, 230]
    },
    {
      "name": "2025",
      "data": [220, 182, 191, 234, 290, 330]
    }
  ]
}
```

### 2. `generate_bar_chart`
Génère une configuration pour un graphique en barres.

**Paramètres** : Identiques à `generate_line_chart`

### 3. `generate_pie_chart`
Génère une configuration pour un graphique circulaire.

**Paramètres** :
- `title` (optionnel) : Titre du graphique
- `data` (requis) : Données du camembert
  - `name` : Nom de la catégorie
  - `value` : Valeur numérique

**Exemple** :
```json
{
  "title": "Répartition des ventes",
  "data": [
    { "name": "Produit A", "value": 335 },
    { "name": "Produit B", "value": 234 },
    { "name": "Produit C", "value": 158 }
  ]
}
```

### 4. `generate_scatter_chart`
Génère une configuration pour un nuage de points.

**Paramètres** :
- `title` (optionnel) : Titre du graphique
- `series` (requis) : Séries de points
  - `name` : Nom de la série
  - `data` : Array de [x, y] coordinates

**Exemple** :
```json
{
  "title": "Corrélation",
  "series": [
    {
      "name": "Dataset 1",
      "data": [[10, 20], [15, 25], [20, 30], [25, 22]]
    }
  ]
}
```

### 5. `generate_custom_chart`
Génère une configuration personnalisée complète.

**Paramètres** :
- `config` (requis) : Objet de configuration ECharts complet

## 🚀 Utilisation

### En ligne de commande (stdio)

```bash
# Compiler TypeScript
npx tsc src/mcp/echart/echart-server.ts --outDir dist --module commonjs --target es2020

# Exécuter le serveur
node dist/mcp/echart/echart-server.js
```

### Dans le navigateur (Web Worker)

Pour intégrer ce serveur dans le Web Worker existant, voir `src/worker.ts`.

## 📦 Dépendances

- `@modelcontextprotocol/sdk` : SDK MCP officiel
- ECharts (côté client pour le rendu)

## 💡 Exemple d'intégration

Pour utiliser ce serveur avec un LLM agent :

```typescript
// L'agent peut demander
"Génère-moi un graphique en ligne montrant les ventes de janvier à juin"

// Le serveur MCP retournera la configuration ECharts
{
  "title": { "text": "Ventes", "left": "center" },
  "xAxis": { "type": "category", "data": ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun"] },
  "yAxis": { "type": "value" },
  "series": [{ "type": "line", "data": [...] }]
}
```

## 🔗 Ressources

- [ECharts Documentation](https://echarts.apache.org/)
- [MCP Protocol](https://modelcontextprotocol.io/)
