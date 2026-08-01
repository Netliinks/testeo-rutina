//import {generateFile } from "../tools";
export const exportEventPdf = (ar, start, end) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF();
    doc.addImage("./public/src/assets/pictures/report.png", "PNG", 10, 10, 30, 10);
    doc.setDrawColor(0, 0, 128);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 128);
    doc.setFontSize(25);
    doc.text(10, 30, `Eventos`);
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
    doc.text(140, 40, "Descripción");
    doc.line(5, 45, 205, 45);
    let row = 50;
    let pagina = 1;
    doc.setTextColor(0, 0, 128);
    doc.text(10, 290, `Página ${pagina}`);
    //resto del contenido
    for (let i = 0; i < ar.length; i++) {
        let event = ar[i];
        let rowTitle = 0;
        let rowDescription = 0;
        // @ts-ignore
        //if (event.creationDate >= start && event.creationDate <= end) {
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(10, row, `${event.creationDate}`);
            doc.text(30, row, `${event.creationTime}`);
            //doc.text(50, row, `${event.user?.firstName ?? ''} ${event.user?.lastName ?? ''}`);
            //doc.text(90, row, `${event.title.split("\n").join("(salto)")}`);
            //doc.text(140, row, `${event.description.split("\n").join("(salto)")}`);
            var lMargin = 50; //left margin in mm
            var rMargin = 5; //right margin in mm
            var pdfInMM = 90; //210;  // width of A4 in mm
            var name = doc.splitTextToSize(`${event.user?.firstName ?? ''} ${event.user?.lastName ?? ''}`, (pdfInMM - lMargin - rMargin));
            doc.text(lMargin, row, name);

            lMargin = 90; //left margin in mm
            rMargin = 5; //right margin in mm
            pdfInMM = 140; //210;  // width of A4 in mm
            var title = event.title.split("\n").join(". ").replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '').trim();
            var paragraph = doc.splitTextToSize(title, (pdfInMM - lMargin - rMargin));
            doc.text(lMargin, row, paragraph);
            rowTitle = calculateRow(title.length,"titulo");

            lMargin = 140; //left margin in mm
            rMargin = 5; //right margin in mm
            pdfInMM = 210; //210;  // width of A4 in mm
            var description = event.description.split("\n").join(". ").replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '').trim();
            paragraph = doc.splitTextToSize(description, (pdfInMM - lMargin - rMargin));
            doc.text(lMargin, row, paragraph);
            rowDescription = calculateRow(description.length,"parrafo");

            rowTitle > rowDescription ? row += rowTitle : row += rowDescription
            doc.setDrawColor(210, 210, 210);
            doc.line(5, row, 205, row);
            if ((row+newDataBlock(ar,i)) > 280) { //290 limite de lineas A4
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
                doc.text(140, 20, "Descripción");
                doc.line(5, 25, 205, 25);
                doc.setTextColor(0, 0, 128);
                doc.text(10, 290, `Página ${pagina}`);
            }else{
                row += 5;
            }
        //}
    }
    // Save the PDF
    var d = new Date();
    var title = "log_Eventos_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.pdf`;
    doc.save(title);
};
export const exportEventCsv = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let event = ar[i];
        // @ts-ignore
        //if (event.creationDate >= start && event.creationDate <= end) {
            let obj = {
                "Empresa": `${event.customer?.name.split("\n").join("(salto)")}`,
                "Título": `${event.title.split("\n").join("(salto)")}`,
                "Fecha": `${event.creationDate}`,
                "Hora": `${event.creationTime}`,
                "Nombre": `${event.user?.firstName ?? ''} ${event.user?.lastName ?? ''}`,
                "Usuario": `${event.user?.username ?? ''}`,
                "Descripción": `${event.description.split("\n").join("(salto)")}`
            };
            rows.push(obj);
        //}
    }
    generateFile(rows, "Eventos", "csv");
};
export const exportEventXls = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let event = ar[i];
        // @ts-ignore
        //if (event.creationDate >= start && event.creationDate <= end) {
            let obj = {
                "Empresa": `${event.customer?.name.split("\n").join("(salto)")}`,
                "Título": `${event.title.split("\n").join("(salto)")}`,
                "Fecha": `${event.creationDate}`,
                "Hora": `${event.creationTime}`,
                "Nombre": `${event.user?.firstName ?? ''} ${event.user?.lastName ?? ''}`,
                "Usuario": `${event.user?.username ?? ''}`,
                "Descripción": `${event.description.split("\n").join("(salto)")}`
            };
            rows.push(obj);
        //}
    }
    generateFile(rows, "Eventos", "xls");
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
        let rowTitle = calculateRow(array[index+1]?.title.length,"titulo");
        let rowDescription = calculateRow(array[index+1]?.description.length,"parrafo");
        rowTitle > rowDescription ? row += rowTitle : row += rowDescription;
    }
    return row;
}