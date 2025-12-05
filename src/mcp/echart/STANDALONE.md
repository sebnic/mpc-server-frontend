# Test du Serveur EChart MCP en Mode Standalone

## Prérequis

Pour tester le serveur MCP EChart en mode standalone (via stdio), vous devez d'abord le compiler.

## Option 1 : Utilisation dans le navigateur (Recommandé)

Le serveur EChart est **déjà intégré** dans le Web Worker principal (`src/worker.ts`).

### Démarrage :

```bash
npm run dev
```

Puis ouvrez http://localhost:5173 et :
1. Cliquez sur "Connect to Server"
2. Initialisez un LLM (Gemini recommandé)
3. Utilisez les boutons d'exemple dans la section "📊 ECharts Generator"

## Option 2 : Mode Standalone (stdio)

### Compilation

Avec Node 18+ et TypeScript installé globalement :

```bash
cd src/mcp/echart
npm install -g typescript  # Si pas déjà installé
npm run build
```

### Exécution du serveur

```bash
npm start
```

### Test avec le script de test

```bash
npm test
```

### Communication JSON-RPC manuelle

Le serveur communique via stdin/stdout en JSON-RPC 2.0 :

**Liste des outils :**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

**Générer un graphique :**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "generate_line_chart",
    "arguments": {
      "title": "Sales Chart",
      "xAxisData": ["Mon", "Tue", "Wed", "Thu", "Fri"],
      "series": [
        {
          "name": "Sales",
          "data": [120, 200, 150, 80, 70]
        }
      ]
    }
  }
}
```

## Intégration avec un client MCP

### Exemple avec Claude Desktop

Ajoutez dans `claude_desktop_config.json` :

```json
{
  "mcpServers": {
    "echart": {
      "command": "node",
      "args": ["/chemin/vers/dist/mcp/echart/echart-server.js"]
    }
  }
}
```

### Exemple avec un client Node.js

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

// Démarrer le serveur
const serverProcess = spawn('node', ['dist/mcp/echart/echart-server.js']);

// Créer le transport
const transport = new StdioClientTransport({
  reader: serverProcess.stdout,
  writer: serverProcess.stdin
});

// Créer le client
const client = new Client({
  name: 'echart-client',
  version: '1.0.0'
}, {
  capabilities: {}
});

// Connecter
await client.connect(transport);

// Lister les outils
const tools = await client.listTools();
console.log(tools);

// Appeler un outil
const result = await client.callTool('generate_line_chart', {
  title: 'Test',
  xAxisData: ['A', 'B', 'C'],
  series: [{ name: 'Data', data: [1, 2, 3] }]
});

console.log(result);
```

## Résolution des problèmes

### TypeScript non trouvé

Si vous obtenez `tsc: commande introuvable` :

```bash
npm install -g typescript
# ou dans le projet
npm install --save-dev typescript
```

### Module non trouvé

Assurez-vous que le `@modelcontextprotocol/sdk` est installé :

```bash
cd ../../..  # Retour à la racine
npm install
```

## Architecture

```
src/mcp/echart/
├── echart-server.ts    # Serveur MCP standalone
├── test-server.ts      # Script de test
├── package.json        # Configuration
├── tsconfig.json       # Config TypeScript
├── README.md           # Documentation principale
└── STANDALONE.md       # Ce fichier
```

Le serveur peut fonctionner :
- **Dans le navigateur** : Intégré dans `src/worker.ts` (mode par défaut)
- **En standalone** : Via stdio pour intégration avec d'autres clients MCP
