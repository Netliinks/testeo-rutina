export const exportSuperPdf = (ar) => {
    let fecha = new Date(); //Fecha actual
    let mes = fecha.getMonth() + 1; //obteniendo mes
    let dia = fecha.getDate(); //obteniendo dia
    let anio = fecha.getFullYear(); //obteniendo año
    if (dia < 10)
        dia = '0' + dia; //agrega cero si el menor de 10
    if (mes < 10)
        mes = '0' + mes; //agrega cero si el menor de 10
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF('l');
    doc.addImage("./public/src/assets/pictures/report.png", "PNG", 10, 10, 50, 15);
    doc.setDrawColor(0, 0, 128);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 128);
    doc.setFontSize(25);
    doc.text(10, 40, `Superusuarios`);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'italic');
    doc.text(240, 40, `Fecha: Generado el ${anio}-${mes}-${dia}`);
    //construimos cabecera del csv
    doc.setFont(undefined, 'bold');
    doc.line(5, 45, 290, 45);
    doc.setFillColor(210, 210, 210);
    doc.rect(5, 45, 285, 10, 'F');
    doc.text(10, 50, "Nombre");
    doc.text(80, 50, "DNI");
    doc.text(100, 50, "Usuario");
    doc.text(160, 50, "Email");
    doc.text(220, 50, "Teléfono");
    doc.text(240, 50, "Creado");
    doc.text(280, 50, "Tipo");
    doc.line(5, 55, 290, 55);
    let row = 60;
    let lineas = 0;
    let pagina = 1;
    doc.setTextColor(0, 0, 128);
    doc.text(10, 200, `Página ${pagina}`);
    //resto del contenido
    for (let i = 0; i < ar.length; i++) {
        let user = ar[i];
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(10, row, `${user?.firstName ?? ''} ${user?.lastName ?? ''} ${user?.secondLastName ?? ''}`);
        doc.text(80, row, `${user?.dni ?? ''}`);
        doc.text(100, row, `${user.username}`);
        doc.text(160, row, `${user?.email ?? ''}`);
        doc.text(220, row, `${user?.phone ?? ''}`);
        doc.text(240, row, `${user.createdDate}`);
        doc.text(280, row, `${verifyUserType(user.userType)}`);
        row += 5;
        let limitLineas = 33;
        if (pagina == 1)
            limitLineas = 26;
        if (lineas >= limitLineas) {
            doc.addPage();
            lineas = 0;
            row = 30;
            pagina += 1;
            doc.setFont(undefined, 'bold');
            doc.setFontSize(10);
            //construimos cabecera del csv
            doc.line(5, 15, 290, 15);
            doc.setFillColor(210, 210, 210);
            doc.rect(5, 15, 285, 10, 'F');
            doc.text(10, 20, "Nombre");
            doc.text(80, 20, "DNI");
            doc.text(100, 20, "Usuario");
            doc.text(160, 20, "Email");
            doc.text(220, 20, "Teléfono");
            doc.text(240, 20, "Creado");
            doc.text(280, 20, "Tipo");
            doc.line(5, 25, 290, 25);
            doc.setTextColor(0, 0, 128);
            doc.text(10, 200, `Página ${pagina}`);
        }
        lineas++;
    }
    // Save the PDF
    var d = new Date();
    var title = "log_Superusuarios_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.pdf`;
    doc.save(title);
};
export const exportSuperCsv = (ar) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let user = ar[i];
        // @ts-ignore
        let obj = {
            "Nombre": `${user?.firstName.split("\n").join("(salto)") ?? ''}`,
            "Apellido 1": `${user?.lastName.split("\n").join("(salto)") ?? ''}`,
            "Apellido 2": `${user?.secondLastName.split("\n").join("(salto)") ?? ''}`,
            "Usuario": `${user.username}`,
            "DNI": `${user?.dni ?? ''}`,
            "Email": `${user?.email ?? ''}`,
            "Teléfono": `${user?.phone ?? ''}`,
            "Creado": `${user.createdDate}`,
            "Tipo": `${verifyUserType(user.userType)}`
        };
        rows.push(obj);
    }
    generateFile(rows, "Superusuarios", "csv");
};
export const exportSuperXls = (ar) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let user = ar[i];
        // @ts-ignore
        let obj = {
            "Nombre": `${user?.firstName.split("\n").join("(salto)") ?? ''}`,
            "Apellido 1": `${user?.lastName.split("\n").join("(salto)") ?? ''}`,
            "Apellido 2": `${user?.secondLastName.split("\n").join("(salto)") ?? ''}`,
            "Usuario": `${user.username}`,
            "DNI": `${user?.dni ?? ''}`,
            "Email": `${user?.email ?? ''}`,
            "Teléfono": `${user?.phone ?? ''}`,
            "Creado": `${user.createdDate}`,
            "Tipo": `${verifyUserType(user.userType)}`
        };
        rows.push(obj);
    }
    generateFile(rows, "Superusuarios", "xls");
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
const verifyUserType = (userType) => {
    if (userType == 'CUSTOMER') {
        return 'Cli.';
    }
    else if (userType == 'GUARD') {
        return 'Guard.';
    }
    else if (userType == 'EMPLOYEE') {
        return 'Empl.';
    }
    else if (userType == 'CONTRACTOR') {
        return 'Contr.';
    }
    else {
        return userType;
    }
};
/*
let rows = []
            const users: any = await getUsers()
            for(let i=0; i < users.length; i++){
                let user = users[i]
                
            }*/ 
