window.HeideggerForms = (() => {
  function byId(id) { return document.getElementById(id); }
  function formatMoney(value) {
    const num = Number(value || 0);
    return Number.isFinite(num) ? num.toFixed(2) : '0.00';
  }
  function escapeText(v) {
    return String(v ?? '').trim();
  }
  function showStatus(el, msg) {
    if (!el) return;
    el.textContent = msg;
    if (msg) {
      setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 2600);
    }
  }
  function collectFiles(input) {
    return input?.files ? [...input.files].map(f => f.name) : [];
  }
  async function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  async function collectImageData(input) {
    if (!input?.files?.length) return [];
    const files = [...input.files].filter(f => f.type.startsWith('image/'));
    const out = [];
    for (const file of files) out.push(await fileToDataUrl(file));
    return out;
  }
  function getPdf() {
    if (!window.jspdf?.jsPDF) {
      throw new Error('PDF-Bibliothek nicht geladen.');
    }
    return new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
  }
  function pdfHeader(doc, title, subtitle = 'Max Heidegger AG · Interne Formulare') {
    doc.setFillColor(17, 24, 39);
    doc.rect(0, 0, 210, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('MH', 14, 11.5);
    doc.setFontSize(13);
    doc.text(title, 24, 11.5);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(subtitle, 14, 24);
    doc.setDrawColor(210, 214, 220);
    doc.line(14, 27, 196, 27);
    return 32;
  }
  function pdfMetaTable(doc, rows, startY) {
    doc.autoTable({
      startY,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2.5, lineColor: [210,214,220], lineWidth: 0.2 },
      columnStyles: { 0: { fontStyle: 'bold', fillColor: [247,248,250], cellWidth: 38 } },
      body: rows.map(([label, value]) => [label, value || '—'])
    });
    return doc.lastAutoTable.finalY + 6;
  }
  function pdfSectionTitle(doc, title, y) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text(title, 14, y);
    return y + 2;
  }
  function savePdf(doc, fileNameBase) {
    const stamp = new Date().toISOString().slice(0, 10);
    doc.save(`${fileNameBase}_${stamp}.pdf`);
  }
  return {
    byId, formatMoney, escapeText, showStatus, collectFiles, collectImageData,
    getPdf, pdfHeader, pdfMetaTable, pdfSectionTitle, savePdf
  };
})();
