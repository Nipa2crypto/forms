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
    for (const file of files) {
      out.push({ name: file.name, dataUrl: await fileToDataUrl(file) });
    }
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
    doc.text('Max Heidegger AG', 14, 11.5);
    doc.setFontSize(13);
    doc.text(title, 196, 11.5, { align: 'right' });
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
  function getImageDimensions(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      img.onerror = reject;
      img.src = dataUrl;
    });
  }
  async function addImagesToPdf(doc, images, startY, options = {}) {
    if (!images?.length) return startY;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = options.marginX ?? 14;
    const marginBottom = options.marginBottom ?? 14;
    const gap = options.gap ?? 6;
    const maxWidth = options.maxWidth ?? ((pageWidth - (marginX * 2) - gap) / 2);
    const maxHeight = options.maxHeight ?? 58;
    let x = marginX;
    let y = startY;
    let col = 0;

    for (const image of images) {
      const dataUrl = typeof image === 'string' ? image : image.dataUrl;
      const label = typeof image === 'string' ? '' : (image.name || '');
      const dims = await getImageDimensions(dataUrl);
      let drawW = maxWidth;
      let drawH = dims.height ? (drawW * dims.height / dims.width) : maxHeight;
      if (drawH > maxHeight) {
        drawH = maxHeight;
        drawW = dims.width ? (drawH * dims.width / dims.height) : maxWidth;
      }
      const blockHeight = drawH + (label ? 7 : 2);
      if (y + blockHeight > pageHeight - marginBottom) {
        doc.addPage();
        y = 20;
        x = marginX;
        col = 0;
      }
      doc.setDrawColor(210, 214, 220);
      doc.rect(x, y, drawW, drawH);
      const format = dataUrl.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(dataUrl, format, x, y, drawW, drawH, undefined, 'FAST');
      if (label) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(75, 85, 99);
        const text = label.length > 42 ? `${label.slice(0, 39)}...` : label;
        doc.text(text, x, y + drawH + 4);
      }
      if (col === 0) {
        x = marginX + maxWidth + gap;
        col = 1;
      } else {
        x = marginX;
        y += blockHeight + gap;
        col = 0;
      }
    }
    if (col === 1) {
      y += maxHeight + 8;
    }
    return y;
  }
  function savePdf(doc, fileNameBase) {
    const stamp = new Date().toISOString().slice(0, 10);
    doc.save(`${fileNameBase}_${stamp}.pdf`);
  }
  return {
    byId, formatMoney, escapeText, showStatus, collectFiles, collectImageData,
    getPdf, pdfHeader, pdfMetaTable, pdfSectionTitle, addImagesToPdf, savePdf
  };
})();
