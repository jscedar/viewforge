// ═══════════════════════════════════════════════
// RUN PIPELINE
// ═══════════════════════════════════════════════
function runPipeline() {
  try {
    const result = executePipeline();
    renderPreview(result);
    switchRTab('preview', document.querySelectorAll('.rtab')[1]);
    document.getElementById('status-msg').textContent = `✓ ${result.length} rows`;
    setTimeout(()=> document.getElementById('status-msg').textContent = '', 3000);
  } catch(e) {
    document.getElementById('status-msg').textContent = '✗ Error: ' + e.message;
  }
}

// ── dot-path helpers ────────────────────────────
function getPath(obj, path) {
  // supports a.b.c and a[].b (treats array as first element for scalar access)
  if (!path || obj === null || obj === undefined) return undefined;
  const clean = path.replace(/\[\]/g, '');          // strip [] markers
  const parts = clean.split('.');
  let cur = obj;
  for (const part of parts) {
    if (cur === null || cur === undefined) return undefined;
    if (Array.isArray(cur)) cur = cur[0];           // unwrap array to first item
    cur = cur[part];
  }
  if (Array.isArray(cur)) return cur[0];            // final unwrap
  return cur;
}

function setPath(obj, path, value) {
  const parts = path.replace(/\[\]/g, '').split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] === undefined) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

// flatten a nested object to dot-path keys for preview table
function flattenObj(obj, prefix = '', out = {}) {
  if (obj === null || obj === undefined) return out;
  if (typeof obj !== 'object' || Array.isArray(obj)) {
    out[prefix] = Array.isArray(obj) ? `[${obj.length} items]` : obj;
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flattenObj(v, key, out);
    else if (Array.isArray(v)) out[key] = `[${v.length}]`;
    else out[key] = v;
  }
  return out;
}

// apply an outputSchema shape to a merged row, producing nested output
function applyShape(shape, row) {
  if (!shape || typeof shape !== 'object') return row;
  const result = {};
  for (const [key, expr] of Object.entries(shape)) {
    if (expr && typeof expr === 'object') {
      if (expr.$from || expr.$agg || expr.$group || expr.$expr || expr.$distinct) {
        result[key] = `[computed: ${JSON.stringify(expr).slice(0,40)}]`;
      } else {
        result[key] = applyShape(expr, row);
      }
    } else if (typeof expr === 'string' && expr.startsWith('$.')) {
      result[key] = getPath(row, expr.slice(2));
    } else {
      result[key] = expr;
    }
  }
  return result;
}

function executePipeline() {
  const nodeResults = {};
  const orderedNodes = topoSort();

  for (const node of orderedNodes) {
    if (node.type === 'source') {
      const src = state.sources.find(s => s.id === node.data.sourceId);
      if (!src) continue;
      let data = src.data.map(r => JSON.parse(JSON.stringify(r))); // deep clone
      // if specific fields selected, project them (keep nested structure intact)
      if (node.data.fields && node.data.fields.length) {
        data = data.map(row => {
          const out = {};
          node.data.fields.forEach(f => {
            const val = getPath(row, f.name);
            if (val !== undefined) setPath(out, f.name, val);
          });
          // also keep top-level id fields for joins
          ['customerId','associateOID','orderId','customer','workerID'].forEach(k => {
            if (row[k] !== undefined && out[k] === undefined) out[k] = row[k];
          });
          return out;
        });
      }
      nodeResults[node.id] = data;

    } else {
      const inputs = state.edges.filter(e => e.to === node.id).map(e => nodeResults[e.from] || []);
      let data = inputs[0] ? inputs[0].map(r => ({...r})) : [];

      if (node.type === 'filter' && node.data.condition) {
        const cond = node.data.condition.trim();
        data = data.filter(row => {
          try {
            // parse simple conditions: path op value
            // op: ==, !=, >, <, >=, <=
            const m = cond.match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
            if (!m) return true;
            let [, lhsExpr, op, rhsExpr] = m;
            lhsExpr = lhsExpr.trim(); rhsExpr = rhsExpr.trim();
            const lhs = getPath(row, lhsExpr) ?? row[lhsExpr];
            let rhs = rhsExpr.replace(/^['"]|['"]$/g, ''); // strip quotes
            if (!isNaN(rhs) && rhsExpr !== '') rhs = Number(rhs);
            if (op === '==') return lhs == rhs;
            if (op === '!=') return lhs != rhs;
            if (op === '>') return Number(lhs) > Number(rhs);
            if (op === '<') return Number(lhs) < Number(rhs);
            if (op === '>=') return Number(lhs) >= Number(rhs);
            if (op === '<=') return Number(lhs) <= Number(rhs);
          } catch { return true; }
          return true;
        });

      } else if (node.type === 'map') {
        if (node.data.fields && node.data.fields.length) {
          const fields = node.data.fields;
          data = data.map(row => {
            const out = {};
            fields.forEach(f => {
              const val = getPath(row, f.name) ?? row[f.name];
              if (val !== undefined) setPath(out, f.name, val);
            });
            return out;
          });
        }

      } else if (node.type === 'join') {
        const right = inputs[1] || [];
        const keyExpr = (node.data.joinKey || '').trim();
        const joinType = node.data.joinType || 'inner';
        if (keyExpr && right.length) {
          // build index on right side - try both the key as-is and common mappings
          const rightIdx = {};
          right.forEach(r => {
            const v = getPath(r, keyExpr) ?? r[keyExpr];
            // also try customerId / associateOID directly
            const v2 = r['customerId'] ?? r['associateOID'] ?? r['orderId'];
            if (v !== undefined) rightIdx[String(v)] = r;
            if (v2 !== undefined && v === undefined) rightIdx[String(v2)] = r;
          });
          // also index by customer.ref → customerId mapping
          const custIdIdx = {};
          right.forEach(r => {
            if (r['customerId']) custIdIdx[String(r['customerId'])] = r;
          });
          const workerIdx = {};
          right.forEach(r => {
            if (r['associateOID']) workerIdx[String(r['associateOID'])] = r;
          });

          if (joinType === 'inner') {
            data = data.flatMap(l => {
              const lv = String(getPath(l, keyExpr) ?? l[keyExpr] ?? '');
              const match = rightIdx[lv] || custIdIdx[lv] || workerIdx[lv];
              // try customer.ref → customerId
              const ref = String(getPath(l, 'customer.ref') ?? l['customer']?.ref ?? '');
              const matchByRef = custIdIdx[ref];
              // try account.managerId → associateOID
              const mgr = String(getPath(l, 'account.managerId') ?? '');
              const matchByMgr = workerIdx[mgr];
              const r = match || matchByRef || matchByMgr;
              return r ? [{ ...l, ...r }] : [];
            });
          } else { // left join
            data = data.map(l => {
              const lv = String(getPath(l, keyExpr) ?? l[keyExpr] ?? '');
              const match = rightIdx[lv] || custIdIdx[lv] || workerIdx[lv];
              const ref = String(getPath(l, 'customer.ref') ?? l['customer']?.ref ?? '');
              const matchByRef = custIdIdx[ref];
              const mgr = String(getPath(l, 'account.managerId') ?? '');
              const matchByMgr = workerIdx[mgr];
              const r = match || matchByRef || matchByMgr;
              return r ? { ...l, ...r } : { ...l };
            });
          }
        }

      } else if (node.type === 'aggregate') {
        const fieldExpr = node.data.aggField || '';
        const fn = node.data.aggFn || 'sum';
        const vals = data.map(r => Number(getPath(r, fieldExpr) ?? r[fieldExpr] ?? 0)).filter(v => !isNaN(v));
        let result;
        if (fn === 'sum')   result = Math.round(vals.reduce((a,b) => a+b, 0) * 100) / 100;
        else if (fn === 'count') result = data.length;
        else if (fn === 'avg')   result = vals.length ? Math.round(vals.reduce((a,b)=>a+b,0) / vals.length * 100) / 100 : 0;
        else if (fn === 'min')   result = Math.min(...vals);
        else if (fn === 'max')   result = Math.max(...vals);
        data = [{ [`${fn}(${fieldExpr.split('.').pop()})`]: result, recordCount: data.length }];

      } else if (node.type === 'groupby') {
        const byFields = (node.data.groupFields || '').split(',').map(s => s.trim()).filter(Boolean);
        const groups = {};
        data.forEach(row => {
          const keyParts = byFields.map(f => String(getPath(row, f) ?? row[f] ?? ''));
          const k = keyParts.join('__||__');
          if (!groups[k]) {
            groups[k] = { _count: 0, _items: [] };
            byFields.forEach((f, i) => {
              const leafKey = f.split('.').pop();
              groups[k][leafKey] = keyParts[i];
            });
          }
          groups[k]._count++;
          groups[k]._items.push(row);
        });
        data = Object.values(groups).map(g => {
          const { _items, ...rest } = g;
          return { ...rest, count: g._count };
        });

      } else if (node.type === 'sort') {
        const fieldExpr = node.data.sortField || '';
        const dir = node.data.sortOrder === 'desc' ? -1 : 1;
        data = [...data].sort((a, b) => {
          const av = getPath(a, fieldExpr) ?? a[fieldExpr] ?? '';
          const bv = getPath(b, fieldExpr) ?? b[fieldExpr] ?? '';
          return av < bv ? -dir : av > bv ? dir : 0;
        });

      } else if (node.type === 'output') {
        // apply nested shape if defined
        if (node.data.outputSchema) {
          data = data.map(row => applyShape(node.data.outputSchema, row));
        }
      }

      nodeResults[node.id] = data;
    }
  }

  const lastOp = orderedNodes.filter(n => n.type !== 'source').pop();
  return lastOp ? (nodeResults[lastOp.id] || []) : (orderedNodes[0] ? nodeResults[orderedNodes[0].id] : []);
}

function topoSort() {
  const visited = new Set();
  const result = [];
  const visit = (nodeId) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    state.edges.filter(e => e.to === nodeId).forEach(e => visit(e.from));
    const node = state.nodes.find(n => n.id === nodeId);
    if (node) result.push(node);
  };
  state.nodes.forEach(n => visit(n.id));
  return result;
}

function renderPreview(data) {
  const el = document.getElementById('preview-content');
  if (!data || !data.length) {
    el.innerHTML = '<div class="preview-empty">No data returned</div>';
    return;
  }
  // detect if output is nested (has object values)
  const hasNesting = data.some(row => Object.values(row).some(v => v && typeof v === 'object' && !Array.isArray(v)));

  if (hasNesting) {
    // render as nested JSON cards
    el.innerHTML = `
      <div style="padding:8px 12px;font-size:10px;color:var(--text3);border-bottom:1px solid var(--border);">${data.length} records · nested output</div>
      <div style="overflow-y:auto;max-height:calc(100% - 32px);padding:8px;">
        ${data.slice(0, 8).map((row, i) => `
          <div style="margin-bottom:8px;border:1px solid var(--border);border-radius:8px;overflow:hidden;">
            <div style="background:var(--bg3);padding:5px 10px;font-size:10px;color:var(--text2);font-weight:600;border-bottom:1px solid var(--border);">
              Record ${i+1} ${getRecordLabel(row)}
            </div>
            <div style="padding:8px;max-height:220px;overflow-y:auto;">
              ${renderNestedRow(row, 0)}
            </div>
          </div>
        `).join('')}
        ${data.length > 8 ? `<div style="text-align:center;font-size:10px;color:var(--text3);padding:8px;">+ ${data.length - 8} more records</div>` : ''}
      </div>`;
  } else {
    // flat table view — flatten any remaining nested values
    const flat = data.map(r => flattenObj(r));
    const cols = [...new Set(flat.flatMap(r => Object.keys(r)))].slice(0, 20);
    const rows = flat.slice(0, 20);
    el.innerHTML = `
      <div style="padding:6px 12px;font-size:10px;color:var(--text3);">${data.length} rows · ${cols.length} cols</div>
      <div style="overflow:auto;padding:0 12px 12px;">
        <table class="preview-table">
          <thead><tr>${cols.map(c => `<th title="${c}">${c.split('.').pop()}</th>`).join('')}</tr></thead>
          <tbody>${rows.map(row => `<tr>${cols.map(c => `<td title="${String(row[c]??'')}">${fmtVal(row[c])}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>`;
  }
}

function getRecordLabel(row) {
  const id = row.customerId || row.orderId || row.associateOID || row.campaignId || row.businessUnit || '';
  return id ? `<span style="color:var(--accent);font-weight:400">(${id})</span>` : '';
}

function fmtVal(v) {
  if (v === null || v === undefined) return '<span style="color:var(--text3)">—</span>';
  if (typeof v === 'boolean') return `<span style="color:var(--accent2)">${v}</span>`;
  if (typeof v === 'number') return `<span style="color:#1e40af">${v}</span>`;
  return String(v).slice(0, 40);
}

function renderNestedRow(obj, depth) {
  if (obj === null || obj === undefined) return '<span style="color:var(--text3)">null</span>';
  if (typeof obj !== 'object') return fmtVal(obj);
  if (Array.isArray(obj)) {
    if (!obj.length) return '<span style="color:var(--text3)">[]</span>';
    if (typeof obj[0] !== 'object') return `<span style="color:#0891b2">[${obj.join(', ')}]</span>`;
    return `<div style="padding-left:${depth > 0 ? 12 : 0}px">${obj.slice(0,3).map(item => `<div style="margin:2px 0;">${renderNestedRow(item, depth+1)}</div>`).join('')}${obj.length > 3 ? `<div style="color:var(--text3);font-size:9px;">+${obj.length-3} more</div>` : ''}</div>`;
  }
  const pad = depth * 12;
  return Object.entries(obj).map(([k, v]) => {
    const isObj = v && typeof v === 'object';
    const valHtml = isObj ? `<div style="padding-left:12px;">${renderNestedRow(v, depth+1)}</div>` : `<span>${fmtVal(v)}</span>`;
    return `<div style="display:flex;gap:6px;padding:1px 0;padding-left:${pad}px;align-items:${isObj?'flex-start':'center'};">
      <span style="color:#3b6ef5;font-size:10px;white-space:nowrap;min-width:120px;flex-shrink:0;">${k}</span>
      <span style="font-size:10px;">${valHtml}</span>
    </div>`;
  }).join('');
}