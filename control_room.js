// control_room.js

// 1. Populate the substation name from localStorage (or a default)
  document.addEventListener('DOMContentLoaded', () => {

  // ↓ Group all your table-body refs here ↓
  const table11Body = document.querySelector('#table11 tbody');
  const table33Body = document.querySelector('#table33 tbody');
  const temp11Body  = document.querySelector('#tableTemp11 tbody');
  const temp33Body  = document.querySelector('#tableTemp33 tbody');

  // … then the rest of your code (populateLiveTable, event hooks, etc.) …


  const header = document.getElementById('substationHeader');
  const sub = localStorage.getItem('selectedSubstation') || '[Substation Not Set]';
  header.textContent = `Entering data for '${sub}'`;

// 2. Attach click handlers only to main-nav buttons
document.querySelectorAll('.section-btn[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    // 1) Glow this button, dim the others
    document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 2) Hide all sections
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));

    // 3) Show the targeted section
    const target = btn.dataset.target;
    document.getElementById(target).classList.add('active');

   

  });
});


 // 3. wire up nested “11KV/33KV” sub-tabs under #panelLoad
 const panelLoad = document.getElementById('panelLoad');
 panelLoad.querySelectorAll('.sub-tab-btn').forEach(btn => {
   btn.addEventListener('click', () => {
     // 1) Glow this button, dim the others
     panelLoad.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
     btn.classList.add('active');

     // 2) Hide all sub-sections, then show the selected one
     panelLoad.querySelectorAll('.sub-section').forEach(sec => sec.classList.remove('active'));
     panelLoad.querySelector('#' + btn.dataset.sub).classList.add('active');
   });
 });





// if the table ever empties out, we still have a row to clone
const row11Template = table11Body.rows[0].cloneNode(true);
document.getElementById('addRow11').addEventListener('click', () => {
  // if we still have rows, clone the live first row; otherwise use our template
  const baseRow = table11Body.rows.length > 0
    ? table11Body.rows[0]
    : row11Template;

  const newRow = baseRow.cloneNode(true);
  newRow.cells[0].textContent = table11Body.rows.length + 1;
  newRow.querySelectorAll('input, select').forEach(el => el.value = '');
  table11Body.appendChild(newRow);
});

table11Body.addEventListener('click', e => {
  if (e.target.classList.contains('delete-row-btn')) {
    e.target.closest('tr').remove();
    [...table11Body.rows].forEach((r,i) => r.cells[0].textContent = i+1);
    populateLiveTable();  // 🔥 ADD THIS LINE to refresh live table
  }
});

  document.getElementById('save11').addEventListener('click', () => {
    const data11 = [...table11Body.rows].map(r => ({
      panelName: r.cells[1].querySelector('input').value,
      vcbState:  r.cells[2].querySelector('select').value,
      load:      r.cells[3].querySelector('input').value
    }));
    localStorage.setItem('pan11Data', JSON.stringify(data11));
    alert('11KV Panels data saved');
  });



// template for when all 33 kV rows get deleted
const row33Template = table33Body.rows[0].cloneNode(true);

document.getElementById('addRow33').addEventListener('click', () => {
  const baseRow = table33Body.rows.length > 0
    ? table33Body.rows[0]
    : row33Template;

  const newRow = baseRow.cloneNode(true);
  newRow.cells[0].textContent = table33Body.rows.length + 1;
  newRow.querySelectorAll('input, select').forEach(el => el.value = '');
  table33Body.appendChild(newRow);
});

table33Body.addEventListener('click', e => {
  if (e.target.classList.contains('delete-row-btn')) {
    e.target.closest('tr').remove();
    [...table33Body.rows].forEach((r,i) => r.cells[0].textContent = i+1);
    populateLiveTable();  // 🔥 ADD THIS LINE to refresh live table
  }
});

  document.getElementById('save33').addEventListener('click', () => {
    const data33 = [...table33Body.rows].map(r => ({
      panelName: r.cells[1].querySelector('input').value,
      vcbState:  r.cells[2].querySelector('select').value,
      load:      r.cells[3].querySelector('input').value
    }));
    localStorage.setItem('pan33Data', JSON.stringify(data33));
    alert('33KV Panels data saved');
  });

// NEW: populate *only* on the first click, so inputs then persist forever
const tempSection = document.getElementById('temp');
const tempInit = { temp11: true, temp33: true };

tempSection.querySelectorAll('.sub-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // 1) Highlight the clicked button
    tempSection.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // 2) Show its corresponding pane
    tempSection.querySelectorAll('.sub-section').forEach(sec => sec.classList.remove('active'));
    tempSection.querySelector('#' + btn.dataset.sub).classList.add('active');

    // 3) Populate the table only the very first time
    if (tempInit[btn.dataset.sub]) {
      if (btn.dataset.sub === 'temp11') populateTemp11();
      if (btn.dataset.sub === 'temp33') populateTemp33();
      tempInit[btn.dataset.sub] = false;
    }
  });
});


function populateTemp11() {
  const tbody = document.querySelector('#tableTemp11 tbody');
  tbody.innerHTML = '';
  // table11Body was declared up above as document.querySelector('#table11 tbody')
  table11Body.querySelectorAll('tr').forEach((r, i) => {
    const tr = document.createElement('tr');
// determine whether this is an 11KV or 33KV row
const tableId = r.closest('table').id;  // "table11" or "table33"

    // Sl. No.
    const td0 = document.createElement('td');
    td0.textContent = i + 1;
    tr.appendChild(td0);
    // 11KV Panel Name
    const td1 = document.createElement('td');
    td1.textContent = r.cells[1].querySelector('input').value;
    tr.appendChild(td1);
    // VCB State
    const td2 = document.createElement('td');
    td2.textContent = r.cells[2].querySelector('select').value;
    tr.appendChild(td2);
    // Load (in A)
    const td3 = document.createElement('td');
    td3.textContent = r.cells[3].querySelector('input').value;
    tr.appendChild(td3);
// F1, B1, B2 → single wrapper div inside each cell
for (let j = 0; j < 3; j++) {
  const td = document.createElement('td');
  // inner div stays flex—td remains a table‐cell
  const wrapper = document.createElement('div');
  wrapper.style.display        = 'flex';
  wrapper.style.alignItems     = 'center';
  wrapper.style.justifyContent = 'center';
  wrapper.style.gap            = '0.25rem';
  wrapper.style.whiteSpace     = 'nowrap';

  const inp = document.createElement('input');
  inp.type        = 'number';
  inp.placeholder = '°C';
  inp.style.width    = '76px';
  inp.style.fontSize = '0.75rem';
  inp.style.padding  = '2px 4px';
  wrapper.appendChild(inp);

  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.name = `h${j+1}`;
  wrapper.appendChild(cb);

  const lbl = document.createElement('span');
  lbl.textContent    = 'H';
  lbl.style.fontSize = '0.75rem';
  wrapper.appendChild(lbl);

  td.appendChild(wrapper);
  tr.appendChild(td);
}



    tbody.appendChild(tr);
  });
}


document.getElementById('saveTemp11').addEventListener('click', () => {
  const rows = document.querySelectorAll('#tableTemp11 tbody tr');
  const tempData11 = [...rows].map(r => ({
    panelName: r.cells[1].textContent,
    vcbState:  r.cells[2].textContent,
    load:      r.cells[3].textContent,
    f1:        r.cells[4].querySelector('input').value,
    b1:        r.cells[5].querySelector('input').value,
    b2:        r.cells[6].querySelector('input').value
  }));
  localStorage.setItem('temp11Data', JSON.stringify(tempData11));
  alert('11KV Temp data saved');
});

function populateTemp33() {
  const tbody = document.querySelector('#tableTemp33 tbody');
  tbody.innerHTML = '';
  table33Body.querySelectorAll('tr').forEach((r, i) => {
    const tr = document.createElement('tr');
    // Sl. No.
    const td0 = document.createElement('td');
    td0.textContent = i + 1;
    tr.appendChild(td0);
    // 33KV Panel Name
    const td1 = document.createElement('td');
    td1.textContent = r.cells[1].querySelector('input').value;
    tr.appendChild(td1);
    // VCB State
    const td2 = document.createElement('td');
    td2.textContent = r.cells[2].querySelector('select').value;
    tr.appendChild(td2);
    // Load (in A)
    const td3 = document.createElement('td');
    td3.textContent = r.cells[3].querySelector('input').value;
    tr.appendChild(td3);

// F1, B1, B2 → single wrapper div inside each cell
for (let j = 0; j < 3; j++) {
  const td = document.createElement('td');
  // inner div stays flex—td remains a table‐cell
  const wrapper = document.createElement('div');
  wrapper.style.display        = 'flex';
  wrapper.style.alignItems     = 'center';
  wrapper.style.justifyContent = 'center';
  wrapper.style.gap            = '0.25rem';
  wrapper.style.whiteSpace     = 'nowrap';

  const inp = document.createElement('input');
  inp.type        = 'number';
  inp.placeholder = '°C';
  inp.style.width    = '76px';
  inp.style.fontSize = '0.75rem';
  inp.style.padding  = '2px 4px';
  wrapper.appendChild(inp);

  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.name = `h${j+1}`;
  wrapper.appendChild(cb);

  const lbl = document.createElement('span');
  lbl.textContent    = 'H';
  lbl.style.fontSize = '0.75rem';
  wrapper.appendChild(lbl);

  td.appendChild(wrapper);
  tr.appendChild(td);
}

    tbody.appendChild(tr);
  });
}

document.getElementById('saveTemp33').addEventListener('click', () => {
  const rows = document.querySelectorAll('#tableTemp33 tbody tr');
  const tempData33 = [...rows].map(r => ({
    panelName: r.cells[1].textContent,
    vcbState:  r.cells[2].textContent,
    load:      r.cells[3].textContent,
    f1:        r.cells[4].querySelector('input').value,
    b1:        r.cells[5].querySelector('input').value,
    b2:        r.cells[6].querySelector('input').value
  }));
  localStorage.setItem('temp33Data', JSON.stringify(tempData33));
  alert('33KV Temp data saved');
});


// live-sync Temp tables whenever Panel-Load inputs change
table11Body.addEventListener('input', () => {
  if (
    document.getElementById('temp').classList.contains('active') &&
    document.getElementById('temp11').classList.contains('active')
  ) populateTemp11();
});

table33Body.addEventListener('input', () => {
  if (
    document.getElementById('temp').classList.contains('active') &&
    document.getElementById('temp33').classList.contains('active')
  ) populateTemp33();
});

// ==== wire up nested sub-tabs under #ultrasound with first-click guard ====
const ultrasoundSection = document.getElementById('ultrasound');
const usInit             = { us11: true, us33: true };

ultrasoundSection.querySelectorAll('.sub-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    ultrasoundSection.querySelectorAll('.sub-tab-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    ultrasoundSection.querySelectorAll('.sub-section')
      .forEach(sec => sec.classList.remove('active'));
    ultrasoundSection.querySelector('#' + btn.dataset.sub)
      .classList.add('active');

    if (usInit[btn.dataset.sub]) {
      if (btn.dataset.sub === 'us11') populateUS11();
      else if (btn.dataset.sub === 'us33') populateUS33();
      usInit[btn.dataset.sub] = false;
    }
  });
});


const classifications = [
  'Corona','Destructive Corona','Mild Tracking','Tracking',
  'Corona with Mild Tracking','Corona with Tracking',
  'Destructive Corona with Tracking','Severe Tracking',
  'Corona with Severe Tracking','Arcing'
];

function populateUS11() {
  const tbody = document.querySelector('#tableUltrasound11 tbody');
  tbody.innerHTML = '';
  // table11Body was declared earlier: document.querySelector('#table11 tbody')
  table11Body.querySelectorAll('tr').forEach((r, i) => {
    const tr = document.createElement('tr');
    // Sl. No.
    const td0 = document.createElement('td');
    td0.textContent = i + 1;
    tr.appendChild(td0);
    // Panel Name, VCB State, Load
    ['input','select','input'].forEach((tag, idx) => {
      const cell = r.cells[1 + idx].querySelector(tag);
      const td = document.createElement('td');
      td.textContent = cell.value;
      tr.appendChild(td);
    });
    // F1, B1, B2, PT, S1, S2 → input + dropdown
    for (let j = 0; j < 6; j++) {
      const td = document.createElement('td');
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.placeholder = 'dB';
      td.appendChild(inp);
      const sel = document.createElement('select');
      // add a hidden default
      const def = document.createElement('option');
      def.disabled = def.hidden = def.selected = true;
      sel.appendChild(def);
      classifications.forEach(text => {
        const opt = document.createElement('option');
        opt.value = opt.textContent = text;
        sel.appendChild(opt);
      });
      td.appendChild(sel);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });
}

function populateUS33() {
  const tbody = document.querySelector('#tableUltrasound33 tbody');
  tbody.innerHTML = '';
  table33Body.querySelectorAll('tr').forEach((r, i) => {
    const tr = document.createElement('tr');
    const td0 = document.createElement('td');
    td0.textContent = i + 1;
    tr.appendChild(td0);
    ['input','select','input'].forEach((tag, idx) => {
      const cell = r.cells[1 + idx].querySelector(tag);
      const td = document.createElement('td');
      td.textContent = cell.value;
      tr.appendChild(td);
    });
    for (let j = 0; j < 6; j++) {
      const td = document.createElement('td');
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.placeholder = 'dB';
      td.appendChild(inp);
      const sel = document.createElement('select');
      const def = document.createElement('option');
      def.disabled = def.hidden = def.selected = true;
      sel.appendChild(def);
      classifications.forEach(text => {
        const opt = document.createElement('option');
        opt.value = opt.textContent = text;
        sel.appendChild(opt);
      });
      td.appendChild(sel);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });
}

document.getElementById('saveUS11')
  .addEventListener('click', () => { /* … save logic … */ });
document.getElementById('saveUS33')
  .addEventListener('click', () => { /* … save logic … */ });


// ==== wire up nested sub-tabs under #tev with first-click guard ====
const tevSection = document.getElementById('tev');
const tevInit    = { tev11: true, tev33: true };

tevSection.querySelectorAll('.sub-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    tevSection.querySelectorAll('.sub-tab-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    tevSection.querySelectorAll('.sub-section')
      .forEach(sec => sec.classList.remove('active'));
    document.getElementById(btn.dataset.sub)
      .classList.add('active');

    if (tevInit[btn.dataset.sub]) {
      if (btn.dataset.sub === 'tev11') populateTEV11();
      else if (btn.dataset.sub === 'tev33') populateTEV33();
      tevInit[btn.dataset.sub] = false;
    }
  });
});

  function populateTEV11() {
    const tbody = document.querySelector('#tableTEV11 tbody');
    tbody.innerHTML = '';
    table11Body.querySelectorAll('tr').forEach((r, i) => {
      const tr = document.createElement('tr');
      // Sl. No., Panel Name, VCB State, Load
      [i + 1,
       r.cells[1].querySelector('input').value,
       r.cells[2].querySelector('select').value,
       r.cells[3].querySelector('input').value
      ].forEach((txt, idx) => {
        const td = document.createElement('td');
        td.textContent = txt;
        tr.appendChild(td);
      });
      // TF1, TB1, TB2, TPT, TS1, TS2 → centered numeric inputs
      for (let j = 0; j < 6; j++) {
        const td = document.createElement('td');
        const inp = document.createElement('input');
        inp.type = 'number';
        inp.placeholder = 'dB';
        inp.style.textAlign = 'center';
        td.appendChild(inp);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });
  }

  function populateTEV33() {
    const tbody = document.querySelector('#tableTEV33 tbody');
    tbody.innerHTML = '';
    table33Body.querySelectorAll('tr').forEach((r, i) => {
      const tr = document.createElement('tr');
      [i + 1,
       r.cells[1].querySelector('input').value,
       r.cells[2].querySelector('select').value,
       r.cells[3].querySelector('input').value
      ].forEach(txt => {
        const td = document.createElement('td');
        td.textContent = txt;
        tr.appendChild(td);
      });
      for (let j = 0; j < 6; j++) {
        const td = document.createElement('td');
        const inp = document.createElement('input');
        inp.type = 'number';
        inp.placeholder = 'dB';
        inp.style.textAlign = 'center';
        td.appendChild(inp);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });
  }

  // Save handlers
  document.getElementById('saveTEV11').addEventListener('click', () => {
    const data = Array.from(document.querySelectorAll('#tableTEV11 tbody tr'))
      .map(r => ({
        panelName: r.cells[1].textContent,
        vcbState:  r.cells[2].textContent,
        load:      r.cells[3].textContent,
        tf1:       r.cells[4].querySelector('input').value,
        tb1:       r.cells[5].querySelector('input').value,
        tb2:       r.cells[6].querySelector('input').value,
        tpt:       r.cells[7].querySelector('input').value,
        ts1:       r.cells[8].querySelector('input').value,
        ts2:       r.cells[9].querySelector('input').value
      }));
    localStorage.setItem('tev11Data', JSON.stringify(data));
    alert('11KV TEV data saved');
  });

  document.getElementById('saveTEV33').addEventListener('click', () => {
    const data = Array.from(document.querySelectorAll('#tableTEV33 tbody tr'))
      .map(r => ({
        panelName: r.cells[1].textContent,
        vcbState:  r.cells[2].textContent,
        load:      r.cells[3].textContent,
        tf1:       r.cells[4].querySelector('input').value,
        tb1:       r.cells[5].querySelector('input').value,
        tb2:       r.cells[6].querySelector('input').value,
        tpt:       r.cells[7].querySelector('input').value,
        ts1:       r.cells[8].querySelector('input').value,
        ts2:       r.cells[9].querySelector('input').value
      }));
    localStorage.setItem('tev33Data', JSON.stringify(data));
    alert('33KV TEV data saved');
  });

  // live-sync TEV when Panel-Load changes
  table11Body.addEventListener('input', () => {
    if (
      document.getElementById('tev').classList.contains('active') &&
      document.querySelector('#tev .sub-tab-btn.active[data-sub="tev11"]')
    ) populateTEV11();
  });
  table33Body.addEventListener('input', () => {
    if (
      document.getElementById('tev').classList.contains('active') &&
      document.querySelector('#tev .sub-tab-btn.active[data-sub="tev33"]')
    ) populateTEV33();
  });

  table11Body.addEventListener('change', () => {
    if (
      document.getElementById('tev').classList.contains('active') &&
      document.querySelector('#tev .sub-tab-btn.active[data-sub="tev11"]')
    ) populateTEV11();
  });
  table33Body.addEventListener('change', () => {
    if (
      document.getElementById('tev').classList.contains('active') &&
      document.querySelector('#tev .sub-tab-btn.active[data-sub="tev33"]')
    ) populateTEV33();
  });



// live-sync Ultrasound tables on any Panel-Load input *or* select‐change
table11Body.addEventListener('input',  populateUS11);
table11Body.addEventListener('change', populateUS11);
table33Body.addEventListener('input',  populateUS33);
table33Body.addEventListener('change', populateUS33);


// ==== wire up nested sub-tabs under #battery ====
const batterySection = document.getElementById('battery');
batterySection.querySelectorAll('.sub-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Highlight the clicked button
    batterySection.querySelectorAll('.sub-tab-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show its corresponding sub-section
    batterySection.querySelectorAll('.sub-section')
      .forEach(sec => sec.classList.remove('active'));
    batterySection.querySelector('#' + btn.dataset.sub)
      .classList.add('active');

    // ▼ Optional: call your populate functions if/when you build them
    // if (btn.dataset.sub === 'bat11') populateBat11();
    // if (btn.dataset.sub === 'bat33') populateBat33();
  });
});

  // --- Save logic for 11KV Battery & Battery Charger ---
  document.getElementById('saveBat11').addEventListener('click', () => {
    const bat11Data = {
      voltage: {
        acOn:  document.getElementById('bat11VoltageOn').value,
        acOff: document.getElementById('bat11VoltageOff').value
      },
      generalFindings: Array.from(
        document.querySelectorAll('#bat11 input[name="bat11GenFindings"]:checked')
      ).map(cb => cb.value),
      otherRemarks: document.getElementById('bat11GenFindingsOther').value
    };
    localStorage.setItem('bat11Data', JSON.stringify(bat11Data));
    alert('11KV Battery & Battery Charger data saved');
  });

  // --- Save logic for 33KV Battery & Battery Charger ---
  document.getElementById('saveBat33').addEventListener('click', () => {
    const bat33Data = {
      voltage: {
        acOn:  document.getElementById('bat33VoltageOn').value,
        acOff: document.getElementById('bat33VoltageOff').value
      },
      generalFindings: Array.from(
        document.querySelectorAll('#bat33 input[name="bat33GenFindings"]:checked')
      ).map(cb => cb.value),
      otherRemarks: document.getElementById('bat33GenFindingsOther').value
    };
    localStorage.setItem('bat33Data', JSON.stringify(bat33Data));
    alert('33KV Battery & Battery Charger data saved');
  });

  // Ambient-Temp storage & “Add” button for Temp11
  const ambient11List = JSON.parse(localStorage.getItem('ambientTemp11Data') || '[]');
  document.getElementById('addAmbientTemp11').addEventListener('click', () => {
    const v = document.getElementById('ambientTemp11').value;
    if (v === '') return alert('Enter Ambient Temp.');
    ambient11List.push(v);
    localStorage.setItem('ambientTemp11Data', JSON.stringify(ambient11List));
    alert('11KV Ambient Temp added');
    document.getElementById('ambientTemp11').value = '';
  });

  // Ambient-Temp storage & “Add” button for Temp33
  const ambient33List = JSON.parse(localStorage.getItem('ambientTemp33Data') || '[]');
  document.getElementById('addAmbientTemp33').addEventListener('click', () => {
    const v = document.getElementById('ambientTemp33').value;
    if (v === '') return alert('Enter Ambient Temp.');
    ambient33List.push(v);
    localStorage.setItem('ambientTemp33Data', JSON.stringify(ambient33List));
    alert('33KV Ambient Temp added');
    document.getElementById('ambientTemp33').value = '';
  });



// Build rows for “Other → 11KV Panels”
function populateOther11() {
  const tbody = document.querySelector('#tableOther11 tbody');
  tbody.innerHTML = '';
  table11Body.querySelectorAll('tr').forEach((r, i) => {
    const tr = document.createElement('tr');
    // Sl. No.
    const td0 = document.createElement('td');
    td0.textContent = i + 1; tr.appendChild(td0);
    // Panel Name
    const td1 = document.createElement('td');
    td1.textContent = r.cells[1].querySelector('input').value;
    tr.appendChild(td1);
    // Observations (checkboxes + manual entry)
    const td2 = document.createElement('td');
    const obsList = [
      'No H.','H. Check','HD','BHD','CHD','1 HD','2 HD',
      'H.Sht.Ckt.','Amp. Def.','Volt. Def.','H.Amp.Def.',
      'Dust & Spider','Huge Dust & Spider','Panel Gap','Panel Hole'
    ];
    obsList.forEach(text => {
      const label = document.createElement('label');
      label.style.display    = 'inline-block';
      label.style.marginRight = '0.5rem';
      label.style.fontSize    = '0.7rem';;
      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.value = text; cb.name = `other11_obs_${i}`;
      label.appendChild(cb);
      label.append(' ' + text);
      td2.appendChild(label);
    });
    // “Other” text + Add button
    const divOther = document.createElement('div');
    divOther.style.marginTop = '0.5rem';
    const input = document.createElement('input');
    input.type = 'text'; input.placeholder = 'Other'; input.style.width = '70%';
    const btn = document.createElement('button');
    btn.textContent = 'Add'; btn.className = 'section-btn'; btn.style.fontSize = '0.7rem';
    divOther.append(input, btn);
    td2.appendChild(divOther);

    tr.appendChild(td2);
    tbody.appendChild(tr);
  });
}

// Build rows for “Other → 33KV Panels” (identical logic)
function populateOther33() {
  const tbody = document.querySelector('#tableOther33 tbody');
  tbody.innerHTML = '';
  table33Body.querySelectorAll('tr').forEach((r, i) => {
    const tr = document.createElement('tr');
    // Sl. No.
    const td0 = document.createElement('td');
    td0.textContent = i + 1; tr.appendChild(td0);
    // Panel Name
    const td1 = document.createElement('td');
    td1.textContent = r.cells[1].querySelector('input').value;
    tr.appendChild(td1);
    // Observations
    const td2 = document.createElement('td');
    const obsList = [
      'No Heater','Heater Check','HD','BHD','CHD','1 HD','2 HD',
      'Heater Sht. Ckt.','Amp. Def.','Volt. Def.','Heater Amp. Def.',
      'Dust & Spider Web','Huge Dust & Spider','Panel Gap','Panel Hole'
    ];
    obsList.forEach(text => {
      const label = document.createElement('label');
      label.style.display    = 'inline-block';
      label.style.marginRight = '0.5rem';
      label.style.fontSize    = '0.7rem';

      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.value = text; cb.name = `other33_obs_${i}`;
      label.appendChild(cb);
      label.append(' ' + text);
      td2.appendChild(label);
    });
    // Manual entry
    const divOther = document.createElement('div');
    divOther.style.marginTop = '0.5rem';
    const input = document.createElement('input');
    input.type = 'text'; input.placeholder = 'Other'; input.style.width = '70%';
    const btn = document.createElement('button');
    btn.textContent = 'Add'; btn.className = 'section-btn'; btn.style.fontSize = '0.7rem';
    divOther.append(input, btn);
    td2.appendChild(divOther);

    tr.appendChild(td2);
    tbody.appendChild(tr);
  });
}

// 11KV live-sync
table11Body.addEventListener('input', () => {
  if (
    document.getElementById('other').classList.contains('active') &&
    document.querySelector('#other .sub-tab-btn.active[data-sub="oth11"]')
  ) populateOther11();
});
table11Body.addEventListener('change', () => {
  if (
    document.getElementById('other').classList.contains('active') &&
    document.querySelector('#other .sub-tab-btn.active[data-sub="oth11"]')
  ) populateOther11();
});
// 33KV live-sync
table33Body.addEventListener('input', () => {
  if (
    document.getElementById('other').classList.contains('active') &&
    document.querySelector('#other .sub-tab-btn.active[data-sub="oth33"]')
  ) populateOther33();
});
table33Body.addEventListener('change', () => {
  if (
    document.getElementById('other').classList.contains('active') &&
    document.querySelector('#other .sub-tab-btn.active[data-sub="oth33"]')
  ) populateOther33();
});

// ==== wire up nested sub-tabs under #other with first-click guard ====
const otherSection = document.getElementById('other');
const otherInit    = { oth11: true, oth33: true };

otherSection.querySelectorAll('.sub-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    otherSection.querySelectorAll('.sub-tab-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    otherSection.querySelectorAll('.sub-section')
      .forEach(sec => sec.classList.remove('active'));
    otherSection.querySelector('#' + btn.dataset.sub)
      .classList.add('active');

    if (otherInit[btn.dataset.sub]) {
      if (btn.dataset.sub === 'oth11') populateOther11();
      else if (btn.dataset.sub === 'oth33') populateOther33();
      otherInit[btn.dataset.sub] = false;
    }
  });
});



  // ─────────── LIVE-TABLE SYNC ───────────
  const liveTbody = document.querySelector('#liveTable tbody');

 function populateLiveTable() {
  liveTbody.innerHTML = '';  
  const COL_COUNT = 20;

  function buildPanelRow(r, is11KV) {
    const tr = document.createElement('tr');
    const values = [
      r.index + 1,
      r.cells[1].querySelector('input').value,
      r.cells[2].querySelector('select').value,
      r.cells[3].querySelector('input').value
    ];
    values.forEach(txt => {
      const td = document.createElement('td');
      td.textContent = txt;
      tr.appendChild(td);
    });

    const tableId = is11KV ? '11' : '33';

    const tevRows = document.querySelectorAll(`#tableTEV${tableId} tbody tr`);
    const tevRow = tevRows[r.index] || null;
[4, 5, 6, 7, 8, 9].forEach(colIdx => {
  const td = document.createElement('td');
  if (tevRow) {
    const val = tevRow.cells[colIdx].querySelector('input')?.value;
    td.textContent = val ? val : '---';
  } else {
    td.textContent = '---';
  }
  tr.appendChild(td);
});


    const tempRows = document.querySelectorAll(`#tableTemp${tableId} tbody tr`);
    const tempRow = tempRows[r.index] || null;
[4, 5, 6].forEach(colIdx => {
  const td = document.createElement('td');
  if (tempRow) {
    const val = tempRow.cells[colIdx].querySelector('input')?.value;
    td.textContent = val ? val : '---';
  } else {
    td.textContent = '---';
  }
  tr.appendChild(td);
});


    const usRows = document.querySelectorAll(`#tableUltrasound${tableId} tbody tr`);
    const usRow = usRows[r.index] || null;
for (let colIdx = 4; colIdx <= 9; colIdx++) {
  const td = document.createElement('td');
  if (usRow) {
    const val = usRow.cells[colIdx].querySelector('input')?.value;
    const cls = usRow.cells[colIdx].querySelector('select')?.value;
    if (val) {
      td.textContent = `${val} dB${cls ? ` (${cls})` : ''}`;
    } else {
      td.textContent = '---';
    }
  } else {
    td.textContent = '---';
  }
  tr.appendChild(td);
}


// Action to be Taken logic inside populateLiveTable() :

const actionTd = document.createElement('td');
let actions = [];

if (tempRow) {
  const f1H = tempRow.cells[4].querySelector('input[type="checkbox"]').checked;
  const b1H = tempRow.cells[5].querySelector('input[type="checkbox"]').checked;
  const b2H = tempRow.cells[6].querySelector('input[type="checkbox"]').checked;
  const b2Val = tempRow.cells[6].querySelector('input[type="number"]').value;

  if (f1H) {
    actions.push("Hotspot has been detected at VCB chamber of the panel. Necessary checking of breaker Male-Female contact points are to be done. Proper tightening of breaker spout contacts and all other junction points must be carried out. IR value of VIs must also be checked.");
  }
  if (b1H && !b2Val) {
    actions.push("Hotspot has been detected at rear Bus Section/CT/Cable chamber. Thus, necessary checking bus contact point, bus spout & bus support insulator must be checked and tightened . Also, all the CT/cable contact points & nut bolts of CT/Cable Chamber are needed to be tightened. Thorough Cleaning & maintenance of the said CT/cable chambers also should be done.");
  }
  if (b1H && b2Val) {
    actions.push("Hotspot has been detected at rear Bus section of the panel. Necessary checking bus contact point, bus spout & bus support insulator must be checked and tightened.");
  }
  if (b2H) {
    actions.push("Hotspot has been detected at CT/Cable chamber. All the CT/cable contact points & nut bolts of CT/Cable Chamber are needed to be tightened. Thorough Cleaning & maintenance of the said CT/cable chambers also should be done.");
  }
}

// NEW: Ultrasound-based Action logic
if (usRow) {
  const f1Val = usRow.cells[4].querySelector('input')?.value;
  const b1Val = usRow.cells[5].querySelector('input')?.value;
  const b2Val = usRow.cells[6].querySelector('input')?.value;
  const ptVal = usRow.cells[7].querySelector('input')?.value;
  const s1Val = usRow.cells[8].querySelector('input')?.value;
  const s2Val = usRow.cells[9].querySelector('input')?.value;

  const tempB2Val = tempRow?.cells[6].querySelector('input[type="number"]')?.value;

  if (f1Val) {
    actions.push("Partial Discharge as noted, was found on the VCB chamber of the panel. Thus, maintenance, cleaning of the said VCB chambers as well as checking of breaker alignment and Insulation Measurement of the VI must be done.");
  }

  if (b1Val && b2Val) {
    actions.push("Partial Discharge as noted, was found on the rear side of Bus Section of the panel. Thus, thorough checking of bus chambers, bus spouts and bus support insulators of these panels should be done. Cleaning & maintenance of the said bus chambers also should be done.");
    actions.push("Partial Discharge as noted, was found on the rear side of CT/Cable Chamber of the panel. Thus, thorough maintenance of the CT/Cable chamber should be done. Bus & CT spouts are to be checked. Electrical clearance of cable lead between phases and phase to earth to be checked.");
  } 

  else if (b1Val && !tempB2Val) {
    actions.push("Partial Discharge as noted, was found on the rear side of Bus Section/CT/Cable Chamber of the panel. Thus, thorough checking of bus chambers, bus spouts and bus support insulators of these panels should be done. Cleaning & maintenance of the said bus chambers also should be done. Also, thorough maintenance of the CT/Cable chamber should be done. Bus & CT spouts are to be checked. Electrical clearance of cable lead between phases and phase to earth to be checked.");
  }  
  
  else if (!b1Val && b2Val) {
    actions.push("Partial Discharge as noted, was found on the rear side of CT/Cable Chamber of the panel. Thus, thorough maintenance of the CT/Cable chamber should be done. Bus & CT spouts are to be checked. Electrical clearance of cable lead between phases and phase to earth to be checked.");
  }

  if (ptVal) {
    actions.push("Partial Discharge as noted, was found on the PT chamber of the panel. Maintenance of the said PT chamber including fixed and moving parts is to be done. Checking of PT alignment must also to be done.");
  }

  if (s1Val || s2Val) {
    actions.push("Partial Discharge as noted, was found on the side Bus Section of the panel. Thus, maintenance of side bus section is be done.");
  }
}


// Roman numeral generator
const toRoman = (num) => {
  const romans = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
  return romans[num - 1] || num;
};

if (actions.length > 0) {
  // Create multiline effect using <div> inside the cell
  actionTd.innerHTML = actions.map((txt, idx) => 
`<div style="font-size:0.6rem; text-align:left;">${toRoman(idx + 1)}. ${txt}</div>`).join('');
} else {
  actionTd.textContent = '';
}

tr.appendChild(actionTd);



    return tr;
  }

  const header11 = document.createElement('tr');
  const td11 = document.createElement('td');
  td11.colSpan = COL_COUNT;
  td11.textContent = '11KV Panels';
  td11.style.fontWeight = 'bold';
  td11.style.textAlign = 'center';
  header11.appendChild(td11);
  liveTbody.appendChild(header11);

  table11Body.querySelectorAll('tr').forEach((r, i) => {
    r.index = i;
    liveTbody.appendChild(buildPanelRow(r, true));
  });

  const rows33 = table33Body.querySelectorAll('tr');
  if (rows33.length) {
    const header33 = document.createElement('tr');
    const td33 = document.createElement('td');
    td33.colSpan = COL_COUNT;
    td33.textContent = '33KV Panels';
    td33.style.fontWeight = 'bold';
    td33.style.textAlign = 'center';
    header33.appendChild(td33);
    liveTbody.appendChild(header33);

    rows33.forEach((r, i) => {
      r.index = i;
      liveTbody.appendChild(buildPanelRow(r, false));
    });
  }
}


  // fire on any change in your Panel-Load tables:
  ['input','change'].forEach(evt => {
    table11Body.addEventListener(evt, populateLiveTable);
    table33Body.addEventListener(evt, populateLiveTable);
  });

// fire on any change in your Temperature tables:
document.querySelector('#tableTemp11 tbody').addEventListener('input', populateLiveTable);
document.querySelector('#tableTemp11 tbody').addEventListener('change', populateLiveTable);

document.querySelector('#tableTemp33 tbody').addEventListener('input', populateLiveTable);
document.querySelector('#tableTemp33 tbody').addEventListener('change', populateLiveTable);

// fire on any change in your Ultrasound tables:
document.querySelector('#tableUltrasound11 tbody').addEventListener('input', populateLiveTable);
document.querySelector('#tableUltrasound11 tbody').addEventListener('change', populateLiveTable);

document.querySelector('#tableUltrasound33 tbody').addEventListener('input', populateLiveTable);
document.querySelector('#tableUltrasound33 tbody').addEventListener('change', populateLiveTable);

// fire on any change in your TEV tables:
document.querySelector('#tableTEV11 tbody').addEventListener('input', populateLiveTable);
document.querySelector('#tableTEV11 tbody').addEventListener('change', populateLiveTable);

document.querySelector('#tableTEV33 tbody').addEventListener('input', populateLiveTable);
document.querySelector('#tableTEV33 tbody').addEventListener('change', populateLiveTable);


  // initial render
  // hydrate TEV & Temp tables once on load
populateTEV11();
populateTEV33();
populateTemp11();
populateTemp33();

// now build the live table
populateLiveTable();




});
