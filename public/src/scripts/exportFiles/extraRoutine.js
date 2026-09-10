import { getEntitiesData, getUserInfo, getFilterEntityData, getEntityData, registerEntity, _userAgent, updateEntity, getFile, sendMail2 } from "../endpoints.js"
//import { getDetails, getSearch } from "../tools.js";
export const exportRoutinePdf = async (ar, start, end) => {
  //let control = await getSearch("service.id", ar.id, "Control")
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF()
    let listImages = []
    const listRoutines = ['-2.1564602,-79.8936213','-2.1549851,-79.8949893','-2.1520254,-79.8977429','-2.1496744,-79.9004169','-2.1482098,-79.9032946','-2.1476567,-79.906736','-2.1469948,-79.9113936','-2.1455394,-79.914659'];
    doc.addImage("./public/src/assets/pictures/header-routine.png", "PNG", 3, 3, 203, 25);
    //doc.setDrawColor(0, 0, 128);
    doc.setFont(undefined, 'bold')
    doc.setTextColor(0,0,0)
    doc.setFontSize(12)
    doc.text(85, 35, `REPORTE DE RUTINA`)
    doc.setFontSize(10)
    //doc.setDrawColor(0, 0, 128);
    doc.setFillColor(1,33,133);
    doc.rect(5,40,42,10,'F');
    doc.line(5, 40, 205, 40);
    doc.line(5, 40, 5, 50);
    doc.setTextColor(255,255,255);
    doc.text(18, 47, "NOMBRE");
    doc.line(5, 50, 205, 50);
    doc.line(205, 40, 205, 50);
    doc.setTextColor(0,0,0)
    doc.setFont(undefined, 'normal')
    doc.text(50, 47, ar[0].rutina);

    doc.setFillColor(1,33,133);
    doc.rect(5,51,200,10,'F');
    doc.line(5, 51, 205, 51);
    doc.line(5, 51, 5, 61);
    doc.line(5, 61, 205, 61);
    doc.line(205, 51, 205, 51);
    doc.setTextColor(255,255,255);
    doc.setFont(undefined, 'bold')
    doc.text(60, 58, `OBSERVACIONES DESDE ${start} HASTA ${end}`);
    let pagina = 1;
    doc.setTextColor(0, 0, 128);
    doc.text(10, 290, `Página ${pagina}`);
    let index = 0;
    let row = 61;
    //observaciones
    for(let i = 0; i < ar.length; i++){
        let detail = ar[i];
        i == 0 ? null : index++;
        if(index >= listRoutines.length){
          index = 0;
        }
        if(detail?.imagen !== ''){
          listImages.push(detail.imagen);
        }
        row += 4;
        //65 75 72 79 82 83 85
        doc.setFontSize(8)
        doc.setFillColor(1,33,133);
        doc.rect(5,row,17,10,'F');
        doc.line(5, row, 205, row);
        doc.line(5, row, 5, row+10);
        
        doc.line(205, row, 205, row+10);
        doc.setTextColor(255,255,255);
        doc.setFont(undefined, 'bold')
        doc.text(8, row+7, "ESTADO");
        doc.setTextColor(0,0,0)
        doc.setFont(undefined, 'normal')
        doc.text(23, row+7, detail.estado);
        doc.setFillColor(1,33,133);
        doc.rect(41,row,15,10,'F');
        doc.setTextColor(255,255,255);
        doc.setFont(undefined, 'bold')
        doc.text(43, row+7, "CORDS");
        doc.setTextColor(0,0,0)
        doc.setFont(undefined, 'normal')
        doc.text(57, row+7, listRoutines[index]);
        doc.setFillColor(1,33,133);
        doc.rect(112,row,18,10,'F');
        doc.setTextColor(255,255,255);
        doc.setFont(undefined, 'bold')
        doc.text(114, row+7, "GUARDIA");
        doc.setTextColor(0,0,0)
        doc.setFont(undefined, 'normal')
        doc.text(132, row+7, detail.usuario);

        doc.setFillColor(1,33,133);
        doc.rect(5,row+10,17,10,'F');
        doc.setTextColor(255,255,255);
        doc.setFont(undefined, 'bold')
        doc.text(8, row+17, "FECHA");
        doc.line(5, row+10, 205, row+10);
        doc.line(5, row+20, 205, row+20);
        doc.line(5, row+10, 5, row+20);
        doc.line(205, row+10, 205, row+20);
        doc.setTextColor(0,0,0)
        doc.setFont(undefined, 'normal')
        doc.text(23, row+14, detail.fecha);
        doc.text(23, row+18, detail.hora);
        doc.line(41, row+10, 41, row+20);
        var lMargin = 43; //left margin in mm
        var rMargin = 2; //right margin in mm
        var pdfInMM = 205; //210;  // width of A4 in mm
        var paragraph = doc.splitTextToSize(detail.observacion, (pdfInMM - lMargin - rMargin));
        doc.text(lMargin, row+15, paragraph);
        //doc.text(43, row+17, detail.observacion);
        row += 20;

        if(ar[i+1] != undefined){
          if(pagina == 1){
            if((row+24) > 286){
                    
              doc.addPage()
              row = (15-4)
              pagina+=1
              doc.setFont(undefined, 'bold')
              doc.setFontSize(10)
              doc.setTextColor(0,0,128)
              doc.text(10, 290, `Página ${pagina}`)
            }   
          }else{
            if((row+24) > 296){
                  
              doc.addPage()
              row = (15-4)
              pagina+=1
              doc.setFont(undefined, 'bold')
              doc.setFontSize(10)
              doc.setTextColor(0,0,128)
              doc.text(10, 290, `Página ${pagina}`)
            }  
          }
        }
    }

    if(listImages.length != 0){
      if(row+60 > 286){
        doc.addPage()
        row = 15
        pagina+=1
        doc.setFont(undefined, 'bold')
        doc.setFontSize(10)
        doc.setTextColor(0,0,128)
        doc.text(10, 290, `Página ${pagina}`)
      }else{
        row+=10
      }
      doc.setFont(undefined, 'bold')
      doc.setTextColor(0,0,0)
      doc.text(102, row, `IMÁGENES`)
      row += 5
      let column = 5
      for(let i=0; i<listImages.length; i++){
        doc.addImage(listImages[i], "JPEG", column, row, 45, 50);
        column+=51
        //console.log("row "+row)
        if(column > 200){
          //console.log("row total "+row)
          if((row+65) > 225){
            if(listImages[i+1] != null){
              doc.addPage()
              column = 5
              row = 15
              pagina+=1
              doc.setFont(undefined, 'bold')
              doc.setFontSize(10)
              doc.setTextColor(0,0,128)
              doc.text(10, 290, `Página ${pagina}`)
            }

          }else{
            column = 5
            row+=60
          }
        }
          
      }
    }
    
    // Save the PDF
    var d = new Date()
    var title = "Rutina_"+ `${ar?.name ?? ''}` + d.getDate() + "_" + (d.getMonth()+1) + "_" + d.getFullYear() +`.pdf`;
    doc.save(title);

}

const exportRoutinePdf2Legacy = async (ar, users, flipImage) => {
    //let control = await getSearch("service.id", ar.id, "Control")
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF();
    let listImages = [];
    //Cuadro de cabecera
    doc.line(5, 5, 205, 5); //linea arriba
    doc.line(5, 5, 5, 30); //linea izquierda
    doc.line(55, 5, 55, 30); //linea izquierda 2
    doc.line(140, 5, 140, 30); //linea derecha 1
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    //doc.text(142, 10, "Código");
    //doc.text(142, 17, "Versión");
    //doc.text(142, 23, "Fecha de\naprobación");
    //doc.line(162, 5, 162, 30); //linea derecha 2
    doc.line(205, 5, 205, 30); //linea derecha final
    //doc.line(140, 12, 205, 12); //linea abajo derecha 1
    //doc.line(140, 19, 205, 19); //linea abajo derecha 2
    doc.line(5, 30, 205, 30); //linea abajo final, tomada para row +10
    //doc.text(164, 10, ar[0].code);
    //doc.text(164, 17, ar[0].version);
    //doc.text(164, 26, ar[0].date);
    doc.addImage("./public/src/assets/pictures/report-logo.png", "PNG", 10, 14, 40, 8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(75, 20, `REPORTE DE SERVICIO`);
    //doc.setDrawColor(0, 0, 128);
    let row = 40;
    let pagina = 1;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 128);
    doc.text(10, 290, `Página ${pagina}`);
    doc.line(5, row, 205, row); //linea arriba
    doc.line(5, row, 5, row + 24); //linea izquierda inicial
    doc.line(24, row + 10, 24, row + 24); //linea izquierda 1
    doc.line(205, row, 205, row + 24); //linea derecha final
    doc.line(140, row + 10, 140, row + 24); //linea derecha 1
    doc.line(155, row + 10, 155, row + 24); //linea derecha 2
    doc.line(5, row + 10, 205, row + 10); //linea abajo 1
    doc.line(5, row + 17, 205, row + 17); //linea abajo 2
    doc.line(5, row + 24, 205, row + 24); //linea abajo final
    doc.setFillColor(10, 71, 88);
    doc.rect(5, row, 200, 10, 'F');
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(90, row + 8, `Detalle del servicio`);
    doc.setTextColor(10, 71, 88);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.text(7, row + 15, `Servicio`);
    doc.text(7, row + 22, `Cliente`);
    doc.text(142, row + 15, `Inicio`);
    doc.text(142, row + 22, `Fin`);
    doc.text(142, row + 22, ``);
    doc.setTextColor(0, 0, 0);
    doc.text(26, row + 15, `${ar[0].rutina}`);
    doc.text(26, row + 22, `${ar[0].cliente}`);
    doc.text(157, row + 15, `${ar[0].inicio}`);
    doc.text(157, row + 22, `${ar[0].fin}`);
    row += 30;
    doc.line(5, row, 205, row); //linea arriba
    doc.line(5, row, 5, row + 12); //linea izquierda inicial
    doc.line(205, row, 205, row + 12); //linea derecha final
    doc.line(5, row + 10, 205, row + 10); //linea abajo 1
    doc.setFillColor(10, 71, 88);
    doc.rect(5, row, 200, 10, 'F');
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(90, row + 8, `Recursos asignados`);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    let numMayor = 0;
    if (users.length != 0) {
        numMayor = users.length;
    }
    const limit = (row + 10) + ((numMayor * 7) + 2);
    doc.line(5, row + 10, 5, limit); //linea izquierda inicial
    doc.line(205, row + 10, 205, limit); //linea derecha final
    doc.line(5, limit, 205, limit); //linea final abajo
    let index = row + 10;
    for (let i = 0; i < users.length; i++) {
        index += 7;
        doc.text(7, index, `${users[i]?.user?.firstName ?? ''} ${users[i]?.user?.lastName ?? ''} ${users[i]?.user?.secondLastName ?? ''}`);
    }
    row = limit + 10;
    doc.line(5, row, 205, row); //linea arriba
    doc.line(5, row, 5, row + 10); //linea izquierda inicial
    doc.line(205, row, 205, row + 10); //linea derecha final
    doc.line(5, row + 10, 205, row + 10); //linea abajo final
    doc.setFillColor(10, 71, 88);
    doc.rect(5, row, 200, 10, 'F');
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(7, row + 8, `#`);
    doc.text(19, row + 8, `Fecha`);
    doc.text(38, row + 8, `Lugar`);
    doc.text(80, row + 8, `Guardia`);
    doc.text(117, row + 8, `Detalle`);
    doc.line(17, row, 17, row + 10);
    doc.line(36, row, 36, row + 10);
    doc.line(78, row, 78, row + 10);
    doc.line(115, row, 115, row + 10);
    row += 10;
    for (let i = 0; i < ar.length; i++) {
        let detail = ar[i];
        if (detail?.imagen !== '') {
            listImages.push({
                imageTag: detail.imageTag,
                imagen: detail.imagen
            });
        }
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.text(6, row + 4, `${detail.imageTag}`);
        doc.text(18, row + 4, `${detail.fecha}\n${detail.hora}`);
        detail.estado == 'No cumplido' ? doc.setTextColor(255, 0, 0) : doc.setTextColor(0, 0, 255);
        //const textWidth = doc.getTextWidth(detail.cords);
        doc.textWithLink(detail.estado == 'No cumplido' ? 'No cumplido' : detail.cords, 37, row + 4, { url: `https://www.google.com/maps/search/?api=1&query=${detail.cords}` });
        doc.setDrawColor(0, 0, 255);
        //detail.estado == 'No cumplido' ? null : doc.line(37, row + 5, 37 + textWidth, row + 5);
        doc.setDrawColor(0, 0, 0);
        doc.setTextColor(0, 0, 0);
        var lMargin = 79; //left margin in mm
        var rMargin = 2; //right margin in mm
        var pdfInMM = 115; //210;  // width of A4 in mm
        var guard = doc.splitTextToSize(detail.usuario, (pdfInMM - lMargin - rMargin));
        doc.text(lMargin, row + 4, guard);
        lMargin = 116; //left margin in mm
        rMargin = 2; //right margin in mm
        pdfInMM = 205; //210;  // width of A4 in mm
        var paragraph = doc.splitTextToSize(detail.observacion, (pdfInMM - lMargin - rMargin));
        doc.text(lMargin, row + 4, paragraph);
        const rowTotal = calculateRow(paragraph);
        doc.line(5, row, 205, row); //linea arriba
        doc.line(5, row + rowTotal, 205, row + rowTotal); //linea abajo
        doc.line(5, row, 5, row + rowTotal); //linea izquierda
        doc.line(205, row, 205, row + rowTotal); //linea derecha
        doc.line(17, row, 17, row + rowTotal);
        doc.line(36, row, 36, row + rowTotal);
        doc.line(78, row, 78, row + rowTotal);
        doc.line(115, row, 115, row + rowTotal);
        row += rowTotal;
        if (ar[i + 1] != undefined) {
            if (pagina == 1) {
                if ((row + newDataBlock(ar, i, doc)) > 281) {
                    doc.addPage();
                    row = (15 - 4);
                    pagina += 1;
                    doc.setFont(undefined, 'bold');
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 128);
                    doc.text(10, 290, `Página ${pagina}`);
                }
            }
            else {
                if ((row + newDataBlock(ar, i, doc)) > 286) {
                    doc.addPage();
                    row = (15 - 4);
                    pagina += 1;
                    doc.setFont(undefined, 'bold');
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 128);
                    doc.text(10, 290, `Página ${pagina}`);
                }
            }
        }
    }
    if (listImages.length != 0) {
        if (row + 60 > 286) {
            doc.addPage();
            row = 15;
            pagina += 1;
            doc.setFont(undefined, 'bold');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 128);
            doc.text(10, 290, `Página ${pagina}`);
        }
        else {
            row += 10;
        }
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFillColor(10, 71, 88);
        doc.rect(5, row - 7, 200, 10, 'F');
        doc.text(90, row, `Anexo Fotográfico`);
        row += 5;
        let column = 5;
        for (let i = 0; i < listImages.length; i++) {
            doc.addImage(listImages[i].imagen, "JPEG", column, flipImage ? row - 45 : row, flipImage ? 50 : 45, flipImage ? 45 : 50, null, null, flipImage ? -90 : 0);
            doc.setFont(undefined, 'italic');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(8);
            doc.text(column, row + 53, `Foto ${listImages[i].imageTag}`);
            column += 51;
            //console.log("row "+row)
            if (column > 200) {
                //console.log("row total "+row)
                if ((row + 65) > 225) {
                    if (listImages[i + 1]?.imagen != undefined) {
                        doc.addPage();
                        column = 5;
                        row = 15;
                        pagina += 1;
                        doc.setFont(undefined, 'bold');
                        doc.setFontSize(10);
                        doc.setTextColor(0, 0, 128);
                        doc.text(10, 290, `Página ${pagina}`);
                    }
                }
                else {
                    column = 5;
                    row += 60;
                }
            }
        }
    }
    // Save the PDF
    var d = new Date();
    var title = "Rutina_" + `${ar[0]?.rutina ?? ''}` + "_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.pdf`;
    doc.save(title);
};

// Reporte de rutina con la identidad visual del reporte de trazabilidad.
// Los datos siguen siendo exclusivamente los que entrega NetGuard.
const exportRoutinePdf2Approx = async (ar, users, flipImage) => {
    window.jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF();
    const report = Array.isArray(ar) ? ar : [];
    const assignedUsers = Array.isArray(users) ? users : [];
    const images = [];
    const colors = {
        navy: [23, 34, 58],
        blue: [82, 113, 220],
        lightBlue: [237, 242, 255],
        border: [211, 220, 235],
        muted: [99, 115, 142],
        text: [23, 34, 58],
        success: [222, 245, 231],
        warning: [255, 239, 202],
        danger: [255, 224, 224]
    };
    const margin = 10;
    const width = 190;
    const clean = (value) => String(value ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const generatedAt = new Date().toLocaleString('es-EC', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const countByState = (state) => report.filter((item) => clean(item?.estado).toLowerCase() === state).length;
    const fulfilled = report.filter((item) => clean(item?.estado).toLowerCase() !== 'no cumplido').length;
    const notFulfilled = countByState('no cumplido');
    const evidenceCount = report.filter((item) => Boolean(item?.imagen)).length;

    const drawFooter = (page, total) => {
        doc.setDrawColor(...colors.border);
        doc.line(margin, 282, 200, 282);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...colors.muted);
        doc.text('NetGuard - Reporte de rutina', margin, 287);
        doc.text(`Generado: ${generatedAt}`, 105, 287, { align: 'center' });
        doc.text(`Pagina ${page} de ${total}`, 200, 287, { align: 'right' });
    };

    const drawHeader = (continuation = false) => {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(...colors.border);
        doc.roundedRect(margin, 9, width, continuation ? 16 : 18, 2, 2, 'FD');
        if (!continuation) {
            try {
                doc.addImage('./public/src/assets/pictures/report-logo.png', 'PNG', 14, 14, 40, 8);
            } catch (_) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.setTextColor(...colors.navy);
                doc.text('NETGUARD', 14, 20);
            }
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(continuation ? 11 : 13);
        doc.setTextColor(...colors.navy);
        doc.text(continuation ? 'REPORTE DE SERVICIO - CONTINUACION' : 'REPORTE DE SERVICIO', 105, continuation ? 19 : 17, { align: 'center' });
        if (!continuation) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(...colors.muted);
            doc.text('Evidencia de rutina', 105, 21, { align: 'center' });
            doc.text(`Generado: ${generatedAt}`, 196, 17, { align: 'right' });
        }
        doc.setDrawColor(...colors.blue);
        doc.setLineWidth(0.8);
        doc.line(margin, continuation ? 25 : 27, 200, continuation ? 25 : 27);
        doc.setLineWidth(0.2);
    };

    const drawSectionTitle = (title, y, note = '') => {
        doc.setFillColor(...colors.navy);
        doc.roundedRect(margin, y, width, 8, 1.5, 1.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(255, 255, 255);
        doc.text(title, margin + 4, y + 5.3);
        if (note) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.text(note, 196, y + 5.2, { align: 'right' });
        }
    };

    const drawInfoRow = (label, value, x, y, labelWidth, valueWidth) => {
        doc.setFillColor(...colors.lightBlue);
        doc.setDrawColor(...colors.border);
        doc.rect(x, y, labelWidth, 8, 'FD');
        doc.rect(x + labelWidth, y, valueWidth, 8, 'S');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...colors.muted);
        doc.text(label.toUpperCase(), x + 2, y + 5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.text);
        const text = doc.splitTextToSize(clean(value) || '-', valueWidth - 4)[0] || '-';
        doc.text(text, x + labelWidth + 2, y + 5);
    };

    const drawSummaryCard = (x, value, label, color) => {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(...colors.border);
        doc.roundedRect(x, 33, 45, 14, 2, 2, 'FD');
        doc.setFillColor(...color);
        doc.roundedRect(x + 3, 36, 8, 8, 1.5, 1.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...colors.navy);
        doc.text(String(value), x + 15, 40.5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...colors.muted);
        doc.text(label.toUpperCase(), x + 15, 44.2);
    };

    const drawTableHeader = (y) => {
        const columns = [
            { title: '#', width: 10 },
            { title: 'FECHA Y HORA', width: 25 },
            { title: 'LUGAR / GPS', width: 34 },
            { title: 'GUARDIA', width: 31 },
            { title: 'ESTADO', width: 24 },
            { title: 'DETALLE', width: 66 }
        ];
        let x = margin;
        doc.setFillColor(...colors.navy);
        doc.rect(margin, y, width, 9, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.2);
        doc.setTextColor(255, 255, 255);
        columns.forEach((column) => {
            doc.text(column.title, x + column.width / 2, y + 5.5, { align: 'center' });
            doc.setDrawColor(255, 255, 255);
            doc.line(x + column.width, y, x + column.width, y + 9);
            x += column.width;
        });
    };

    const addTablePage = () => {
        doc.addPage();
        drawHeader(true);
        drawSectionTitle('BITACORA DE RUTINA', 31, `${report.length} registros`);
        drawTableHeader(41);
        return 50;
    };

    drawHeader();
    drawSummaryCard(10, report.length, 'registros', colors.lightBlue);
    drawSummaryCard(58, fulfilled, 'cumplidos', colors.success);
    drawSummaryCard(106, notFulfilled, 'no cumplidos', colors.danger);
    drawSummaryCard(154, evidenceCount, 'evidencias', colors.warning);

    let row = 52;
    drawSectionTitle('DETALLE DEL SERVICIO', row);
    row += 8;
    const info = report[0] || {};
    drawInfoRow('Servicio', info.rutina, 10, row, 24, 71);
    drawInfoRow('Inicio', info.inicio, 105, row, 19, 76);
    row += 8;
    drawInfoRow('Cliente', info.cliente, 10, row, 24, 71);
    drawInfoRow('Fin', info.fin, 105, row, 19, 76);
    row += 12;

    drawSectionTitle('RECURSOS ASIGNADOS', row);
    row += 8;
    const resourceNames = assignedUsers
        .map((assignment) => clean(`${assignment?.user?.firstName ?? ''} ${assignment?.user?.lastName ?? ''} ${assignment?.user?.secondLastName ?? ''}`))
        .filter(Boolean);
    const resourceLines = resourceNames.length ? resourceNames : ['Sin guardias asignados'];
    const resourceHeight = Math.max(10, Math.ceil(resourceLines.length / 2) * 8 + 2);
    doc.setDrawColor(...colors.border);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, row, width, resourceHeight, 1.5, 1.5, 'FD');
    resourceLines.forEach((name, index) => {
        const column = index % 2;
        const line = Math.floor(index / 2);
        doc.setFillColor(...colors.blue);
        doc.circle(15 + column * 94, row + 5 + line * 8, 1.5, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...colors.text);
        doc.text(name, 19 + column * 94, row + 6.2 + line * 8);
    });
    row += resourceHeight + 6;

    drawSectionTitle('BITACORA DE RUTINA', row, `${report.length} registros`);
    row += 8;
    drawTableHeader(row);
    row += 9;

    report.forEach((detail, index) => {
        if (detail?.imagen) {
            images.push({ ...detail, imageTag: detail.imageTag || index + 1 });
        }
        const dateTime = [clean(detail?.fecha), clean(detail?.hora)].filter(Boolean);
        const location = clean(detail?.estado).toLowerCase() === 'no cumplido' ? 'No cumplido' : (clean(detail?.cords) || '-');
        const guardLines = doc.splitTextToSize(clean(detail?.usuario) || '-', 27);
        const detailLines = doc.splitTextToSize(clean(detail?.observacion) || '-', 62);
        const locationLines = doc.splitTextToSize(location, 30);
        const lineCount = Math.max(guardLines.length, detailLines.length, locationLines.length, dateTime.length, 1);
        const rowHeight = Math.max(14, lineCount * 3.5 + 6);

        if (row + rowHeight > 277) {
            row = addTablePage();
        }
        const cellWidths = [10, 25, 34, 31, 24, 66];
        let x = margin;
        doc.setFillColor(index % 2 === 0 ? 255 : 249, index % 2 === 0 ? 255 : 251, index % 2 === 0 ? 255 : 255);
        doc.setDrawColor(...colors.border);
        doc.rect(margin, row, width, rowHeight, 'FD');
        cellWidths.slice(0, -1).forEach((cellWidth) => {
            x += cellWidth;
            doc.line(x, row, x, row + rowHeight);
        });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...colors.text);
        doc.text(String(detail?.imageTag ?? index + 1), 15, row + rowHeight / 2 + 1, { align: 'center' });
        doc.text(dateTime, 22.5, row + 5);
        if (location !== '-' && clean(detail?.estado).toLowerCase() !== 'no cumplido') {
            doc.setTextColor(...colors.blue);
            doc.text(locationLines, 47, row + 5);
            doc.link(47, row + 2, 30, Math.max(5, locationLines.length * 3.5), {
                url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clean(detail?.cords))}`
            });
        } else {
            doc.setTextColor(202, 42, 42);
            doc.text(locationLines, 47, row + 5);
        }
        doc.setTextColor(...colors.text);
        doc.text(guardLines, 81, row + 5);
        const state = clean(detail?.estado) || '-';
        const stateColor = state.toLowerCase() === 'no cumplido' ? colors.danger : colors.success;
        doc.setFillColor(...stateColor);
        doc.roundedRect(102, row + rowHeight / 2 - 3.5, 20, 7, 1.2, 1.2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(...colors.text);
        doc.text(state, 112, row + rowHeight / 2 + 0.8, { align: 'center', maxWidth: 18 });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(detailLines, 125, row + 5);
        row += rowHeight;
    });

    if (images.length) {
        const addPhotoPage = (continuation = false) => {
            doc.addPage();
            drawHeader(true);
            drawSectionTitle(continuation ? 'ANEXO FOTOGRAFICO - CONTINUACION' : 'ANEXO FOTOGRAFICO', 31, `${images.length} fotografias`);
            return 43;
        };
        if (row + 70 > 277) {
            row = addPhotoPage();
        } else {
            row += 8;
            drawSectionTitle('ANEXO FOTOGRAFICO', row, `${images.length} fotografias`);
            row += 11;
        }
        let column = 0;
        images.forEach((item, index) => {
            const cardWidth = 92;
            const cardHeight = 62;
            if (column === 0 && row + cardHeight > 277) {
                row = addPhotoPage(true);
            }
            const x = margin + column * 98;
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(...colors.border);
            doc.roundedRect(x, row, cardWidth, cardHeight, 2, 2, 'FD');
            try {
                if (flipImage) {
                    doc.addImage(item.imagen, 'JPEG', x + 23, row + 3, 46, 84, null, null, -90);
                } else {
                    doc.addImage(item.imagen, 'JPEG', x + 3, row + 3, 86, 45);
                }
            } catch (_) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(...colors.muted);
                doc.text('No fue posible cargar la imagen', x + cardWidth / 2, row + 27, { align: 'center' });
            }
            doc.setFillColor(...colors.navy);
            doc.roundedRect(x + 3, row + 50, cardWidth - 6, 8, 1, 1, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(255, 255, 255);
            doc.text(`Foto ${item.imageTag} - ${clean(item.fecha)} ${clean(item.hora)}`, x + 6, row + 55);
            column += 1;
            if (column === 2 || index === images.length - 1) {
                column = 0;
                row += cardHeight + 6;
            }
        });
    }

    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
        doc.setPage(page);
        drawFooter(page, totalPages);
    }

    const today = new Date();
    const title = `Rutina_${clean(info.rutina) || 'sin_nombre'}_${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}.pdf`;
    doc.save(title);
};

// Implementación visual equivalente al reporte de trazabilidad de Trace.
// Solo cambia la presentación: las fuentes de datos continúan siendo NetGuard.
export const exportRoutinePdf2 = async (ar, users, flipImage, checkEmail, email, index = 1, total = 1) => {
    window.jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF();
    const rows = Array.isArray(ar) ? ar : [];
    const guards = Array.isArray(users) ? users : [];
    const NAVY = [15, 45, 82];
    const BLUE = [29, 78, 216];
    const BORDER = [229, 231, 235];
    const MUTED = [156, 163, 175];
    const TEXT = [55, 65, 81];
    const PADDING = 2;
    const clean = (value) => String(value ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const getLineHeight = () => doc.getFontSize() * (doc.getLineHeightFactor?.() ?? 1.15) * 0.352777778;
    const getLines = (value, width) => {
        const lines = doc.splitTextToSize(clean(value) || '-', width);
        return Array.isArray(lines) ? lines : [lines];
    };
    const getTextWidth = (value) => doc.getTextWidth(String(value ?? ''));
    const drawWrapped = (x, y, value, width) => {
        const lines = getLines(value, width);
        const lineHeight = getLineHeight();
        lines.forEach((line, index) => doc.text(String(line), x, y + PADDING + (index * lineHeight) + lineHeight / 2, { baseline: 'middle' }));
        return Math.max(1, lines.length) * lineHeight + (PADDING * 2);
    };
    const getWrappedHeight = (value, width) => Math.max(1, getLines(value, width).length) * getLineHeight() + (PADDING * 2);
    const first = rows[0] || {};
    const noCumplidos = rows.filter((row) => clean(row?.estado).toLowerCase() === 'no cumplido').length;
    const cumplidos = rows.length - noCumplidos;
    const evidencia = rows.filter((row) => Boolean(row?.imagen)).length;
    const generatedAt = new Date().toLocaleString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    let page = 1;
    const listImages = [];

    const drawCheck = (x, y) => {
        doc.setDrawColor(21, 128, 61);
        doc.setLineWidth(0.4);
        doc.line(x, y + 1.8, x + 1, y + 2.8);
        doc.line(x + 1, y + 2.8, x + 3.2, y + 0.3);
    };
    const drawCross = (x, y) => {
        doc.setDrawColor(220, 38, 38);
        doc.setLineWidth(0.4);
        doc.line(x, y + 0.5, x + 2, y + 2.5);
        doc.line(x + 2, y + 0.5, x, y + 2.5);
    };
    const drawFooter = (pageNumber) => {
        doc.setFillColor(248, 250, 252);
        doc.rect(10, 282, 190, 8, 'F');
        doc.setDrawColor(241, 245, 249);
        doc.line(10, 282, 200, 282);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...MUTED);
        const footerLabel = 'Reporte de Rutina · NetGuard by';
        doc.text(footerLabel, 13, 287);
        try {
            doc.addImage('./public/src/assets/pictures/login_logo.png', 'PNG', 13 + getTextWidth(footerLabel) + 0.8, 285.3, 18, 1.9);
        } catch (_) {
            // El reporte mantiene el texto aun si el recurso visual no estuviera disponible.
        }
        doc.text(`Página ${pageNumber}`, 105, 287, { align: 'center' });
        const email = 'info@netliinks.com';
        const separator = ' · ';
        const website = 'https://netliinks.com/netguard';
        const emailWidth = getTextWidth(email);
        const separatorWidth = getTextWidth(separator);
        const websiteWidth = getTextWidth(website);
        const websiteX = 197 - websiteWidth;
        const separatorX = websiteX - separatorWidth;
        const emailX = separatorX - emailWidth;
        doc.text(email, emailX, 287);
        doc.text(separator, separatorX, 287);
        doc.text(website, 197, 287, { align: 'right' });
        doc.link(emailX, 284, emailWidth, 4, { url: `mailto:${email}` });
        doc.link(websiteX, 284, websiteWidth, 4, { url: website });
    };
    const drawMainHeader = () => {
        doc.setFillColor(...NAVY);
        doc.rect(10, 5, 190, 1.5, 'F');
        try {
            doc.addImage('./public/src/assets/pictures/report-logo.png', 'PNG', 14, 11, 40, 8);
        } catch (_) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...NAVY);
            doc.text('NETGUARD', 14, 16);
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...NAVY);
        doc.text('REPORTE DE SERVICIO', 75, 14);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        doc.text('Rutina · Evidencia de servicio', 75, 18);
        doc.setTextColor(107, 114, 128);
        doc.text(`Fecha: ${generatedAt}`, 200, 16, { align: 'right' });
        doc.setDrawColor(...BORDER);
        doc.line(10, 23, 200, 23);
    };
    const drawMiniHeader = () => {
        doc.setFillColor(...NAVY);
        doc.rect(10, 5, 190, 1.5, 'F');
        doc.setFillColor(248, 250, 252);
        doc.rect(10, 7, 190, 8, 'F');
        doc.setDrawColor(...BORDER);
        doc.line(10, 15, 200, 15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...NAVY);
        doc.text('NETGUARD', 15, 12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...MUTED);
        doc.text(`· ${clean(first.rutina)} · ${clean(first.cliente)}`, 31, 12);
    };
    const addPage = () => {
        doc.addPage();
        page += 1;
        drawMiniHeader();
        drawFooter(page);
    };
    const drawSection = (title, row, note = '') => {
        doc.setFillColor(...BLUE);
        doc.rect(10, row, 1.2, 4, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...NAVY);
        doc.text(title, 13, row + 3);
        if (note) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...MUTED);
            doc.text(note, 200, row + 3, { align: 'right' });
        }
    };
    const drawTableHeader = (row) => {
        doc.setFillColor(...NAVY);
        doc.rect(10, row, 190, 8, 'F');
        doc.setDrawColor(...NAVY);
        doc.rect(10, row, 190, 8, 'S');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('#', 13.5, row + 5, { align: 'center' });
        doc.text('FECHA / HORA', 27, row + 5, { align: 'center' });
        doc.text('GUARDIA', 53, row + 5, { align: 'center' });
        doc.text('DETALLE', 109.5, row + 5, { align: 'center' });
        doc.text('MARCACIÓN', 160, row + 5, { align: 'center' });
        doc.text('COORDENADAS', 185, row + 3, { align: 'center' });
        doc.text('GPS', 185, row + 6, { align: 'center' });
    };
    const addTablePage = () => {
        addPage();
        drawSection('BITÁCORA DE RUTINA', 20, `${rows.length} registros`);
        drawTableHeader(26);
        return 34;
    };

    drawMainHeader();
    drawFooter(page);
    const selectedStatus = document.getElementById('status-export')?.value ?? 'Todos';
    const summaryItems = selectedStatus === 'Marcadas'
        ? [
            { value: rows.length, label: 'REGISTROS', color: NAVY, icon: null },
            { value: cumplidos, label: 'CUMPLIDOS', color: [21, 128, 61], icon: 'check' }
        ]
        : selectedStatus === 'NoMarcadas'
            ? [
                { value: rows.length, label: 'REGISTROS', color: NAVY, icon: null },
                { value: noCumplidos, label: 'NO CUMPLIDOS', color: [220, 38, 38], icon: 'cross' }
            ]
            : [
                { value: rows.length, label: 'REGISTROS', color: NAVY, icon: null },
                { value: cumplidos, label: 'CUMPLIDOS', color: [21, 128, 61], icon: 'check' },
                { value: noCumplidos, label: 'NO CUMPLIDOS', color: [220, 38, 38], icon: 'cross' }
            ];
    doc.setDrawColor(...BORDER);
    doc.rect(10, 25, 190, 16, 'S');
    const summaryWidth = 190 / summaryItems.length;
    summaryItems.forEach((item, index) => {
        const centerX = 10 + summaryWidth * index + summaryWidth / 2;
        if (index > 0) {
            doc.setDrawColor(...BORDER);
            doc.line(10 + summaryWidth * index, 25, 10 + summaryWidth * index, 41);
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(item.icon ? 16 : 18);
        doc.setTextColor(...item.color);
        if (item.icon) doc.text(String(item.value), centerX - 2, 31, { align: 'right' });
        else doc.text(String(item.value), centerX, 31, { align: 'center' });
        if (item.icon === 'check') drawCheck(centerX + 0.5, 28.5);
        if (item.icon === 'cross') drawCross(centerX + 0.5, 28.5);
        doc.setFontSize(7);
        doc.setTextColor(...MUTED);
        doc.text(item.label, centerX, 38, { align: 'center' });
    });

    let row = 46;
    const sectionSpacing = 5;
    drawSection('DETALLE DEL SERVICIO', row);
    row += 6;
    const infoRows = [
        { label: 'Servicio', left: first.rutina, rightLabel: 'Cliente', right: first.cliente },
        { label: 'Fecha inicial', left: first.inicio, rightLabel: 'Fecha final', right: first.fin }
    ];
    const labelWidth = 26;
    const valueWidth = 69;
    const contentWidth = valueWidth - (PADDING * 2);
    infoRows.forEach((item) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const height = Math.max(10, getWrappedHeight(item.left, contentWidth), getWrappedHeight(item.right, contentWidth));
        [[10, item.label, item.left], [105, item.rightLabel, item.right]].forEach(([x, label, value]) => {
            doc.setFillColor(241, 245, 249);
            doc.setDrawColor(...BORDER);
            doc.rect(x, row, labelWidth, height, 'FD');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(100, 116, 139);
            doc.text(String(label).toUpperCase(), x + 2, row + height / 2 + 0.9, { baseline: 'middle' });
            doc.setFillColor(255, 255, 255);
            doc.rect(x + labelWidth, row, valueWidth, height, 'FD');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(17, 24, 39);
            drawWrapped(x + labelWidth + PADDING, row + (height - getWrappedHeight(value, contentWidth)) / 2, value, contentWidth);
        });
        row += height;
    });
    row += sectionSpacing;

    drawSection('RECURSOS ASIGNADOS', row);
    row += 6;
    if (guards.length) {
        const cardWidth = 44.5;
        const cardHeight = 10;
        const gap = 4;
        guards.forEach((guard, index) => {
            const column = index % 4;
            const line = Math.floor(index / 4);
            const x = 10 + column * (cardWidth + gap);
            const y = row + line * 13;
            const name = clean(`${guard?.user?.firstName ?? ''} ${guard?.user?.lastName ?? ''} ${guard?.user?.secondLastName ?? ''}`).toUpperCase() || '-';
            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(...BORDER);
            doc.roundedRect(x, y, cardWidth, cardHeight, 1, 1, 'FD');
            doc.setFillColor(100, 116, 139);
            doc.circle(x + 5.5, y + 5, 2.2, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(index + 1 >= 10 ? 5.5 : 7);
            doc.setTextColor(255, 255, 255);
            doc.text(String(index + 1), x + 5.5, y + 5.8, { align: 'center' });
            let fontSize = 7.5;
            doc.setFontSize(fontSize);
            let nameLines = doc.splitTextToSize(name, 32.5);
            while (nameLines.length > 2 && fontSize > 5.5) {
                fontSize -= 0.5;
                doc.setFontSize(fontSize);
                nameLines = doc.splitTextToSize(name, 32.5);
            }
            const lineHeight = getLineHeight();
            const startY = y + (cardHeight - nameLines.length * lineHeight) / 2;
            doc.setTextColor(17, 24, 39);
            nameLines.forEach((nameLine, lineIndex) => doc.text(nameLine, x + 9.5, startY + (lineIndex * lineHeight) + lineHeight / 2, { baseline: 'middle' }));
        });
        row += Math.ceil(guards.length / 4) * 13 - 3 + sectionSpacing;
    } else {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(...BORDER);
        doc.roundedRect(10, row, 190, 10, 1.2, 1.2, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('SIN GUARDIAS ASIGNADOS', 15, row + 6);
        row += 10 + sectionSpacing;
    }

    drawSection('BITÁCORA DE RUTINA', row, `${rows.length} registros · ${evidencia} evidencias`);
    row += 6;
    drawTableHeader(row);
    row += 8;
    rows.forEach((detail, index) => {
        const status = clean(detail?.estado) || '-';
        const failed = status.toLowerCase() === 'no cumplido';
        const guardText = clean(detail?.usuario) || '-';
        const detailText = clean(detail?.observacion) || '-';
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const dateLines = [clean(detail?.fecha), clean(detail?.hora)].filter(Boolean);
        const coordinateLines = failed || !clean(detail?.cords)
            ? [failed ? 'NO MARCÓ' : '-']
            : clean(detail.cords).split(',').flatMap((coordinate, coordinateIndex) => getLines(`${coordinate.trim()}${coordinateIndex === 0 ? ',' : ''}`, 26));
        const dateHeight = Math.max(1, dateLines.length) * getLineHeight() + (PADDING * 2);
        const guardHeight = getWrappedHeight(guardText, 28);
        const detailHeight = getWrappedHeight(detailText, 77);
        const coordinateHeight = Math.max(1, coordinateLines.length) * getLineHeight() + (PADDING * 2);
        const rowHeight = Math.max(14, dateHeight, guardHeight, detailHeight, coordinateHeight);
        if (row + rowHeight > 280) row = addTablePage();
        if (detail?.imagen) listImages.push({ ...detail, imageTag: detail.imageTag ?? index + 1, estado: status });
        if (failed) {
            doc.setFillColor(254, 242, 242);
            doc.setDrawColor(254, 202, 202);
        } else {
            doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
            doc.setDrawColor(241, 245, 249);
        }
        doc.rect(10, row, 190, rowHeight, 'FD');
        doc.setFont('helvetica', failed ? 'bold' : 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...(failed ? [220, 38, 38] : TEXT));
        doc.text(String(detail?.imageTag ?? index + 1), 13.5, row + rowHeight / 2, { align: 'center', baseline: 'middle' });
        const dateStartY = row + (rowHeight - dateLines.length * getLineHeight()) / 2;
        dateLines.forEach((line, lineIndex) => doc.text(line, 27, dateStartY + (lineIndex * getLineHeight()) + getLineHeight() / 2, { align: 'center', baseline: 'middle' }));
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...(failed ? [220, 38, 38] : TEXT));
        drawWrapped(39, row + (rowHeight - guardHeight) / 2, guardText, 28);
        drawWrapped(71, row + (rowHeight - detailHeight) / 2, detailText, 77);
        if (failed) {
            doc.setFillColor(254, 226, 226);
            doc.setDrawColor(254, 202, 202);
            doc.circle(160, row + rowHeight / 2, 2.5, 'FD');
            drawCross(159, row + rowHeight / 2 - 1.5);
        } else {
            doc.setFillColor(220, 252, 231);
            doc.setDrawColor(187, 247, 208);
            doc.circle(160, row + rowHeight / 2, 2.5, 'FD');
            drawCheck(158.8, row + rowHeight / 2 - 1.6);
        }
        const cords = clean(detail?.cords);
        if (failed || !cords) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(...(failed ? [220, 38, 38] : MUTED));
            doc.text(failed ? 'NO MARCÓ' : '-', 185, row + rowHeight / 2, { align: 'center', baseline: 'middle' });
        } else {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(...BLUE);
            const lineHeight = getLineHeight();
            const top = row + (rowHeight - lineHeight * coordinateLines.length) / 2;
            coordinateLines.forEach((coordinate, coordinateIndex) => doc.text(coordinate, 185, top + (coordinateIndex * lineHeight) + lineHeight / 2, { align: 'center', baseline: 'middle' }));
            doc.link(170, row, 30, rowHeight, { url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cords)}` });
        }
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.2);
        doc.line(17, row, 17, row + rowHeight);
        doc.line(37, row, 37, row + rowHeight);
        doc.line(69, row, 69, row + rowHeight);
        doc.line(150, row, 150, row + rowHeight);
        doc.line(170, row, 170, row + rowHeight);
        row += rowHeight;
    });

    if (listImages.length) {
        const startPhotoPage = (continuation = false) => {
            addPage();
            row = 20;
            drawSection(continuation ? 'ANEXO FOTOGRÁFICO - CONTINUACIÓN' : 'ANEXO FOTOGRÁFICO', row, `${listImages.length} fotografías · Evidencias de rutina`);
            row += 8;
        };
        if (row + 60 > 280) startPhotoPage();
        else {
            row += 8;
            drawSection('ANEXO FOTOGRÁFICO', row, `${listImages.length} fotografías · Evidencias de rutina`);
            row += 8;
        }
        let column = 10;
        const pictureWidth = 60;
        const pictureHeight = 38;
        const cardHeight = 48;
        for (let index = 0; index < listImages.length; index += 1) {
            const image = listImages[index];
            if (row + cardHeight > 280) {
                startPhotoPage(true);
                column = 10;
            }
            const failed = clean(image.estado).toLowerCase() === 'no cumplido';
            doc.setDrawColor(...(failed ? [254, 202, 202] : BORDER));
            doc.roundedRect(column, row, pictureWidth, cardHeight, 1.5, 1.5, 'S');
            try {
                if (flipImage) doc.addImage(image.imagen, 'JPEG', column + 0.5, row + 0.5 - (pictureWidth - 1), pictureHeight, pictureWidth - 1, null, null, -90);
                else doc.addImage(image.imagen, 'JPEG', column + 0.5, row + 0.5, pictureWidth - 1, pictureHeight);
            } catch (_) {
                doc.setFillColor(243, 244, 246);
                doc.rect(column + 0.5, row + 0.5, pictureWidth - 1, pictureHeight, 'F');
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(8);
                doc.setTextColor(...MUTED);
                doc.text('Sin imagen adjunta', column + pictureWidth / 2, row + pictureHeight / 2 + 2, { align: 'center' });
            }
            const barY = row + pictureHeight + 0.5;
            doc.setFillColor(...(failed ? [254, 242, 242] : [248, 250, 252]));
            doc.setDrawColor(...(failed ? [254, 202, 202] : [241, 245, 249]));
            doc.rect(column + 0.5, barY, pictureWidth - 1, cardHeight - pictureHeight - 1, 'FD');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(...(failed ? [220, 38, 38] : TEXT));
            doc.text(`Foto ${image.imageTag} · ${clean(image.hora)}`, column + 4, barY + 5.5);
            if (clean(image.cords)) {
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...BLUE);
                doc.text('Ver mapa', column + 46, barY + 5.5);
                doc.link(column + 45, barY + 1.5, 13, 4.5, { url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clean(image.cords))}` });
            }
            column += 65;
            if (column > 200) {
                column = 10;
                row += cardHeight + 4;
            }
        }
    }
    const totalPages = doc.getNumberOfPages();
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        doc.setPage(pageNumber);
        drawFooter(pageNumber);
    }
    // Save the PDF
    var d = new Date();
    var routineName = clean(ar[0]?.rutina ?? '').replace(/\s+/g, '_');
    var title = `Servicio_${routineName}_${d.getDate()}_${d.getMonth() + 1}_${d.getFullYear()}.pdf`;

    if (checkEmail) {
        // Robust Base64 generation for binary PDF content
        const pdfOutput = doc.output('datauristring');
        const pdfBase64 = pdfOutput.split(',')[1];

        let mailRaw = JSON.stringify({
            "address": `${email}`,
            "subject": total > 1 ? `Netliinks - [${index} de ${total}] Reporte de Servicio: ${ar[0]?.rutina ?? ''}` : `Netliinks - Reporte de Servicio: ${ar[0]?.rutina ?? ''}`,
            "body": `Cliente: ${ar[0]?.cliente ?? ''}`,
            "file": pdfBase64,
            "filename": title
        });
        return await sendMail2(mailRaw);
    }
    else {
        doc.save(title);
        return { allSucceeded: true, isDownload: true };
    }
};
const calculateRow = (paragraph) => {
    let row = 10;
    // limit limite de lineas
    paragraph.forEach((line) => {
        //console.log(line)
        //console.log(paragraph.length)
        //console.log(line.length)
        if (paragraph.length > 2 /*&& line.length >= limiDetailLine*/) { //124 caracteres cada linea aprox en total margen A4, 70 en este espacio
            row += 2;
        }
    });
    return row;
};
const newDataBlock = (array, index, doc) => {
    let row = 0;
    if (array[index + 1] != undefined) {
        //row+=10;
        var lMargin = 110; //left margin in mm
        var rMargin = 2; //right margin in mm
        var pdfInMM = 205; //210;  // width of A4 in mm
        var paragraph = doc.splitTextToSize(array[index + 1]?.observacion, (pdfInMM - lMargin - rMargin));
        row += calculateRow(paragraph);
    }
    return row;
};

