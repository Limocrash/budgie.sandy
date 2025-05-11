/* ======================================================================
 *  expenseEntry.js     (Budgie 0.1.15, 2025‑05‑10)/* -----------------------------------------------------------
 * -----------------------------------------------------------
 *  • Reads window.BUDGIE_CONFIG (injected by Config.js)
 *  • GET  /exec?action=getCategories   → build Cat / Sub‑cat dropdowns
 *  • POST /exec?action=addExpense      → save one expense row
 * 
 * version 0.1.15 stardate: 20250511.2127
 * ====================================================================*/
// --- MINIMAL JSON‑P + NO‑CORS VERSION ---

const BASE = `https://script.google.com/macros/s/${window.BUDGIE_CONFIG.APPS_SCRIPT_ID}/exec`;

/* 1. load categories via JSON‑P */
(function () {
  const cb  = 'loadCategoryMap';
  const s   = document.createElement('script');
  s.src = `${BASE}?action=getCategories&callback=${cb}&_=${Date.now()}`;
  document.head.appendChild(s);
})();

window.loadCategoryMap = map => {
  const catSel = document.getElementById('category');
  const subSel = document.getElementById('subcategory');
  Object.keys(map).forEach(c => catSel.add(new Option(c, c)));
  catSel.addEventListener('change', () => {
    subSel.innerHTML = '';
    (map[catSel.value] || []).forEach(sc => subSel.add(new Option(sc, sc)));
  });
};

/* 2. submit (no‑CORS) */
document.getElementById('expense-form').addEventListener('submit', async e => {
  e.preventDefault();
  const p = {
    action      : 'addExpense',
    date        : document.getElementById('date').value,
    amount      : Number(document.getElementById('amount').value),
    category    : document.getElementById('category').value,
    subcategory : document.getElementById('subcategory').value,
    description : document.getElementById('description').value,
    payMethod   : document.getElementById('payMethod').value      // <- fixed
  };
  
  await fetch(BASE, {
    method : 'POST',
    mode   : 'no-cors',
    headers: { 'Content-Type':'text/plain' },
    body   : JSON.stringify(p)
  });
  alert('Saved!');
  e.target.reset();
});
