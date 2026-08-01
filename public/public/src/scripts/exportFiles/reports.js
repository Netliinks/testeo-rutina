import { reportToStimate } from "../tools.js";

//import {generateFile } from "../tools";
export const exportReportPdf = (ar, start, end) => {
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
    generateFile(rows, "Reportes", "csv");
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
    generateFile(rows, "Reportes", "xls");
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
