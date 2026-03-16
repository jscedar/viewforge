# ViewForge — Data View Builder

A visual, browser-based tool for building nested JSON data views from multiple structured sources. Define transformations, joins, filters, and output shapes — then export a portable DSL and generated code in JavaScript, Kotlin, Python, or SQL.

![ViewForge Screenshot](docs/screenshot.png)

---

## Features

- **Pipeline View** — drag-and-drop node canvas to build transformation pipelines (Join, Filter, Map, Aggregate, Group By, Sort, Output)
- **Builder View** — hierarchical JSON block editor to define nested output shapes directly
- **Bidirectional sync** — switch freely between Pipeline and Builder; both views represent the same pipeline
- **Nested source explorer** — recursive tree view of deeply nested JSON sources with type badges, search, and drag-to-canvas
- **Dataset Sets** — cohesive sample datasets (`orders`, `customers`, `workers`) with matching IDs so joins produce real results
- **Sample Views** — 5 pre-built complex pipelines with nested output schemas, ready to load and run
- **DSL output** — readable JSON pipeline DSL with `$op`, `$from`, `$shape` conventions
- **Code generation** — working JavaScript, Kotlin, Python, and SQL output from any pipeline
- **Live preview** — run any pipeline and see results as nested JSON record cards or a flat table

---

## Project Structure

```
viewforge/
├── index.html              # Entry point — loads all modules
├── styles/
│   └── main.css            # All styles (layout, nodes, builder blocks, modals)
├── src/
│   ├── pipeline.js         # State, source management, canvas nodes, drag-drop, connections
│   ├── dsl.js              # DSL builder + code generation (JS/Kotlin/Python/SQL)
│   ├── execute.js          # Pipeline execution engine (dot-path aware) + preview renderer
│   ├── ui.js               # UI utilities, modals (datasets, views, DSL, code gen)
│   ├── builder.js          # Builder view — block tree, bidirectional pipeline sync
│   └── boot.js             # init() call
└── data/
    └── sample-data.js      # DATASET_SETS + SAMPLE_VIEWS definitions
```

---

## Getting Started

ViewForge is a pure static app — no build step, no server required.

### Option 1: Open directly
```bash
open index.html
```
> Note: Some browsers block ES module imports from `file://`. Use a local server for best results.

### Option 2: Local dev server (recommended)
```bash
# Python
python3 -m http.server 3000

# Node
npx serve .

# VS Code
# Install "Live Server" extension, right-click index.html → Open with Live Server
```
Then visit `http://localhost:3000`.

---

## Usage

### Loading Data
1. Click **⊞ Datasets** to load a pre-built dataset set (orders + customers + workers with matching IDs)
2. Or click **+ Add JSON Source** to paste your own JSON

### Building a Pipeline
1. Expand a source in the left panel and drag fields onto the canvas
2. Add operators from the toolbar: **Join**, **Filter**, **Map**, **Aggregate**, **Group By**, **Sort**
3. Connect nodes: click the right-side dot (output port) on one node, then the left-side dot (input port) on another
4. Click a connection line to delete it
5. Add an **Output** node at the end with a view name

### Using the Builder View
1. Click **{ } Builder** in the header to switch views
2. The current pipeline's output shape is automatically translated into editable blocks
3. Click any **blue source pill** on a field to open the path picker and map it to a source field
4. Click the **coloured gutter** to change a field's type (`str`, `num`, `obj`, `[]`, `Σ agg`, `λ expr`)
5. Add nested objects with `+ {} object`, arrays with `+ [] array`
6. Drag blocks to reorder; use `▼/▶` to collapse/expand
7. Switch back to **⬡ Pipeline** — the output node is updated with the new shape

### Loading Sample Views
Click **⊡ Sample Views** to browse 5 pre-built complex pipelines:
- **Customer Order Profile** — orders joined with customers, nested per-customer doc
- **Worker Compensation & Org Tree** — nested org tree with dept-level payroll aggregations
- **Order Fulfilment Manifest** — full shipping manifest with nested pick list
- **Customer 360 with Account Manager** — 3-source join with embedded AM contact card
- **Campaign Attribution & Revenue** — campaign groupby with revenue breakdown

Each view auto-loads required sources from the Acme Tech Retail dataset set.

### Running & Exporting
- **▶ Run** — executes the pipeline and shows results in the Preview tab
- **{ } DSL** — view and copy the JSON pipeline DSL
- **⬡ Code** — generate working code in JS / Kotlin / Python / SQL

---

## DSL Format

```json
{
  "$pipeline": "viewforge/1.0",
  "sources": {
    "orders": { "$ref": "orders", "select": ["orderId", "customer.ref", "payment.totals.grandTotal"] },
    "customers": { "$ref": "customers", "select": ["customerId", "loyalty.tier.code"] }
  },
  "steps": [
    { "$op": "join",   "$from": ["orders", "customers"], "type": "inner", "on": "customer.ref" },
    { "$op": "filter", "$from": "n1",  "where": "status.code != 'CANCELLED'" },
    { "$op": "map",    "$from": "n2",  "fields": ["orderId", "loyalty.tier.code"] },
    { "$op": "output", "$from": "n3",  "name": "order_tier_view",
      "shape": {
        "orderId": "$.orderId",
        "customer": { "tier": "$.loyalty.tier.code" },
        "total": "$.payment.totals.grandTotal"
      }
    }
  ],
  "output": "order_tier_view"
}
```

---

## Tech Stack

- Vanilla HTML / CSS / JavaScript — zero dependencies, zero build step
- JetBrains Mono + Syne fonts (Google Fonts)
- All data transformations run client-side in the browser

---

## Roadmap

- [ ] Save / load pipelines (localStorage + export JSON)
- [ ] More operators: `limit`, `distinct`, `flatten`, `pivot`, `rename`
- [ ] CSV / schema file import
- [ ] Formula editor with autocomplete
- [ ] Multi-set dataset management
- [ ] Server-side execution adapter (Node.js / JVM)
- [ ] Shareable pipeline URLs

---

## License

MIT
