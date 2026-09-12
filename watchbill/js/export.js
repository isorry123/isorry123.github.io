/* ============================================================
   export.js — Save to PDF (print)
   ============================================================ */

function exportToPdf() {
  document.body.classList.add('printing');
  window.print();
  setTimeout(() => document.body.classList.remove('printing'), 300);
}
