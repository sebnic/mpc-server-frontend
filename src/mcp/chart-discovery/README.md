# Chart Discovery MCP Server

Hierarchical chart discovery tools for efficient LLM token usage.

## Concept

Instead of sending all ECharts configurations in every prompt, use a **3-level hierarchy**:

1. **Level 1**: Discover available chart types
2. **Level 2**: Get detailed schema for specific type
3. **Level 3**: Generate chart with learned schema

## Available Tools

### 1. get_chart_types
List all available chart types with descriptions.

**Parameters:** None

**Returns:**
```json
{
  "types": [
    {
      "name": "line",
      "description": "Line chart for trends over time",
      "useCases": ["Time series", "Trends"],
      "example": "Sales over months"
    },
    // ... more types
  ]
}
```

**Example:**
```typescript
const result = await client.callTool('get_chart_types', {});
// Discover: line, bar, pie, scatter, radar, gauge, funnel, heatmap
```

### 2. get_chart_config_schema
Get detailed configuration schema for a specific chart type.

**Parameters:**
- `chartType` (string, required): Type to get schema for

**Returns:**
```json
{
  "type": "line",
  "description": "Line chart showing trends",
  "parameters": {
    "title": { "type": "string", "optional": true },
    "xAxisData": { "type": "array<string>", "required": true },
    "series": { "type": "array<object>", "required": true }
  },
  "example": { /* full example */ },
  "tool": "generate_line_chart"
}
```

**Example:**
```typescript
const schema = await client.callTool('get_chart_config_schema', { 
  chartType: 'pie' 
});
// Returns complete schema and example for pie charts
```

## Cost Comparison

### Traditional Approach (Monolithic)
```
Every request = 3000 tokens (all tools documented)
10 requests = 30,000 tokens
```

### Hierarchical Approach
```
Simple request (known type) = 1,700 tokens (56% savings)
Complex request (discovery) = 2,600 tokens (33% savings)
10 requests = ~19,000 tokens average
```

## Workflow

### Quick Path (Common Charts)
```
User: "Line chart: Jan 100, Feb 150, Mar 200"
  ↓
Agent: Recognizes "line chart" → generate_line_chart
  ↓
Result: Chart rendered
```

### Discovery Path (Complex/Unknown)
```
User: "Chart showing correlation between variables"
  ↓
Agent: Calls get_chart_types → Discovers "scatter"
  ↓
Agent: Calls get_chart_config_schema(scatter) → Learns structure
  ↓
Agent: Calls generate_scatter_chart → Creates chart
  ↓
Result: Chart rendered
```

## Integration

These tools are integrated into the main worker alongside chart generation tools:
- `get_chart_types` - Discovery
- `get_chart_config_schema` - Schema learning
- `generate_line_chart` - Generation
- `generate_bar_chart` - Generation
- `generate_pie_chart` - Generation

## Demo

Click the **"🔍 Test Discovery (Hierarchy)"** button in the UI to see the 3-step workflow in action!

## See Also

- [HIERARCHY_DEMO.md](../../../HIERARCHY_DEMO.md) - Complete documentation
- [echart/](../echart/) - Chart generation servers
