import { reportToStimate, generateFileSimpleXls, generateFileSimpleCsv } from "../tools.js";
import { exportNetGuardStatisticalReport } from "./statisticalReport.js";

//import {generateFile } from "../tools";
const exportReportPdfPortraitLegacy = (ar, start, end) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF();
    doc.addImage("./public/src/assets/pictures/report.png", "PNG", 10, 10, 30, 10);
    doc.setDrawColor(0, 0, 128);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 128);
    doc.setFontSize(25);
    doc.text(10, 30, `Reportes`);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'italic');
    doc.text(135, 30, `Fecha: Desde ${start} Hasta ${end}`);
    //construimos cabecera del csv
    doc.setFont(undefined, 'bold');
    doc.line(5, 34.8, 205, 34.8);
    doc.setFillColor(210, 210, 210);
    doc.rect(5, 35, 200, 10, 'F');
    doc.text(10, 40, "Fecha");
    doc.text(30, 40, "Hora");
    doc.text(50, 40, "Usuario");
    doc.text(90, 40, "Título");
    doc.text(140, 40, "Contenido");
    doc.line(5, 45, 205, 45);
    let row = 50;
    let pagina = 1;
    doc.setTextColor(0, 0, 128);
    doc.text(10, 290, `Página ${pagina}`);
    //resto del contenido
    for (let i = 0; i < ar.length; i++) {
        let report = ar[i];
        let rowTitle = 0;
        let rowDescription = 0;
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(10, row, `${report.fecha}`);
        doc.text(30, row, `${report.hora}`);
        var lMargin = 50; //left margin in mm
        var rMargin = 5; //right margin in mm
        var pdfInMM = 90; //210;  // width of A4 in mm
        var paragraph = doc.splitTextToSize(report.usuario, (pdfInMM - lMargin - rMargin));
        doc.text(lMargin, row, paragraph);

        lMargin = 90; //left margin in mm
        rMargin = 5; //right margin in mm
        pdfInMM = 140; //210;  // width of A4 in mm
        paragraph = doc.splitTextToSize(report.titulo, (pdfInMM - lMargin - rMargin));
        doc.text(lMargin, row, paragraph);
        rowTitle = calculateRow(report.titulo.length,"titulo");

        lMargin = 140; //left margin in mm
        rMargin = 5; //right margin in mm
        pdfInMM = 210; //210;  // width of A4 in mm
        paragraph = doc.splitTextToSize(report.contenido, (pdfInMM - lMargin - rMargin));
        doc.text(lMargin, row, paragraph);
        rowDescription = calculateRow(report.contenido.length,"parrafo");

        rowTitle > rowDescription ? row += rowTitle : row += rowDescription
        if(report.imagen != ''){
            doc.addImage(`${report.imagen}`, "JPEG", 80, row, 50, 30);
            row+=35
        }
        doc.setDrawColor(210, 210, 210);
        doc.line(5, row, 205, row);
        if ((row+newDataBlock(ar,i)) > 280) {
            doc.addPage();
            row = 30;
            pagina += 1;
            doc.setFontSize(10);
            doc.setFont(undefined, 'italic');
            doc.text(135, 10, `Fecha: Desde ${start} Hasta ${end}`);
            doc.setFont(undefined, 'bold');
            //construimos cabecera del csv
            doc.setDrawColor(0, 0, 128);
            doc.line(5, 15, 205, 15);
            doc.setFillColor(210, 210, 210);
            doc.rect(5, 15, 200, 10, 'F');
            doc.text(10, 20, "Fecha");
            doc.text(30, 20, "Hora");
            doc.text(50, 20, "Usuario");
            doc.text(90, 20, "Título");
            doc.text(140, 20, "Contenido");
            doc.line(5, 25, 205, 25);
            doc.setTextColor(0, 0, 128);
            doc.text(10, 290, `Página ${pagina}`);
        }else{
            row += 5;
        }
    }
    // Save the PDF
    var d = new Date();
    var title = "log_Reportes_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.pdf`;
    doc.save(title);
};

// Generador vigente: conserva los registros de reportes y los presenta con
// la identidad visual horizontal utilizada en los reportes de visitas y rutinas.
export const exportReportPdf = (ar, start, end) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const reports = Array.isArray(ar) ? ar : [];
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    let y = 10;
    let pageNumber = 1;

    const fullUserName = (value) => String(value ?? '').trim() || 'Sin usuario';
    const uniqueUsers = new Set(reports.map((report) => fullUserName(report?.usuario)));
    const attachments = reports.filter((report) => String(report?.imagen ?? '').trim() !== '').length;
    const now = new Date();
    const generatedAt = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const drawFooter = (number) => {
        doc.setFillColor(248, 249, 252);
        doc.rect(margin, pageHeight - 14, contentWidth, 8, 'F');
        doc.setFont(undefined, 'normal');
        doc.setTextColor(145, 145, 145);
        doc.setFontSize(7);
        doc.text('Registro de Reportes · NetGuard by Netliinks', margin + 3, pageHeight - 9);
        doc.text(`Página ${number}`, pageWidth / 2, pageHeight - 9, { align: 'center' });
        doc.text('info@netliinks.com · https://netliinks.com/netguard', pageWidth - margin - 3, pageHeight - 9, { align: 'right' });
    };
    const drawHeader = (continuation = false) => {
        doc.setFillColor(0, 32, 96);
        doc.rect(margin, 10, contentWidth, 2, 'F');
        // Se conserva el logo original que ya usa el reporte de NetGuard.
        doc.addImage('./public/src/assets/pictures/logo_os.png', 'PNG', margin, 15.75, 48, 8.5);
        doc.setTextColor(0, 32, 96);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(15);
        doc.text(continuation ? 'REGISTRO DE REPORTES · CONTINUACIÓN' : 'REGISTRO DE REPORTES', pageWidth / 2, 21, { align: 'center' });
        doc.setFont(undefined, 'normal');
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(8);
        doc.text('Bitácora Digital · Historial de reportes', pageWidth / 2, 26, { align: 'center' });
        doc.setFontSize(7);
        doc.text(`Fecha: ${generatedAt}`, pageWidth - margin, 20, { align: 'right' });
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, 32, pageWidth - margin, 32);
        y = 37;
    };
    const drawSection = (title, detail = '') => {
        doc.setFillColor(27, 94, 170);
        doc.rect(margin, y, 1.2, 4.5, 'F');
        doc.setTextColor(0, 32, 96);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(8);
        doc.text(title, margin + 3, y + 3.3);
        if (detail) {
            doc.setFont(undefined, 'normal');
            doc.setTextColor(145, 145, 145);
            doc.setFontSize(7);
            doc.text(detail, pageWidth - margin, y + 3.3, { align: 'right' });
        }
        y += 7;
    };
    const drawSummary = () => {
        const cards = [
            { label: 'TOTAL REPORTES', value: reports.length, color: [0, 32, 96] },
            { label: 'USUARIOS REGISTRADORES', value: uniqueUsers.size, color: [25, 100, 190] },
            { label: 'CON EVIDENCIA', value: attachments, color: [27, 138, 65] },
            { label: 'SIN EVIDENCIA', value: reports.length - attachments, color: [188, 130, 0] },
        ];
        const cardWidth = contentWidth / cards.length;
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
            { label: 'ORIGEN', value: 'NetGuard · Registro de Reportes' },
            { label: 'TOTAL REGISTROS', value: `${reports.length} reportes registrados` },
        ];
        const width = contentWidth / cells.length;
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
        const counts = reports.reduce((result, report) => {
            const user = fullUserName(report?.usuario);
            result[user] = (result[user] || 0) + 1;
            return result;
        }, {});
        const users = Object.entries(counts).map(([user, count]) => `${user} (${count})`).join(' · ') || 'Sin registros';
        const lines = doc.splitTextToSize(users, contentWidth - 8);
        const height = Math.max(10, (lines.length * 3.5) + 5);
        doc.setFillColor(248, 249, 252);
        doc.setDrawColor(225, 229, 235);
        doc.rect(margin, y, contentWidth, height, 'FD');
        doc.setTextColor(70, 70, 80);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(7);
        doc.text(lines, margin + 3, y + 5);
        y += height + 6;
    };

    const columns = [
        { key: 'number', label: '#', width: 7 },
        { key: 'date', label: 'FECHA', width: 20 },
        { key: 'time', label: 'HORA', width: 16 },
        { key: 'user', label: 'USUARIO', width: 34 },
        { key: 'title', label: 'TÍTULO', width: 42 },
        { key: 'content', label: 'CONTENIDO', width: 136 },
        { key: 'evidence', label: 'ADJUNTO', width: 22 },
    ];
    const evidencePhotos = [];
    const evidenceLinks = [];
    const columnX = {};
    let x = margin;
    columns.forEach((column) => {
        columnX[column.key] = x;
        x += column.width;
    });
    const drawTableHeader = () => {
        doc.setFillColor(0, 32, 96);
        doc.rect(margin, y, contentWidth, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(6);
        columns.forEach((column) => {
            doc.text(
                doc.splitTextToSize(column.label, column.width - 2),
                columnX[column.key] + (column.width / 2),
                y + 3.1,
                { align: 'center' },
            );
        });
        y += 8;
    };
    const drawEvidence = (image, xPosition, yPosition, width, height) => {
        if (!image) return false;
        try {
            // Los adjuntos llegan como URL blob:. getImageProperties() los
            // procesa por segunda vez y puede bloquear jsPDF con exportaciones
            // grandes. Una única inserción conserva la evidencia y finaliza el PDF.
            doc.addImage(image, 'JPEG', xPosition + 2, yPosition + 2, width - 4, height - 4);
            return true;
        } catch (error) {
            console.warn('No se pudo incluir la evidencia del reporte en el PDF.', error);
            return false;
        }
    };
    const addPage = () => {
        doc.addPage();
        pageNumber++;
        drawHeader(true);
        drawSection('BITÁCORA DE REPORTES', `${reports.length} registros`);
        drawTableHeader();
    };

    drawHeader();
    drawSummary();
    drawPeriod();
    drawUsers();
    drawSection('BITÁCORA DE REPORTES', `${reports.length} registros`);
    drawTableHeader();
    reports.forEach((report, index) => {
        const values = {
            number: String(index + 1),
            date: String(report?.fecha ?? '-') || '-',
            time: String(report?.hora ?? '-') || '-',
            user: fullUserName(report?.usuario),
            title: String(report?.titulo ?? '').trim() || '-',
            content: String(report?.contenido ?? '').trim() || '-',
        };
        doc.setFont(undefined, 'normal');
        doc.setFontSize(6.2);
        const lines = {};
        columns.filter((column) => column.key !== 'evidence').forEach((column) => {
            lines[column.key] = doc.splitTextToSize(values[column.key], column.width - 3);
        });
        const textLines = Math.max(...Object.values(lines).map((value) => value.length));
        const hasEvidence = String(report?.imagen ?? '').trim() !== '';
        const rowHeight = Math.max(9, (textLines * 3.2) + 3.5);
        if (y + rowHeight > pageHeight - 18) addPage();
        let evidencePhoto;
        if (hasEvidence) {
            evidencePhoto = { ...report, reportNumber: index + 1 };
            evidencePhotos.push(evidencePhoto);
            evidenceLinks.push({
                photo: evidencePhoto,
                page: doc.internal.getCurrentPageInfo().pageNumber,
                x: columnX.evidence,
                y,
                width: columns[6].width,
                height: rowHeight,
            });
        }
        if (index % 2 === 1) {
            doc.setFillColor(250, 250, 250);
            doc.rect(margin, y, contentWidth, rowHeight, 'F');
        }
        doc.setDrawColor(228, 228, 228);
        doc.rect(margin, y, contentWidth, rowHeight, 'S');
        columns.forEach((column, columnIndex) => {
            if (columnIndex > 0) doc.line(columnX[column.key], y, columnX[column.key], y + rowHeight);
            if (column.key === 'evidence') return;
            doc.setTextColor(50, 50, 55);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(column.key === 'content' ? 6 : 6.2);
            doc.text(lines[column.key], columnX[column.key] + 1.5, y + 4.5);
        });
        doc.setTextColor(hasEvidence ? 27 : 145, hasEvidence ? 94 : 145, hasEvidence ? 170 : 145);
        doc.setFont(undefined, hasEvidence ? 'bold' : 'italic');
        doc.setFontSize(5.8);
        doc.text(hasEvidence ? 'Ver anexo' : 'Sin adjunto', columnX.evidence + (columns[6].width / 2), y + (rowHeight / 2) + 1, { align: 'center' });
        y += rowHeight;
    });
    if (evidencePhotos.length) {
        const photoCardWidth = 85;
        const photoCardHeight = 62;
        const photoImageHeight = 48;
        const photoGap = 6;
        const startEvidencePage = (continuation = false) => {
            doc.addPage();
            pageNumber++;
            drawHeader(true);
            drawSection(continuation ? 'ANEXO FOTOGRÁFICO - CONTINUACIÓN' : 'ANEXO FOTOGRÁFICO', `${evidencePhotos.length} fotografías · Evidencias de reportes`);
        };

        // Las evidencias nunca comparten la tabla: se presentan en su propio anexo.
        startEvidencePage();
        let photoX = margin;
        evidencePhotos.forEach((report, imageIndex) => {
            if (y + photoCardHeight > pageHeight - 18) {
                startEvidencePage(true);
                photoX = margin;
            }
            doc.setDrawColor(225, 229, 235);
            doc.roundedRect(photoX, y, photoCardWidth, photoCardHeight, 1.5, 1.5, 'S');
            report.annexPage = doc.internal.getCurrentPageInfo().pageNumber;
            report.annexY = y;
            const evidenceAdded = drawEvidence(report.imagen, photoX, y, photoCardWidth, photoImageHeight + 2);
            if (!evidenceAdded) {
                doc.setFillColor(243, 244, 246);
                doc.rect(photoX + 2, y + 2, photoCardWidth - 4, photoImageHeight - 2, 'F');
                doc.setTextColor(145, 145, 145);
                doc.setFont(undefined, 'italic');
                doc.setFontSize(7);
                doc.text('Adjunto no disponible', photoX + (photoCardWidth / 2), y + 25, { align: 'center' });
            }
            doc.setFillColor(248, 249, 252);
            doc.rect(photoX + 1, y + photoImageHeight + 1, photoCardWidth - 2, photoCardHeight - photoImageHeight - 2, 'F');
            doc.setTextColor(35, 50, 75);
            doc.setFont(undefined, 'bold');
            doc.setFontSize(6.8);
            doc.text(`Reporte ${report.reportNumber} · ${String(report.fecha ?? '-')} ${String(report.hora ?? '')}`, photoX + 3, y + photoImageHeight + 6);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(6.3);
            const photoTitle = doc.splitTextToSize(String(report.titulo ?? '').trim() || 'Sin título', photoCardWidth - 6).slice(0, 1);
            doc.text(photoTitle, photoX + 3, y + photoImageHeight + 10);
            photoX += photoCardWidth + photoGap;
            if (photoX + photoCardWidth > pageWidth - margin || imageIndex === evidencePhotos.length - 1) {
                photoX = margin;
                y += photoCardHeight + 5;
            }
        });
    }
    evidenceLinks.forEach((link) => {
        if (!link.photo.annexPage) return;
        doc.setPage(link.page);
        doc.link(link.x, link.y, link.width, link.height, {
            pageNumber: link.photo.annexPage,
            top: link.photo.annexY,
            // jsPDF requiere un zoom numérico. Un valor textual deja el PDF
            // inválido para los lectores del navegador.
            zoom: 0,
        });
    });
    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);
        drawFooter(page);
    }
    const date = new Date();
    doc.save(`log_Reportes_${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}.pdf`);
};

export const exportReportCsv = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let note = ar[i];
        let noteCreationDateAndTime = note.creationDate.split('T');
        let noteCreationDate = noteCreationDateAndTime[0];
        let noteCreationTime = noteCreationDateAndTime[1];
        // @ts-ignore
        //if (noteCreationDate >= start && noteCreationDate <= end) {
            let obj = {
                "Empresa": `${note.customer?.name.split("\n").join("(salto)")}`,
                "Título": `${note.title.split("\n").join("(salto)")}`,
                "Fecha": `${noteCreationDate}`,
                "Hora": `${noteCreationTime}`,
                "Nombre": `${note.user?.firstName ?? ''} ${note.user?.lastName ?? ''}`,
                "Usuario": `${note.user?.username ?? ''}`,
                "Contenido": `${note.content.split("\n").join("(salto)")}`,
            };
            rows.push(obj);
        //}
    }
    generateFileSimpleCsv(rows, "Reportes", "csv");
};
export const exportReportXls = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let note = ar[i];
        let noteCreationDateAndTime = note.creationDate.split('T');
        let noteCreationDate = noteCreationDateAndTime[0];
        let noteCreationTime = noteCreationDateAndTime[1];
        // @ts-ignore
        //if (noteCreationDate >= start && noteCreationDate <= end) {
            let obj = {
                "Empresa": `${note.customer?.name.split("\n").join("(salto)")}`,
                "Título": `${note.title.split("\n").join("(salto)")}`,
                "Fecha": `${noteCreationDate}`,
                "Hora": `${noteCreationTime}`,
                "Nombre": `${note.user?.firstName ?? ''} ${note.user?.lastName ?? ''}`,
                "Usuario": `${note.user?.username ?? ''}`,
                "Contenido": `${note.content.split("\n").join("(salto)")}`,
            };
            rows.push(obj);
        //}
    }
    generateFileSimpleXls(rows, "Reportes", "xls");
};
const generateFile = (ar, title, extension) => {
    //comprobamos compatibilidad
    if (window.Blob && (window.URL || window.webkitURL)) {
        var contenido = "", d = new Date(), blob, reader, save, clicEvent;
        //creamos contenido del archivo
        for (var i = 0; i < ar.length; i++) {
            //construimos cabecera del csv
            if (i == 0)
                contenido += Object.keys(ar[i]).join(";") + "\n";
            //resto del contenido
            contenido += Object.keys(ar[i]).map(function (key) {
                return ar[i][key];
            }).join(";") + "\n";
        }
        //creamos el blob
        blob = new Blob(["\ufeff", contenido], { type: `text/${extension}` });
        //creamos el reader
        // @ts-ignore
        var reader = new FileReader();
        reader.onload = function (event) {
            //escuchamos su evento load y creamos un enlace en dom
            save = document.createElement('a');
            // @ts-ignore
            save.href = event.target.result;
            save.target = '_blank';
            //aquí le damos nombre al archivo
            save.download = "log_" + title + "_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.${extension}`;
            try {
                //creamos un evento click
                clicEvent = new MouseEvent('click', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                });
            }
            catch (e) {
                //si llega aquí es que probablemente implemente la forma antigua de crear un enlace
                clicEvent = document.createEvent("MouseEvent");
                // @ts-ignore
                clicEvent.click();
            }
            //disparamos el evento
            save.dispatchEvent(clicEvent);
            //liberamos el objeto window.URL
            (window.URL || window.webkitURL).revokeObjectURL(save.href);
        };
        //leemos como url
        reader.readAsDataURL(blob);
    }
    else {
        //el navegador no admite esta opción
        alert("Su navegador no permite esta acción");
    }
};

const calculateRow = (length, mode) => {
    let row = 0;
    let limit = 0; // limite de lineas
    if(mode=="parrafo"){
        limit = 47;
    }else if(mode=="titulo"){
        limit = 30;
    }
    let lineCount = Math.ceil(length / limit);
    for(let i = 1; i <= lineCount; i++){
        if(length <= (limit * i)){  //124 caracteres cada linea aprox en total margen A4
            row += (4*i);
        }
    }
    return row;
}

const newDataBlock = (array, index) => {
    let row = 0;
    if(array[index+1] != undefined){
        row+=5;
        let rowTitle = calculateRow(array[index+1]?.titulo.length,"titulo");
        let rowDescription = calculateRow(array[index+1]?.contenido.length,"parrafo");
        rowTitle > rowDescription ? row += rowTitle : row += rowDescription;
        if(array[index+1]?.imagen != '')
            row+=35
    }
    return row;
}

export const generarReporteXls = async (conditions, reports) => {
    const statisticalRows = await reportToStimate(conditions, reports);
    return exportNetGuardStatisticalReport({
        title: 'REPORTE DE INGRESO DE CONSIGNAS (REPORTES)',
        filename: 'Cumplimiento_Reporte.xlsx',
        conditions,
        rows: statisticalRows.map((user) => ({ customer: user.customer, user: `[${user.username}] ${user.name}`, required: user.requerido, completed: user.reports, compliance: user.cumplimiento })),
        glossary: [
            { term: 'Requeridos', definition: 'Cantidad de consignas esperadas para el usuario durante el período seleccionado.' },
            { term: 'Realizados', definition: 'Cantidad de consignas registradas durante el período seleccionado.' },
            { term: 'Cumplimiento', definition: 'Porcentaje calculado por NetGuard: realizados / requeridos.' }
        ]
    });
    // @ts-ignore
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Reporte");
    const usuarios = await reportToStimate(conditions, reports);
    // Encabezado principal
    const titulo = sheet.addRow(["REPORTE DE INGRESO DE CONSIGNAS (REPORTES)"]);
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
        const row = sheet.addRow([u["customer"], `[${u["username"]}] ${u["name"]}`, u["requerido"], u["reports"], u["cumplimiento"] == 'N/A' ? u["cumplimiento"] : `${u["cumplimiento"]}%`]);
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
    link.download = "Cumplimiento_Reporte.xlsx";
    link.click();
    URL.revokeObjectURL(blobUrl);
    // @ts-ignore
    //window.location=link;
};
