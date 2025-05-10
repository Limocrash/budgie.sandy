/* ======================================================================
 *  expenseEntry.js     (Budgie 0.1.15, 2025‑05‑10)/* -----------------------------------------------------------
 * -----------------------------------------------------------
 *  • Reads window.BUDGIE_CONFIG (injected by Config.js)
 *  • GET  /exec?action=getCategories   → build Cat / Sub‑cat dropdowns
 *  • POST /exec?action=addExpense      → save one expense row
 * 
 * version 0.1.15 stardate: 20250510.2111
 * ----------------------------------------------------------------------
 *  – JSON‑P for read‑only GET (avoids CORS)
 *  – JSON POST for write (addExpense)
 * ====================================================================*/

/* ---------- 0.  Config ------------------------------------------------ */
if (!window.BUDGIE_CONFIG?.APPS_SCRIPT_ID) {
  alert('Config.js missing APPS_SCRIPT_ID'); throw new Error('No config');
}
const BASE     = `https://script.google.com/macros/s/${window.BUDGIE_CONFIG.APPS_SCRIPT_ID}/exec`;
const CAT_URL  = `${BASE}?action=getCategories&callback=handleCats&_=${Date.now()}`;
const SAVE_URL = `${BASE}?action=addExpense`;

console.log('Booting expenseEntry', { CAT_URL, SAVE_URL });

/* ---------- 1.  JSON‑P loader ---------------------------------------- */
function handleCats(map) {
  /* map = { "Category name": ["Sub A","Sub B"], … } */
  buildCategoryUI(map);
}

/* inject a script tag – JSON‑P response will call handleCats() */
(function fetchCategories () {
  const s = document.createElement('script');
  s.src = CAT_URL;
  s.onerror = () => {
    alert('Failed to load categories – check Apps Script deployment.');
  };
  document.head.appendChild(s);
})();

/* ---------- 2.  Build UI once JSON‑P arrives ------------------------- */
function buildCategoryUI (map) {
  const catSel = document.getElementById('category');
  const subSel = document.getElementById('subcategory');

  /* populate category dropdown */
  Object.keys(map).forEach(cat => catSel.add(new Option(cat, cat)));

  /* on category change → fill sub‑list */
  catSel.addEventListener('change', () => {
    subSel.innerHTML = '';
    (map[catSel.value] || []).forEach(sub =>
      subSel.add(new Option(sub, sub))
    );
  });
}

/* ---------- 3.  Helper: checked beneficiaries ------------------------ */
function getCheckedBeneficiaries () {
  return Array.from(document.querySelectorAll('#beneficiaries input:checked'))
              .map(cb => cb.value);  // ["P001", "P003"]
}

/* ---------- 4.  Submit handler -------------------------------------- */
document.getElementById('expense-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    action       : 'addExpense',
    date         : document.getElementById('date').value,
    amount       : Number(document.getElementById('amount').value),
    category     : document.getElementById('category').value,
    subcategory  : document.getElementById('subcategory').value,
    description  : document.getElementById('description').value || '',
    payMethod    : document.getElementById('payMethod').value    || '',
    beneficiaries: getCheckedBeneficiaries()
  };

  try {
    const res  = await fetch(SAVE_URL, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload)
    });
    const out = await res.json();

    if (out.ok) {
      alert(`Saved!  ExpenseID ${out.id}`);
      e.target.reset();
      document.getElementById('subcategory').innerHTML = '';
    } else {
      throw new Error(out.msg || 'Server error');
    }
  } catch (err) {
    alert('Save failed: ' + err.message);
    console.error(err);
  }
});
