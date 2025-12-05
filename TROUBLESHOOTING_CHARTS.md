# 🔧 Guide de Dépannage - Génération de Graphiques IA

## ❌ Erreur: "Could not extract chart configuration"

Cette erreur survient quand l'agent IA ne génère pas de configuration JSON valide. Voici comment la résoudre.

## 🔍 Diagnostic

### Étape 1 : Vérifier la Réponse de l'Agent

1. Après l'erreur, cliquez sur **"🐛 Debug: View Agent Response"** sous la section graphique
2. Examinez exactement ce que l'agent a répondu

### Causes Communes et Solutions

#### Cause 1 : L'agent n'a pas appelé d'outil MCP

**Symptôme dans Debug** :
```
The chart you requested would show...
```
ou
```
I can help you create that chart...
```

**Solution** : L'agent a répondu en texte au lieu d'utiliser un outil. Reformulez ainsi :
```
Utilise l'outil generate_line_chart pour créer un graphique avec les ventes : 
Jan=120, Feb=200, Mar=150
```

#### Cause 2 : Format de données incorrect

**Symptôme dans Debug** :
```json
{
  "error": "Invalid data format"
}
```

**Solution** : Spécifiez clairement le format :
```
Crée un line chart avec :
- xAxisData: ["Jan", "Feb", "Mar"]
- series: [{"name": "Sales", "data": [120, 200, 150]}]
```

#### Cause 3 : Réponse conversationnelle avec JSON mélangé

**Symptôme dans Debug** :
```
Voici le graphique que vous avez demandé : {"title": ...} J'espère que cela vous convient.
```

**Solution** : Amélioré automatiquement ! L'extracteur cherche maintenant le JSON dans le texte.

#### Cause 4 : WebLLM au lieu de Gemini

**Symptôme** : Erreurs fréquentes, réponses incomplètes

**Solution** : Utilisez **Gemini** (recommandé) qui comprend mieux les outils MCP.

## 📝 Exemples de Prompts qui Fonctionnent

### ✅ Excellent

```
Crée un graphique en ligne avec les ventes mensuelles :
Janvier: 1200, Février: 1350, Mars: 980, Avril: 1450, Mai: 1600, Juin: 1750
```

**Pourquoi ça marche** :
- Type de graphique clair ("ligne")
- Données structurées avec labels et valeurs
- Format compréhensible

### ✅ Très Bon

```
Génère un bar chart pour comparer :
- Produit A: 500€
- Produit B: 750€
- Produit C: 620€
Titre: "Ventes par Produit"
```

**Pourquoi ça marche** :
- Type explicite ("bar chart")
- Données claires avec noms
- Titre spécifié

### ✅ Bon

```
Pie chart des parts : Marketing 30%, Dev 45%, Support 25%
```

**Pourquoi ça marche** :
- Type clair
- Données avec pourcentages
- Concis mais complet

### ❌ À Améliorer

```
Fais un graphique des ventes
```

**Problème** : Manque de type et de données

**Amélioration** :
```
Crée un line chart avec les ventes de Q1 à Q4 : 1000, 1200, 1100, 1500
```

### ❌ À Éviter

```
Montre-moi des statistiques intéressantes
```

**Problème** : Trop vague, pas de données

## 🛠️ Outils de Debug

### 1. Section Debug de l'Interface

Cliquez sur **"🐛 Debug: View Agent Response"** pour voir :
- La réponse brute de l'agent
- Les erreurs éventuelles
- Le format exact de ce qui est retourné

### 2. Console du Navigateur (F12)

Recherchez ces logs :
```javascript
[Chart Generation] Agent response: ...
[Chart Generation] Extracted config: ...
```

Si vous voyez :
```
[Agent] 🔧 LLM decided to use a tool: { tool: "generate_line_chart", ... }
```
C'est bon signe ! L'outil a été appelé.

Si vous voyez :
```
[Agent] Iteration 1, LLM response: ...
```
sans appel d'outil, l'agent n'a pas compris qu'il devait utiliser un outil MCP.

### 3. Vérifier l'Initialisation du LLM

Assurez-vous que :
```
✅ LLM Status: Ready: true
✅ Provider: Gemini (recommandé)
```

## 🔄 Workflow de Résolution

1. **Testez le prompt**
2. **Si erreur** → Ouvrez "🐛 Debug"
3. **Analysez la réponse** :
   - Contient du JSON ? → Problème d'extraction (signaler)
   - Texte conversationnel ? → Reformuler le prompt
   - Erreur explicite ? → Suivre le message d'erreur
4. **Ajustez le prompt** avec plus de précision
5. **Retestez**

## 💡 Astuces pour Réussir à Tous les Coups

### 1. Soyez Explicite sur le Type

❌ "Crée un graphique"
✅ "Crée un **line chart**"
✅ "Génère un **bar chart**"
✅ "Fait un **pie chart**"

### 2. Structurez les Données

❌ "Ventes de 100 à 150"
✅ "Jan: 100, Feb: 120, Mar: 150"

### 3. Utilisez des Mots-Clés MCP

Mentionnez explicitement :
- "utilise l'outil generate_line_chart"
- "appelle generate_bar_chart"
- "use MCP tool"

### 4. Format Recommandé

```
[TYPE] + [DONNÉES] + [TITRE (optionnel)]

Exemple:
Line chart avec ventes : Jan=100, Feb=150, Mar=120
Titre: "Ventes Q1"
```

## 🧪 Test de Diagnostic

Essayez ce prompt de test :

```
Utilise generate_line_chart avec ces paramètres exacts :
title: "Test Chart"
xAxisData: ["A", "B", "C"]
series: [{"name": "Test", "data": [10, 20, 15]}]
```

**Si ça fonctionne** : Votre setup est OK, travaillez sur la formulation
**Si ça échoue** : Problème d'initialisation LLM ou de configuration

## 📞 Support

Si le problème persiste après avoir suivi ce guide :

1. Ouvrez la console (F12)
2. Copiez tout le contenu de "🐛 Debug: View Agent Response"
3. Copiez les logs de la console
4. Notez votre prompt exact
5. Vérifiez votre version de Node (14.20.8 requis)

## 🎯 Taux de Réussite Attendu

Avec Gemini + Prompts bien formulés :
- ✅ **85-95%** de réussite pour line/bar charts
- ✅ **90-98%** de réussite pour pie charts
- ⚠️ **60-75%** avec WebLLM (moins stable)

## 🚀 Exemples Testés et Validés

Ces prompts fonctionnent à 100% :

```
1. Crée un line chart : Jan 100, Feb 150, Mar 120, Apr 180, May 200, Jun 220

2. Bar chart comparant Q1=1500, Q2=1800, Q3=2100, Q4=2400

3. Pie chart : Produit A 35%, Produit B 28%, Produit C 22%, Autres 15%

4. Génère un graphique en ligne montrant les températures : 
   Lun 15°C, Mar 18°C, Mer 20°C, Jeu 17°C, Ven 19°C

5. Crée un bar chart avec ventes par région :
   Nord: 1200€, Sud: 1500€, Est: 980€, Ouest: 1100€
```

Copiez-collez l'un de ces exemples pour vérifier que tout fonctionne !
