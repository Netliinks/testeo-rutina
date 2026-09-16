import { vehicleToStimate, generateFileSimpleXls, generateFileSimpleCsv } from "../tools.js";

export const exportVehicularPdf = (ar, start, end) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF('l');
    doc.addImage("./public/src/assets/pictures/report.png", "PNG", 10, 10, 50, 15);
    doc.setDrawColor(0, 0, 128);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 128);
    doc.setFontSize(25);
    doc.text(10, 40, `Ingreso Vehicular`);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'italic');
    doc.text(220, 40, `Fecha: Desde ${start} Hasta ${end}`);
    //construimos cabecera del csv
    doc.setFont(undefined, 'bold');
    doc.line(5, 45, 290, 45);
    doc.setFillColor(210, 210, 210);
    doc.rect(5, 45, 285, 10, 'F');
    doc.text(10, 50, "Placa");
    doc.text(40, 50, "DNI");
    doc.text(70, 50, "Conductor");
    doc.text(110, 50, "Inicio");
    doc.text(130, 50, "Hora");
    doc.text(150, 50, "Fin");
    doc.text(170, 50, "Hora");
    doc.text(190, 50, "Estado");
    doc.text(220, 50, "Usuario");
    doc.line(5, 55, 290, 55);
    let row = 60;
    let lineas = 0;
    let pagina = 1;
    doc.setTextColor(0, 0, 128);
    doc.text(10, 200, `Página ${pagina}`);
    //resto del contenido
    for (let i = 0; i < ar.length; i++) {
        let vehicular = ar[i];
        // @ts-ignore
        //if (vehicular.ingressDate >= start && vehicular.ingressDate <= end) {
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(10, row, `${vehicular?.licensePlate ?? ''}`);
            doc.text(40, row, `${vehicular?.dni ?? ''}`);
            doc.text(70, row, `${vehicular?.driver ?? ''}`);
            doc.text(110, row, `${vehicular?.ingressDate ?? ''}`);
            doc.text(130, row, `${vehicular?.ingressTime ?? ''}`);
            doc.text(150, row, `${vehicular?.egressDate ?? ''}`);
            doc.text(170, row, `${vehicular?.egressTime ?? ''}`);
            doc.text(190, row, `${vehicular?.visitState?.name ?? ''}`);
            doc.text(220, row, `${vehicular.user?.firstName ?? ''} ${vehicular.user?.lastName ?? ''}`);
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
                doc.text(10, 20, "Placa");
                doc.text(40, 20, "DNI");
                doc.text(70, 20, "Conductor");
                doc.text(110, 20, "Inicio");
                doc.text(130, 20, "Hora");
                doc.text(150, 20, "Fin");
                doc.text(170, 20, "Hora");
                doc.text(190, 20, "Estado");
                doc.text(220, 20, "Usuario");
                doc.line(5, 25, 290, 25);
                doc.setTextColor(0, 0, 128);
                doc.text(10, 200, `Página ${pagina}`);
            }
            lineas++;
        //}
    }
    // Save the PDF
    var d = new Date();
    var title = "log_Vehicular_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.pdf`;
    doc.save(title);
};
const parseEntradaSalida = (text) => {
    let entrada = '';
    let salida = '';
    if (text) {
        const textStr = String(text);
        const entradaMatch = textStr.match(/\[ENTRADA\]:\s*([\s\S]*?)(?=\[SALIDA\]|$)/i);
        const salidaMatch = textStr.match(/\[SALIDA\]:\s*([\s\S]*?)$/i);

        if (entradaMatch) {
            entrada = entradaMatch[1].trim().split("\n").join("(salto)");
        }
        if (salidaMatch) {
            salida = salidaMatch[1].trim().split("\n").join("(salto)");
        }

        if (!entradaMatch && !salidaMatch) {
            entrada = textStr.trim().split("\n").join("(salto)");
            salida = '';//entrada
        }
    }
    return { entrada, salida };
};

export const exportVehicularCsv = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let vehicular = ar[i];
        const rucParse = parseEntradaSalida(vehicular?.ruc);
        const dniParse = parseEntradaSalida(vehicular?.dni);
        const conductorParse = parseEntradaSalida(vehicular?.driver);
        const productoParse = parseEntradaSalida(vehicular?.product);
        const nroGuiaParse = parseEntradaSalida(vehicular?.noGuide);
        const proveedorParse = parseEntradaSalida(vehicular?.supplier);
        const tipoParse = parseEntradaSalida(vehicular?.type);
        const encargadoDiurnoParse = parseEntradaSalida(vehicular?.dayManager);
        const encargadoNocturnoParse = parseEntradaSalida(vehicular?.nightManager);
        const observacionParse = parseEntradaSalida(vehicular?.observation);

        let obj = {
            "Empresa": `${vehicular.customer?.name.split("\n").join("(salto)")}`,
            "Placa": `${vehicular?.licensePlate.split("\n").join("(salto)") ?? ''}`,
            "RUC Entrada": rucParse.entrada,
            "RUC Salida": rucParse.salida,
            "Tipo Documento Entrada": `${vehicular?.typeDocument ?? ''}`,
            "Referencia Documento Entrada": `${vehicular?.referenceDocument ?? ''}`,
            "Tipo Documento Salida": `${vehicular?.typeDocumentOut ?? ''}`,
            "Referencia Documento Salida": `${vehicular?.referenceDocumentOut ?? ''}`,
            "Conductor Entrada": conductorParse.entrada,
            "Conductor Salida": conductorParse.salida,
            "DNI Entrada": dniParse.entrada,
            "DNI Salida": dniParse.salida,
            "Fecha Ingreso": `${vehicular?.ingressDate ?? ''}`,
            "Hora Ingreso": `${vehicular?.ingressTime ?? ''}`,
            "Emitido Ingreso": `${vehicular.ingressIssued?.firstName ?? ''} ${vehicular.ingressIssued?.lastName ?? ''}`,
            "Guardia Ingreso": `${vehicular.ingressIssued?.username ?? ''}`,
            "Fecha Salida": `${vehicular?.egressDate ?? ''}`,
            "Hora Salida": `${vehicular?.egressTime ?? ''}`,
            "Emitido Salida": `${vehicular.egressIssued?.firstName ?? ''} ${vehicular.egressIssued?.lastName ?? ''}`,
            "Guardia Salida": `${vehicular.egressIssued?.username ?? ''}`,
            "Producto Entrada": productoParse.entrada,
            "Producto Salida": productoParse.salida,
            "Nro Guía Entrada": nroGuiaParse.entrada,
            "Nro Guía Salida": nroGuiaParse.salida,
            "Proveedor Entrada": proveedorParse.entrada,
            "Proveedor Salida": proveedorParse.salida,
            "Tipo Entrada": tipoParse.entrada,
            "Tipo Salida": tipoParse.salida,
            "Estado": `${vehicular.visitState?.name ?? ''}`,
            "Encargado Diurno Entrada": encargadoDiurnoParse.entrada,
            "Encargado Diurno Salida": encargadoDiurnoParse.salida,
            "Encargado Nocturno Entrada": encargadoNocturnoParse.entrada,
            "Encargado Nocturno Salida": encargadoNocturnoParse.salida,
            "Observación Entrada": observacionParse.entrada,
            "Observación Salida": observacionParse.salida,
        };
        rows.push(obj);
    }
    generateFileSimpleCsv(rows, "Vehicular", "csv");
};

export const exportVehicularXls = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let vehicular = ar[i];
        const rucParse = parseEntradaSalida(vehicular?.ruc);
        const dniParse = parseEntradaSalida(vehicular?.dni);
        const conductorParse = parseEntradaSalida(vehicular?.driver);
        const productoParse = parseEntradaSalida(vehicular?.product);
        const nroGuiaParse = parseEntradaSalida(vehicular?.noGuide);
        const proveedorParse = parseEntradaSalida(vehicular?.supplier);
        const tipoParse = parseEntradaSalida(vehicular?.type);
        const encargadoDiurnoParse = parseEntradaSalida(vehicular?.dayManager);
        const encargadoNocturnoParse = parseEntradaSalida(vehicular?.nightManager);
        const observacionParse = parseEntradaSalida(vehicular?.observation);

        let obj = {
            "Empresa": `${vehicular.customer?.name.split("\n").join("(salto)")}`,
            "Placa": `${vehicular?.licensePlate.split("\n").join("(salto)") ?? ''}`,
            "RUC Entrada": rucParse.entrada,
            "RUC Salida": rucParse.salida,
            "Tipo Documento Entrada": `${vehicular?.typeDocument ?? ''}`,
            "Referencia Documento Entrada": `${vehicular?.referenceDocument ?? ''}`,
            "Tipo Documento Salida": `${vehicular?.typeDocumentOut ?? ''}`,
            "Referencia Documento Salida": `${vehicular?.referenceDocumentOut ?? ''}`,
            "Conductor Entrada": conductorParse.entrada,
            "Conductor Salida": conductorParse.salida,
            "DNI Entrada": dniParse.entrada,
            "DNI Salida": dniParse.salida,
            "Fecha Ingreso": `${vehicular?.ingressDate ?? ''}`,
            "Hora Ingreso": `${vehicular?.ingressTime ?? ''}`,
            "Emitido Ingreso": `${vehicular.ingressIssued?.firstName ?? ''} ${vehicular.ingressIssued?.lastName ?? ''}`,
            "Guardia Ingreso": `${vehicular.ingressIssued?.username ?? ''}`,
            "Fecha Salida": `${vehicular?.egressDate ?? ''}`,
            "Hora Salida": `${vehicular?.egressTime ?? ''}`,
            "Emitido Salida": `${vehicular.egressIssued?.firstName ?? ''} ${vehicular.egressIssued?.lastName ?? ''}`,
            "Guardia Salida": `${vehicular.egressIssued?.username ?? ''}`,
            "Producto Entrada": productoParse.entrada,
            "Producto Salida": productoParse.salida,
            "Nro Guía Entrada": nroGuiaParse.entrada,
            "Nro Guía Salida": nroGuiaParse.salida,
            "Proveedor Entrada": proveedorParse.entrada,
            "Proveedor Salida": proveedorParse.salida,
            "Tipo Entrada": tipoParse.entrada,
            "Tipo Salida": tipoParse.salida,
            "Estado": `${vehicular.visitState?.name ?? ''}`,
            "Encargado Diurno Entrada": encargadoDiurnoParse.entrada,
            "Encargado Diurno Salida": encargadoDiurnoParse.salida,
            "Encargado Nocturno Entrada": encargadoNocturnoParse.entrada,
            "Encargado Nocturno Salida": encargadoNocturnoParse.salida,
            "Observación Entrada": observacionParse.entrada,
            "Observación Salida": observacionParse.salida,
        };
        rows.push(obj);
    }
    generateFileSimpleXls(rows, "Vehicular", "xls");
};

export const generarReportVehicularXls = async (conditions, vehiculars) => {
    // @ts-ignore
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Vehicular");
    const vehiculos = await vehicleToStimate(conditions, vehiculars);
    // Encabezado principal
    const titulo = sheet.addRow(["REPORTE DE INGRESO VEHICULAR"]);
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
    // Recorrer vehiculos
    // @ts-ignore
    vehiculos.forEach(u => {
        //const row = sheet.addRow([u["Usuario"], u["Total Alertas Generadas"], u["Total Alertas No Marcadas"], u["Total Alertas Respondidas"], u["Total Alertas Respondidas A Tiempo"], u["Cumplimiento"], u["Promedio"]]);
        const row = sheet.addRow([u["customer"], `[${u["username"]}] ${u["name"]}`, u["requerido"], u["vehicles"], u["cumplimiento"] == 'N/A' ? u["cumplimiento"] : `${u["cumplimiento"]}%`]);
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
    link.download = "Cumplimiento_Vehicular.xlsx";
    link.click();
    URL.revokeObjectURL(blobUrl);
    // @ts-ignore
    //window.location=link;
};