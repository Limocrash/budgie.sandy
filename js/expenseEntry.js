/* -----------------------------------------------------------
 *  expenseEntry.js   –  Quick Expense Entry front‑end
 * -----------------------------------------------------------
 *  ‣ Loads window.BUDGIE_CONFIG from Config.js
 *  ‣ Fetches category → sub‑category map (live → fallback)
 *  ‣ Builds the two dropdowns
 *  ‣ Collects Beneficiary check‑boxes
 *  ‣ Sends JSON payload to Apps Script endpoint
 * --------------------------------------------------------- */

/* ---------- constants built from Config.js ---------- */
if (!window.BUDGIE_CONFIG || !window.BUDGIE_CONFIG.APPS_SCRIPT_ID) {
  throw new Error('BUDGIE_CONFIG or APPS_SCRIPT_ID is not defined. Ensure js/Config.js is loaded first.');
}

const BASE      = `https://script.google.com/macros/s/${window.BUDGIE_CONFIG.APPS_SCRIPT_ID}/exec`;
const CAT_URL   = `${BASE}?action=getCategories`;
const SAVE_URL  = `${BASE}?action=addExpense`;

console.log('Config loaded:', window.BUDGIE_CONFIG);

/* ---------- load category map ---------- */
async function loadCategoryMap () {
  try {
    const res = await fetch(CAT_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('live fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('Using fallback categories.json', err);
    const fallback = await fetch('data/categories.json');
    return fallback.json();
  }
}

/* ---------- helper: collect checked beneficiaries ---------- */
function getCheckedBeneficiaries () {
  return [...document.querySelectorAll('#beneficiaries input:checked')]
           .map(cb => cb.value);                 // → ["P001","P003"]
}

/* ---------- immediately‑invoked async to build dropdowns ---------- */
(async () => {
  const map    = await loadCategoryMap();
  const catSel = document.getElementById('category');
  const subSel = document.getElementById('subcategory');

  // populate Category dropdown
  Object.keys(map).forEach(cat => {
    catSel.add(new Option(cat, cat));
  });

  // when Category changes, rebuild Sub list
  catSel.addEventListener('change', () => {
    subSel.innerHTML = '';
    (map[catSel.value] || []).forEach(sub => {
      subSel.add(new Option(sub, sub));
    });
  });
})();

/* ---------- submit handler ---------- */
document.getElementById('expense-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    date:          document.getElementById('date').value,
    amount:        Number(document.getElementById('amount').value),
    category:      document.getElementById('category').value,
    subcategory:   document.getElementById('subcategory').value,
    description:   document.getElementById('description').value || '',
    payMethod:     document.getElementById('payMethod').value   || '',
    beneficiaries: getCheckedBeneficiaries()                    // NEW field
  };

  try {
    const res = await fetch(SAVE_URL, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload)
    });

    const out = await res.json();
    if (out.ok) {
      alert(`Saved! ExpenseID ${out.expenseID}`);
      e.target.reset();
      document.getElementById('subcategory').innerHTML = '';
    } else {
      throw new Error(out.msg || 'Unknown error');
    }
  } catch (err) {
    alert('Save failed: ' + err.message);
    console.error(err);
  }
});
