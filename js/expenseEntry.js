/** expenseEntry.js **/

// ---------- constants built from config.js ----------
if (!window.BUDGIE_CONFIG || !window.BUDGIE_CONFIG.APPS_SCRIPT_ID) {
  throw new Error('BUDGIE_CONFIG or APPS_SCRIPT_ID is not defined. Ensure config.js is loaded first.');
}
const BASE = `https://script.google.com/macros/s/${window.BUDGIE_CONFIG.APPS_SCRIPT_ID}/exec`;
const CAT_URL   = `${BASE}?action=getCategories`;
const SAVE_URL  = `${BASE}?action=addExpense`;
console.log('Config in expenseEntry.js:', window.BUDGIE_CONFIG);

// ---------- load category map ----------

async function saveExpense(expenseData) {
  try {
    const response = await fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'addExpense',
        ...expenseData,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Expense saved:', result);
    return result;
  } catch (err) {
    console.error('Error saving expense:', err);
    throw err;
  }
}

// immediately‑invoked async to build dropdowns
(async ()=>{
  const map    = await loadCategoryMap();
  const catSel = document.getElementById('category');
  const subSel = document.getElementById('subcategory');

  // populate Category dropdown
  Object.keys(map).forEach(cat=>{
    catSel.add(new Option(cat, cat));
  });

  // when Category changes, rebuild Sub list
  catSel.addEventListener('change', ()=>{
    subSel.innerHTML = '';
    map[catSel.value].forEach(sub=>{
      subSel.add(new Option(sub, sub));
    });
  });
})();

// ---------- submit handler ----------
document.getElementById('expense-form').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const payload = {
    date:        document.getElementById('date').value,
    amount:      Number(document.getElementById('amount').value),
    category:    document.getElementById('category').value,
    subcategory: document.getElementById('subcategory').value,
    description: document.getElementById('description').value || '',
    payMethod:   document.getElementById('payMethod').value || '',
  };

  try {
    const res = await fetch(SAVE_URL, {
      method : "POST",
      headers: {"Content-Type":"application/json"},
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
  } catch(err){
    alert('Save failed: ' + err.message);
    console.error(err);
  }
});
// ---------- end of file ----------