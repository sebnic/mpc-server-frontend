# Refactorisation du Worker MCP

## Vue d'ensemble

Le fichier `worker.ts` a été refactorisé pour utiliser les modules MCP organisés dans `src/mcp/`. Cette refactorisation améliore la maintenabilité et la réutilisabilité du code.

## Changements effectués

### Avant
- **worker.ts** : ~843 lignes avec toute la logique inline
  - Définitions des outils
  - Handlers des outils
  - Générateurs de graphiques
  - Logique LLM et agent

### Après
- **worker.ts** : 132 lignes (84% de réduction !)
  - Import des modules MCP
  - Orchestration des handlers
  - Configuration du serveur

### Organisation modulaire

```
src/
├── worker.ts (132 lignes) ← Point d'entrée
└── mcp/
    ├── index.ts ← Export central
    ├── README.md
    ├── basic-tools/
    │   ├── basic-tools-server.ts
    │   └── README.md
    ├── llm/
    │   ├── llm-server.ts
    │   └── README.md
    ├── agent/
    │   ├── agent-server.ts
    │   └── README.md
    ├── echart/
    │   ├── echart-tools.ts ← Nouveau fichier pour intégration browser
    │   ├── echart-server.ts (standalone)
    │   └── README.md
    └── chart-discovery/
        └── README.md
```

## Architecture

### 1. Schémas des outils
Chaque module exporte une fonction pour obtenir les schémas :
```typescript
basicToolsSchema           // Array direct
getLLMToolsSchema()        // Fonction
getAgentToolsSchema()      // Fonction
getChartDiscoverySchema()  // Fonction
getChartGenerationSchema() // Fonction
```

### 2. Handlers des outils
Chaque handler retourne `null` s'il ne reconnaît pas le tool :
```typescript
handleBasicTool(name, args)
handleLLMTool(name, args, llmService, onProgress?)
handleAgentTool(name, args, agent, availableTools?)
handleChartDiscoveryTool(name, args)
handleChartGenerationTool(name, args)
```

### 3. Orchestration dans worker.ts
Le worker essaie chaque handler dans l'ordre :
```typescript
async function handleToolCall(request) {
  const basicResult = handleBasicTool(name, args);
  if (basicResult) return basicResult;

  const llmResult = await handleLLMTool(name, args, llmService, onProgress);
  if (llmResult) return llmResult;

  const agentResult = await handleAgentTool(name, args, agent, tools);
  if (agentResult) return agentResult;

  const chartDiscoveryResult = handleChartDiscoveryTool(name, args);
  if (chartDiscoveryResult) return chartDiscoveryResult;

  const chartGenerationResult = handleChartGenerationTool(name, args);
  if (chartGenerationResult) return chartGenerationResult;

  throw new Error(`Unknown tool: ${name}`);
}
```

## Avantages

### ✅ Maintenabilité
- Code organisé en modules logiques
- Chaque module a sa responsabilité claire
- Documentation intégrée dans chaque dossier

### ✅ Réutilisabilité
- Les handlers peuvent être utilisés dans d'autres contextes
- Schémas exportés pour tests ou documentation
- Séparation claire entre browser et standalone

### ✅ Testabilité
- Modules indépendants faciles à tester
- Dépendances explicites (llmService, agent)
- Pas de couplage global

### ✅ Évolutivité
- Ajouter un nouveau serveur = créer un dossier dans mcp/
- Pattern clair à suivre
- Export central via mcp/index.ts

## Fichiers créés

1. **src/mcp/echart/echart-tools.ts** (nouveau)
   - Schémas et handlers pour intégration browser
   - Séparé de echart-server.ts (standalone)
   - Générateurs de configuration ECharts

2. **Modifications des handlers existants**
   - Retour de `null` au lieu d'erreur si tool non reconnu
   - Ajout de paramètres optionnels (onProgress, availableTools)
   - Logs améliorés

## Utilisation

### Ajouter un nouveau serveur MCP

1. Créer un dossier dans `src/mcp/`
2. Créer un fichier serveur avec :
   ```typescript
   export function getMyToolsSchema() { ... }
   export function handleMyTool(name, args) {
     // ...
     return null; // Si tool non reconnu
   }
   ```
3. Exporter dans `src/mcp/index.ts`
4. Importer et utiliser dans `worker.ts`

## Tests

Le projet compile sans erreurs TypeScript pour worker.ts :
```bash
npx tsc --noEmit src/worker.ts
# ✅ Aucune erreur
```

## Prochaines étapes possibles

- [ ] Tests unitaires pour chaque module
- [ ] Validation des schémas avec JSON Schema
- [ ] Documentation API auto-générée
- [ ] Métriques de performance par handler
