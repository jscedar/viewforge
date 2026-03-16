// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════
const state = {
  sources: [],
  nodes: [],
  edges: [],
  selectedNode: null,
  draggingNode: null,
  dragOffset: { x: 0, y: 0 },
  connectingFrom: null,
  nodeIdCounter: 0,
  edgeIdCounter: 0,
  currentLang: 'js'
};

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
function init() {
  // Load the first dataset set by default (Acme Tech Retail)
  const set = DATASET_SETS[0];
  const icons  = { orders:'🛒', customers:'👤', workers:'🏢' };
  const colors = { orders:'#3b6ef5', customers:'#0fa86a', workers:'#6c47e8' };
  ['orders','customers','workers'].forEach(name => {
    addSource(name, set.sources[name], colors[name], icons[name]);
  });
  updateStatus();
}

// ═══════════════════════════════════════════════
// SOURCES
// ═══════════════════════════════════════════════
function inferType(val) {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'boolean') return 'bool';
  if (typeof val === 'number') return 'num';
  if (typeof val === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) return 'date';
    return 'str';
  }
  if (Array.isArray(val)) return 'arr';
  if (typeof val === 'object') return 'obj';
  return 'str';
}

// Build a recursive schema tree from a sample object
function buildSchemaTree(obj, path = '') {
  if (obj === null || obj === undefined) return [];
  const sample = Array.isArray(obj) ? obj[0] : obj;
  if (!sample || typeof sample !== 'object') return [];
  
  return Object.entries(sample).map(([key, val]) => {
    const fullPath = path ? `${path}.${key}` : key;
    const type = inferType(val);
    const node = { key, path: fullPath, type };
    
    if (type === 'obj' && val && typeof val === 'object' && !Array.isArray(val)) {
      node.children = buildSchemaTree(val, fullPath);
    } else if (type === 'arr' && Array.isArray(val)) {
      const itemSample = val[0];
      if (itemSample && typeof itemSample === 'object') {
        node.itemType = 'obj';
        node.children = buildSchemaTree(itemSample, fullPath + '[]');
      } else {
        node.itemType = inferType(itemSample);
        node.example = val.slice(0,2).join(', ');
      }
    } else {
      node.example = val !== null && val !== undefined ? String(val).slice(0, 30) : '';
    }
    return node;
  });
}

function schemaFromData(data) {
  const sample = Array.isArray(data) ? data[0] : data;
  if (!sample || typeof sample !== 'object') return [];
  return Object.entries(sample).map(([k, v]) => ({
    name: k,
    type: inferType(v),
    example: Array.isArray(v) ? '[...]' : (typeof v === 'object' && v ? '{...}' : String(v))
  }));
}

// Count all leaf fields in tree
function countLeaves(nodes) {
  let n = 0;
  for (const node of nodes) {
    if (node.children) n += countLeaves(node.children);
    else n++;
  }
  return n;
}

const COLORS = ['#4f8ef7','#3ecf8e','#f59e0b','#ec4899','#06b6d4','#7c5cf6','#eab308'];
const ICONS = ['🗄️','📋','📊','🔗','📁','🗃️','📂'];

function addSource(name, data, color, icon) {
  const schema = schemaFromData(data);
  const tree = buildSchemaTree(Array.isArray(data) ? data[0] : data);
  const src = {
    id: 'src_' + Date.now() + '_' + Math.random().toString(36).slice(2),
    name, data, schema, tree,
    color: color || COLORS[state.sources.length % COLORS.length],
    icon: icon || ICONS[state.sources.length % ICONS.length]
  };
  state.sources.push(src);
  renderSources();
}

function renderSources() {
  const el = document.getElementById('sources-list');
  el.innerHTML = '';
  state.sources.forEach(src => {
    const leafCount = countLeaves(src.tree);
    const card = document.createElement('div');
    card.className = 'source-card';
    card.innerHTML = `
      <div class="source-header" onclick="toggleSource('${src.id}')">
        <div class="source-icon" style="background:${src.color}22;color:${src.color}">${src.icon}</div>
        <span class="source-name">${src.name}</span>
        <span class="source-count">${leafCount} fields</span>
        <span class="source-chevron">▶</span>
      </div>
      <div class="source-fields" id="fields-${src.id}">
        <input class="source-search" placeholder="🔍 Search fields..." oninput="filterTree('${src.id}', this.value)">
        <div id="tree-${src.id}" style="padding:4px 6px 2px;">
          ${renderTreeNodes(src.tree, src.id, src.name, 0)}
        </div>
        <div class="field-item" style="color:var(--accent);font-size:10px;padding:6px 10px;border-top:1px solid var(--border);margin-top:4px;"
          onclick="addSourceToCanvas('${src.id}')">
          <span style="font-size:13px;">+</span> Add all to canvas
        </div>
      </div>
    `;
    el.appendChild(card);
  });
}

function renderTreeNodes(nodes, srcId, srcName, depth) {
  if (!nodes || !nodes.length) return '';
  return nodes.map(node => {
    const hasChildren = node.children && node.children.length > 0;
    const isLeaf = !hasChildren;
    const indent = depth * 14;
    const toggleId = `toggle_${srcId}_${node.path.replace(/[^a-z0-9]/gi,'_')}`;
    const childrenId = `children_${srcId}_${node.path.replace(/[^a-z0-9]/gi,'_')}`;
    
    const typeLabel = node.type === 'arr' ? (node.itemType ? `[${node.itemType}]` : 'arr') : node.type;
    const typeCls = node.type === 'arr' ? 'ft-arr' : `ft-${node.type}`;
    
    let exampleHtml = '';
    if (isLeaf && node.example) {
      exampleHtml = `<span class="tree-example" title="${node.example}">${node.example}</span>`;
    } else if (!isLeaf) {
      const childCount = countLeaves(node.children);
      exampleHtml = `<span class="tree-example" style="color:var(--text3);font-style:italic;">${childCount}f</span>`;
    }
    
    const dragAttrs = isLeaf
      ? `draggable="true" ondragstart="fieldDragStart(event,'${srcId}','${node.path}','${node.type}','${srcName}')"`
      : '';
    const dragIcon = isLeaf ? `<span class="tree-drag-icon">⠿</span>` : '';
    
    const toggleBtn = hasChildren
      ? `<button class="tree-toggle" id="${toggleId}" onclick="toggleTreeNode('${childrenId}','${toggleId}')">▶</button>`
      : `<span class="tree-spacer"></span>`;
    
    const childrenHtml = hasChildren
      ? `<div class="tree-children" id="${childrenId}">${renderTreeNodes(node.children, srcId, srcName, depth + 1)}</div>`
      : '';

    return `
      <div class="tree-node" data-path="${node.path}" data-key="${node.key}">
        <div class="tree-row ${isLeaf ? 'is-leaf' : ''}" 
          style="padding-left:${indent + 4}px;"
          ${dragAttrs}
          ${isLeaf ? `title="Drag to canvas: ${node.path}"` : `onclick="toggleTreeNode('${childrenId}','${toggleId}')" style="padding-left:${indent+4}px;cursor:pointer;"`}>
          <div class="tree-indent">${toggleBtn}</div>
          <span class="field-type-badge ${typeCls}">${typeLabel}</span>
          <span class="tree-key">${node.key}</span>
          ${exampleHtml}
          ${dragIcon}
        </div>
        ${childrenHtml}
      </div>`;
  }).join('');
}

function toggleTreeNode(childrenId, toggleId) {
  const el = document.getElementById(childrenId);
  const btn = document.getElementById(toggleId);
  if (!el) return;
  el.classList.toggle('open');
  if (btn) btn.textContent = el.classList.contains('open') ? '▼' : '▶';
}

function filterTree(srcId, query) {
  const treeEl = document.getElementById('tree-' + srcId);
  if (!treeEl) return;
  const q = query.toLowerCase().trim();
  // show/hide tree-node rows based on path match
  treeEl.querySelectorAll('.tree-node').forEach(node => {
    const path = (node.dataset.path || '').toLowerCase();
    const key = (node.dataset.key || '').toLowerCase();
    if (!q || path.includes(q) || key.includes(q)) {
      node.style.display = '';
      // if matched inside nested, open parent children
      if (q) {
        let parent = node.closest('.tree-children');
        while (parent) {
          parent.classList.add('open');
          const id = parent.id;
          const toggleId = id.replace('children_', 'toggle_');
          const btn = document.getElementById(toggleId);
          if (btn) btn.textContent = '▼';
          parent = parent.parentElement?.closest('.tree-children');
        }
      }
    } else {
      node.style.display = 'none';
    }
  });
}

function toggleSource(id) {
  const card = document.getElementById('fields-'+id)?.closest('.source-card');
  if (card) card.classList.toggle('expanded');
}

// ═══════════════════════════════════════════════
// DRAG FROM SOURCE
// ═══════════════════════════════════════════════
let dragData = null;

function fieldDragStart(e, srcId, path, type, srcName) {
  dragData = { srcId, field: path, path, type, srcName, kind: 'field' };
  const ghost = document.getElementById('drag-ghost');
  const shortPath = path.split('.').slice(-2).join('.');
  ghost.textContent = `${srcName} · ${shortPath}`;
  ghost.style.display = 'block';
  e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  e.dataTransfer.effectAllowed = 'copy';
  setTimeout(() => ghost.style.display = 'none', 0);
}

function flattenLeaves(nodes, result = []) {
  for (const n of nodes) {
    if (n.children && n.children.length) flattenLeaves(n.children, result);
    else result.push({ name: n.path, type: n.type, example: n.example || '' });
  }
  return result;
}

function addSourceToCanvas(srcId) {
  const src = state.sources.find(s => s.id === srcId);
  if (!src) return;
  const wrap = document.getElementById('canvas-wrap');
  const x = 40 + Math.random() * 80;
  const y = 40 + Math.random() * 80;
  // only add top-level fields by default (first 10), not all nested
  const topFields = (src.tree || []).slice(0, 10).map(n => ({
    name: n.path, type: n.type, example: n.example || '',
    hasChildren: !!(n.children && n.children.length)
  }));
  createNode('source', x, y, { sourceId: srcId, sourceName: src.name, fields: topFields });
}

function canvasDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
}

function canvasDrop(e) {
  e.preventDefault();
  const raw = e.dataTransfer.getData('text/plain');
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    if (d.kind === 'field') {
      const rect = document.getElementById('canvas-wrap').getBoundingClientRect();
      const x = e.clientX - rect.left - 90;
      const y = e.clientY - rect.top - 40;
      const src = state.sources.find(s => s.id === d.srcId);
      if (!src) return;
      // check if source node already exists
      const existing = state.nodes.find(n => n.type === 'source' && n.data.sourceId === d.srcId);
      if (existing) {
        // add field to existing node if not already there
        const already = existing.data.fields.find(f => f.name === d.field);
        if (!already) {
          existing.data.fields.push({ name: d.field, type: d.type, example: '' });
          renderNode(existing);
          refreshDSL();
        }
      } else {
        createNode('source', x, y, {
          sourceId: d.srcId,
          sourceName: src.name,
          fields: [{ name: d.field, type: d.type }]
        });
      }
    }
  } catch(ex) {}
}

// ═══════════════════════════════════════════════
// NODES
// ═══════════════════════════════════════════════
function nextId() { return 'n' + (++state.nodeIdCounter); }

const NODE_CONFIG = {
  source:    { label: 'Source',    icon: '🗄️', cls: 'node-source' },
  join:      { label: 'Join',      icon: '⟗',  cls: 'node-join' },
  filter:    { label: 'Filter',    icon: '⊕',  cls: 'node-filter' },
  map:       { label: 'Map',       icon: '→',  cls: 'node-map' },
  aggregate: { label: 'Aggregate', icon: 'Σ',  cls: 'node-agg' },
  groupby:   { label: 'Group By',  icon: '≡',  cls: 'node-join' },
  sort:      { label: 'Sort',      icon: '↕',  cls: 'node-join' },
  output:    { label: 'Output',    icon: '⬡',  cls: 'node-output' }
};

function createNode(type, x, y, data = {}) {
  const id = nextId();
  const cfg = NODE_CONFIG[type];
  const node = {
    id, type,
    x: Math.max(10, x),
    y: Math.max(10, y),
    data: {
      label: data.label || (data.sourceName ? `${cfg.label}: ${data.sourceName}` : cfg.label),
      ...data
    }
  };
  state.nodes.push(node);
  document.getElementById('empty-hint').style.display = 'none';
  renderNode(node);
  updateStatus();
  refreshDSL();
  return node;
}

function renderNode(node) {
  const existing = document.getElementById('node-' + node.id);
  if (existing) existing.remove();

  const cfg = NODE_CONFIG[node.type];
  const el = document.createElement('div');
  el.id = 'node-' + node.id;
  el.className = `node ${cfg.cls}`;
  el.style.left = node.x + 'px';
  el.style.top = node.y + 'px';

  let bodyContent = '';
  if (node.type === 'source' && node.data.fields) {
    bodyContent = `
      <div class="node-body">
        ${node.data.fields.map(f => {
          const parts = (f.name || '').split('.');
          const leafName = parts[parts.length - 1];
          const parentPath = parts.length > 1 ? parts.slice(0, -1).join('.') : '';
          return `
          <div class="node-field-row" title="${f.name}">
            <div class="nf-dot" style="background:${typeColor(f.type)}"></div>
            <span class="nf-name" style="flex:1;min-width:0;">
              ${parentPath ? `<span style="color:var(--text3);font-size:9px;">${parentPath}.</span>` : ''}${leafName}
            </span>
            <span class="nf-type">${f.type}</span>
            <button class="nf-remove" onclick="removeField('${node.id}','${f.name}')">×</button>
          </div>`;
        }).join('')}
        <div class="node-drop-zone" 
          ondragover="event.preventDefault();this.classList.add('drag-over')"
          ondragleave="this.classList.remove('drag-over')"
          ondrop="dropOnNode(event,'${node.id}')">
          drop fields here
        </div>
      </div>`;
  } else if (node.type === 'join') {
    bodyContent = `<div class="node-config">
      <div class="config-row">
        <span class="config-label">type</span>
        <select class="config-select" onchange="nodeConfigChange('${node.id}','joinType',this.value)">
          <option ${node.data.joinType==='inner'?'selected':''}>inner</option>
          <option ${node.data.joinType==='left'?'selected':''}>left</option>
          <option ${node.data.joinType==='right'?'selected':''}>right</option>
          <option ${node.data.joinType==='full'?'selected':''}>full</option>
        </select>
      </div>
      <div class="config-row">
        <span class="config-label">on</span>
        <input class="config-input" placeholder="e.g. customer_id" value="${node.data.joinKey||''}"
          oninput="nodeConfigChange('${node.id}','joinKey',this.value)">
      </div>
    </div>`;
  } else if (node.type === 'filter') {
    bodyContent = `<div class="node-config">
      <div class="config-row">
        <span class="config-label">where</span>
        <input class="config-input" placeholder="e.g. status == 'shipped'" value="${node.data.condition||''}"
          oninput="nodeConfigChange('${node.id}','condition',this.value)">
      </div>
    </div>`;
  } else if (node.type === 'map') {
    bodyContent = `<div class="node-config">
      <div class="config-row">
        <span class="config-label">alias</span>
        <input class="config-input" placeholder="field: expr" value="${node.data.mapping||''}"
          oninput="nodeConfigChange('${node.id}','mapping',this.value)">
      </div>
      <div class="node-body">
        ${(node.data.fields||[]).map(f => `
          <div class="node-field-row">
            <div class="nf-dot" style="background:${typeColor(f.type)}"></div>
            <span class="nf-name">${f.name}</span>
            <span class="nf-type">${f.type}</span>
          </div>`).join('')}
        <div class="node-drop-zone"
          ondragover="event.preventDefault();this.classList.add('drag-over')"
          ondragleave="this.classList.remove('drag-over')"
          ondrop="dropOnNode(event,'${node.id}')">drop fields</div>
      </div>
    </div>`;
  } else if (node.type === 'aggregate') {
    bodyContent = `<div class="node-config">
      <div class="config-row">
        <span class="config-label">fn</span>
        <select class="config-select" onchange="nodeConfigChange('${node.id}','aggFn',this.value)">
          <option ${node.data.aggFn==='sum'?'selected':''}>sum</option>
          <option ${node.data.aggFn==='avg'?'selected':''}>avg</option>
          <option ${node.data.aggFn==='count'?'selected':''}>count</option>
          <option ${node.data.aggFn==='min'?'selected':''}>min</option>
          <option ${node.data.aggFn==='max'?'selected':''}>max</option>
        </select>
      </div>
      <div class="config-row">
        <span class="config-label">field</span>
        <input class="config-input" placeholder="field name" value="${node.data.aggField||''}"
          oninput="nodeConfigChange('${node.id}','aggField',this.value)">
      </div>
    </div>`;
  } else if (node.type === 'groupby') {
    bodyContent = `<div class="node-config">
      <div class="config-row">
        <span class="config-label">by</span>
        <input class="config-input" placeholder="field1, field2" value="${node.data.groupFields||''}"
          oninput="nodeConfigChange('${node.id}','groupFields',this.value)">
      </div>
    </div>`;
  } else if (node.type === 'sort') {
    bodyContent = `<div class="node-config">
      <div class="config-row">
        <span class="config-label">by</span>
        <input class="config-input" placeholder="field" value="${node.data.sortField||''}"
          oninput="nodeConfigChange('${node.id}','sortField',this.value)">
      </div>
      <div class="config-row">
        <span class="config-label">order</span>
        <select class="config-select" onchange="nodeConfigChange('${node.id}','sortOrder',this.value)">
          <option ${node.data.sortOrder==='asc'?'selected':''}>asc</option>
          <option ${node.data.sortOrder==='desc'?'selected':''}>desc</option>
        </select>
      </div>
    </div>`;
  } else if (node.type === 'output') {
    const schemaPreview = node.data.outputSchema
      ? `<div style="margin-top:6px;">
           <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:var(--text3);margin-bottom:3px;">Nested Output Shape</div>
           <div style="font-size:9px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:5px;padding:6px 8px;max-height:130px;overflow-y:auto;white-space:pre;line-height:1.5;color:#065f46;font-family:var(--mono);">${escHtml(JSON.stringify(node.data.outputSchema,null,2))}</div>
         </div>` : '';
    bodyContent = `<div class="node-config">
      <div class="config-row">
        <span class="config-label">name</span>
        <input class="config-input" placeholder="view name" value="${node.data.outputName||'my_view'}"
          oninput="nodeConfigChange('${node.id}','outputName',this.value)">
      </div>
      ${schemaPreview}
    </div>`;
  }

  function escHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  const tagMap = { join:'tag-join', filter:'tag-filter', map:'tag-map', aggregate:'tag-agg', groupby:'tag-join', sort:'tag-join', output:'tag-output', source:'' };
  const tag = node.type !== 'source' ? `<span class="node-tag ${tagMap[node.type]}">${cfg.label}</span>` : '';

  el.innerHTML = `
    <div class="node-port port-in" data-node="${node.id}" data-dir="in"
      ${node.type === 'source' ? 'style="display:none"' : ''}
      onclick="startConnect('${node.id}','in')"></div>
    <div class="node-header">
      <span class="node-icon">${cfg.icon}</span>
      <span class="node-title">${node.data.label || cfg.label}</span>
      ${tag}
      <button class="node-del" onclick="deleteNode('${node.id}')">×</button>
    </div>
    ${bodyContent}
    <div class="node-port port-out" data-node="${node.id}" data-dir="out"
      onclick="startConnect('${node.id}','out')"></div>
  `;

  // drag to move
  const header = el.querySelector('.node-header');
  header.addEventListener('mousedown', e => startNodeDrag(e, node.id));

  document.getElementById('canvas-nodes').appendChild(el);
}

function typeColor(t) {
  const map = { str:'#3ecf8e', num:'#4f8ef7', bool:'#7c5cf6', date:'#f59e0b', arr:'#06b6d4', obj:'#eab308' };
  return map[t] || '#8890a8';
}

function nodeConfigChange(nodeId, key, val) {
  const node = state.nodes.find(n => n.id === nodeId);
  if (node) { node.data[key] = val; refreshDSL(); }
}

function removeField(nodeId, fieldName) {
  const node = state.nodes.find(n => n.id === nodeId);
  if (!node) return;
  node.data.fields = node.data.fields.filter(f => f.name !== fieldName);
  renderNode(node);
  refreshDSL();
}

function dropOnNode(e, nodeId) {
  e.stopPropagation();
  e.preventDefault();
  const raw = e.dataTransfer.getData('text/plain');
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    if (d.kind === 'field') {
      const node = state.nodes.find(n => n.id === nodeId);
      if (!node) return;
      if (!node.data.fields) node.data.fields = [];
      if (!node.data.fields.find(f => f.name === d.field)) {
        node.data.fields.push({ name: d.field, type: d.type });
      }
      renderNode(node);
      refreshDSL();
    }
  } catch(ex) {}
  e.currentTarget.classList.remove('drag-over');
}

function deleteNode(id) {
  state.nodes = state.nodes.filter(n => n.id !== id);
  state.edges = state.edges.filter(e => e.from !== id && e.to !== id);
  document.getElementById('node-' + id)?.remove();
  if (state.nodes.length === 0) document.getElementById('empty-hint').style.display = 'block';
  drawEdges();
  updateStatus();
  refreshDSL();
}

function addNode(type) {
  const wrap = document.getElementById('canvas-wrap');
  const x = 120 + Math.random() * (wrap.clientWidth - 300);
  const y = 80 + Math.random() * (wrap.clientHeight - 200);
  createNode(type, x, y);
}

// ═══════════════════════════════════════════════
// NODE DRAGGING
// ═══════════════════════════════════════════════
let draggingNodeId = null, dragStartX, dragStartY, nodeStartX, nodeStartY;

function startNodeDrag(e, nodeId) {
  if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
  draggingNodeId = nodeId;
  const node = state.nodes.find(n => n.id === nodeId);
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  nodeStartX = node.x;
  nodeStartY = node.y;
  document.addEventListener('mousemove', onNodeDrag);
  document.addEventListener('mouseup', endNodeDrag);
  e.preventDefault();
}

function onNodeDrag(e) {
  if (!draggingNodeId) return;
  const node = state.nodes.find(n => n.id === draggingNodeId);
  node.x = Math.max(0, nodeStartX + e.clientX - dragStartX);
  node.y = Math.max(0, nodeStartY + e.clientY - dragStartY);
  const el = document.getElementById('node-' + draggingNodeId);
  el.style.left = node.x + 'px';
  el.style.top = node.y + 'px';
  drawEdges();
}

function endNodeDrag() {
  draggingNodeId = null;
  document.removeEventListener('mousemove', onNodeDrag);
  document.removeEventListener('mouseup', endNodeDrag);
  refreshDSL();
}

// ═══════════════════════════════════════════════
// CONNECTIONS
// ═══════════════════════════════════════════════
let connectingFrom = null;

function startConnect(nodeId, dir) {
  if (dir === 'out') {
    connectingFrom = nodeId;
    document.getElementById('status-msg').textContent = 'Click another node\'s input port to connect';
  } else if (connectingFrom && dir === 'in') {
    if (connectingFrom !== nodeId) {
      // check no duplicate
      const dup = state.edges.find(e => e.from === connectingFrom && e.to === nodeId);
      if (!dup) {
        state.edges.push({ id: 'e'+(++state.edgeIdCounter), from: connectingFrom, to: nodeId });
        drawEdges();
        updateStatus();
        refreshDSL();
      }
    }
    connectingFrom = null;
    document.getElementById('status-msg').textContent = 'Connected!';
    setTimeout(() => document.getElementById('status-msg').textContent = '', 2000);
  }
}

function drawEdges() {
  const svg = document.getElementById('canvas-svg');
  svg.innerHTML = '';
  // defs
  svg.innerHTML = `<defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#4f8ef7" opacity="0.7"/>
    </marker>
  </defs>`;
  state.edges.forEach(edge => {
    const fromEl = document.getElementById('node-' + edge.from);
    const toEl = document.getElementById('node-' + edge.to);
    if (!fromEl || !toEl) return;
    const fw = fromEl.offsetWidth, fh = fromEl.offsetHeight;
    const tw = toEl.offsetWidth, th = toEl.offsetHeight;
    const fx = parseInt(fromEl.style.left) + fw;
    const fy = parseInt(fromEl.style.top) + fh / 2;
    const tx = parseInt(toEl.style.left);
    const ty = parseInt(toEl.style.top) + th / 2;
    const cx = (fx + tx) / 2;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${fx},${fy} C${cx},${fy} ${cx},${ty} ${tx},${ty}`);
    path.setAttribute('stroke', '#4f8ef7');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('fill', 'none');
    path.setAttribute('opacity', '0.6');
    path.setAttribute('marker-end', 'url(#arr)');
    path.style.cursor = 'pointer';
    path.addEventListener('click', () => {
      state.edges = state.edges.filter(e => e.id !== edge.id);
      drawEdges(); updateStatus(); refreshDSL();
    });
    svg.appendChild(path);
  });
}