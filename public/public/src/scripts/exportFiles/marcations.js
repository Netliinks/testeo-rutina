import { getFile } from "../endpoints.js";
export const exportMarcationsPdf = async (ar, start, end) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignored
    var doc = new jsPDF();
    doc.addImage("./public/src/assets/pictures/report.png", "PNG", 10, 10, 50, 15);
    doc.setDrawColor(0, 0, 128);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 128);
    doc.setFontSize(25);
    doc.text(10, 40, `Marcaciones`);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'italic');
    doc.text(130, 40, `Fecha: Desde ${start} Hasta ${end}`);
    //construimos cabecera del csv
    doc.setFont(undefined, 'bold');
    doc.line(5, 45, 200, 45);
    doc.setFillColor(210, 210, 210);
    doc.rect(5, 45, 195, 10, 'F');
    doc.text(10, 50, "Nombre");
    doc.text(50, 50, "DNI");
    doc.text(80, 50, "Inicio");
    doc.text(100, 50, "Hora");
    doc.text(130, 50, "Fin");
    doc.text(150, 50, "Hora");
    doc.text(170, 50, "Estado");
    doc.line(5, 55, 200, 55);
    let row = 60;
    let pagina = 1;
    doc.setTextColor(0, 0, 128);
    doc.text(10, 290, `Página ${pagina}`);
    //resto del contenido
    for (let i = 0; i < ar.length; i++) {
        let marcation = ar[i];
        // @ts-ignore
        //if (marcation.ingressDate >= start && marcation.ingressDate <= end) {
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(10, row, `${marcation.user?.firstName ?? ''} ${marcation.user?.lastName ?? ''}`);
            doc.text(50, row, `${marcation.user?.dni ?? ''}`);
            doc.text(80, row, `${marcation.ingressDate}`);
            doc.text(100, row, `${marcation.ingressTime}`);
            doc.text(130, row, `${marcation?.egressDate ?? ''}`);
            doc.text(150, row, `${marcation?.egressTime ?? ''}`);
            doc.text(170, row, `${marcation.marcationState?.name ?? ''}`);
            let imagesPath = [marcation?.camera1, marcation?.camera2, marcation?.camera3, marcation?.camera4, marcation?.camera5, marcation?.camera6, marcation?.camera7, marcation?.camera8];
            let imagesTotal = 0;
            let column = 5;
            let countImage = 0;
            let existImage = false;
            for(let y=0; y<imagesPath.length; y++){
                if(imagesPath[y] !== undefined){
                    if(countImage>3){
                        row+=32;
                        column=5;
                        countImage = 0;
                    }
                    if(!existImage){
                        existImage = true;
                        row += 5;
                    }
                    let image = await getFile(imagesPath[y]);
                    doc.addImage(`${image}`, "JPEG", column, row, 48, 30);
                    imagesTotal+=1;
                    countImage+=1;
                    column+=50;
                    
                }
            }
            if(imagesTotal !== 0){
                if(imagesTotal > 4){
                    row+=30;
                }else{
                    row+=32;
                }
            }
            if ((row+newDataBlock(ar,i)) > 280) {
                doc.addPage();
                row = 30;
                pagina += 1;
                doc.setFont(undefined, 'bold');
                doc.setFontSize(10);
                //construimos cabecera del csv
                doc.line(5, 15, 200, 15);
                doc.setFillColor(210, 210, 210);
                doc.rect(5, 15, 195, 10, 'F');
                doc.text(10, 20, "Nombre");
                doc.text(50, 20, "DNI");
                doc.text(80, 20, "Inicio");
                doc.text(100, 20, "Hora");
                doc.text(130, 20, "Fin");
                doc.text(150, 20, "Hora");
                doc.text(170, 20, "Estado");
                doc.line(5, 25, 200, 25);
                doc.setTextColor(0, 0, 128);
                doc.text(10, 290, `Página ${pagina}`);
            }else{
                row += 5;
            }

        //}
    }
    // Save the PDF
    var d = new Date();
    var title = "log_Marcaciones_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.pdf`;
    doc.save(title);
};
export const exportMarcationsCsv = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let marcation = ar[i];
        // @ts-ignore
        //if (marcation.ingressDate >= start && marcation.ingressDate <= end) {
            let obj = {
                "Empresa": `${marcation.customer?.name.split("\n").join("(salto)")}`,
                "DNI": `${marcation.user?.dni ?? ''}`,
                "Nombre": `${marcation.user?.firstName ?? ''} ${marcation.user?.lastName ?? ''}`,
                "Usuario": `${marcation.user?.username ?? ''}`,
                "Fecha Ingreso": `${marcation.ingressDate}`,
                "Hora Ingreso": `${marcation.ingressTime}`,
                "Emitido Ingreso": `${marcation.ingressIssued?.firstName ?? ''} ${marcation.ingressIssued?.lastName ?? ''}`,
                "Guardia Ingreso": `${marcation.ingressIssued?.username ?? ''}`,
                "Fecha Salida": `${marcation?.egressDate ?? ''}`,
                "Hora Salida": `${marcation?.egressTime ?? ''}`,
                "Emitido Salida": `${marcation.egressIssued?.firstName ?? ''} ${marcation.egressIssued?.lastName ?? ''}`,
                "Guardia Salida": `${marcation.egressIssued?.username ?? ''}`,
                "Estado": `${marcation.marcationState?.name ?? ''}`,
            };
            rows.push(obj);
        //}
    }
    generateFile(rows, "Marcaciones", "csv");
};
export const exportMarcationsXls = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let marcation = ar[i];
        // @ts-ignore
        //if (marcation.ingressDate >= start && marcation.ingressDate <= end) {
            let obj = {
                "Empresa": `${marcation.customer?.name.split("\n").join("(salto)")}`,
                "DNI": `${marcation.user?.dni ?? ''}`,
                "Nombre": `${marcation.user?.firstName ?? ''} ${marcation.user?.lastName ?? ''}`,
                "Usuario": `${marcation.user?.username ?? ''}`,
                "Fecha Ingreso": `${marcation.ingressDate}`,
                "Hora Ingreso": `${marcation.ingressTime}`,
                "Emitido Ingreso": `${marcation.ingressIssued?.firstName ?? ''} ${marcation.ingressIssued?.lastName ?? ''}`,
                "Guardia Ingreso": `${marcation.ingressIssued?.username ?? ''}`,
                "Fecha Salida": `${marcation?.egressDate ?? ''}`,
                "Hora Salida": `${marcation?.egressTime ?? ''}`,
                "Emitido Salida": `${marcation.egressIssued?.firstName ?? ''} ${marcation.egressIssued?.lastName ?? ''}`,
                "Guardia Salida": `${marcation.egressIssued?.username ?? ''}`,
                "Estado": `${marcation.marcationState?.name ?? ''}`,
            };
            rows.push(obj);
        //}
    }
    generateFile(rows, "Marcaciones", "xls");
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

const newDataBlock = (array, index) => {
    let row = 0;
    if(array[index+1] != undefined){
        row+=5;
        let imagesPath = [array[index+1]?.camera1, array[index+1]?.camera2, array[index+1]?.camera3, array[index+1]?.camera4, array[index+1]?.camera5, array[index+1]?.camera6, array[index+1]?.camera7, array[index+1]?.camera8];
        let images = [];
        for(let y=0; y<imagesPath.length; y++){
            if(imagesPath[y] !== undefined){
                images.push(imagesPath[y]);
            }
        }
        if(images.length !== 0){
            if(images.length > 4){
                row+=30;
            }else{
                row+=32;
            }
        }
            
    }
    return row;
}