import { visitToStimate, generateFileSimpleXls, generateFileSimpleCsv } from "../tools.js";
import { exportNetGuardStatisticalReport } from "./statisticalReport.js";

const exportVisitPdfPortraitLegacy = (ar, start, end) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const totalPagesExp = "{total_pages_count_string}";
    // 1. Calculate Summary Stats
    const stats = {
        total: ar.length,
        finalizado: ar.filter((v) => v.visitState?.name === 'Finalizado').length,
        enCurso: ar.filter((v) => v.visitState?.name === 'En Curso').length,
        pendiente: ar.filter((v) => v.visitState?.name === 'Pendiente').length,
        emergente: ar.filter((v) => v.visitState?.name === 'Emergente').length,
    };
    // 2. Group visits by user
    const userCounts = ar.reduce((acc, visit) => {
        const userName = `${visit.user?.firstName ?? ''} ${visit.user?.lastName ?? ''}`.trim() || visit.user?.username || 'Sistema';
        acc[userName] = (acc[userName] || 0) + 1;
        return acc;
    }, {});
    const now = new Date();
    const timestamp = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    let y = 10;
    let currentPage = 1;
    const drawHeader = () => {
        // Thick blue line at top
        doc.setFillColor(0, 32, 96);
        doc.rect(10, 10, pageWidth - 20, 2, 'F');
        // Logo on the left - Resized to match the tight text block height
        doc.addImage("./public/src/assets/pictures/logo_os.png", "PNG", 10, 16.5, 33, 11);
        // Title and Subtitle - Restored tight vertical spacing
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 32, 96);
        doc.setFontSize(16);
        doc.text("REGISTRO DE VISITAS", 65, 22);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text("Bitácora Digital · Historial de accesos", 65, 27);
        // Date/Time on the right
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Fecha: ${timestamp}`, pageWidth - 10, 25, { align: 'right' });
        // Thin line at the bottom of header
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.line(10, 32, pageWidth - 10, 32);
        y = 36;
    };
    const drawFooter = (pageNumber) => {
        const oldSize = doc.getFontSize();
        const oldColor = doc.getTextColor();
        // Footer background bar
        doc.setFillColor(248, 249, 252);
        doc.rect(10, pageHeight - 15, pageWidth - 20, 10, 'F');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont(undefined, 'normal');
        // Left side: Text + Logo
        const footerLeftText = "Registro de Visitas · NetGuard by ";
        doc.text(footerLeftText, 13, pageHeight - 9);
        const textWidth = doc.getTextWidth(footerLeftText);
        // Adjusted height to 3.5mm and y position to align perfectly with the 8pt text
        doc.addImage("./public/src/assets/pictures/logo_n.png", "PNG", 13 + textWidth + 1, pageHeight - 12.1, 14, 3.5);
        // Center: Page number
        doc.text(`Página ${pageNumber}`, pageWidth / 2, pageHeight - 9, { align: 'center' });
        // Right side: Contact info
        doc.text("info@netliinks.com · https://netliinks.com/netguard", pageWidth - 13, pageHeight - 9, { align: 'right' });
        doc.setFontSize(oldSize);
        doc.setTextColor(oldColor[0], oldColor[1], oldColor[2]);
    };
    const drawSecondaryHeader = () => {
        // Thick blue line at top
        doc.setFillColor(0, 32, 96);
        doc.rect(10, 10, pageWidth - 20, 2, 'F');
        // Light gray bar
        doc.setFillColor(248, 249, 252);
        doc.rect(10, 12, pageWidth - 20, 6, 'F');
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 32, 96);
        doc.text("NETGUARD", 15, 16.5);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text(" · VIGIA · OCEANSECURITY MATRIZ", 32, 16.5);
        y = 22;
    };
    const drawSectionTitle = (title) => {
        doc.setFillColor(0, 32, 96);
        doc.rect(10, y, 1.2, 4, 'F');
        doc.setFontSize(9);
        doc.setTextColor(0, 32, 96);
        doc.setFont(undefined, 'bold');
        doc.text(title, 13, y + 3.2);
        if (title === "BITÁCORA DE VISITAS") {
            doc.setFontSize(7.5);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(150, 150, 150);
            doc.text(`${stats.total} registros`, pageWidth - 10, y + 3.2, { align: 'right' });
        }
        y += 7;
    };
    const drawSummaryCards = () => {
        const containerWidth = pageWidth - 20;
        const containerHeight = 18;
        const cardWidth = containerWidth / 5;
        doc.setFillColor(248, 249, 252);
        doc.setDrawColor(235, 235, 235);
        doc.roundedRect(10, y, containerWidth, containerHeight, 1.5, 1.5, 'FD');
        const cards = [
            { label: 'Total Registros', value: stats.total, color: [70, 70, 70] },
            { label: 'Finalizado', value: stats.finalizado, color: [40, 167, 69] },
            { label: 'En Curso', value: stats.enCurso, color: [0, 123, 255] },
            { label: 'Pendiente', value: stats.pendiente, color: [255, 193, 7] },
            { label: 'Emergente', value: stats.emergente, color: [220, 53, 69] }
        ];
        cards.forEach((card, index) => {
            const x = 10 + (index * cardWidth);
            if (index > 0) {
                doc.setDrawColor(230, 230, 230);
                doc.setLineWidth(0.1);
                doc.line(x, y + 3, x, y + containerHeight - 3);
            }
            doc.setTextColor(120, 120, 120);
            doc.setFontSize(6.5);
            doc.setFont(undefined, 'normal');
            doc.text(card.label.toUpperCase(), x + (cardWidth / 2), y + 6, { align: 'center' });
            doc.setTextColor(card.color[0], card.color[1], card.color[2]);
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(card.value.toString(), x + (cardWidth / 2), y + 14, { align: 'center' });
        });
        y += containerHeight + 6;
    };
    const drawPeriodDetails = () => {
        drawSectionTitle("DETALLE DEL PERIODO");
        const gridWidth = pageWidth - 20;
        const cellWidth = gridWidth / 2;
        const cellHeight = 7;
        const labelWidth = 30; // Fixed width for labels
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.15);
        // Main container with rounded corners
        doc.roundedRect(10, y, gridWidth, cellHeight * 2, 1.5, 1.5, 'D');
        // Row 1: Label Backgrounds
        doc.setFillColor(248, 250, 252);
        doc.rect(10.1, y + 0.1, labelWidth - 0.1, cellHeight - 0.1, 'F');
        doc.rect(10 + cellWidth + 0.1, y + 0.1, labelWidth - 0.1, cellHeight - 0.1, 'F');
        // Row 2: Label Backgrounds
        doc.rect(10.1, y + cellHeight + 0.1, labelWidth - 0.1, cellHeight - 0.2, 'F');
        doc.rect(10 + cellWidth + 0.1, y + cellHeight + 0.1, labelWidth - 0.1, cellHeight - 0.2, 'F');
        // Draw internal lines
        doc.line(10, y + cellHeight, 10 + gridWidth, y + cellHeight); // Horizontal divider
        doc.line(10 + cellWidth, y, 10 + cellWidth, y + (cellHeight * 2)); // Vertical center divider
        doc.line(10 + labelWidth, y, 10 + labelWidth, y + (cellHeight * 2)); // Label divider 1
        doc.line(10 + cellWidth + labelWidth, y, 10 + cellWidth + labelWidth, y + (cellHeight * 2)); // Label divider 2
        doc.setFontSize(6.5);
        doc.setTextColor(100, 100, 100);
        // Labels
        doc.setFont(undefined, 'bold');
        doc.text("DESDE", 13, y + 4.5);
        doc.text("HASTA", 10 + cellWidth + 3, y + 4.5);
        doc.text("ORIGEN", 13, y + cellHeight + 4.5);
        doc.text("TOTAL REGISTROS", 10 + cellWidth + 3, y + cellHeight + 4.5);
        // Values
        doc.setTextColor(50, 50, 50);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(7.5);
        doc.text(start || '-', 10 + labelWidth + 3, y + 4.5);
        doc.text(end || '-', 10 + cellWidth + labelWidth + 3, y + 4.5);
        doc.text("NetGuard · Control de Visitas", 10 + labelWidth + 3, y + cellHeight + 4.5);
        doc.text(`${stats.total} visitas registradas`, 10 + cellWidth + labelWidth + 3, y + cellHeight + 4.5);
        y += (cellHeight * 2) + 6;
    };
    const drawUserList = () => {
        const userText = Object.entries(userCounts)
            .map(([name, count]) => `${name} (${count})`)
            .join("  ·  ");
        const splitUsers = doc.splitTextToSize(userText, pageWidth - 30);
        const boxHeight = (splitUsers.length * 4) + 2;
        if (y + boxHeight + 15 > pageHeight - 20) {
            doc.addPage();
            currentPage++;
            drawSecondaryHeader();
            y = 25;
        }
        drawSectionTitle("USUARIOS REGISTRADORES");
        doc.setFillColor(248, 249, 252);
        doc.setDrawColor(235, 235, 235);
        doc.roundedRect(10, y, pageWidth - 20, boxHeight, 1.5, 1.5, 'FD');
        doc.setFontSize(7);
        doc.setTextColor(80, 80, 80);
        doc.setFont(undefined, 'normal');
        doc.text(splitUsers, 15, y + 4.5);
        y += boxHeight + 6;
    };
    const drawTableHeader = () => {
        doc.setFillColor(0, 32, 96);
        doc.rect(10, y, pageWidth - 20, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.text("#", 12, y + 5.5);
        doc.text("VISITANTE", 20, y + 5.5);
        doc.text("DNI", 68, y + 5.5);
        doc.text("ENTRADA", 92, y + 5.5);
        doc.text("SALIDA", 118, y + 5.5);
        doc.text("USUARIO", 145, y + 5.5);
        doc.text("ESTADO", 175, y + 5.5);
        y += 10;
    };
    // Initial page setup
    drawHeader();
    drawSummaryCards();
    drawPeriodDetails();
    drawUserList();
    drawSectionTitle("BITÁCORA DE VISITAS");
    drawTableHeader();
    drawFooter(currentPage);
    ar.forEach((visit, i) => {
        const visitorName = `${visit.firstName ?? ''} ${visit.firstLastName ?? ''} ${visit.secondLastName ?? ''}`.trim();
        const userName = `${visit.user?.firstName ?? ''} ${visit.user?.lastName ?? ''}`.trim() || visit.user?.username || '-';
        // Recalibrated distribution
        const colW = { visitor: 43, dni: 20, ingress: 24, egress: 24, user: 28 };
        const xPos = { index: 12, visitor: 20, dni: 68, ingress: 92, egress: 118, user: 145, state: 175 };
        // Set font state BEFORE calculating any splits
        doc.setFontSize(7);
        doc.setFont(undefined, 'normal');
        // Adaptive font for long visitor names
        let currentVisitorFS = 7;
        if (visitorName.length > 25)
            currentVisitorFS = 6;
        doc.setFontSize(currentVisitorFS);
        const visitorSplit = doc.splitTextToSize(visitorName, colW.visitor);
        // Adaptive font for long DNI
        const dniRaw = visit.dni || '-';
        let currentDniFS = 7;
        if (dniRaw.length > 12)
            currentDniFS = 5.5;
        doc.setFontSize(currentDniFS);
        const dniSplit = doc.splitTextToSize(dniRaw, colW.dni);
        // Adaptive font for long user names
        let currentUserFS = 7;
        if (userName.length > 18)
            currentUserFS = 6;
        doc.setFontSize(currentUserFS);
        const userSplit = doc.splitTextToSize(userName, colW.user);
        doc.setFontSize(7); // Base for others
        // Entry/Exit
        const ingressDateSplit = doc.splitTextToSize(visit.ingressDate || '-', colW.ingress);
        const ingressTimeSplit = doc.splitTextToSize(visit.ingressTime || '-', colW.ingress);
        const egressDateSplit = doc.splitTextToSize(visit.egressDate || '-', colW.egress);
        const egressTimeSplit = doc.splitTextToSize(visit.egressTime || '-', colW.egress);
        const maxLines = Math.max(visitorSplit.length, dniSplit.length, userSplit.length, ingressDateSplit.length + ingressTimeSplit.length, egressDateSplit.length + egressTimeSplit.length, 2);
        const rowHeight = (maxLines * 4) + 4;
        if (y + rowHeight > pageHeight - 20) {
            doc.addPage();
            currentPage++;
            drawSecondaryHeader();
            drawSectionTitle("BITÁCORA DE VISITAS");
            drawTableHeader();
            drawFooter(currentPage);
        }
        if (i % 2 === 1) {
            doc.setFillColor(250, 250, 250);
            doc.rect(10, y, pageWidth - 20, rowHeight, 'F');
        }
        doc.setDrawColor(230, 230, 230);
        doc.line(10, y + rowHeight, pageWidth - 10, y + rowHeight);
        doc.setTextColor(50, 50, 50);
        // Draw Row Content
        doc.setFontSize(7);
        doc.text((i + 1).toString(), xPos.index, y + 6);
        doc.setFontSize(currentVisitorFS);
        doc.text(visitorSplit, xPos.visitor, y + 6);
        doc.setFontSize(currentDniFS);
        doc.text(dniSplit, xPos.dni, y + 6);
        doc.setFontSize(7);
        // Entry
        doc.setFont(undefined, 'bold');
        doc.text(ingressDateSplit, xPos.ingress, y + 6);
        doc.setFont(undefined, 'normal');
        doc.text(ingressTimeSplit, xPos.ingress, y + 6 + (ingressDateSplit.length * 3.8));
        // Exit
        doc.setFont(undefined, 'bold');
        doc.text(egressDateSplit, xPos.egress, y + 6);
        doc.setFont(undefined, 'normal');
        doc.text(egressTimeSplit, xPos.egress, y + 6 + (egressDateSplit.length * 3.8));
        doc.setFontSize(currentUserFS);
        doc.text(userSplit, xPos.user, y + 6);
        doc.setFontSize(7);
        // Status Badge
        const state = visit.visitState?.name || 'Desconocido';
        let stateColor = [150, 150, 150];
        let bgColor = [240, 240, 240];
        if (state === 'Finalizado') {
            stateColor = [40, 167, 69];
            bgColor = [232, 245, 233];
        }
        else if (state === 'Pendiente') {
            stateColor = [255, 193, 7];
            bgColor = [255, 248, 225];
        }
        else if (state === 'En Curso') {
            stateColor = [0, 123, 255];
            bgColor = [227, 242, 253];
        }
        else if (state === 'Emergente') {
            stateColor = [220, 53, 69];
            bgColor = [255, 235, 238];
        }
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.roundedRect(xPos.state, y + 2, 22, 5, 1, 1, 'F');
        doc.setFillColor(stateColor[0], stateColor[1], stateColor[2]);
        doc.circle(xPos.state + 2.5, y + 4.5, 0.8, 'F');
        doc.setTextColor(stateColor[0], stateColor[1], stateColor[2]);
        doc.setFontSize(5.5);
        doc.setFont(undefined, 'bold');
        doc.text(state.toUpperCase(), xPos.state + 4.5, y + 5.5);
        y += rowHeight;
    });
    if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
    }
    var d = new Date();
    var title = "log_Visitas_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + ".pdf";
    doc.save(title);
};

// El formato horizontal permite conservar todos los campos de la bitácora sin
// truncar el detalle de entrada/salida. Se mantienen los logotipos actuales
// del reporte (logo_os y logo_n); la maqueta recibida solo sirve de referencia.
export const exportVisitPdf = (ar, start, end) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const tableWidth = pageWidth - (margin * 2);
    let y = 10;
    let pageNumber = 1;

    const fullName = (user) => `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
    const guardName = (user) => fullName(user) || user?.username || '-';
    const stateName = (visit) => visit?.visitState?.name?.trim() || 'Sin estado';
    const stateKey = (visit) => stateName(visit).toLocaleLowerCase();
    const displayDateTime = (date, time) => {
        const value = `${date ?? ''} ${time ?? ''}`.trim();
        return value || '-';
    };
    const stats = {
        total: ar.length,
        finalizado: ar.filter((visit) => stateKey(visit) === 'finalizado').length,
        enCurso: ar.filter((visit) => stateKey(visit) === 'en curso').length,
        pendiente: ar.filter((visit) => stateKey(visit) === 'pendiente').length,
        emergente: ar.filter((visit) => stateKey(visit) === 'emergente').length,
    };
    const userCounts = ar.reduce((acc, visit) => {
        const name = guardName(visit?.user) || 'Sistema';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});
    const now = new Date();
    const timestamp = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const statusColors = (state) => {
        if (state === 'Finalizado') return { text: [27, 138, 65], background: [232, 245, 233] };
        if (state === 'Pendiente') return { text: [188, 130, 0], background: [255, 248, 225] };
        if (state === 'En Curso') return { text: [25, 100, 190], background: [227, 242, 253] };
        if (state === 'Emergente') return { text: [200, 45, 60], background: [255, 235, 238] };
        return { text: [100, 100, 100], background: [240, 240, 240] };
    };
    const drawFooter = (number) => {
        doc.setFillColor(248, 249, 252);
        doc.rect(margin, pageHeight - 14, tableWidth, 8, 'F');
        doc.setFont(undefined, 'normal');
        doc.setTextColor(145, 145, 145);
        doc.setFontSize(7);
        const footerText = 'Registro de Visitas · NetGuard by ';
        doc.text(footerText, margin + 3, pageHeight - 9);
        doc.addImage('./public/src/assets/pictures/logo_n.png', 'PNG', margin + 4 + doc.getTextWidth(footerText), pageHeight - 11.6, 14, 3.5);
        doc.text(`Página ${number}`, pageWidth / 2, pageHeight - 9, { align: 'center' });
        doc.text('info@netliinks.com · https://netliinks.com/netguard', pageWidth - margin - 3, pageHeight - 9, { align: 'right' });
    };
    const drawHeader = (continuation = false) => {
        doc.setFillColor(0, 32, 96);
        doc.rect(margin, 10, tableWidth, 2, 'F');
        // Versión optimizada del logo corporativo: mantiene el archivo liviano
        // en reportes de varias páginas y respeta la proporción original.
        doc.addImage('./public/src/assets/pictures/logo_os.png', 'PNG', margin, 15.75, 48, 8.5);
        doc.setTextColor(0, 32, 96);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(15);
        doc.text(continuation ? 'REGISTRO DE VISITAS · CONTINUACIÓN' : 'REGISTRO DE VISITAS', pageWidth / 2, 21, { align: 'center' });
        doc.setFont(undefined, 'normal');
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(8);
        doc.text('Bitácora Digital · Historial de accesos', pageWidth / 2, 26, { align: 'center' });
        doc.setFontSize(7);
        doc.text(`Fecha: ${timestamp}`, pageWidth - margin, 20, { align: 'right' });
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, 32, pageWidth - margin, 32);
        y = 37;
    };
    const drawSection = (title, details = '') => {
        doc.setFillColor(27, 94, 170);
        doc.rect(margin, y, 1.2, 4.5, 'F');
        doc.setTextColor(0, 32, 96);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(8);
        doc.text(title, margin + 3, y + 3.3);
        if (details) {
            doc.setFont(undefined, 'normal');
            doc.setTextColor(145, 145, 145);
            doc.setFontSize(7);
            doc.text(details, pageWidth - margin, y + 3.3, { align: 'right' });
        }
        y += 7;
    };
    const drawSummary = () => {
        const cards = [
            { label: 'TOTAL REGISTROS', value: stats.total, color: [0, 32, 96] },
            { label: 'FINALIZADO', value: stats.finalizado, color: [27, 138, 65] },
            { label: 'EN CURSO', value: stats.enCurso, color: [25, 100, 190] },
            { label: 'PENDIENTE', value: stats.pendiente, color: [188, 130, 0] },
            { label: 'EMERGENTE', value: stats.emergente, color: [200, 45, 60] },
        ];
        const cardWidth = tableWidth / cards.length;
        const cardHeight = 17;
        cards.forEach((card, index) => {
            const x = margin + (index * cardWidth);
            doc.setFillColor(248, 249, 252);
            doc.setDrawColor(225, 229, 235);
            doc.rect(x, y, cardWidth - 1.5, cardHeight, 'FD');
            doc.setTextColor(card.color[0], card.color[1], card.color[2]);
            doc.setFont(undefined, 'bold');
            doc.setFontSize(13);
            doc.text(String(card.value), x + ((cardWidth - 1.5) / 2), y + 7.5, { align: 'center' });
            doc.setTextColor(100, 100, 100);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(6.5);
            doc.text(card.label, x + ((cardWidth - 1.5) / 2), y + 12.5, { align: 'center' });
        });
        y += cardHeight + 6;
    };
    const drawPeriod = () => {
        drawSection('DETALLE DEL PERIODO');
        const cells = [
            { label: 'DESDE', value: start || '-' },
            { label: 'HASTA', value: end || '-' },
            { label: 'ORIGEN', value: 'NetGuard · Control de Visitas' },
            { label: 'TOTAL REGISTROS', value: `${stats.total} visitas registradas` },
        ];
        const width = tableWidth / cells.length;
        const height = 12;
        cells.forEach((cell, index) => {
            const x = margin + (index * width);
            doc.setFillColor(252, 253, 255);
            doc.setDrawColor(225, 229, 235);
            doc.rect(x, y, width, height, 'FD');
            doc.setTextColor(135, 135, 150);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(6);
            doc.text(cell.label, x + 3, y + 4);
            doc.setTextColor(35, 50, 75);
            doc.setFont(undefined, 'bold');
            doc.setFontSize(7.5);
            doc.text(doc.splitTextToSize(cell.value, width - 6), x + 3, y + 8);
        });
        y += height + 6;
    };
    const drawUsers = () => {
        drawSection('USUARIOS REGISTRADORES');
        const users = Object.entries(userCounts).map(([name, count]) => `${name} (${count})`).join(' · ') || 'Sin registros';
        const lines = doc.splitTextToSize(users, tableWidth - 8);
        const height = Math.max(10, (lines.length * 3.5) + 5);
        doc.setFillColor(248, 249, 252);
        doc.setDrawColor(225, 229, 235);
        doc.rect(margin, y, tableWidth, height, 'FD');
        doc.setTextColor(70, 70, 80);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(7);
        doc.text(lines, margin + 3, y + 5);
        y += height + 6;
    };

    const columns = [
        { key: 'index', label: '#', width: 7 },
        { key: 'visitor', label: 'VISITANTE', width: 49 },
        { key: 'dni', label: 'DNI', width: 22 },
        { key: 'department', label: 'DEPARTAMENTO VISITADO', width: 52 },
        { key: 'entry', label: 'ENTRADA', width: 27 },
        { key: 'entryBy', label: 'REGISTRA ENTRADA', width: 32 },
        { key: 'exit', label: 'SALIDA', width: 27 },
        { key: 'exitBy', label: 'REGISTRA SALIDA', width: 32 },
        { key: 'state', label: 'ESTADO', width: 29 },
    ];
    const xPositions = {};
    let currentX = margin;
    columns.forEach((column) => {
        xPositions[column.key] = currentX;
        currentX += column.width;
    });
    const drawTableHeader = () => {
        doc.setFillColor(0, 32, 96);
        doc.rect(margin, y, tableWidth, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(5.6);
        columns.forEach((column) => {
            const label = doc.splitTextToSize(column.label, column.width - 2);
            doc.text(label, xPositions[column.key] + 1.5, y + 3.1);
        });
        y += 8;
    };
    const addPage = () => {
        doc.addPage();
        pageNumber++;
        drawHeader(true);
        drawSection('BITÁCORA DE VISITAS', `${stats.total} registros`);
        drawTableHeader();
    };

    drawHeader();
    drawSummary();
    drawPeriod();
    drawUsers();
    drawSection('BITÁCORA DE VISITAS', `${stats.total} registros`);
    drawTableHeader();
    ar.forEach((visit, index) => {
        const values = {
            index: String(index + 1),
            visitor: `${visit?.firstName ?? ''} ${visit?.firstLastName ?? ''} ${visit?.secondLastName ?? ''}`.trim() || '-',
            dni: visit?.dni || '-',
            department: visit?.department?.name || '-',
            entry: displayDateTime(visit?.ingressDate, visit?.ingressTime),
            entryBy: guardName(visit?.ingressIssuedId),
            exit: displayDateTime(visit?.egressDate, visit?.egressTime),
            exitBy: guardName(visit?.egressIssuedId),
            state: stateName(visit),
        };
        doc.setFontSize(6.2);
        doc.setFont(undefined, 'normal');
        const linesByColumn = {};
        columns.forEach((column) => {
            linesByColumn[column.key] = doc.splitTextToSize(values[column.key], column.width - 3);
        });
        const maxLines = Math.max(...Object.values(linesByColumn).map((lines) => lines.length));
        const rowHeight = Math.max(8, (maxLines * 3.2) + 3.5);
        if (y + rowHeight > pageHeight - 18) addPage();
        if (index % 2 === 1) {
            doc.setFillColor(250, 250, 250);
            doc.rect(margin, y, tableWidth, rowHeight, 'F');
        }
        doc.setDrawColor(228, 228, 228);
        doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);
        columns.forEach((column) => {
            if (column.key === 'state') return;
            doc.setTextColor(50, 50, 55);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(column.key === 'dni' && values.dni.length > 13 ? 5.3 : 6.2);
            doc.text(linesByColumn[column.key], xPositions[column.key] + 1.5, y + 4.5);
        });
        const colors = statusColors(values.state);
        const stateColumn = columns.find((column) => column.key === 'state');
        const stateWidth = Math.min(stateColumn.width - 3, Math.max(16, doc.getTextWidth(values.state.toUpperCase()) + 7));
        doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
        doc.roundedRect(xPositions.state + 1.5, y + 1.8, stateWidth, 4.7, 0.8, 0.8, 'F');
        doc.setFillColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.circle(xPositions.state + 3.8, y + 4.15, 0.6, 'F');
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(5.2);
        doc.text(values.state.toUpperCase(), xPositions.state + 5.2, y + 5);
        y += rowHeight;
    });
    for (let page = 1; page <= pageNumber; page++) {
        doc.setPage(page);
        drawFooter(page);
    }
    const date = new Date();
    doc.save(`log_Visitas_${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}.pdf`);
};

export const exportVisitCsv = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let visit = ar[i];
        // @ts-ignore
        //if (visit.creationDate >= start && visit.creationDate <= end) {
            let obj = {
                "Empresa": `${visit.customer?.name.split("\n").join("(salto)")}`,
                "Nombre": `${visit.firstName} ${visit.firstLastName} ${visit.secondLastName}`,
                "DNI": `${visit.dni}`,
                "Fecha Creación": `${visit.creationDate}`,
                "Hora Creación": `${visit.creationTime}`,
                "Nombre Usuario": `${visit.user?.firstName ?? ''} ${visit.user?.lastName ?? ''}`,
                "Usuario": `${visit.user?.username ?? ''}`,
                "Tipo": `${verifyUserType(visit.user.userType)}`,
                "Departamento": `${visit.department?.name ?? ''}`,
                "Estado": `${visit.visitState?.name ?? ''}`,
                "Verificado": `${visit.verifiedDocument ? 'Si' : 'No'}`,
                "Favorita": `${visit.favorite ? 'Si' : 'No'}`,
                "Teléfono": `${visit.phoneNumber}`,
                "Autorizado": `${visit.authorizer}`,
                "Fecha Ingreso": `${visit.ingressDate}`,
                "Hora Ingreso": `${visit.ingressTime}`,
                "Emitido Ingreso": `${visit.ingressIssuedId?.firstName ?? ''} ${visit.ingressIssuedId?.lastName ?? ''}`,
                "Guardia Ingreso": `${visit.ingressIssuedId?.username ?? ''}`,
                "Fecha Salida": `${visit?.egressDate ?? ''}`,
                "Hora Salida": `${visit?.egressTime ?? ''}`,
                "Emitido Salida": `${visit.egressIssuedId?.firstName ?? ''} ${visit.egressIssuedId?.lastName ?? ''}`,
                "Guardia Salida": `${visit.egressIssuedId?.username ?? ''}`,
                "Asunto": `${visit.reason.split("\n").join("(salto)")}`,
            };
            rows.push(obj);
        //}
    }
    generateFileSimpleCsv(rows, "Visitas", "csv");
};
export const exportVisitXls = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let visit = ar[i];
        // @ts-ignore
        //if (visit.creationDate >= start && visit.creationDate <= end) {
            let obj = {
                "Empresa": `${visit.customer?.name.split("\n").join("(salto)")}`,
                "Nombre": `${visit.firstName} ${visit.firstLastName} ${visit.secondLastName}`,
                "DNI": `${visit.dni}`,
                "Fecha Creación": `${visit.creationDate}`,
                "Hora Creación": `${visit.creationTime}`,
                "Nombre Usuario": `${visit.user?.firstName ?? ''} ${visit.user?.lastName ?? ''}`,
                "Usuario": `${visit.user?.username ?? ''}`,
                "Tipo": `${verifyUserType(visit.user.userType)}`,
                "Departamento": `${visit.department?.name ?? ''}`,
                "Estado": `${visit.visitState?.name ?? ''}`,
                "Verificado": `${visit.verifiedDocument ? 'Si' : 'No'}`,
                "Favorita": `${visit.favorite ? 'Si' : 'No'}`,
                "Teléfono": `${visit.phoneNumber}`,
                "Autorizado": `${visit.authorizer}`,
                "Fecha Ingreso": `${visit.ingressDate}`,
                "Hora Ingreso": `${visit.ingressTime}`,
                "Emitido Ingreso": `${visit.ingressIssuedId?.firstName ?? ''} ${visit.ingressIssuedId?.lastName ?? ''}`,
                "Guardia Ingreso": `${visit.ingressIssuedId?.username ?? ''}`,
                "Fecha Salida": `${visit?.egressDate ?? ''}`,
                "Hora Salida": `${visit?.egressTime ?? ''}`,
                "Emitido Salida": `${visit.egressIssuedId?.firstName ?? ''} ${visit.egressIssuedId?.lastName ?? ''}`,
                "Guardia Salida": `${visit.egressIssuedId?.username ?? ''}`,
                "Asunto": `${visit.reason.split("\n").join("(salto)")}`,
            };
            rows.push(obj);
        //}
    }
    generateFileSimpleXls(rows, "Visitas", "xls");
};
const generateFile = (ar, title, extension) => {
    if (window.Blob && (window.URL || window.webkitURL)) {
        var contenido = "", d = new Date(), blob, reader, save, clicEvent;
        for (var i = 0; i < ar.length; i++) {
            if (i == 0)
                contenido += Object.keys(ar[i]).join(";") + "\n";
            contenido += Object.keys(ar[i]).map(function (key) {
                return ar[i][key];
            }).join(";") + "\n";
        }
        blob = new Blob(["\ufeff", contenido], { type: `text/${extension}` });
        // @ts-ignore
        var reader = new FileReader();
        reader.onload = function (event) {
            save = document.createElement('a');
            // @ts-ignore
            save.href = event.target.result;
            save.target = '_blank';
            save.download = "log_" + title + "_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.${extension}`;
            try {
                clicEvent = new MouseEvent('click', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                });
            }
            catch (e) {
                clicEvent = document.createEvent("MouseEvent");
                // @ts-ignore
                clicEvent.click();
            }
            save.dispatchEvent(clicEvent);
            (window.URL || window.webkitURL).revokeObjectURL(save.href);
        };
        reader.readAsDataURL(blob);
    }
    else {
        alert("Su navegador no permite esta acción");
    }
};
const verifyUserType = (userType) => {
    if (userType == 'CUSTOMER')
        return 'Cliente';
    else if (userType == 'GUARD')
        return 'Guardia';
    else if (userType == 'EMPLOYEE')
        return 'Empleado';
    else if (userType == 'CONTRACTOR')
        return 'Contratista';
    else
        return userType;
};
const splitText = (doc, field, lMargin, rMargin, pdfInMM) => {
    return doc.splitTextToSize(field, (pdfInMM - lMargin - rMargin));
};

export const generarReportVisitXls = async (conditions, visits) => {
    const statisticalRows = await visitToStimate(conditions, visits);
    return exportNetGuardStatisticalReport({
        title: 'REPORTE DE INGRESO DE PERSONAS (VISITAS EMERGENTES)',
        filename: 'Cumplimiento_Visita.xlsx',
        conditions,
        rows: statisticalRows.map((user) => ({ customer: user.customer, user: `[${user.username}] ${user.name}`, required: user.requerido, completed: user.visits, compliance: user.cumplimiento })),
        glossary: [
            { term: 'Requeridos', definition: 'Cantidad de ingresos emergentes esperados para el usuario durante el período seleccionado.' },
            { term: 'Realizados', definition: 'Cantidad de ingresos emergentes registrados por el usuario durante el período seleccionado.' },
            { term: 'Cumplimiento', definition: 'Porcentaje calculado por NetGuard: realizados / requeridos.' }
        ]
    });
    // @ts-ignore
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Personal");
    const usuarios = await visitToStimate(conditions, visits);
    // Encabezado principal
    const titulo = sheet.addRow(["REPORTE DE INGRESO DE PERSONAS (VISITAS EMERGENTES)"]);
    titulo.font = { bold: true, size: 14 };
    titulo.alignment = { horizontal: "center" };
    sheet.mergeCells("A1:E1");
    sheet.addRow([]);
    const fechas = sheet.addRow([`FECHA INICIAL: ${conditions.filterStartDate} - FECHA CORTE: ${conditions.filterEndDate}`]);
    fechas.font = { italic: true };
    sheet.mergeCells("A3:E3");
    sheet.addRow([]);
    const header = sheet.addRow([
        "Cliente",
        "Usuario",
        "Requeridos",
        "Realizados",
        "Cumplimiento",
    ]);
    header.font = { bold: true };
    header.alignment = { horizontal: "center" };
    // @ts-ignore
    header.eachCell(cell => {
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };
    });
    // Recorrer usuarios
    // @ts-ignore
    usuarios.forEach(u => {
        //const row = sheet.addRow([u["Usuario"], u["Total Alertas Generadas"], u["Total Alertas No Marcadas"], u["Total Alertas Respondidas"], u["Total Alertas Respondidas A Tiempo"], u["Cumplimiento"], u["Promedio"]]);
        const row = sheet.addRow([u["customer"], `[${u["username"]}] ${u["name"]}`, u["requerido"], u["visits"], u["cumplimiento"] == 'N/A' ? u["cumplimiento"] : `${u["cumplimiento"]}%`]);
        let cellIndex = 0;
        // @ts-ignore
        row.eachCell(cell => {
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            if(cellIndex < 2){
                cell.alignment = { horizontal: "left" };
            }else{
                cell.alignment = { horizontal: "center" };
            }
            
            cellIndex += 1;
        });
    });
    sheet.addRow([]);
    // Ajustar ancho de columnas
    sheet.columns = [
        { width: 30 },
        { width: 60 },
        { width: 25 },
        { width: 25 },
        { width: 25 },
    ];
    // Guardar archivo
    //await workbook.xlsx.writeFile("ReporteCumplimiento.xlsx");
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
    var blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "Cumplimiento_Visita.xlsx";
    link.click();
    URL.revokeObjectURL(blobUrl);
    // @ts-ignore
    //window.location=link;
};
