/** expenseEntry.js
 *  
 * 
 */
// ---------- load category map ----------
async function loadCategoryMap() {
    const liveURL = "https://script.google.com/macros/s/" + APPS_SCRIPT_ID + "/exec?action=getCategories";   // <- replace
    try {
      const res = await fetch(liveURL, {cache:'no-store'});
      if (!res.ok) throw new Error('live fetch failed');
      return await res.json();
    } catch(err) {
      console.warn('Using fallback categories.json', err);
      const fallback = await fetch('/data/categories.json');
      return fallback.json();
    }
  }
  
  (async ()=>{
    const map    = await loadCategoryMap();
    const catSel = document.getElementById('category');
    const subSel = document.getElementById('subcategory');
  
    // populate category dropdown
    Object.keys(map).forEach(cat=>{
      catSel.add(new Option(cat, cat));
    });
  
    // on category change, populate sub list
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
      const res = await fetch("YOUR_APPS_SCRIPT_URL/exec?action=addExpense", {
        method : "POST",
        headers: {"Content-Type":"application/json"},
        body   : JSON.stringify(payload)
      });
      const out = await res.json();
      if(out.ok){
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
  