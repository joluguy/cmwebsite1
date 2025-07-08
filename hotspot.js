// hotspot.js

console.log('hotspot.js Loaded');
window.ambientCell = null;

document.addEventListener('DOMContentLoaded', () => {
  const sub = localStorage.getItem('selectedSubstation') || '[Substation Not Set]';
  document.getElementById('substationHeader').textContent = `Entering data for '${sub}'`;

  // wire up downloads first (so they work even if init fails)
  document.getElementById('downloadExcelBtn')?.addEventListener('click', downloadExcel);
  document.getElementById('downloadDocBtn')?.addEventListener('click', downloadDoc);
  document.getElementById('downloadPdfBtn')?.addEventListener('click', downloadPdf);

  // now initialize rows safely
  try {
    loadHotspotData();
    addRow();
    renderLive();
  } catch (e) {
    console.error('Hotspot init failed:', e);
  }
});

// --- Options ---
const location1Opts = ['PTR-1','PTR-2','PTR-3','PTR-4','PTR-5','PTR-6','PTR-7','Station Service Transformer','Other'];
const location2Opts = [
  'HV Bushing Connector','LV Bushing Connector','HV Bushing Stud','LV Bushing Stud','CT Connector',
  'VCB Upper Pad Connector','VCB Lower Pad Connector','VCB Upper & Lower Pad Connector','VCB Upper Pad','VCB Lower Pad',
  '1st Isolator','1st DP','Isolator before CT','Isolator after VCB','Isolator before VCB',
  'HV LA Internal Hotspot','LV LA Internal Hotspot','11KV Feeder Isolator','Cable Socket Nut-Bolt','Other'
];
const condMap = {
  isolator: ['Pad Connector','Female Contact','Pad Connector & Female Contact','Other'],
  feeder: ['Female Dropper Connector','Male-Female Contact','Flexible Cord Upper Side Connector',
           'Flexible Cord Lower Side Connector','Flexible Cord Lower Side Binding',
           'Flexible Cord Lower side to Pin Binding','Flexible Cord Lower side to Pin Binding & Conductor','Other']
};
const sideOpts = ['Both Sides','PTR Side','Bus Side','CT Side','VCB Side','Line Side','Incomer Side','Isolator Side','Cable Side','LA Side','Station Service Transformer Side','Other'];

// ── full-form lookup for feeder-isolator checkboxes ──
const feederFullMap = {
  'FDC':  'Female Dropper Connector',
  'FCUSC':'Flexible Cord Upper Side Connector',
  'FCLSC':'Flexible Cord Lower Side Connector',
  'FC':   'Flexible Cord',
  'MF Cont.':'Male-Female Contact',
  'C-S Nut Bolt':'Cable-Socket Nut-Bolt'
};



// --- Helpers ---
function createSelect(opts) {
  const sel = document.createElement('select');
  sel.innerHTML = '<option value=""></option>' + opts.map(o => `<option>${o}</option>`).join('');
  return sel;
}

// --- Add Row ---
function addRow() {
  const tbody = document.querySelector('#hotspotTable tbody');
  const tr = document.createElement('tr');

  // Serial No.
  tr.insertCell().textContent = tbody.rows.length + 1;

  // Hotspot Location 3-tier
  const tdLoc = tr.insertCell();
  const sel1 = createSelect(location1Opts);
  sel1.addEventListener('change', function() {
  if (this.value === 'Other') {
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = 'Enter other…';
    inp.addEventListener('input', renderLive);
    this.replaceWith(inp);
  }
  renderLive();
});
  const sel2 = createSelect(location2Opts);
  sel2.addEventListener('change', function() {
  const row = this.closest('tr');
  const v = this.value;

  if (v === 'Other') {
    // … your existing “Other” swap code …
  }
  else if (v === '11KV Feeder Isolator') {
    applyFeederIsolator(row);
  }
  else {
    // normal 3-tier logic (isolators etc)
    onLoc2Change.call(this);
    // ensure phase cells go back to side-dropdowns
    resetPhaseCells(row);
  }

  renderLive();
});


  let sel3 = null;


// special case: transform the four phase cells when 11KV Feeder Isolator is picked
function applyFeederIsolator(row) {
  // 1) drop the location-tier-3 if it exists
  if (sel3) { sel3.remove(); sel3 = null; }

  // 2) for each phase cell: remove the side dropdown, inject checkboxes + text
  row.querySelectorAll('.phase-cell').forEach(td => {
    // remove old side-selector
    const oldSel = td.querySelector('.phase-side-select');
    if (oldSel) oldSel.remove();

    // clear any existing feeder widgets (in case of reselection)
    td.querySelectorAll('.feeder-cb-container, .feeder-other-input').forEach(el => el.remove());

    // checkbox container
    const cbContainer = document.createElement('div');
    cbContainer.className = 'feeder-cb-container';

    ['FDC','MF Cont.','FCUSC','FCLSC','FC','C-S Nut Bolt'].forEach(opt => {
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = opt;
      cb.addEventListener('change', renderLive);

      const lbl = document.createElement('label');
      lbl.textContent = opt;
      lbl.prepend(cb);

      cbContainer.appendChild(lbl);
    });

    // manual entry
    const otherInput = document.createElement('input');
    otherInput.type = 'text';
    otherInput.placeholder = 'Enter other…';
    otherInput.className = 'feeder-other-input';
    otherInput.addEventListener('input', renderLive);

    td.append(cbContainer, otherInput);
  });
}

// reset phase cells back to normal dropdowns
function resetPhaseCells(row) {
  // remove any feeder checkboxes / text
  row.querySelectorAll('.feeder-cb-container, .feeder-other-input').forEach(el => el.remove());

  // re-attach a side-dropdown to any phase cell that's missing it
  row.querySelectorAll('.phase-cell').forEach(td => {
    if (!td.querySelector('.phase-side-select')) {
      const sideSel = createSelect(sideOpts);
      sideSel.classList.add('phase-side-select');
      sideSel.addEventListener('change', renderLive);
      td.append(sideSel);
    }
  });
}




  function onLoc2Change() {
    // 1) drop old third control
    if (sel3) { sel3.remove(); sel3 = null; }

    // 2) choose new third control
    const v = sel2.value;
    if (['1st Isolator','1st DP','Isolator before CT','Isolator after VCB','Isolator before VCB'].includes(v)) {
      sel3 = createSelect(condMap.isolator);
    } 



else if (v === 'Other') {
      sel3 = document.createElement('input');
      sel3.type = 'text';
      sel3.placeholder = 'Enter other…';
    }

    // 3) if it’s a select, bind its own “Other” swap
    if (sel3 && sel3.tagName === 'SELECT') {
      sel3.addEventListener('change', function() {
        if (this.value === 'Other') {
          const inp3 = document.createElement('input');
          inp3.type = 'text';
          inp3.placeholder = 'Enter other…';
          inp3.addEventListener('input', renderLive);
          this.replaceWith(inp3);
        }
        renderLive();
      });
    }
    // 4) always bind render on input
    if (sel3 && sel3.tagName !== 'SELECT') {
      sel3.addEventListener('input', renderLive);
    }

    // 5) append only the third control (never re-append sel1/sel2!)
    if (sel3) tdLoc.append(sel3);
    renderLive();
  }

  tdLoc.append(sel1, sel2);

// Ambient Temp (static cell with dynamic rowSpan)
  if (!window.ambientCell) {
    const tdAmb = tr.insertCell();
    const ambInput = document.createElement('input');
    ambInput.id = 'ambientInput';
    ambInput.type = 'number';
    ambInput.placeholder = '°C';
    ambInput.addEventListener('input', renderLive);
    tdAmb.append(ambInput);
    tdAmb.rowSpan = 1;
    window.ambientCell = tdAmb;
  } else {
    // only increase span—do not insert an extra cell
    window.ambientCell.rowSpan++;
  }

  // Phases R/Y/B/Neutral

for (let i = 0; i < 4; i++) {
  const td = tr.insertCell();
  td.classList.add('phase-cell');                // <— mark it

  const num = document.createElement('input');
  num.type = 'number';
  num.placeholder = '°C';
  num.addEventListener('input', renderLive);

  const sideSel = createSelect(sideOpts);
  sideSel.classList.add('phase-side-select');     // <— mark the dropdown
  sideSel.addEventListener('change', renderLive);

  td.append(num, sideSel);
}


  // Image Code
  const tdImg = tr.insertCell();
  const imgInput = document.createElement('input'); imgInput.type='text'; imgInput.placeholder='Code'; imgInput.addEventListener('input', renderLive);
  tdImg.append(imgInput);

  // Remarks
  const tdRem = tr.insertCell();
  const remInput = document.createElement('input'); remInput.type='text'; remInput.placeholder='Remarks'; remInput.addEventListener('input', renderLive);
  tdRem.append(remInput);

  // Action
  const tdAct = tr.insertCell();
  const delBtn = document.createElement('button'); delBtn.textContent='Delete'; delBtn.className='remove-btn'; delBtn.onclick = () => {
  tr.remove();
  if (window.ambientCell) {
    window.ambientCell.rowSpan--;
    if (window.ambientCell.rowSpan === 0) {
      window.ambientCell.remove();
      window.ambientCell = null;
    }
  }
  renderLive();
};
  tdAct.append(delBtn);

  tbody.append(tr);
  renderLive();
}

// --- Save/Load ---
function saveHotspotData() {
  const data = [];
  document.querySelectorAll('#hotspotTable tbody tr').forEach(tr => {
    const locEls = tr.cells[1].querySelectorAll('select,input');
    data.push({
      loc1: locEls[0]?.value || '',
      loc2: locEls[1]?.value || '',
      loc3: locEls[2]?.value || '',
      ambient: document.getElementById('ambientInput').value,
      r: tr.cells[3].querySelector('input').value,
      rSide: tr.cells[3].querySelector('select')?.value || '',
      y: tr.cells[4].querySelector('input').value,
      ySide: tr.cells[4].querySelector('select')?.value || '',
      b: tr.cells[5].querySelector('input').value,
      bSide: tr.cells[5].querySelector('select')?.value || '',
      n: tr.cells[6].querySelector('input').value,
      nSide: tr.cells[6].querySelector('select')?.value || '',
      img: tr.cells[7].querySelector('input').value,
      remarks: tr.cells[8].querySelector('input').value
    });
  });
  localStorage.setItem('hotspotData', JSON.stringify(data));
  alert('Hotspot data saved.');
}

function loadHotspotData() {
  const saved = JSON.parse(localStorage.getItem('hotspotData')||'[]');
  if (!saved.length) return;
  const tbody = document.querySelector('#hotspotTable tbody'); tbody.innerHTML = '';
  saved.forEach(rec => {
    addRow();
    const tr = tbody.lastChild;
    const els = tr.cells[1].querySelectorAll('select,input');
    els[0].value = rec.loc1;
    els[1].value = rec.loc2;
    if (els[2]) els[2].value = rec.loc3;
    document.getElementById('ambientInput').value = rec.ambient;
    ['r','y','b','n'].forEach((c,idx) => {
      const cell = tr.cells[3+idx]; cell.querySelector('input').value = rec[c];
      const sel = cell.querySelector('select'); if (sel) sel.value = rec[c+'Side'];
    });
    tr.cells[7].querySelector('input').value = rec.img;
    tr.cells[8].querySelector('input').value = rec.remarks;
  });
}

// --- Render Live Table ---
function renderLive() {
  const lt = document.querySelector('#hotspotLiveTable tbody'); lt.innerHTML = '';
  const rows = document.querySelectorAll('#hotspotTable tbody tr');
  const n = rows.length;

// figure out which rows are LA hotspots
// figure out which rows are LA hotspots
const laStatuses = Array.from(rows).map(tr => {
  const locEls = tr.cells[1].querySelectorAll('select,input');
  const loc2 = locEls[1]?.value;
  return loc2 === 'HV LA Internal Hotspot'
      || loc2 === 'LV LA Internal Hotspot';
});

// compute contiguous non-LA blocks so we only merge adjacent rows
const rowSpanMap = {};
let segStart = null;
laStatuses.forEach((isLA, idx) => {
  if (!isLA) {
    if (segStart === null) segStart = idx;
  } else if (segStart !== null) {
    rowSpanMap[segStart] = idx - segStart;
    segStart = null;
  }
});
if (segStart !== null) {
  rowSpanMap[segStart] = rows.length - segStart;
}



  rows.forEach((tr,i) => {
    const rrow = lt.insertRow();
    rrow.insertCell().textContent = i+1;


// ── Location text with special feeder-isolator formatting ──
const locEls = tr.cells[1].querySelectorAll('select,input');
const loc1 = locEls[0]?.value || '';
const loc2 = locEls[1]?.value || '';
let text;

if (loc2 === '11KV Feeder Isolator') {
  // base: e.g. "Ckt-1 11KV Feeder Isolator"
  text = [loc1, loc2].filter(v => v).join(' ');

  // collect per-phase selections
  const phaseNames = ['R','Y','B','Neutral'];
  const phaseGroups = [];

  phaseNames.forEach((ph, idx) => {
    // original table cell index for this phase
    const offset = (i === 0) ? 3 : 2;
    const phaseCell = tr.cells[offset + idx];

    // 1) checkboxes
    const checked = Array.from(
      phaseCell.querySelectorAll('.feeder-cb-container input:checked')
    ).map(cb => cb.value);

    // 2) manual-other text
    const other = phaseCell.querySelector('.feeder-other-input')?.value.trim();
    if (other) checked.push(other);

    if (checked.length) {
      // map to full forms and join
      const parts = checked.map(opt => feederFullMap[opt] || opt);
      phaseGroups.push(`${parts.join(' & ')} (${ph} Phase)`);
    }
  });

  if (phaseGroups.length) {
    text += ' ' + phaseGroups.join('; ');
  }
} else {
  // ── fallback to your original dropdown-side logic ──
  text = Array.from(locEls).map(e => e.value).filter(v => v).join(' ');

  let sideText = '';
  ['R','Y','B','Neutral'].forEach((ph, idx) => {
    const offset = (i === 0) ? 3 : 2;
    const cell = tr.cells[offset + idx];
    const side = cell.querySelector('select')?.value;
    if (side) sideText += `${ph} Phase: ${side}, `;
  });
  if (sideText) {
    sideText = sideText.slice(0, -2);
    text += ` (${sideText})`;
  }
}

rrow.insertCell().textContent = text || '---';



    // Ambient
    if (i === 0) {const c = rrow.insertCell(); const ambEl = document.getElementById('ambientInput'); c.textContent = (ambEl ? ambEl.value : '') || '---'; c.rowSpan = n;}

    // R/Y/B/N
const offset = (i === 0) ? 3 : 2;
['r','y','b','n'].forEach((c, idx) => {
  const cell = tr.cells[offset + idx];
  const v = cell.querySelector('input').value || '---';
  rrow.insertCell().textContent = v;
});



    // Image Code
    rrow.insertCell().textContent = tr.cells[7].querySelector('input').value || '---';
    // Remarks
// Action to be Taken
if (laStatuses[i]) {
  // per-row Lightning Arrestor replacement
  const c = rrow.insertCell();
  c.textContent = 
    'The Lightning Arrestor is to be replaced with a healthy one';
  c.contentEditable = true;
}
else if (rowSpanMap[i]) {
  // start of a contiguous “other” block → merge exactly that many rows
  const span = rowSpanMap[i];
  const c = rrow.insertCell();
  c.textContent =
    'All the hotspots detected at switchyard must be rectified to avoid unplanned outage of supply and emergency shutdown. The IR Images are attached for ready reference.';
  c.contentEditable = true;
  c.rowSpan = span;
}
// for other non-LA rows in a block we do nothing (they’re covered by the above rowspan)

// (for the other non-LA rows covered by rowSpan, we skip inserting a cell)

  });
}

// --- Download Excel/Doc/PDF ---
function downloadExcel() {
  const tbl=document.getElementById('hotspotLiveTable').cloneNode(true);
  tbl.querySelectorAll('thead th').forEach(th=>{ th.style.fontFamily='Cambria'; th.style.fontSize='12pt'; th.style.fontWeight='bold'; th.style.backgroundColor='#d9d9d9'; th.style.color='#000'; });
  tbl.querySelectorAll('tbody tr').forEach(tr=>tr.querySelectorAll('td').forEach(td=>{ td.style.fontFamily='Cambria'; td.style.fontSize='12pt'; td.style.backgroundColor='#dce6f2'; td.style.color='#000'; }));
  const html='<html><head><meta charset="utf-8"></head><body>'+tbl.outerHTML+'</body></html>';
  const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel' });
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=`Hotspot_${new Date().toISOString().split('T')[0]}.xls`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
function downloadDoc() {
  const tbl=document.getElementById('hotspotLiveTable').cloneNode(true);
  const pre='<!DOCTYPE html><html><head><meta charset="utf-8"><style>'+
    'table{border-collapse:collapse;width:100%;}@page{size:landscape;}'+
    'thead th{font-family:Cambria;font-size:12pt;font-weight:bold;background:#d9d9d9;color:#000;}'+
    'tbody td{font-family:Cambria;font-size:12pt;background:#dce6f2;color:#000;}'+
    'th,td{border:1px solid #000;}'+'</style></head><body>';
  const html=pre+tbl.outerHTML+'</body></html>';
  const blob=window.htmlDocx.asBlob(html,{orientation:'landscape',margins:{top:720,right:720,bottom:720,left:720}});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`Hotspot_${new Date().toISOString().split('T')[0]}.docx`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
function downloadPdf() {
  const original=document.getElementById('hotspotLiveTable');
  const clone=original.cloneNode(true);
  // inline black text + backgrounds
  clone.querySelectorAll('th').forEach(th=>{ th.style.color='#000'; th.style.backgroundColor='#d9d9d9'; th.style.fontFamily='Cambria'; th.style.fontSize='12pt'; th.style.fontWeight='bold'; });
  clone.querySelectorAll('td').forEach(td=>{ td.style.color='#000'; td.style.backgroundColor='#dce6f2'; td.style.fontFamily='Cambria'; td.style.fontSize='12pt'; });
  const wrapper=document.createElement('div'); wrapper.style.position='absolute'; wrapper.style.left='-9999px'; wrapper.appendChild(clone);
  document.body.appendChild(wrapper);
  html2pdf().set({margin:10,filename:`Hotspot_${new Date().toISOString().split('T')[0]}.pdf`,jsPDF:{unit:'pt',format:'a4',orientation:'landscape'},html2canvas:{scale:2}}).from(clone).save().finally(()=>wrapper.remove());
}
