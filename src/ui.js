// ═══════════════════════════════════════════════
// UI UTILS
// ═══════════════════════════════════════════════
function switchRTab(name, btn) {
  document.querySelectorAll('.rtab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.rtab-pane').forEach(p => p.classList.remove('active'));
  if(btn) btn.classList.add('active');
  else document.querySelectorAll('.rtab').forEach(t => { if(t.textContent.toLowerCase().includes(name)) t.classList.add('active'); });
  const pane = document.getElementById('pane-' + name);
  if (pane) pane.classList.add('active');
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function openAddSource() {
  document.getElementById('src-name').value = '';
  document.getElementById('src-json').value = '';
  openModal('modal-add');
}

function addSourceFromModal() {
  const name = document.getElementById('src-name').value.trim();
  const raw = document.getElementById('src-json').value.trim();
  if (!name) { alert('Please enter a source name'); return; }
  if (!raw) { alert('Please paste JSON data'); return; }
  try {
    let parsed = JSON.parse(raw);
    // unwrap: if object with single array key, use that array
    if (!Array.isArray(parsed) && typeof parsed === 'object') {
      const arrKeys = Object.keys(parsed).filter(k => Array.isArray(parsed[k]));
      if (arrKeys.length === 1) {
        parsed = parsed[arrKeys[0]];
      } else {
        parsed = [parsed];
      }
    }
    addSource(name, Array.isArray(parsed) ? parsed : [parsed]);
    closeModal('modal-add');
  } catch(e) {
    alert('Invalid JSON: ' + e.message);
  }
}

function showCodeGen() {
  generateCode(state.currentLang);
  switchRTab('codegen', document.querySelectorAll('.rtab')[2]);
}

function clearCanvas() {
  state.nodes = [];
  state.edges = [];
  document.getElementById('canvas-nodes').innerHTML = '';
  document.getElementById('canvas-svg').innerHTML = '';
  document.getElementById('empty-hint').style.display = 'block';
  builderTree = [];
  _builderOutputName = 'my_view';
  if (activeCanvasView === 'builder') renderBuilderTree();
  updateStatus();
  refreshDSL();
}

function zoomReset() {
  document.getElementById('canvas-wrap').scrollTo(0,0);
}

function updateStatus() {
  document.getElementById('node-count').textContent = state.nodes.length + ' nodes';
  document.getElementById('edge-count').textContent = state.edges.length + ' connections';
}

// close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(mo => {
  mo.addEventListener('click', e => { if (e.target === mo) mo.classList.remove('open'); });
});

// ═══════════════════════════════════════════════
// SAMPLES MODAL
// ═══════════════════════════════════════════════
let selectedDatasetSetId = null;

function openSamplesModal() {
  selectedDatasetSetId = null;
  document.getElementById('load-dataset-btn').disabled = true;
  renderSampleGrid();
  openModal('modal-samples');
}

function renderSampleGrid() {
  const grid = document.getElementById('samples-grid');
  grid.innerHTML = DATASET_SETS.map(set => `
    <div class="view-card ${selectedDatasetSetId===set.id?'selected':''}"
      style="${selectedDatasetSetId===set.id?'border-color:var(--accent);background:#eff3ff;':''}"
      onclick="selectDatasetSet('${set.id}')">
      <div class="view-card-icon">${set.icon}</div>
      <div class="view-card-body">
        <div class="view-card-name">${set.name}</div>
        <div class="view-card-desc">${set.desc}</div>
        <div class="view-card-pills" style="margin-top:6px;">
          <span class="view-pill vp-source">📦 ${set.sources.orders.length} orders</span>
          <span class="view-pill vp-source">👤 ${set.sources.customers.length} customers</span>
          <span class="view-pill vp-source">🏢 ${set.sources.workers.length} workers</span>
          ${set.tags.map(t=>`<span class="dataset-tag">${t}</span>`).join('')}
        </div>
        <div style="margin-top:8px;font-size:10px;color:var(--text3);">
          IDs linked: <code style="background:var(--bg4);padding:1px 4px;border-radius:3px;">orders.customer.ref</code> →
          <code style="background:var(--bg4);padding:1px 4px;border-radius:3px;">customers.customerId</code> ·
          <code style="background:var(--bg4);padding:1px 4px;border-radius:3px;">customers.account.managerId</code> →
          <code style="background:var(--bg4);padding:1px 4px;border-radius:3px;">workers.associateOID</code>
        </div>
      </div>
      <div class="view-card-action">
        <button class="btn ${selectedDatasetSetId===set.id?'primary':''}" style="font-size:10px;white-space:nowrap;"
          onclick="event.stopPropagation();selectDatasetSet('${set.id}');loadSelectedDataset()">Load Set</button>
      </div>
    </div>
  `).join('');
}

function selectDatasetSet(id) {
  selectedDatasetSetId = id;
  document.getElementById('load-dataset-btn').disabled = false;
  renderSampleGrid();
}

function loadSelectedDataset() {
  if (!selectedDatasetSetId) return;
  const set = DATASET_SETS.find(s => s.id === selectedDatasetSetId);
  if (!set) return;
  // Load all 3 sources, replacing any existing ones with matching names
  ['orders','customers','workers'].forEach(srcName => {
    const existingIdx = state.sources.findIndex(s => s.name === srcName);
    if (existingIdx >= 0) state.sources.splice(existingIdx, 1);
    const icons = { orders:'🛒', customers:'👤', workers:'🏢' };
    const colors = { orders:'#3b6ef5', customers:'#0fa86a', workers:'#6c47e8' };
    addSource(srcName, set.sources[srcName], colors[srcName], icons[srcName]);
  });
  closeModal('modal-samples');
  document.getElementById('status-msg').textContent = `✓ Loaded "${set.name}" — orders, customers & workers all loaded with matching IDs`;
  setTimeout(()=>document.getElementById('status-msg').textContent='',4000);
}

// ═══════════════════════════════════════════════
// VIEWS MODAL
// ═══════════════════════════════════════════════
function openViewsModal() {
  renderViewsList();
  openModal('modal-views');
}

function renderViewsList() {
  const el = document.getElementById('views-list');
  const pillType = p => {
    if(['orders','customers','workers'].includes(p)) return 'vp-source';
    if(p==='join') return 'vp-join';
    if(p==='filter') return 'vp-filter';
    if(p==='map') return 'vp-map';
    if(['aggregate','groupby','sort'].includes(p)) return 'vp-agg';
    return 'vp-output';
  };
  el.innerHTML = SAMPLE_VIEWS.map(v => {
    const missingSources = v.requiredSources.filter(n => !state.sources.find(s => s.name === n));
    const missingLabel = missingSources.length
      ? `<span style="font-size:10px;color:var(--orange);">⚠ will auto-load: ${missingSources.join(', ')}</span>`
      : `<span style="font-size:10px;color:var(--green);">✓ sources ready</span>`;

    // Build a pretty-printed collapsed output shape preview (top 2 levels only)
    const shapePreview = v.outputShape ? buildShapePreview(v.outputShape) : '';

    return `
    <div class="view-card">
      <div class="view-card-icon">${v.icon}</div>
      <div class="view-card-body" style="min-width:0;">
        <div class="view-card-name">${v.name}</div>
        <div class="view-card-desc">${v.desc}</div>
        <div class="view-card-pills" style="margin-bottom:8px;">
          ${v.pills.map(p=>`<span class="view-pill ${pillType(p)}">${p}</span>`).join('')}
          <span style="margin-left:4px;">${missingLabel}</span>
        </div>
        ${shapePreview ? `
        <div style="margin-top:4px;">
          <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:var(--text3);margin-bottom:3px;">Output Shape</div>
          <div style="font-size:9px;font-family:var(--mono);background:#f8f9fc;border:1px solid var(--border);border-radius:5px;padding:7px 9px;max-height:100px;overflow-y:auto;white-space:pre;line-height:1.6;color:var(--text2);">${shapePreview}</div>
        </div>` : ''}
      </div>
      <div class="view-card-action">
        <button class="btn primary" style="font-size:10px;white-space:nowrap;" onclick="loadView('${v.id}')">▶ Load</button>
      </div>
    </div>`;
  }).join('');
}

function buildShapePreview(shape, depth=0) {
  if (depth > 2) return '<span style="color:var(--text3)">…</span>';
  const indent = '  '.repeat(depth);
  const lines = [];
  for (const [k, v] of Object.entries(shape)) {
    if (v && typeof v === 'object' && !v.$from && !v.$agg && !v.$group && !v.$expr && !v.$distinct) {
      lines.push(`<span style="color:#3b6ef5">${indent}${k}</span>: {`);
      if (depth < 1) {
        const inner = buildShapePreview(v, depth+1);
        lines.push(inner);
        lines.push(`${indent}}`);
      } else {
        lines.push(`${indent}  <span style="color:var(--text3)">…${Object.keys(v).length} fields</span>`);
        lines.push(`${indent}}`);
      }
    } else if (v && typeof v === 'object' && v.$from) {
      lines.push(`<span style="color:#3b6ef5">${indent}${k}</span>: <span style="color:#0891b2">[…]</span> <span style="color:var(--text3)">// from ${v.$from}</span>`);
    } else if (v && typeof v === 'object' && v.$agg) {
      lines.push(`<span style="color:#3b6ef5">${indent}${k}</span>: <span style="color:#d97706">${v.$agg}(${v.$field||''})</span>`);
    } else if (v && typeof v === 'object' && v.$group) {
      lines.push(`<span style="color:#3b6ef5">${indent}${k}</span>: <span style="color:#db2777">groupBy(${v.$group})</span>`);
    } else {
      const val = typeof v === 'string' ? `<span style="color:#0fa86a">"${v}"</span>` : JSON.stringify(v);
      lines.push(`<span style="color:#3b6ef5">${indent}${k}</span>: ${val}`);
    }
  }
  return lines.join('\n');
}

function loadView(id) {
  const view = SAMPLE_VIEWS.find(v => v.id === id);
  if (!view) return;
  view.requiredSources.forEach(name => {
    if (!state.sources.find(s => s.name === name)) {
      if (DATASET_SETS[0]?.sources[name]) {
        const icons  = { orders:'🛒', customers:'👤', workers:'🏢' };
        const colors = { orders:'#3b6ef5', customers:'#0fa86a', workers:'#6c47e8' };
        addSource(name, DATASET_SETS[0].sources[name], colors[name], icons[name]);
      }
    }
  });
  const srcMap = {};
  view.requiredSources.forEach(name => { srcMap[name] = state.sources.find(s => s.name === name); });

  // make sure we're in pipeline view while building nodes
  const prevView = activeCanvasView;
  activeCanvasView = 'pipeline';
  document.getElementById('canvas-view').classList.remove('hidden');
  document.getElementById('builder-view').classList.remove('active');
  view.build(srcMap);

  // Prime builder tree from the view's outputShape immediately
  if (view.outputShape) {
    builderTree = schemaToBuilder(view.outputShape);
    _builderOutputName = view.outputShape ? (state.nodes.find(n=>n.type==='output')?.data?.outputName || 'my_view') : 'my_view';
  } else {
    setTimeout(pipelineToBuilder, 100);
  }

  closeModal('modal-views');
  document.getElementById('status-msg').textContent = `✓ Loaded "${view.name}" — switch to { } Builder to edit the output shape`;
  setTimeout(() => document.getElementById('status-msg').textContent = '', 4000);
}