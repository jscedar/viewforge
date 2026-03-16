// ═══════════════════════════════════════════════
// CANVAS VIEW SWITCHER
// ═══════════════════════════════════════════════
let activeCanvasView = 'pipeline';
let _suppressSync = false; // prevent sync loops

function switchCanvasView(view) {
  if (view === activeCanvasView) return;

  // ── Before leaving current view, save its state ──
  if (activeCanvasView === 'pipeline') {
    // Translate pipeline → builder
    pipelineToBuilder();
  } else {
    // Translate builder → pipeline
    builderToPipeline();
  }

  activeCanvasView = view;
  document.getElementById('canvas-view').classList.toggle('hidden', view !== 'pipeline');
  document.getElementById('builder-view').classList.toggle('active', view === 'builder');
  document.getElementById('vtog-pipeline').classList.toggle('active', view === 'pipeline');
  document.getElementById('vtog-builder').classList.toggle('active', view === 'builder');

  if (view === 'builder') renderBuilderTree();
  refreshDSL();
  document.getElementById('status-msg').textContent = view === 'builder'
    ? '{ } Builder view — edit the output JSON shape directly'
    : '⬡ Pipeline view — connect nodes to build the transformation';
  setTimeout(() => document.getElementById('status-msg').textContent = '', 3000);
}

// ═══════════════════════════════════════════════════════
// PIPELINE → BUILDER  (read pipeline state, produce builderTree)
// ═══════════════════════════════════════════════════════
function pipelineToBuilder() {
  // Strategy: walk the pipeline in topo order, collect the full
  // logical output shape the pipeline would produce, map it to builder nodes.

  // 1. Find output node — get its outputSchema if any
  const outputNode = state.nodes.find(n => n.type === 'output');
  if (outputNode?.data?.outputSchema) {
    builderTree = schemaToBuilder(outputNode.data.outputSchema);
    const name = outputNode.data.outputName || 'my_view';
    _builderOutputName = name;
    return;
  }

  // 2. No explicit schema — derive shape from source fields + operator chain
  const orderedNodes = topoSort();
  let fields = []; // { name, type, sourceName }

  // Collect all fields from source nodes
  const sourceNodes = orderedNodes.filter(n => n.type === 'source');
  sourceNodes.forEach(sn => {
    (sn.data.fields || []).forEach(f => {
      fields.push({ name: f.name, type: f.type || 'str', sourceName: sn.data.sourceName });
    });
  });

  // Apply map nodes — restrict to mapped fields
  const mapNodes = orderedNodes.filter(n => n.type === 'map');
  if (mapNodes.length) {
    const lastMap = mapNodes[mapNodes.length - 1];
    if (lastMap.data.fields?.length) {
      fields = lastMap.data.fields.map(f => ({
        name: f.name, type: f.type || 'str', sourceName: f.sourceName || ''
      }));
    }
  }

  // Apply groupby — add group key fields
  const groupNodes = orderedNodes.filter(n => n.type === 'groupby');
  if (groupNodes.length) {
    const gn = groupNodes[groupNodes.length - 1];
    const byFields = (gn.data.groupFields || '').split(',').map(s => s.trim()).filter(Boolean);
    fields = byFields.map(f => ({ name: f.split('.').pop(), type: 'str', sourceName: '' }));
    fields.push({ name: 'count', type: 'num', sourceName: '' });
  }

  // Apply aggregate — replace with agg result
  const aggNodes = orderedNodes.filter(n => n.type === 'aggregate');

  // Build builder tree from fields
  builderTree = fields.slice(0, 20).map(f => {
    const parts = f.name.replace(/\[\]/g, '').split('.');
    const key = parts[parts.length - 1];
    return mkNode(key, f.type || 'str', `$.${f.name}`);
  });

  // Add agg nodes
  aggNodes.forEach(an => {
    builderTree.push({
      ...mkNode(`${an.data.aggFn||'sum'}_${(an.data.aggField||'').split('.').pop()}`, 'agg', ''),
      aggFn: an.data.aggFn || 'sum',
      aggField: an.data.aggField || ''
    });
  });

  if (!builderTree.length) builderInit();
  _builderOutputName = outputNode?.data?.outputName || 'my_view';
}

// ═══════════════════════════════════════════════════════
// BUILDER → PIPELINE  (read builderTree, update pipeline nodes)
// ═══════════════════════════════════════════════════════
function builderToPipeline() {
  if (!builderTree.length) return;
  _suppressSync = true;

  const schema = builderToSchema(builderTree);
  const name = _builderOutputName || document.getElementById('builder-output-name')?.value || 'my_view';

  // Find or create output node
  let outputNode = state.nodes.find(n => n.type === 'output');
  if (outputNode) {
    outputNode.data.outputName = name;
    outputNode.data.outputSchema = schema;
    outputNode.data.label = `Output: ${name}`;
    renderNode(outputNode);
  } else if (state.nodes.length > 0) {
    // Create an output node positioned to the right of the rightmost node
    const maxX = Math.max(...state.nodes.map(n => n.x)) + 220;
    const midY = state.nodes.reduce((s, n) => s + n.y, 0) / state.nodes.length;
    outputNode = createNode('output', maxX, midY - 40, {
      label: `Output: ${name}`,
      outputName: name,
      outputSchema: schema
    });
    // Wire the last non-output, non-source node to it
    const lastOp = [...state.nodes].reverse().find(n => n.type !== 'output' && n.type !== 'source');
    if (lastOp) addEdge(lastOp.id, outputNode.id);
  }

  // Sync map nodes — if builder has flat leaf fields pointing to source paths,
  // update the last map node's field list (or create one if none exists)
  const flatLeaves = flattenBuilderLeaves(builderTree);
  if (flatLeaves.length) {
    let mapNode = state.nodes.find(n => n.type === 'map');
    if (mapNode) {
      mapNode.data.fields = flatLeaves.map(l => ({ name: l.path.replace(/^\$\./, ''), type: l.type }));
      renderNode(mapNode);
    }
  }

  drawEdges();
  _suppressSync = false;
}

// Collect all leaf nodes from builderTree as { key, path, type }
function flattenBuilderLeaves(nodes, result = []) {
  for (const n of nodes) {
    if (n.children && n.children.length) {
      flattenBuilderLeaves(n.children, result);
    } else if (n.type !== 'agg' && n.type !== 'expr' && n.path) {
      result.push({ key: n.key, path: n.path, type: n.type });
    }
  }
  return result;
}

// ═══════════════════════════════════════════════
// BUILDER STATE
// ═══════════════════════════════════════════════
let builderTree = [];
let builderNextId = 1;
let selectedJBNode = null;
let pathPickerTarget = null;
let typeMenuTarget = null;
let builderDragSrcId = null;
let _builderOutputName = 'my_view';

function jbId() { return 'jb' + (builderNextId++); }

function builderInit() {
  // seed from currently loaded sources if available
  const allFields = [];
  state.sources.slice(0, 1).forEach(src => {
    (src.tree || []).slice(0, 6).forEach(n => {
      if (!n.children) allFields.push({ key: n.key, type: n.type, path: `$.${n.path}` });
    });
  });
  builderTree = allFields.length ? allFields.map(f => mkNode(f.key, f.type, f.path)) : [
    mkNode('id',   'str', '$.customerId'),
    mkNode('name', 'str', '$.profile.name.formatted'),
    mkNode('status','str','$.account.status.code'),
  ];
}

function mkNode(key='', type='str', path='', children=null) {
  return {
    id: jbId(), key, type, path,
    filter: '', sortBy: '', sortOrder: 'asc', aggFn: 'sum', aggField: '',
    children: children !== null ? children : (type === 'obj' || type === 'arr' ? [] : null),
    collapsed: false
  };
}

function syncBuilderToState() {
  if (_suppressSync) return;
  _builderOutputName = document.getElementById('builder-output-name')?.value || 'my_view';
  const outputNode = state.nodes.find(n => n.type === 'output');
  if (outputNode) {
    outputNode.data.outputName = _builderOutputName;
    outputNode.data.outputSchema = builderToSchema(builderTree);
    renderNode(outputNode);
  }
  refreshDSL();
}

function builderToSchema(nodes) {
  const out = {};
  for (const n of nodes) {
    if (!n.key) continue;
    if (n.type === 'obj' && n.children) {
      out[n.key] = builderToSchema(n.children);
    } else if (n.type === 'arr' && n.children) {
      out[n.key] = {
        $from: n.path || '$items',
        $shape: builderToSchema(n.children),
        ...(n.filter ? { $filter: n.filter } : {}),
        ...(n.sortBy ? { $sort: { by: n.sortBy, order: n.sortOrder || 'asc' } } : {})
      };
    } else if (n.type === 'agg') {
      out[n.key] = { $agg: n.aggFn || 'sum', $field: n.aggField || n.path };
    } else if (n.type === 'expr') {
      out[n.key] = { $expr: n.path };
    } else {
      out[n.key] = n.path || `$.${n.key}`;
    }
  }
  return out;
}

function schemaToBuilder(schema) {
  // also look up source field types for richer type inference
  const allPaths = {};
  state.sources.forEach(src => {
    const walk = (nodes) => nodes.forEach(n => {
      allPaths[`$.${n.path}`] = n.type;
      if (n.children) walk(n.children);
    });
    walk(src.tree || []);
  });

  return Object.entries(schema || {}).map(([k, v]) => {
    if (v && typeof v === 'object') {
      if (v.$agg) return { ...mkNode(k, 'agg', ''), aggFn: v.$agg, aggField: v.$field || '' };
      if (v.$expr) return { ...mkNode(k, 'expr', v.$expr) };
      if (v.$from) {
        const children = schemaToBuilder(v.$shape || {});
        return { ...mkNode(k, 'arr', v.$from, children), filter: v.$filter || '', sortBy: v.$sort?.by || '', sortOrder: v.$sort?.order || 'asc' };
      }
      const children = schemaToBuilder(v);
      return mkNode(k, 'obj', '', children);
    }
    const path = typeof v === 'string' ? v : '';
    // infer type: look up in source paths, fall back to heuristic
    const inferredType = allPaths[path] ||
      (path.includes('date') || path.includes('Date') || path.includes('At') ? 'date' :
       path.includes('count') || path.includes('total') || path.includes('amount') || path.includes('Value') ? 'num' :
       path.includes('indicator') || path.includes('enrolled') || path.includes('verified') ? 'bool' : 'str');
    return mkNode(k, inferredType, path);
  });
}

function importFromPipeline() {
  pipelineToBuilder();
  renderBuilderTree();
}

// ═══════════════════════════════════════════════
// BUILDER RENDER
// ═══════════════════════════════════════════════
function renderBuilderTree() {
  const root = document.getElementById('jb-root');
  if (!root) return;
  const outputName = _builderOutputName || document.getElementById('builder-output-name')?.value || 'my_view';
  root.innerHTML = `
    <div class="jb-output-header">
      <span style="font-size:18px;">⬡</span>
      <div class="jb-output-title">Output View</div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:10px;color:var(--text3);">name:</span>
        <input class="jb-output-name" id="builder-output-name" value="${outputName}" placeholder="view_name" oninput="syncBuilderToState()" style="min-width:140px;">
      </div>
    </div>
    <div style="font-family:var(--mono);font-size:11px;color:var(--text3);padding:0 0 4px 4px;">{</div>
    <div id="jb-nodes-root" style="margin-left:4px;">
      ${builderTree.map(n => renderJBNode(n, 0)).join('')}
    </div>
    ${renderAddRow(null, 0)}
    <div style="font-family:var(--mono);font-size:11px;color:var(--text3);padding:4px 0 0 4px;">}</div>
  `;
  // also sync toolbar name input
  const toolbarInput = document.getElementById('builder-output-name');
  if (toolbarInput) toolbarInput.value = outputName;
  attachBuilderEvents();
}

const TYPE_ICONS = { str:'𝑓', num:'#', bool:'✓', date:'📅', obj:'{}', arr:'[]', expr:'λ', agg:'Σ' };
const TYPE_LABELS = { str:'str', num:'num', bool:'bool', date:'date', obj:'obj', arr:'arr', expr:'expr', agg:'agg' };
const TYPE_GUTTER = { str:'jb-type-str', num:'jb-type-num', bool:'jb-type-bool', date:'jb-type-date', obj:'jb-type-obj', arr:'jb-type-arr', expr:'jb-type-expr', agg:'jb-type-agg' };

function renderJBNode(node, depth) {
  const hasChildren = node.type === 'obj' || node.type === 'arr';
  const isCollapsed = node.collapsed;
  const indent = depth * 20;
  const isSelected = selectedJBNode === node.id;

  let valHtml = '';
  if (node.type === 'obj') {
    valHtml = `<span style="color:var(--text3);font-size:10px;">{${node.children?.length||0} fields}</span>`;
  } else if (node.type === 'arr') {
    const srcLabel = node.path || '$items';
    valHtml = `
      <span class="jb-src-pill" data-id="${node.id}" data-field="path">${srcLabel}</span>
      ${node.filter ? `<span class="jb-src-pill jb-pill-filter" data-id="${node.id}" data-field="filter">⊕ ${node.filter}</span>` : ''}
      ${node.sortBy ? `<span class="jb-src-pill jb-pill-sort" data-id="${node.id}" data-field="sortBy">↕ ${node.sortBy}</span>` : ''}
      <span style="color:var(--text3);font-size:10px;">[${node.children?.length||0} fields]</span>`;
  } else if (node.type === 'agg') {
    valHtml = `
      <select class="config-select" style="width:60px;" data-id="${node.id}" data-field="aggFn" onchange="updateJBField(this)">
        ${['sum','avg','count','min','max'].map(f=>`<option ${node.aggFn===f?'selected':''}>${f}</option>`).join('')}
      </select>
      <span class="jb-src-pill jb-pill-fn" data-id="${node.id}" data-field="aggField">${node.aggField||'pick field…'}</span>`;
  } else if (node.type === 'expr') {
    valHtml = `<input class="jb-val" data-id="${node.id}" data-field="path" value="${node.path||''}" placeholder="e.g. $.a + $.b  or  length($.items)" onchange="updateJBField(this)">`;
  } else {
    // leaf — show source path pill + optional inline edit
    valHtml = `
      <span class="jb-src-pill" data-id="${node.id}" data-field="path">${node.path || 'pick source…'}</span>
      <input class="jb-val" data-id="${node.id}" data-field="path" value="${node.path||''}" placeholder="$.field.path" onchange="updateJBField(this)" style="max-width:160px;color:var(--text3);">`;
  }

  const expandBtn = hasChildren
    ? `<button class="jb-expand ${isCollapsed?'':'open'}" data-id="${node.id}" onclick="toggleJBCollapse('${node.id}')">${isCollapsed?'▶':'▼'}</button>`
    : '';

  const actionsHtml = `
    <div class="jb-actions">
      ${hasChildren ? `<button class="jb-act add-child" title="Add field" onclick="builderAddChild('${node.id}','field','str')">+𝑓</button>
      <button class="jb-act add-arr" title="Add object" onclick="builderAddChild('${node.id}','obj')">+{}</button>` : ''}
      <button class="jb-act" title="Change type" onclick="openTypeMenu(event,'${node.id}')">⬡</button>
      <button class="jb-act del" title="Delete" onclick="deleteJBNode('${node.id}')">×</button>
    </div>`;

  const blockHtml = `
    <div class="jb-block ${isSelected?'jb-selected':''}" data-id="${node.id}"
      draggable="true"
      ondragstart="jbDragStart(event,'${node.id}')"
      ondragover="jbDragOver(event,'${node.id}')"
      ondrop="jbDrop(event,'${node.id}')"
      ondragleave="jbDragLeave(event)"
      onclick="selectJBNode('${node.id}')">
      <div class="jb-gutter ${TYPE_GUTTER[node.type]||'jb-type-str'}" title="${node.type}" onclick="openTypeMenu(event,'${node.id}')">${TYPE_ICONS[node.type]||'𝑓'}</div>
      <div class="jb-key-wrap">
        <input class="jb-key" data-id="${node.id}" data-field="key" value="${node.key||''}" placeholder="field_name" onchange="updateJBField(this)" onclick="event.stopPropagation()">
      </div>
      <span class="jb-colon">:</span>
      <div class="jb-val-wrap">
        ${expandBtn}
        ${valHtml}
      </div>
      ${actionsHtml}
    </div>`;

  let childrenHtml = '';
  if (hasChildren) {
    childrenHtml = `
      <div class="jb-children ${isCollapsed?'collapsed':''}" id="jb-ch-${node.id}">
        ${(node.children||[]).map(c => renderJBNode(c, depth+1)).join('')}
        ${renderAddRow(node.id, depth+1)}
      </div>`;
  }

  return `
    <div class="jb-node" data-id="${node.id}" style="padding-left:${indent}px;">
      <div class="jb-row">${blockHtml}</div>
      ${childrenHtml}
    </div>`;
}

function renderAddRow(parentId, depth) {
  const pid = parentId || 'root';
  return `
    <div class="jb-add-row" style="padding-left:${depth*20+4}px;">
      <button class="jb-add-btn" onclick="builderAddChild('${pid}','field','str')">+ field</button>
      <button class="jb-add-btn" onclick="builderAddChild('${pid}','obj')">+ {} object</button>
      <button class="jb-add-btn arr" onclick="builderAddChild('${pid}','arr')">+ [] array</button>
      <button class="jb-add-btn fn" onclick="builderAddChild('${pid}','agg')">+ Σ agg</button>
    </div>`;
}

// ═══════════════════════════════════════════════
// BUILDER INTERACTIONS
// ═══════════════════════════════════════════════
function attachBuilderEvents() {
  // delegate pill clicks to open path picker
  document.querySelectorAll('.jb-src-pill[data-id]').forEach(pill => {
    pill.addEventListener('click', e => {
      e.stopPropagation();
      const field = pill.dataset.field;
      const id = pill.dataset.id;
      if (field === 'aggField' || field === 'path') openPathPicker(e, id, field);
    });
  });
}

function builderAdd(type, subtype) {
  const node = mkNode('', type === 'field' ? (subtype||'str') : type, '');
  if (type !== 'field') node.type = type;
  builderTree.push(node);
  renderBuilderTree();
  syncBuilderToState();
}

function builderAddChild(parentId, type, subtype) {
  if (parentId === 'root') {
    builderTree.push(mkNode('', type === 'field' ? (subtype||'str') : type, ''));
  } else {
    const parent = findJBNode(builderTree, parentId);
    if (parent && parent.children !== null) {
      if (!parent.children) parent.children = [];
      parent.children.push(mkNode('', type === 'field' ? (subtype||'str') : type, ''));
    }
  }
  renderBuilderTree();
  syncBuilderToState();
}

function deleteJBNode(id) {
  builderTree = removeJBNode(builderTree, id);
  if (selectedJBNode === id) selectedJBNode = null;
  renderBuilderTree();
  syncBuilderToState();
}

function removeJBNode(nodes, id) {
  return nodes.filter(n => n.id !== id).map(n => {
    if (n.children) n.children = removeJBNode(n.children, id);
    return n;
  });
}

function findJBNode(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) { const found = findJBNode(n.children, id); if (found) return found; }
  }
  return null;
}

function updateJBField(el) {
  const node = findJBNode(builderTree, el.dataset.id);
  if (!node) return;
  node[el.dataset.field] = el.value;
  if (el.dataset.field === 'key') renderBuilderTree(); // re-render to update labels
  syncBuilderToState();
}

function toggleJBCollapse(id) {
  const node = findJBNode(builderTree, id);
  if (node) { node.collapsed = !node.collapsed; renderBuilderTree(); }
}

function selectJBNode(id) {
  selectedJBNode = selectedJBNode === id ? null : id;
  document.querySelectorAll('.jb-block').forEach(b => b.classList.toggle('jb-selected', b.dataset.id === selectedJBNode));
}

// ─── Type menu ───────────────────────────────
let typeMenuNodeId = null;
function openTypeMenu(e, nodeId) {
  e.stopPropagation();
  typeMenuNodeId = nodeId;
  const menu = document.getElementById('type-menu');
  menu.classList.add('open');
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';
}
function setNodeType(type) {
  const node = findJBNode(builderTree, typeMenuNodeId);
  if (node) {
    node.type = type;
    if (type === 'obj' || type === 'arr') { if (!node.children) node.children = []; }
    else { node.children = null; }
    renderBuilderTree();
    syncBuilderToState();
  }
  document.getElementById('type-menu').classList.remove('open');
}
document.addEventListener('click', () => {
  document.getElementById('type-menu')?.classList.remove('open');
  document.getElementById('path-picker')?.classList.remove('open');
});

// ─── Path picker ─────────────────────────────
function openPathPicker(e, nodeId, field) {
  e.stopPropagation();
  pathPickerTarget = { nodeId, field };
  const picker = document.getElementById('path-picker');
  picker.classList.add('open');
  picker.style.left = (e.clientX + 10) + 'px';
  picker.style.top = e.clientY + 'px';
  document.getElementById('pp-search').value = '';
  populatePathPicker('');
  setTimeout(() => document.getElementById('pp-search').focus(), 50);
}

function getAllPaths() {
  const paths = [];
  state.sources.forEach(src => {
    const collectPaths = (nodes, prefix='') => {
      nodes.forEach(n => {
        const fullPath = prefix ? `${prefix}.${n.key}` : n.key;
        if (!n.children || !n.children.length) {
          paths.push({ label: n.key, path: `$.${fullPath}`, source: src.name, type: n.type });
        } else {
          paths.push({ label: n.key, path: `$.${fullPath}`, source: src.name, type: n.type, hasChildren: true });
          collectPaths(n.children, fullPath);
        }
      });
    };
    collectPaths(src.tree || []);
  });
  return paths;
}

function populatePathPicker(query) {
  const q = query.toLowerCase();
  const allPaths = getAllPaths();
  const filtered = q ? allPaths.filter(p => p.path.toLowerCase().includes(q) || p.label.toLowerCase().includes(q)) : allPaths;
  const el = document.getElementById('pp-items');
  el.innerHTML = filtered.slice(0, 60).map(p => `
    <div class="pp-item" onclick="pickPath('${p.path.replace(/'/g,"\\'")}')">
      <span class="field-type-badge ft-${p.type}" style="font-size:8px;">${p.type}</span>
      <div>
        <div style="font-size:10px;">${p.label}</div>
        <div class="pp-item-path">${p.path} <span style="color:var(--accent2);margin-left:4px;">${p.source}</span></div>
      </div>
    </div>`).join('') || '<div style="padding:10px;font-size:10px;color:var(--text3);">No fields found</div>';
}

function filterPathPicker(val) { populatePathPicker(val); }

function pickPath(path) {
  if (!pathPickerTarget) return;
  const { nodeId, field } = pathPickerTarget;
  const node = findJBNode(builderTree, nodeId);
  if (node) {
    node[field] = path;
    // infer type from path
    const match = getAllPaths().find(p => p.path === path);
    if (match && node.type !== 'obj' && node.type !== 'arr' && node.type !== 'agg' && node.type !== 'expr') {
      node.type = match.type || 'str';
    }
    // auto-fill key from path leaf if key is empty
    if (!node.key) node.key = path.split('.').pop().replace(/\[\]/g,'');
    renderBuilderTree();
    syncBuilderToState();
  }
  document.getElementById('path-picker').classList.remove('open');
}

// ─── Builder drag-drop reorder ────────────────
let jbDragId = null;
function jbDragStart(e, id) {
  jbDragId = id;
  e.dataTransfer.effectAllowed = 'move';
  e.stopPropagation();
}
function jbDragOver(e, id) {
  if (jbDragId && jbDragId !== id) {
    e.preventDefault();
    document.querySelectorAll('.jb-block').forEach(b => b.classList.toggle('drop-target', b.dataset.id === id));
  }
}
function jbDragLeave(e) {
  document.querySelectorAll('.jb-block.drop-target').forEach(b => b.classList.remove('drop-target'));
}
function jbDrop(e, targetId) {
  e.preventDefault(); e.stopPropagation();
  document.querySelectorAll('.jb-block.drop-target').forEach(b => b.classList.remove('drop-target'));
  if (!jbDragId || jbDragId === targetId) return;
  const src = findJBNode(builderTree, jbDragId);
  if (!src) return;
  builderTree = removeJBNode(builderTree, jbDragId);
  // insert before target in flat root list (simplified - root level only for now)
  const idx = builderTree.findIndex(n => n.id === targetId);
  if (idx >= 0) builderTree.splice(idx, 0, src);
  else builderTree.push(src);
  jbDragId = null;
  renderBuilderTree();
  syncBuilderToState();
}

// ─── Drop from source panel onto builder ─────
function builderDragOver(e) { e.preventDefault(); }
function builderDrop(e) {
  e.preventDefault();
  const raw = e.dataTransfer.getData('text/plain');
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    if (d.kind === 'field') {
      const parts = d.path.split('.');
      const key = parts[parts.length-1].replace(/\[\]/g,'');
      const node = mkNode(key, d.type, `$.${d.path}`);
      builderTree.push(node);
      renderBuilderTree();
      syncBuilderToState();
    }
  } catch {}
}

// ─── DSL integration ─────────────────────────
function getBuilderOutputSchema() {
  return builderTree.length ? builderToSchema(builderTree) : null;
}