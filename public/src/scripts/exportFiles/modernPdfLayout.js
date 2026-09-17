const safe = (value, fallback = '-') => String(value ?? '').trim() || fallback;

const dateTime = () => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// Capa visual común. Las vistas de CS siguen preparando y consultando sus
// propios registros; este módulo únicamente los dibuja en el PDF.
export const createModernPdf = ({ title, subtitle, origin, start, end, rows, columns, filename, users = [], evidenceLabel = 'Evidencias', summary = null }) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = width - margin * 2;
    const generatedAt = dateTime();
    const photos = rows.filter(row => Boolean(row.image));
    const evidenceLinks = [];
    let y = 10;

    const header = (continued = false) => {
        doc.setFillColor(0, 32, 96);
        doc.rect(margin, 10, contentWidth, 2, 'F');
        // CS usa este logo corporativo en sus reportes de rutina actuales.
        // Si el lector no puede resolver el recurso local, el PDF se mantiene
        // válido y conserva una identidad textual en vez de abortar.
        try {
            doc.addImage('./public/src/assets/pictures/report.png', 'PNG', margin + 4, 15, 40, 10);
        } catch (_) {
            doc.setTextColor(0, 32, 96); doc.setFont(undefined, 'bold'); doc.setFontSize(11);
            doc.text('NETGUARD', margin + 4, 21);
        }
        doc.setTextColor(0, 32, 96); doc.setFont(undefined, 'bold'); doc.setFontSize(15);
        doc.text(continued ? `${title} · CONTINUACIÓN` : title, width / 2, 21, { align: 'center' });
        doc.setTextColor(120, 120, 120); doc.setFont(undefined, 'normal'); doc.setFontSize(8);
        doc.text(subtitle, width / 2, 26, { align: 'center' });
        doc.setFontSize(7); doc.text(`Fecha: ${generatedAt}`, width - margin, 20, { align: 'right' });
        doc.setDrawColor(220, 220, 220); doc.line(margin, 32, width - margin, 32);
        y = 37;
    };
    const footer = (page, total) => {
        doc.setFillColor(248, 249, 252); doc.rect(margin, height - 14, contentWidth, 8, 'F');
        doc.setTextColor(145, 145, 145); doc.setFont(undefined, 'normal'); doc.setFontSize(7);
        doc.text(`${title} · NetGuard by Netliinks`, margin + 3, height - 9);
        doc.text(`Página ${page} de ${total}`, width / 2, height - 9, { align: 'center' });
        doc.text('info@netliinks.com · netliinks.com/netguard', width - margin - 3, height - 9, { align: 'right' });
    };
    const section = (name, note = '') => {
        doc.setFillColor(27, 94, 170); doc.rect(margin, y, 1.2, 4.5, 'F');
        doc.setTextColor(0, 32, 96); doc.setFont(undefined, 'bold'); doc.setFontSize(8); doc.text(name, margin + 3, y + 3.3);
        if (note) { doc.setFont(undefined, 'normal'); doc.setTextColor(145, 145, 145); doc.setFontSize(7); doc.text(note, width - margin, y + 3.3, { align: 'right' }); }
        y += 7;
    };
    const pageBreak = (table = false) => {
        doc.addPage(); header(true);
        if (table) { section(`BITÁCORA DE ${title.replace('REGISTRO DE ', '').replace('REPORTE DE ', '')}`, `${rows.length} registros`); tableHeader(); }
    };
    const colX = {}; let x = margin;
    columns.forEach(column => { colX[column.key] = x; x += column.width; });
    const tableHeader = () => {
        doc.setFillColor(0, 32, 96); doc.rect(margin, y, contentWidth, 8, 'F');
        doc.setTextColor(255, 255, 255); doc.setFont(undefined, 'bold'); doc.setFontSize(5.8);
        columns.forEach(column => doc.text(doc.splitTextToSize(column.label, column.width - 2), colX[column.key] + column.width / 2, y + 3.1, { align: 'center' }));
        y += 8;
    };

    header();
    const cards = summary || [{ label: 'TOTAL REGISTROS', value: rows.length, color: [0, 32, 96] }, { label: 'CON EVIDENCIA', value: photos.length, color: [27, 138, 65] }, { label: 'SIN EVIDENCIA', value: rows.length - photos.length, color: [188, 130, 0] }];
    const cardWidth = contentWidth / cards.length;
    cards.forEach((card, index) => {
        const cardX = margin + index * cardWidth;
        doc.setFillColor(248, 249, 252); doc.setDrawColor(225, 229, 235); doc.rect(cardX, y, cardWidth - 1.5, 17, 'FD');
        doc.setTextColor(...card.color); doc.setFont(undefined, 'bold'); doc.setFontSize(13); doc.text(String(card.value), cardX + (cardWidth - 1.5) / 2, y + 7.5, { align: 'center' });
        doc.setTextColor(100, 100, 100); doc.setFont(undefined, 'normal'); doc.setFontSize(6.5); doc.text(card.label, cardX + (cardWidth - 1.5) / 2, y + 12.5, { align: 'center' });
    });
    y += 23;
    section('DETALLE DEL PERIODO');
    const details = [{ label: 'DESDE', value: safe(start) }, { label: 'HASTA', value: safe(end) }, { label: 'ORIGEN', value: origin }, { label: 'TOTAL', value: `${rows.length} registros` }];
    details.forEach((item, index) => {
        const cellWidth = contentWidth / details.length; const cellX = margin + index * cellWidth;
        doc.setFillColor(252, 253, 255); doc.setDrawColor(225, 229, 235); doc.rect(cellX, y, cellWidth, 12, 'FD');
        doc.setTextColor(135, 135, 150); doc.setFontSize(6); doc.text(item.label, cellX + 3, y + 4);
        doc.setTextColor(35, 50, 75); doc.setFont(undefined, 'bold'); doc.setFontSize(7.5); doc.text(doc.splitTextToSize(item.value, cellWidth - 6), cellX + 3, y + 8);
    });
    y += 18;
    if (users.length) {
        section('USUARIOS REGISTRADORES');
        const userText = doc.splitTextToSize(users.join(' · '), contentWidth - 8);
        const userHeight = Math.max(10, userText.length * 3.5 + 5);
        doc.setFillColor(248, 249, 252); doc.setDrawColor(225, 229, 235); doc.rect(margin, y, contentWidth, userHeight, 'FD');
        doc.setTextColor(70, 70, 80); doc.setFont(undefined, 'normal'); doc.setFontSize(7); doc.text(userText, margin + 3, y + 5); y += userHeight + 6;
    }
    section(`BITÁCORA DE ${title.replace('REGISTRO DE ', '').replace('REPORTE DE ', '')}`, `${rows.length} registros`); tableHeader();
    rows.forEach((row, index) => {
        const lines = {};
        columns.forEach(column => { lines[column.key] = doc.splitTextToSize(safe(row[column.key]), column.width - 3); });
        const rowHeight = Math.max(9, ...Object.values(lines).map(value => value.length * 3.2 + 3.5));
        if (y + rowHeight > height - 18) pageBreak(true);
        const attachmentColumn = columns.find(column => column.key === 'attachment');
        if (attachmentColumn && row.image) {
            evidenceLinks.push({ photo: row, page: doc.internal.getCurrentPageInfo().pageNumber, x: colX.attachment, y, width: attachmentColumn.width, height: rowHeight });
        }
        if (index % 2) { doc.setFillColor(250, 250, 250); doc.rect(margin, y, contentWidth, rowHeight, 'F'); }
        doc.setDrawColor(228, 228, 228); doc.rect(margin, y, contentWidth, rowHeight, 'S');
        columns.forEach((column, columnIndex) => {
            if (columnIndex) doc.line(colX[column.key], y, colX[column.key], y + rowHeight);
            if (column.key === 'attachment') {
                doc.setTextColor(row.image ? 27 : 145, row.image ? 94 : 145, row.image ? 170 : 145);
                doc.setFont(undefined, row.image ? 'bold' : 'italic'); doc.setFontSize(5.8);
                doc.text(lines[column.key], colX[column.key] + column.width / 2, y + rowHeight / 2 + 1, { align: 'center' });
                return;
            }
            doc.setTextColor(50, 50, 55); doc.setFont(undefined, column.key === 'state' ? 'bold' : 'normal'); doc.setFontSize(6.1);
            doc.text(lines[column.key], colX[column.key] + 1.5, y + 4.5);
        });
        y += rowHeight;
    });
    if (photos.length) {
        doc.addPage(); header(true); section('ANEXO FOTOGRÁFICO', `${photos.length} fotografías · ${evidenceLabel}`);
        const cardWidth = 85, cardHeight = 62, imageHeight = 48, gap = 6; let photoX = margin;
        photos.forEach((photo, index) => {
            if (y + cardHeight > height - 18) { doc.addPage(); header(true); section('ANEXO FOTOGRÁFICO - CONTINUACIÓN', `${photos.length} fotografías`); photoX = margin; }
            doc.setDrawColor(225, 229, 235); doc.roundedRect(photoX, y, cardWidth, cardHeight, 1.5, 1.5, 'S');
            photo.annexPage = doc.internal.getCurrentPageInfo().pageNumber; photo.annexY = y;
            try { doc.addImage(photo.image, 'JPEG', photoX + 2, y + 2, cardWidth - 4, imageHeight - 2); } catch (_) { doc.setFillColor(243, 244, 246); doc.rect(photoX + 2, y + 2, cardWidth - 4, imageHeight - 2, 'F'); }
            doc.setFillColor(248, 249, 252); doc.rect(photoX + 1, y + imageHeight + 1, cardWidth - 2, cardHeight - imageHeight - 2, 'F');
            doc.setTextColor(35, 50, 75); doc.setFont(undefined, 'bold'); doc.setFontSize(6.5); doc.text(safe(photo.caption), photoX + 3, y + imageHeight + 6);
            photoX += cardWidth + gap;
            if (photoX + cardWidth > width - margin || index === photos.length - 1) { photoX = margin; y += cardHeight + 5; }
        });
    }
    evidenceLinks.forEach((link) => {
        if (!link.photo.annexPage) return;
        doc.setPage(link.page);
        doc.link(link.x, link.y, link.width, link.height, { pageNumber: link.photo.annexPage, top: link.photo.annexY, zoom: 0 });
    });
    const pages = doc.getNumberOfPages();
    for (let page = 1; page <= pages; page++) { doc.setPage(page); footer(page, pages); }
    doc.save(filename);
};
