# Guide de Test - Intégration ECharts

## ✅ Trois étapes complétées

### 1. ✅ Intégration dans le Web Worker
Les outils ECharts sont maintenant disponibles dans le serveur MCP :
- `generate_line_chart`
- `generate_bar_chart`
- `generate_pie_chart`

### 2. ✅ UI de Visualisation
Une interface complète a été ajoutée avec :
- Section "📊 ECharts Generator"
- 3 boutons d'exemple prêts à l'emploi
- Affichage du graphique rendu
- Vue de la configuration JSON

### 3. ✅ Mode Standalone
Documentation complète pour l'utilisation en standalone :
- Guide dans `src/mcp/echart/STANDALONE.md`
- Script de test `test-server.ts`
- Compatible avec d'autres clients MCP

## 🧪 Comment Tester

### Test Rapide (Navigateur)

1. **Démarrer l'application** :
   ```bash
   npm run dev
   ```
   Ouvrir http://127.0.0.1:5173/

2. **Connecter au serveur** :
   - Cliquer sur "Connect to Server"
   - Les outils ECharts apparaissent dans la liste

3. **Initialiser un LLM** (optionnel pour l'agent) :
   - Sélectionner "Gemini"
   - Entrer votre clé API
   - Cliquer "Initialize LLM"

4. **Tester les graphiques** :
   - Scroller jusqu'à "📊 ECharts Generator"
   - Cliquer sur l'un des boutons :
     * 📈 Sales Example (Line Chart)
     * 📊 Revenue Example (Bar Chart)
     * 🥧 Market Share Example (Pie Chart)
   - Le graphique s'affiche instantanément
   - Cliquer sur "View Configuration JSON" pour voir le code

### Test avec l'Agent IA

L'agent peut maintenant générer des graphiques !

**Exemples de questions** :
- "Génère-moi un graphique en ligne montrant les ventes de janvier à juin"
- "Crée un graphique circulaire pour la répartition des produits"
- "Fait un bar chart avec les revenus trimestriels"

L'agent utilisera automatiquement les outils `generate_*_chart` pour créer la configuration.

### Test Standalone (Avancé)

Voir le fichier `src/mcp/echart/STANDALONE.md` pour :
- Compilation du serveur
- Utilisation avec d'autres clients MCP
- Intégration avec Claude Desktop
- Communication JSON-RPC manuelle

## 📊 Exemples de Configurations Générées

### Line Chart
```json
{
  "title": { "text": "Monthly Sales 2024-2025", "left": "center" },
  "tooltip": { "trigger": "axis" },
  "legend": { "data": ["2024", "2025"], "top": 40 },
  "xAxis": {
    "type": "category",
    "data": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "boundaryGap": false
  },
  "yAxis": { "type": "value" },
  "series": [
    {
      "name": "2024",
      "type": "line",
      "data": [120, 132, 101, 134, 90, 230],
      "smooth": true
    },
    {
      "name": "2025",
      "type": "line",
      "data": [220, 182, 191, 234, 290, 330],
      "smooth": true
    }
  ]
}
```

### Pie Chart
```json
{
  "title": { "text": "Market Share 2025", "left": "center" },
  "tooltip": {
    "trigger": "item",
    "formatter": "{a} <br/>{b}: {c} ({d}%)"
  },
  "legend": { "orient": "vertical", "left": "left", "top": 60 },
  "series": [
    {
      "name": "Data",
      "type": "pie",
      "radius": "50%",
      "data": [
        { "name": "Product A", "value": 335 },
        { "name": "Product B", "value": 234 },
        { "name": "Product C", "value": 158 }
      ]
    }
  ]
}
```

## 🎯 Prochaines Étapes Possibles

- [ ] Ajouter plus de types de graphiques (scatter, radar, gauge)
- [ ] Permettre l'édition interactive des configurations
- [ ] Export des graphiques en PNG/SVG
- [ ] Intégration avec des sources de données externes
- [ ] Templates de graphiques pré-configurés

## 📚 Ressources

- [ECharts Documentation](https://echarts.apache.org/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- README principal : `README.md`
- Guide standalone : `src/mcp/echart/STANDALONE.md`
