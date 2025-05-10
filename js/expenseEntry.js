/* -----------------------------------------------------------
 *  expenseEntry.js   –  Quick Expense Entry (v0.1.15)
 * -----------------------------------------------------------
 *  • Reads window.BUDGIE_CONFIG (injected by Config.js)
 *  • GET  /exec?action=getCategories   → build Cat / Sub‑cat dropdowns
 *  • POST /exec?action=addExpense      → save one expense row
 * --------------------------------------------------------- */

/* ---------- 1.  Config & URLs ---------- */
if (!window.BUDGIE_CONFIG?.APPS_SCRIPT_ID) {
  throw new Error('Config.js missing or APPS_SCRIPT_ID not defined.');
}

const BASE      = `https://script.google.com/macros/s/${window.BUDGIE_CONFIG.APPS_SCRIPT_ID}/exec`;
const CAT_URL   = `${BASE}?action=getCategories`;
const SAVE_URL  = `${BASE}?action=addExpense`;

console.log('Expense‑entry JS booted:', { CAT_URL, SAVE_URL });

/* ---------- 2.  Helper: load category → sub list ---------- */
async function loadCategoryMap () {
  try {
    const res = await fetch(CAT_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('live fetch failed');
    return await res.json();                    // { "Housing":[ "Rent", … ] }
  } catch (err) {
    console.warn('Using local fallback categories.json', err);
    const local = await fetch('data/categories.json');
    return local.json();
  }
}

/* ---------- 3.  Helper: collect checked beneficiaries ---------- */
function getCheckedBeneficiaries () {
  return Array.from(document.querySelectorAll('#beneficiaries input:checked'))
              .map(cb => cb.value);             // [ "P001", "P003" ]
}

/* ---------- 4.  Build dropdowns on page load ---------- */
(async () => {
  const map    = await loadCategoryMap();
  const catSel = document.getElementById('category');
  const subSel = document.getElementById('subcategory');

  Object.keys(map).forEach(cat => catSel.add(new Option(cat, cat)));

  catSel.addEventListener('change', () => {
    subSel.innerHTML = '';
    (map[catSel.value] || []).forEach(sub =>
      subSel.add(new Option(sub, sub))
    );
  });
})();

/* ---------- 5.  Submit handler ---------- */
document.getElementById('expense-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    action       : 'addExpense',                     // router key
    date         : document.getElementById('date').value,
    amount       : Number(document.getElementById('amount').value),
    category     : document.getElementById('category').value,
    subcategory  : document.getElementById('subcategory').value,
    description  : document.getElementById('description').value || '',
    payMethod    : document.getElementById('payMethod').value    || '',
    beneficiaries: getCheckedBeneficiaries()                     // ["P001"]
  };

  try {
    const res = await fetch(SAVE_URL, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload)
    });

    const out = await res.json();
    if (out.ok) {
      alert(`Saved!  ExpenseID ${out.expenseID}`);
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
