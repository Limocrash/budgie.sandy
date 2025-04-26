/**
 * app.js — Budgie Main Page Scripts
 *
 * This script is ONLY for the index.html landing page.
 * It handles dynamic button creation from Config.js
 * and basic homepage setup.
 */

// Wait for DOM to load before executing
window.addEventListener("DOMContentLoaded", () => {
    const linkMap = {
      FORM_EXPENSE_ID: "Quick Expense Entry",
      FORM_LOAN_EXISTING_ID: "New Loan – Existing Borrower",
      FORM_LOAN_NEW_ID: "New Loan – New Borrower",
      FORM_REPAYMENT_ID: "Loan Repayment",
      VIEW_EXPENSES_PAGE: "View Selected Entries",
      SCRIPT_WEBAPP_URL: "View Dashboard"
    };
  
    const container = document.getElementById("linkContainer");
    if (!container) return;
  
    for (const key in linkMap) {
      const url = BUDGIE_CONFIG[key];
      if (url && url.startsWith("http")) {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.textContent = linkMap[key];
        link.className = "link-tile";
        container.appendChild(link);
      }
    }
  });
  