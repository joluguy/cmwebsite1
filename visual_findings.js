// visual_findings.js
// Definitions
const ptrList = ['PTR-1','PTR-2','PTR-3','PTR-4','PTR-5','PTR-6','PTR-7'];
const otherList = ['33KV CT','33KV PT','LA','33KV VCB','Other'];

// Data for PTR forms
const oilLeakCols = [
  ['R Phase HV Bushing','Y Phase HV Bushing','B Phase HV Bushing','R Phase HV Bushing Turret','Y Phase HV Bushing Turret','B Phase HV Bushing Turret','R Phase LV Bushing','Y Phase LV Bushing','B Phase LV Bushing','Neutral Bushing','R Phase LV Bushing Turret','Y Phase LV Bushing Turret','B Phase LV Bushing Turret','Neutral Bushing Turret'],
  ['Top Filtration Valve','Bottom Drain Valve','Top Sampling Valve','Conservator Tank Drain Valve','Tap Changer','MOG','POG','Buchholz Relay','OSR','Valve between Buchholz Relay & Conservator Tank','Top Tank near HV R Ph','Top Tank near HV Y Ph','Top Tank near HV B Ph','Top Tank near LV R Ph','Top Tank near LV Y Ph','Top Tank near LV B Ph','Top Tank near Neutral'],
  ['Upper side radiator valve near HV R Phase','Upper side radiator valve near HV Y Phase','Upper side radiator valve near HV B Phase','Lower side radiator valve near HV R Phase','Lower side radiator valve near HV Y Phase','Lower side radiator valve near HV B Phase','Upper side radiator valve near LV R Phase','Upper side radiator valve near LV Y Phase','Upper side radiator valve near LV B Phase','Upper side radiator valve near Neutral','Lower side radiator valve near LV R Phase','Lower side radiator valve near LV Y Phase','Lower side radiator valve near LV B Phase','Lower side radiator valve near Neutral'],
  ['Upper side radiator Plug near HV R Phase','Upper side radiator Plug near HV Y Phase','Upper side radiator Plug near HV B Phase','Lower side radiator Plug near HV R Phase','Lower side radiator Plug near HV Y Phase','Lower side radiator Plug near HV B Phase','Upper side radiator Plug near LV R Phase','Upper side radiator Plug near LV Y Phase','Upper side radiator Plug near LV B Phase','Upper side radiator Plug near Neutral','Lower side radiator Plug near LV R Phase','Lower side radiator Plug near LV Y Phase','Lower side radiator Plug near LV B Phase','Lower side radiator Plug near Neutral']
];
const otherCols = [
  ['Air-Oil Mix','M. Tank Oil Low','OLTC Oil Low','PTR Oil Check','Low Oil on M. Tank Breather Oil Pot','Low Oil on OLTC Breather Oil Pot','M. Tank Breather Oil Pot Empty','OLTC Breather Oil Pot Empty','Broken M. Tank Breather Oil Pot','Broken OLTC Breather Oil Pot','M. Tank Breather Oil Pot Missing','OLTC Breather Oil Pot Missing'],
  ['OTI >WTI','OTI=WTI','OTI Def.','WTI Def.','M. Tank Breather S. Gel.','OLTC Breather S. Gel.','MOG Def.','MOG Conn. Open','POG not Visible','MK Box Glass Cover Missing','MK Box Glass Cover Broken'],
  ['MK Box Flat Earthing','OLTC Flat Earthing','Neutral Double Flat Earthing','PTR Body Rusted','PTR Radiator Rusted','PTR Con. Tank Rusted'],
  ['OLTC Count']
];

// Other Observations data
const otherObsMap = {
  '33KV CT': ['O/L from PTR-1 R Phase CT','O/L from PTR-1 Y Phase CT'],
  '33KV PT': ['O/L from R Phase PT-1','O/L from Y Phase PT-1'],
  'LA': ['PTR-1 R Phase LA Missing'],
  '33KV VCB': ['VCB to be replaced'],
  'Other': ['Rusted Iron Structure','Rusted Isolator Handle','Rusted CT JB','Rusted PT JB','Rusted CT Body','Rusted PT Body','Rusted Earth Riser','Aerial Rail Pole Earth Spike Req.']
};

// Store entries
let liveData = [];
let currentEquipment = '';


// Initialize
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('substationHeader').innerText = `Entering data for '${localStorage.getItem('selectedSubstation')||''}'`;
  // Toggles
  const ptrToggle = document.getElementById('ptrToggle');
  const otherToggle = document.getElementById('otherToggle');
  ptrToggle.onclick = () => switchSection('ptr');
  otherToggle.onclick = () => switchSection('other');
  // Buttons
  const ptrButtons = document.getElementById('ptrButtons');
  ptrList.forEach(name => {
    const btn = document.createElement('button'); btn.textContent = name;
    btn.onclick = () => selectPTR(name);
    ptrButtons.appendChild(btn);
  });
  const otherButtons = document.getElementById('otherButtons');
  otherList.forEach(name => {
    const btn = document.createElement('button'); btn.textContent = name;
    btn.onclick = () => selectOther(name);
    otherButtons.appendChild(btn);
  });
  // init
  switchSection('ptr');
  selectPTR(ptrList[0]);
  renderLive();
  // Exports
  document.getElementById('exportExcel').onclick = exportExcel;
  document.getElementById('exportDoc').onclick = exportDoc;
  document.getElementById('exportPdf').onclick = exportPdf;
});


  // Save current liveData to localStorage
  document.getElementById('saveBtn').onclick = () => {
    localStorage.setItem('visualFindings', JSON.stringify(liveData));
    alert('Visual findings saved');
  };
  // Go back to switchyard page
  document.getElementById('backBtn').onclick = () => {
    window.location.href = 'switchyard.html';
  };



function switchSection(sec) {
  document.getElementById('ptrSection').classList.toggle('active', sec==='ptr');
  document.getElementById('otherSection').classList.toggle('active', sec==='other');
  document.getElementById('ptrToggle').classList.toggle('active', sec==='ptr');
  document.getElementById('otherToggle').classList.toggle('active', sec==='other');
}

// PTR Handling
function selectPTR(name) {
  currentEquipment = name;
  // Highlight only the clicked PTR button
  document.querySelectorAll('#ptrButtons button').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === name);
  });
  buildPTRForm(name);
}




function buildPTRForm(equip) {
  const c = document.getElementById('ptrFormContainer'); c.innerHTML='';
  const div = document.createElement('div'); div.className='form-container';
  // Oil Leakages
  // Oil Leakages Accordion
  const osec = document.createElement('div');
  osec.className = 'form-section';
  osec.innerHTML = `<h2>${equip} Observations</h2><h3>Oil Leakages</h3>`;
  // define groups
  const groups = {
    'Bushing O/L': [
      'R Phase HV Bushing','Y Phase HV Bushing','B Phase HV Bushing',
      'R Phase HV Bushing Turret','Y Phase HV Bushing Turret','B Phase HV Bushing Turret',
      'R Phase LV Bushing','Y Phase LV Bushing','B Phase LV Bushing','Neutral Bushing',
      'R Phase LV Bushing Turret','Y Phase LV Bushing Turret','B Phase LV Bushing Turret','Neutral Bushing Turret'
    ],
    'Top Tank O/L': [
      'Top Tank near HV R Ph','Top Tank near HV Y Ph','Top Tank near HV B Ph',
      'Top Tank near LV R Ph','Top Tank near LV Y Ph','Top Tank near LV B Ph',
      'Top Tank near Neutral','Top Tank above MK Box','Top Tank above OLTC'
    ],
    'Radiator Valve O/L': [
      'Upper side radiator valve near HV R Phase','Upper side radiator valve near HV Y Phase',
      'Upper side radiator valve near HV B Phase','Lower side radiator valve near HV R Phase',
      'Lower side radiator valve near HV Y Phase','Lower side radiator valve near HV B Phase',
      'Upper side radiator valve near LV R Phase','Upper side radiator valve near LV Y Phase',
      'Upper side radiator valve near LV B Phase','Upper side radiator valve near Neutral',
      'Lower side radiator valve near LV R Phase','Lower side radiator valve near LV Y Phase',
      'Lower side radiator valve near LV B Phase','Lower side radiator valve near Neutral'
    ],
    'Radiator Plug O/L': [
      'Upper side radiator Plug near HV R Phase','Upper side radiator Plug near HV Y Phase',
      'Upper side radiator Plug near HV B Phase','Lower side radiator Plug near HV R Phase',
      'Lower side radiator Plug near HV Y Phase','Lower side radiator Plug near HV B Phase',
      'Upper side radiator Plug near LV R Phase','Upper side radiator Plug near LV Y Phase',
      'Upper side radiator Plug near LV B Phase','Upper side radiator Plug near Neutral',
      'Lower side radiator Plug near LV R Phase','Lower side radiator Plug near LV Y Phase',
      'Lower side radiator Plug near LV B Phase','Lower side radiator Plug near Neutral'
    ],
    'Other O/L': [
      'Top Filtration Valve','Bottom Drain Valve','Top Sampling Valve','Conservator Tank Drain Valve',
      'Tap Changer','MOG','POG','Buchholz Relay','OSR','Valve between Buchholz Relay & Conservator Tank'
    ]
  };

  Object.entries(groups).forEach(([title, items]) => {
    // header button
    const btn = document.createElement('button');
    btn.className = 'accordion-btn';
    btn.textContent = title;
    btn.onclick = () => {
      // toggle active
      osec.querySelectorAll('.accordion-btn').forEach(b=>b.classList.remove('active'));
      osec.querySelectorAll('.grid').forEach(g=>g.style.display='none');
      btn.classList.add('active');
      grid.style.display = 'grid';
    };
    osec.appendChild(btn);

    // grid
    const grid = document.createElement('div');
    grid.className = 'grid';
    grid.style.display = 'none';
    items.forEach(val=>{
      const lbl = document.createElement('label');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = val;
      cb.onchange = () => savePTR(equip);
      lbl.appendChild(cb);
      lbl.append(val);
      grid.appendChild(lbl);
    });
    osec.appendChild(grid);
  });

  // activate first group by default
  const firstBtn = osec.querySelector('.accordion-btn');
  const firstGrid = osec.querySelector('.grid');
  firstBtn.classList.add('active');
  firstGrid.style.display = 'grid';

// Add manual Oil Leakage entry
const customOilDiv = document.createElement('div');
customOilDiv.className = 'custom-input';
customOilDiv.innerHTML = `
  <input id="customOilInput" placeholder="Other leakage..." type="text"/>
  <button onclick="addCustomOil()">Add</button>`;
osec.appendChild(customOilDiv);
  


div.appendChild(osec);

  // Other Findings
  const fsec=document.createElement('div'); fsec.className='form-section';
  fsec.innerHTML=`<h3>Other Findings</h3>`;
  otherCols.forEach((col,i)=>{
    const colDiv=document.createElement('div'); colDiv.className='grid';
    col.forEach(val=>{
      if(val==='OLTC Count'){
        const lbl=document.createElement('label'); lbl.textContent=val; const inp=document.createElement('input'); inp.type='number'; inp.oninput=()=>savePTR(equip);
        lbl.appendChild(inp); colDiv.appendChild(lbl);
      } else {
        const lbl=document.createElement('label'); const cb=document.createElement('input'); cb.type='checkbox'; cb.value=val;
        cb.onchange=()=>savePTR(equip);
        lbl.appendChild(cb); lbl.append(val); colDiv.appendChild(lbl);
      }
    }); fsec.appendChild(colDiv);
  });
  div.appendChild(fsec);

  // — Add manual “Other finding…” entry field —
  const customOtherDiv = document.createElement('div');
  customOtherDiv.className = 'other-entry';
  customOtherDiv.innerHTML = `
    <input id="customOtherInput" placeholder="Other finding..." type="text"/>
    <button onclick="addCustomOther()">Add</button>
  `;
  div.appendChild(customOtherDiv);


  c.appendChild(div);
  savePTR(equip);
}

function savePTR(equip) {
  // clear existing for this equip
  // Remove only the auto-generated rows, but keep manual ones
liveData = liveData.filter(r => !(r.equipment === equip && !r.manual));
  // Oil
  // Oil (only from the first form-section)
  const oil = Array.from(
    document.querySelectorAll(
      '#ptrFormContainer .form-section:nth-of-type(1) input[type="checkbox"]:checked'
    )
  ).map(cb => cb.value);


  if(oil.length){
    const txt = oil.length>1?
      `Oil leakages were found from ${oil.join(' & ')} --- These oil leakages must be arrested.`:
      `Oil leakage was found from ${oil[0]} --- This oil leakage must be arrested.`;
    liveData.push({equipment:equip,action:txt});
  }
  // Other
  document.querySelectorAll('#ptrFormContainer .form-section:nth-child(2) input').forEach(inp=>{
    if(inp.type==='checkbox'&&inp.checked){
      liveData.push({equipment:equip,action:otherDesc(inp.value)});
    } else if(inp.tagName==='INPUT'&&inp.type==='number'&&inp.value){
      liveData.push({equipment:equip,action:`OLTC counter was been found ${inp.value}. BDV of the oil of OLTC chamber to be checked. If BDV found low appropriate action to be taken.`});
    }
  });
  renderLive();
}

function oilDesc(v){ return true; }
function otherDesc(val){
  const map = {
    'Air-Oil Mix':'It has been observed in POG that air is present in the conservator tank. The bellow of the PTR is not properly filled with air. Appropriate action to be taken to rectify the problem.',
    'M. Tank Oil Low':'Low oil level has been found. Action must be taken to maintain desired oil level in the transformer as per oil filling procedure of manufacturer.',
    'OLTC Oil Low':'Low oil level has been found on OLTC. Action must be taken to maintain desired oil level in the transformer as per oil filling procedure of manufacturer.',
    'PTR Oil Check':'Oil Level is to be checked. If found low, necessary action towards oil filling as per oil filling procedure of manufacturer is to be done.',
    'Low Oil on M. Tank Breather Oil Pot':'Low Oil level was found on the Oil pot of main tank breather. Appropriate action to be taken.',
    'Low Oil on OLTC Breather Oil Pot':'Low Oil level was found on the Oil pot of OLTC conservator tank breather. Appropriate action to be taken.',
    'M. Tank Breather Oil Pot Empty':'Oil pot of main tank breather was found empty. Appropriate action to be taken.',
    'OLTC Breather Oil Pot Empty':'Oil pot of OLTC conservator tank breather was found empty. Appropriate action to be taken.',
    'Broken M. Tank Breather Oil Pot':'Oil pot of the main tank breather was found broken. Appropriate action to be taken.',
    'Broken OLTC Breather Oil Pot':'Oil pot of the OLTC conservator tank breather was found broken. Appropriate action to be taken.',
    'M. Tank Breather Oil Pot Missing':'Oil pot of the Main Tank conservator tank breather was found missing. Appropriate action to be taken.',
    'OLTC Breather Oil Pot Missing':'Oil pot of the OLTC conservator tank breather was found missing. Appropriate action to be taken.',
    'OTI >WTI':'OTI temperature has found higher than WTI temperature. So, proper checking of thermal image sensor against their respective pocket is to be done. If found ok, then cleaning of OTI/WTI thermal image sensor is to be done and also, WTI & OTI pockets to be filled with transformer oil. Calibration test of OTI & WTI may also be done.',
    'OTI=WTI':'OTI temperature has been found same as WTI temperature. So, cleaning of OTI/WTI thermal image sensor is to be done and also, WTI & OTI pockets to be filled with transformer oil. Calibration test of OTI & WTI may also be done.',
    'OTI Def.':'OTI was found to be defective. Appropriate action to be taken.',
    'WTI Def.':'WTI was found to be defective. Appropriate action to be taken.',
    'M. Tank Breather S. Gel.':'Silica gel of the PTR Conservator Tank breather must be replaced.',
    'OLTC Breather S. Gel.':'Silica gel of the OLTC Conservator Tank breather must be replaced.',
    'MOG Def.':'MOG was found to be defective. Necessary action is to be taken.',
    'MOG Conn. Open':'MOG connections were found to be open. Necessary action is to be taken.',
    'POG not Visible':'POG was found to be hazy and not properly visible. The same is to be checked.',
    'MK Box Glass Cover Missing':'Glass Cover of the Marshalling Kiosk was found missing. Appropriate action must be taken.',
    'MK Box Glass Cover Broken':'MK Box Glass Cover was found broken. Appropriate action to be taken to rectify the problem.',
    'MK Box Flat Earthing':'MK box is to be earthed though flat and is to be connected with PTR Body earthing.',
    'OLTC Flat Earthing':'OLTC Chamber is to be earthed though flat and is to be connected with PTR Body earthing.',
    'Neutral Double Flat Earthing':'PTR Neutral is to be earth though Double Flat and is to be connected with the PTR body earthing.',
    'PTR Body Rusted':'Rust formation on PTR body was observed. The same must be cleaned and painted with weather resisting non fading paint of Dark Admiralty Grey as per technical specification of WBSEDCL.',
    'PTR Radiator Rusted':'Rust formation on PTR Radiator was observed. The same must be cleaned and painted with weather resisting non fading paint of Dark Admiralty Grey as per technical specification of WBSEDCL.',
    'PTR Con. Tank Rusted':'Rust formation on PTR Conservator Tank was observed. The same must be cleaned and painted with weather resisting non fading paint of Dark Admiralty Grey as per technical specification of WBSEDCL.'
  };
  return map[val] || '';
}

// Render live table
function renderLive() {
  const tbody = document.querySelector('#liveTable tbody');
  const priorities = [...ptrList, ...otherList, 'Other']; // ensure “Other” last
  let html = '';
  let sl = 1;

  // Build rows in priority order, merging equipment cells
  priorities.forEach(equip => {
    // grab all rows for this equip, but sort so manual:true always come last
const group = liveData
  .filter(r => r.equipment === equip)
  .sort((a, b) => (a.manual ? 1 : 0) - (b.manual ? 1 : 0));

    if (!group.length) return;
    group.forEach((row, idx) => {
      if (idx === 0) {
        html += `
          <tr>
            <td>${sl}</td>
            <td rowspan="${group.length}">${equip}</td>
            <td>${row.action}</td>
          </tr>`;
      } else {
        html += `
          <tr>
            <td>${sl}</td>
            <td>${row.action}</td>
          </tr>`;
      }
      sl++;
    });
  });

  // Fallback
  tbody.innerHTML = html || '<tr><td colspan="3">No data yet.</td></tr>';
}


// Export functions (using libraries loaded on page)
function exportExcel() {
  // Converts the live table to a workbook and downloads as .xlsx
  const wb = XLSX.utils.table_to_book(
    document.getElementById('liveTable'),
    { sheet: 'Findings' }
  );
  XLSX.writeFile(wb, `VisualFindings_${new Date().toISOString().slice(0,10)}.xlsx`);
}

function exportDoc() {
  // Wraps the table HTML in a docx Blob and triggers download
  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>'
             + document.getElementById('liveTable').outerHTML
             + '</body></html>';
  const blob = window.htmlDocx.asBlob(html);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `VisualFindings_${new Date().toISOString().slice(0,10)}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportPdf() {
  // Uses html2pdf to print the table to PDF
  html2pdf()
    .set({
      margin: 10,
      filename: `VisualFindings_${new Date().toISOString().slice(0,10)}.pdf`,
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'landscape' }
    })
    .from(document.getElementById('liveTable'))
    .save();
}

// Helpers for manual entries
function addCustomOil() {
  const v = document.getElementById('customOilInput').value.trim();
  if (!v) return;
  const activeGrid = document.querySelector(
    '#ptrFormContainer .form-section:nth-of-type(1) .grid[style*="display: grid"]'
  );
  const lbl = document.createElement('label');
  const cb  = document.createElement('input');
  cb.type = 'checkbox'; cb.value = v; cb.onchange = () => savePTR(currentEquipment);
  lbl.appendChild(cb); lbl.append(v);
  activeGrid.appendChild(lbl);
  document.getElementById('customOilInput').value = '';
  savePTR(currentEquipment);
}

function addCustomOther() {
  const v = document.getElementById('customOtherInput').value.trim();
  if (!v) return;
  liveData.push({ equipment: currentEquipment, action: v, manual: true });
  renderLive();
  document.getElementById('customOtherInput').value = '';
}


