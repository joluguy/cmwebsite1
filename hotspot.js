// hotspot.js

console.log('hotspot.js Loaded');

document.addEventListener('DOMContentLoaded', () => {
  const sub = localStorage.getItem('selectedSubstation') || '[Substation Not Set]';
  document.getElementById('substationHeader').textContent = `Entering data for '${sub}'`;

  loadHotspotData();
  addRow();
  renderLive();

  document.getElementById('downloadExcelBtn').addEventListener('click', downloadExcel);
  document.getElementById('downloadDocBtn').addEventListener('click', downloadDoc);
  document.getElementById('downloadPdfBtn').addEventListener('click', downloadPdf);
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
  // if they pick “Other” in the 2nd menu, swap it out
  if (this.value === 'Other') {
    // drop any existing 3rd control
    if (sel3) { sel3.remove(); sel3 = null; }
    const inp2 = document.createElement('input');
    inp2.type = 'text';
    inp2.placeholder = 'Enter other…';
    inp2.addEventListener('input', renderLive);
    this.replaceWith(inp2);
  }
  else {
    // otherwise run your existing tier-3 logic
    onLoc2Change.call(this);
  }
});

  let sel3 = null;

  function onLoc2Change() {
    if (sel3) { sel3.remove(); sel3 = null; }
    const v = sel2.value;
    if (['1st Isolator','1st DP','Isolator before CT','Isolator after VCB','Isolator before VCB'].includes(v)) {
      sel3 = createSelect(condMap.isolator);
    } else if (v === '11KV Feeder Isolator') {
      sel3 = createSelect(condMap.feeder);
    } else if (v === 'Other') {
      sel3 = document.createElement('input');
      sel3.type = 'text'; sel3.placeholder='Enter other...';
    }
    if (sel3) {
  if (sel3.tagName === 'SELECT') {
    // if it's a select, watch for “Other” and swap it out
    sel3.addEventListener('change', function() {
      if (this.value === 'Other') {
        const inp3 = document.createElement('input');
        inp3.type = 'text';
        inp3.placeholder = 'Enter other…';
        inp3.addEventListener('input', renderLive);
        this.replaceWith(inp3);
        renderLive();
      }
    });
  } else {
    // if it’s already an input, keep your live-render binding
    sel3.addEventListener('input', renderLive);
  }
}

    tdLoc.append(sel1, sel2);
    if (sel3) tdLoc.append(sel3);
    renderLive();
  }

  tdLoc.append(sel1, sel2);

  // Ambient Temp
  let amb = document.getElementById('ambientInput');
  if (!amb) {
    amb = document.createElement('input');
    amb.id = 'ambientInput'; amb.type = 'number'; amb.placeholder = '°C';
    amb.addEventListener('input', renderLive);
  }
  tr.insertCell().append(amb);

  // Phases R/Y/B/Neutral
  for (let i = 0; i < 4; i++) {
    const td = tr.insertCell();
    const num = document.createElement('input'); num.type='number'; num.placeholder='°C'; num.addEventListener('input', renderLive);
    const sideSel = createSelect(sideOpts); sideSel.addEventListener('change', renderLive);
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
  const delBtn = document.createElement('button'); delBtn.textContent='Delete'; delBtn.className='remove-btn'; delBtn.onclick = () => { tr.remove(); renderLive(); };
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
  rows.forEach((tr,i) => {
    const rrow = lt.insertRow();
    rrow.insertCell().textContent = i+1;
    // Location text
    const locEls = tr.cells[1].querySelectorAll('select,input');
    let text = Array.from(locEls).map(e=>e.value).filter(v=>v).join(' ');
    const sides = ['R','Y','B','Neutral']
      .map((ph,idx)=>tr.cells[3+idx].querySelector('select')?.value||'')
      .filter(v=>v)
      .map((v,idx)=>`${['R','Y','B','Neutral'][idx]} Phase- ${v}`);
    if (sides.length) text += ` (${sides.join(', ')})`;
    rrow.insertCell().textContent = text||'---';
    // Ambient
    if (i===0) { const c=rrow.insertCell(); c.textContent=document.getElementById('ambientInput').value||'---'; c.rowSpan=n; }
    // R/Y/B/N
    ['r','y','b','n'].forEach((c,idx)=>{
      const v = tr.cells[3+idx].querySelector('input').value;
      rrow.insertCell().textContent = v||'---';
    });
    // Image Code
    rrow.insertCell().textContent = tr.cells[7].querySelector('input').value || '---';
    // Remarks
    if (i===0) { const c=rrow.insertCell(); c.textContent='All the hotspots detected at switchyard must be rectified to avoid unplanned outage of supply and emergency shutdown. The IR Images are attached for ready reference.'; c.contentEditable=true; c.rowSpan=n; }
  });
}

// --- Download Excel/Doc/PDF ---
function downloadExcel() {
  const tbl=document.getElementById('hotspotLiveTable').cloneNode(true);
  tbl.querySelectorAll('thead th').forEach(th=>{ th.style.fontFamily='Cambria'; th.style.fontSize='12pt'; th.style.fontWeight='bold'; th.style.backgroundColor='#d9d9d9'; th.style.color='#000'; });
  tbl.querySelectorAll('tbody tr').forEach(tr=>tr.querySelectorAll('td').forEach(td=>{ td.style.fontFamily='Cambria'; td.style.fontSize='12pt'; td.style.backgroundColor='#dce6f2'; td.style.color='#000'; }));
  const html='<html><head><meta charset="utf-8"></head><body>'+tbl.outerHTML+'</body></html>';
  const blob=new Blob(['﻿',html],{type:'application/vnd.ms-excel'});
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
