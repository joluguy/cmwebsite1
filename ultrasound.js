// === Configuration ===
const equipmentOptions = [
  '33KV CT','33KV PT','33KV VCB','Bushing','Cable',
  'Lightning Arrestor','33KV Pin Insulator','11KV Pin Insulator',
  'Post Insulator','Conductor','Other'
];
const locationOptions = [
  'PTR-1','PTR-2','PTR-3','PTR-4','PTR-5','PTR-6','PTR-7',
  'Bus PT','PT-1','PT-2','PT-3','Station Service Transformer','Other'
];
const sideOptions = [
  'Both Sides','PTR Side','Bus Side','CT Side','VCB Side','LA Side','Line Side',
  'Incoming Side','Cable Side','Station Transformer Side','Other'
];
const classifications = [
  'Corona','Destructive Corona','Mild Tracking','Tracking',
  'Corona with Mild Tracking','Corona with Tracking',
  'Destructive Corona with Tracking','Severe Tracking',
  'Corona with Severe Tracking','Arcing'
];

// priority list: highest (0) to lowest (9); any other => 10
const priorityList = [
  '33KV CT','33KV PT','33KV VCB','Bushing','Cable',
  'Lightning Arrestor','33KV Pin Insulator','11KV Pin Insulator',
  'Post Insulator','Conductor'
];

const prompt2Maps = {
  preciseMap: {
    'Bushing':            ['HV Bushing','LV Bushing','HV Bushing Connector','LV Bushing Connector','Other'],
    'Cable':              ['33KV Cable Head','33KV Cable Lead','11KV Cable Head','11KV Cable Lead','33KV Cable Socket Nut-Bolt','11KV Cable Socket Nut-Bolt','Other'],
    '33KV Pin Insulator': ['1st Isolator 33KV Pin','1st DP 33KV Pin','Isolator before CT 33KV Pin','Isolator after VCB 33KV Pin','Isolator before VCB 33KV Pin','Isolator 33KV Pin','Other'],
    '11KV Pin Insulator': ['11KV Pin','11KV Feeder Isolator 11KV Pin','Other'],
    'Conductor':          ['HV Conductor','LV Conductor','LV Bushing to Cable Conductor','Other'],
    'Lightning Arrestor':  ['HV LA','LV LA','Other']
  },
  actionTemplates: {
    '33KV CT': {
      'Corona':                      'Necessary action to be taken care of towards cleaning, maintenance and oil checking of the said CT.',
      'Destructive Corona':          'Oil checking as well as necessary cleaning and maintenance of this CT should be done. Necessary checking of tightness of the said CT secondary wires is also required.',
      'Mild Tracking':               'Necessary action to be taken care of towards cleaning, maintenance and oil checking of the said CT.',
      'Tracking':                    'Necessary cleaning and maintenance are required. Insulation resistance in between CT primary to earth and primary to secondary by 5 kV megger and CT secondary to earth by 500 V megger are to be measured and if low, appropriate action taken.',
      'Corona with Mild Tracking':   'Necessary action to be taken care of towards cleaning, maintenance and oil checking of the said CT.',
      'Corona with Tracking':        'Necessary action to be taken care of towards cleaning, maintenance and oil checking of the said CT. Also, Insulation resistance in between CT primary to earth and Primary to secondary by 5KV megger and CT secondary to earth by 500Volt megger are to be measured and if found low then appropriate action is to be taken.',
      'Destructive Corona with Tracking': 'Oil checking as well as necessary cleaning and maintenance of this CT should be done. Necessary checking of tightness of the said CT secondary wires is also required. Also perform IR checks as above and take action if low.Insulation resistance in between CT primary to earth and Primary to secondary by 5KV megger and CT secondary to earth by 500Volt megger are to be measured and if found low then appropriate action is to be taken.',
      'Severe Tracking':             'Necessary cleaning and maintenance are required. Insulation resistance in between CT primary to earth and Primary to secondary by 5KV megger and CT secondary to earth by 500Volt megger are to be measured and if found low then the CT is to be replaced.',
      'Corona with Severe Tracking': 'Necessary cleaning, maintenance and oil checking of the said CT. Insulation resistance in between CT primary to earth and Primary to secondary by 5KV megger and CT secondary to earth by 500Volt megger are to be measured and if found low then the CT is to be replaced.',
      'Arcing':                      'Necessary action to be taken care of towards replacement of the CT with a healthy one.'
    },
    '33KV PT': {
      /* same as CT but “PT” */
      'Corona':                      'Necessary action to be taken care of towards cleaning, maintenance and oil checking of the said PT.',
      'Destructive Corona':          'Oil checking as well as necessary cleaning and maintenance of this PT should be done. Necessary checking of tightness of the said PT secondary wires is also required.',
      'Mild Tracking':               'Necessary action to be taken care of towards cleaning, maintenance and oil checking of the said PT.',
      'Tracking':                    'Necessary cleaning and maintenance are required. Insulation resistance in between PT primary to earth and primary to secondary by 5 kV megger and PT secondary to earth by 500 V megger are to be measured and if low, appropriate action taken.',
      'Corona with Mild Tracking':   'Necessary action to be taken care of towards cleaning, maintenance and oil checking of the said PT.',
      'Corona with Tracking':        'Necessary action to be taken care of towards cleaning, maintenance and oil checking of the said PT. Insulation resistance in between PT primary to earth and primary to secondary by 5 kV megger and PT secondary to earth by 500 V megger are to be measured and if low, appropriate action taken.',
      'Destructive Corona with Tracking': 'Oil checking as well as necessary cleaning and maintenance of this PT should be done. Insulation resistance in between PT primary to earth and primary to secondary by 5 kV megger and PT secondary to earth by 500 V megger are to be measured and if low, appropriate action taken.',
      'Severe Tracking':             'Necessary cleaning and maintenance are required. Insulation resistance in between PT primary to earth and Primary to secondary by 5KV megger and PT secondary to earth by 500Volt megger are to be measured and if found low then the PT is to be replaced.',
      'Corona with Severe Tracking': 'Necessary cleaning, maintenance and oil checking of the said PT. Insulation resistance in between PT primary to earth and Primary to secondary by 5KV megger and PT secondary to earth by 500Volt megger are to be measured and if found low then the PT is to be replaced.',
      'Arcing':                      'Necessary action to be taken care of towards replacement of the PT with a healthy one.'
    },
    '33KV VCB': {
      default: 'IR to be measured between upper pad and lower pad of the all VCBs for checking of VI insulation and lower pad to earth for tie rod insulation. Meggering should be executed through 5 KV megger. '
    },
    'Bushing': {
      default: 'Thorough maintenance, cleaning and release of tapped air (if any) from the said bushing should be carried out.'
    },
    '33KV Pin Insulator': {
      default: 'Binding of the pin insulators should be done properly. IR measurement of these pin insulators is to be done. If the IR value is found low then these pin insulators may be replaced.'
    },
    '11KV Pin Insulator': {
      default: 'Binding of the pin insulators should be done properly. IR measurement … if low then they may be replaced.'
    },
    'Post Insulator': {
      default: 'Binding of the post insulators should be done properly. IR measurement of these post insulators is to be done. If the IR value is found low then these post insulators may be replaced.'
    },
    'Conductor': {
      default: 'This conductor has to be replaced with a new and healthy one.'
    },
    'Lightning Arrestor': {
      default: 'Earthing of the LA to be checked and necessary action to be taken if the earthing of LA found open.Also, IR of the said LA also needs to be checked and to be replaced if the value found low.'
    },
    'Cable': {
      default: 'Cleaning, treatment of cable termination joint and subsequent application of amalgamated tape of HV insulation grade must be carried out.',
      'X-Cbl': 'If possible, avoid the cable crossing by rearrange the cable at both side and increase the electrical clearance between the phases of cable crossing.',
      'C-Dep': 'Also, carbon deposition has been observed on 33 kV cable terminations.',
      'Trck Mrk': 'Also, tracking mark has been observed on 33 kV cable terminations.'
    }
  }
};

// === Helpers ===
function createDropdown(opts, onChange) {
  const sel = document.createElement('select');
  sel.innerHTML = '<option value=""></option>' + opts.map(o => `<option>${o}</option>`).join('');
  if (onChange) sel.addEventListener('change', () => onChange.call(sel));
  return sel;
}

function createPhaseField() {
  const wrap = document.createElement('div');
  const num  = Object.assign(document.createElement('input'), { type:'number', placeholder:'dB' });
  const cls  = createDropdown(classifications, null);
  const cbw  = document.createElement('div'); cbw.className='checkbox-container';
  ['Rep','IR','Audible','X-Cbl','C-Dep','Trck Mrk'].forEach(l=>{
    const lab = document.createElement('label');
    const cb  = document.createElement('input'); cb.type='checkbox'; cb.value=l;
    lab.append(cb, document.createTextNode(' '+l));
    cbw.append(lab);
  });
  const rec = Object.assign(document.createElement('input'), { type:'number', placeholder:'Recording No.' });
  wrap.append(num, cls, cbw, rec);
  return wrap;
}

// === Main Functions ===

function addRow() {
  const tbody = document.querySelector('#ultrasoundTable tbody');
  const tr    = document.createElement('tr');

  // Equipment
  const tdEq = document.createElement('td');
  const selEq = createDropdown(equipmentOptions, function(){
    // if CT/PT/VCB: auto-precise
    if (['33KV CT','33KV PT','33KV VCB','Post Insulator'].includes(this.value)) {
      tdPrec.innerHTML = '';
      const inp = document.createElement('input');
      inp.type='text'; inp.value=this.value; inp.readOnly=true;
      tdPrec.append(inp);
    } else {
      updatePrecise(this, tdPrec);
    }
    // if “Other”: manual
    if (this.value==='Other') {
      const inp = document.createElement('input');
      inp.type='text'; inp.placeholder='Enter Equipment Details';
      this.replaceWith(inp);
    }
    renderLive();
  });
  tdEq.append(selEq); tr.append(tdEq);

  // Location
  const tdLoc = document.createElement('td');
  const selLoc = createDropdown(locationOptions, function(){
    if (this.value==='Other'){
      const inp=document.createElement('input');
      inp.type='text'; inp.placeholder='Enter location';
      this.replaceWith(inp);
    }
    renderLive();
  });
  tdLoc.append(selLoc); tr.append(tdLoc);

  // Precise
  const tdPrec = document.createElement('td');
  tdPrec.append(createDropdown([],null)); tr.append(tdPrec);

  // Side
  const tdSide = document.createElement('td');
  const selSide = createDropdown(sideOptions, function(){
    if (this.value==='Other'){
      const inp=document.createElement('input');
      inp.type='text'; inp.placeholder='Enter side';
      this.replaceWith(inp);
    }
    renderLive();
  });
  tdSide.append(selSide); tr.append(tdSide);

  // R/Y/B/Neutral
  for(let i=0; i<4; i++){
    const td = document.createElement('td');
    const fld = createPhaseField();
    fld.querySelectorAll('input,select').forEach(e=>e.addEventListener('input',renderLive));
    td.append(fld); tr.append(td);
  }

  // Remarks
  const tdRem = document.createElement('td');
  const inpRem = document.createElement('input');
  inpRem.type='text'; inpRem.placeholder='Remarks';
  inpRem.addEventListener('input',renderLive);
  tdRem.append(inpRem); tr.append(tdRem);

  // Delete
  const tdDel = document.createElement('td');
  const btnDel = document.createElement('button');
  btnDel.className='remove-btn'; btnDel.textContent='Delete';
  btnDel.onclick=()=>{ tr.remove(); renderLive(); };
  tdDel.append(btnDel); tr.append(tdDel);

  tbody.append(tr);
  renderLive();
}

function updatePrecise(sel, cell) {
  cell.innerHTML = '';
  const opts = prompt2Maps.preciseMap[sel.value]||[];
  if (opts.length) {
    const dd = createDropdown(opts, function(){
      if (this.value==='Other'){
        const inp=document.createElement('input');
        inp.type='text'; inp.placeholder='Enter precise';
        this.replaceWith(inp);
      }
      renderLive();
    });
    cell.append(dd);
  } else {
    const inp=document.createElement('input');
    inp.type='text'; inp.placeholder='Enter precise location';
    inp.addEventListener('input',renderLive);
    cell.append(inp);
  }
}

function renderLive(){
  const lb = document.querySelector('#liveTable tbody');
  lb.innerHTML = '';
  const rows = Array.from(document.querySelectorAll('#ultrasoundTable tbody tr'));
  const groups = {};
  rows.forEach(r=>{
    const eq = r.cells[0].querySelector('select,input').value;
    (groups[eq]=groups[eq]||[]).push(r);
  });

  // sort equipment keys by priorityList
  const eqKeys = Object.keys(groups).sort((a,b)=>{
    const iA = priorityList.indexOf(a), iB = priorityList.indexOf(b);
    const pA = iA<0? priorityList.length : iA;
    const pB = iB<0? priorityList.length : iB;
    return pA - pB;
  });

  let idx=1;
  eqKeys.forEach(eq=>{
    const grp = groups[eq];
    const isBus = eq==='Bushing', isPin = eq==='33KV Pin Insulator';

    grp.forEach((r,i)=>{
      const tr=document.createElement('tr');
      // Sl. No.
      const td0=document.createElement('td'); td0.textContent=idx++; tr.append(td0);
      // Equipment (once)
      if(i===0){
        const td1=document.createElement('td');
        td1.textContent=eq;
        td1.rowSpan=grp.length;
        tr.append(td1);
      }
      // Location+Precise+Side+Remarks
      const loc=r.cells[1].querySelector('select,input').value;
      const pr =r.cells[2].querySelector('select,input').value;
      const sd =r.cells[3].querySelector('select,input').value;
      const rm =r.cells[8].querySelector('input').value;
      let text=loc+(pr?' '+pr:'');
      if(sd) text+=` (${sd})`;
      if(rm) text+=' – '+rm;
      const td2=document.createElement('td');
      td2.textContent=text;
      tr.append(td2);

      // Phases
      ['R Phase','Y Phase','B Phase','Neutral'].forEach((ph,j)=>{
        const f=r.cells[4+j].firstChild;
        const v=f.querySelector('input[type=number]').value;
        const cls=f.querySelector('select').value;
        const cbs={};
        f.querySelectorAll('input[type=checkbox]').forEach(cb=>cbs[cb.value]=cb.checked);
        const td=document.createElement('td');
        if(v&&cls){
          let out=`${v} dB (${cls})`;
          if(cbs['Audible']) out+='<br/><strong>Audible</strong>';
          td.innerHTML=out;
        } else td.textContent='---';
        tr.append(td);
      });

      // Action (editable)
      if(isBus||isPin){
        if(i===0){
          const tdA=document.createElement('td');
          tdA.textContent = isBus
            ? prompt2Maps.actionTemplates['Bushing'].default
            : prompt2Maps.actionTemplates['33KV Pin Insulator'].default;
          tdA.rowSpan=grp.length;
          tdA.contentEditable = true;
          tr.append(tdA);
        }
      } else {
        const tdA=document.createElement('td');
        tdA.contentEditable = true;
        const acts=[];
        ['R Phase','Y Phase','B Phase','Neutral'].forEach((ph,j)=>{
          const f=r.cells[4+j].firstChild;
          const v=f.querySelector('input[type=number]').value;
          const cls=f.querySelector('select').value;
          const cbs={};
          f.querySelectorAll('input[type=checkbox]').forEach(cb=>cbs[cb.value]=cb.checked);
          if(!v||!cls) return;
          const arr=[];
          if(cbs['Rep']){
            arr.push('The same is to be replaced with a healthy one.');
          } else {
            const tmpl=prompt2Maps.actionTemplates[eq]||{};
            if(tmpl[cls]) arr.push(tmpl[cls]);
            else if(tmpl['default']) arr.push(tmpl['default']);
            if(cbs['IR']) arr.push('Insulation resistance in between primary to earth and Primary to secondary by 5KV megger and secondary to earth by 500Volt megger are to be measured and if found low then appropriate action is to be taken.');
            if(eq==='Cable'){
              ['X-Cbl','C-Dep','Trck Mrk'].forEach(fl=>{
                if(cbs[fl]&&tmpl[fl]) arr.push(tmpl[fl]);
              });
            }
          }
          if(arr.length){
            acts.push(`<u><strong>${ph}:</strong></u><br/>${arr.join('<br/>')}`);
          }
        });
        tdA.innerHTML = acts.join('<hr style="border-top:1px dashed #888;margin:4px 0;"/>');
        tr.append(tdA);
      }

      lb.append(tr);
    });
  });
}

function saveFormData(){
  const data=[];
  document.querySelectorAll('#ultrasoundTable tbody tr').forEach(r=>{
    const e={
      equipment:r.cells[0].querySelector('select,input').value,
      location: r.cells[1].querySelector('select,input').value,
      precise:  r.cells[2].querySelector('select,input').value,
      side:     r.cells[3].querySelector('select,input').value,
      remarks:  r.cells[8].querySelector('input').value
    };
    ['R','Y','B','N'].forEach((k,i)=>{
      const f=r.cells[4+i].firstChild;
      e[k]={
        value:f.querySelector('input[type=number]').value,
        class:f.querySelector('select').value,
        rep:  f.querySelector('input[value="Rep"]').checked,
        ir:   f.querySelector('input[value="IR"]').checked,
        aud:  f.querySelector('input[value="Audible"]').checked
      };
    });
    data.push(e);
  });
  localStorage.setItem('ultrasoundData',JSON.stringify(data));
  alert('Data saved.');
}

function loadFormData(){
  const s=localStorage.getItem('ultrasoundData');
  if(!s) return;
  JSON.parse(s).forEach(e=>{
    addRow();
    const r=document.querySelector('#ultrasoundTable tbody tr:last-child');
    r.cells[0].querySelector('select,input').value = e.equipment;
    r.cells[1].querySelector('select,input').value = e.location;
    updatePrecise(r.cells[0].querySelector('select,input'),r.cells[2]);
    r.cells[2].querySelector('select,input').value = e.precise;
    r.cells[3].querySelector('select,input').value = e.side;
    ['R','Y','B','N'].forEach((k,i)=>{
      const f=r.cells[4+i].firstChild;
      f.querySelector('input[type=number]').value       = e[k].value;
      f.querySelector('select').value                   = e[k].class;
      f.querySelector('input[value="Rep"]').checked     = e[k].rep;
      f.querySelector('input[value="IR"]').checked      = e[k].ir;
      f.querySelector('input[value="Audible"]').checked = e[k].aud;
    });
    r.cells[8].querySelector('input').value = e.remarks;
  });

  renderLive();
}

// ———————— global download handlers ————————
// wire up Download buttons
document.getElementById('downloadExcelBtn').addEventListener('click', downloadExcel);
document.getElementById('downloadDocBtn').addEventListener('click', downloadDoc);

function downloadExcel() {
  const tableHTML = document.getElementById('liveTable').outerHTML;
  const preamble = 
    '\uFEFF' +  // UTF-8 BOM
    '<html ' +
      'xmlns:o="urn:schemas-microsoft-com:office:office" ' +
      'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
      'xmlns="http://www.w3.org/TR/REC-html40">' +
    '<head><meta charset="UTF-8"/>' +
    '<!--[if gte mso 9]>' +
      '<xml>' +
        '<x:ExcelWorkbook>' +
          '<x:ExcelWorksheets>' +
            '<x:ExcelWorksheet>' +
              '<x:Name>Sheet1</x:Name>' +
              '<x:WorksheetOptions>' +
                '<x:DisplayGridlines/>' +
              '</x:WorksheetOptions>' +
            '</x:ExcelWorksheet>' +
          '</x:ExcelWorksheets>' +
        '</x:ExcelWorkbook>' +
      '</xml>' +
    '<![endif]-->' +
    '</head><body>';
  const closing = '</body></html>';
  const excelFile = preamble + tableHTML + closing;

  const blob = new Blob([excelFile], {
    type: 'application/vnd.ms-excel;charset=UTF-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const sub   = localStorage.getItem('selectedSubstation') || 'Unknown';
  const now   = new Date();
  const dd    = String(now.getDate()).padStart(2,'0');
  const mm    = String(now.getMonth()+1).padStart(2,'0');
  const yyyy  = now.getFullYear();
  a.href     = url;
  a.download = `Ultrasound_${sub}_${dd}-${mm}-${yyyy}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}


// generate a Word .doc file from the live table HTML
function downloadDoc() {
  // 1) clone the live table so we can style it without touching the on-screen version
  const original = document.getElementById('liveTable');
  const clone    = original.cloneNode(true);

  // 2) header row styling
  const headerRow = clone.querySelector('thead tr');
  headerRow.style.backgroundColor = '#a7abb7';
  headerRow.querySelectorAll('th').forEach(th => {
    th.style.fontFamily = 'Cambria';
    th.style.fontSize   = '11pt';
  });

  // 3) row-group colouring & uniform Action-font sizing
  const rows     = Array.from(clone.querySelectorAll('tbody tr'));
  const colors   = [
    '#f0f8ff','#fafad2','#e6e6fa','#fff0f5',
    '#f0fff0','#f5f5f5','#fffaf0','#f5fffa',
    '#f5f5dc','#f0ffff'
  ];
  let currentEq  = null;
  let colorIndex = -1;
  let lastEq     = null;

  rows.forEach(tr => {
    // if this row has the merged Equipment cell, pick up its text
    const eqCell = tr.querySelector('td[rowspan]');
    if (eqCell) {
      lastEq    = eqCell.textContent;
      currentEq = null;    // reset so we pick a new colour for this group
    }
    // when equipment changes, advance to next colour
    if (lastEq !== currentEq) {
      currentEq  = lastEq;
      colorIndex = (colorIndex + 1) % colors.length;
    }
    // apply to every cell in the row
    Array.from(tr.cells).forEach((td, colIdx, all) => {
      td.style.backgroundColor = colors[colorIndex];
      td.style.fontFamily      = 'Cambria';
      // Action-column is always the last cell in each row
      const isAction = (colIdx === all.length - 1);
      td.style.fontSize        = isAction ? '9pt' : '11pt';
    });
  });


  // 4) wrap in Word HTML with landscape and font defaults
  const preamble =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
           'xmlns:w="urn:schemas-microsoft-com:office:word" ' +
           'xmlns="http://www.w3.org/TR/REC-html40">' +
    '<head><meta charset="utf-8">' +
    '<style>' +
      '@page { size: landscape; } ' +
      'body { font-family: Cambria; font-size: 11pt; } ' +
    '</style></head><body>';
  const closing = '</body></html>';

  const html = preamble + clone.outerHTML + closing;
  const blob = new Blob(
    ['\ufeff', html],
    { type: 'application/msword' }
  );
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href    = url;
  
  // build filename as Ultrasound_<Substation>_<YYYY-MM-DD>.doc
  const sub   = localStorage.getItem('selectedSubstation') || 'Unknown';
  const now   = new Date();
const day   = String(now.getDate()).padStart(2, '0');
const month = String(now.getMonth() + 1).padStart(2, '0');
const year  = now.getFullYear();
const date  = `${day}-${month}-${year}`;
  a.download = `Ultrasound_${sub}_${date}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}
