/* ======================================================================
 *  expenseEntry.js     (Budgie 0.1.15, 2025‑05‑10)/* -----------------------------------------------------------
 * -----------------------------------------------------------
 *  • Reads window.BUDGIE_CONFIG (injected by Config.js)
 *  • GET  /exec?action=getCategories   → build Cat / Sub‑cat dropdowns
 *  • POST /exec?action=addExpense      → save one expense row
 * 
 * version 0.1.15 stardate: 20250511.1006
 * ====================================================================*/
/* ------------ 0. Config ------------- */
const SAVE_URL   = 'https://script.google.com/macros/s/AKfycbzXYPCQnM3WpoHx.../exec';
const CATS_URL   = SAVE_URL + '?action=getCategories';    // JSON‑P

/* ------------ 1.  Load category map via JSON‑P ------------- */
(function injectJsonP () {
  const s = document.createElement('script');
  s.src = CATS_URL;
  document.head.appendChild(s);
})();

window.loadCategoryMap = function (map) {     // called by JSON‑P
  console.log('Category map', map);
  buildCategoryUI(map);
};

/* ------------ 2.  Build the dropdowns ------------- */
function buildCategoryUI (map) {
  const catSel = document.getElementById('category');
  const subSel = document.getElementById('subcategory');

  // populate main list
  Object.keys(map).forEach(cat => catSel.add(new Option(cat, cat)));

  // on change, refill sub list
  catSel.addEventListener('change', () => {
    subSel.innerHTML = '';
    (Array.isArray(map[catSel.value]) ? map[catSel.value] : [])
      .forEach(sub => subSel.add(new Option(sub, sub)));
  });
}

/* ------------ 3.  Who’s checked? ------------- */
function getCheckedBeneficiaries () {
  return Array.from(
    document.querySelectorAll('#beneficiaries input:checked')
  ).map(cb => cb.value);           // ["P001", "P003"]
}

/* ------------ 4.  Submit ------------- */
document.getElementById('expense-form')
        .addEventListener('submit', async e => {
  e.preventDefault();

  const payload = {
    action       : 'addExpense',
    date         : document.getElementById('date').value,
    amount       : document.getElementById('amount').value,
    category     : document.getElementById('category').value,
    subcategory  : document.getElementById('subcategory').value,
    description  : document.getElementById('description').value,
    payMethod    : document.getElementById('paymethod').value,
    beneficiaries: getCheckedBeneficiaries()
  };

  try {
    await fetch(SAVE_URL, {
      method : 'POST',
      mode   : 'no-cors',                    // ← 💡 key trick
      headers: { 'Content-Type': 'text/plain' },
      body   : JSON.stringify(payload)
    });
    alert('Saved 👍');                       // we can’t inspect response
    e.target.reset();
  } catch (err) {
    alert('Save failed – offline?');
  }
});
