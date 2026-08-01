import { getEntitiesData, getUserInfo, getFilterEntityData, getEntityData, registerEntity, _userAgent, updateEntity, getFile } from "../endpoints.js"
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

export const exportRoutinePdf2 = async (ar, users, flipImage) => {
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

