# HierarchyVisual

This Power BI custom visual displays hierarchical data using childid/parentid relationships. It supports:
- Grouping duplicate childid/parentid pairs as single nodes
- Indentation for hierarchy levels
- Displaying a label (display value) instead of IDs
- Expand/collapse for parent nodes
- A data section for related fields per node

## Getting Started

1. Install dependencies:
   ```pwsh
   npm install
   ```
2. Start the visual for development:
   ```pwsh
   pbiviz start
   ```
3. Package the visual for production:
   ```pwsh
   pbiviz package
   ```

## Customization
- Edit `src/visual.ts` to implement hierarchy logic and rendering.
- Update `pbiviz.json` to configure data roles and capabilities.

## Requirements
- Node.js
- Power BI Visuals Tools (`npm install -g powerbi-visuals-tools`)

## Data Roles

This visual requires the following fields to work correctly:
- **parentid**: The parent identifier for each record.
- **childid**: The child identifier for each record.
- **display value**: The label to display for each node.
- (Optional) Additional fields for the data section per node.

To use the visual, ensure your dataset includes at least the parentid and childid fields.

---

For more details, see the official [Power BI visuals documentation](https://docs.microsoft.com/power-bi/developer/visuals/).
