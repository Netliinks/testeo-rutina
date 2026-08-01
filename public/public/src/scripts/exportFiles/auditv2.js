import { auditResponse } from "../tools.js";
export const exportAuditV2Xls = async (conditions) => {
    let rows = [];
    const arrayIntern = [];
    const arrayExtern = [];
    const breakData = await auditResponse(conditions);
    for (let i = 0; i < breakData.length; i++) {
        let data = breakData[i];
        let obj = {};
        if (conditions.objetive == 'RUTINA DE CONSOLA') {
            obj = {
                "Usuario": `${data["Usuario"]}`,
                //"Total Intentos Marcacion": `${data["Total Intentos Marcacion"]}`,
                //"Total Marcaciones Hechas": `${data["Total Marcaciones Hechas"]}`,
                "Total Alertas Generadas": `${data["Total Alertas Generadas"]}`,
                //"Total Alertas No Marcadas": `${data["Total Alertas No Marcadas"]}`,
                "Total Alertas Respondidas": `${data["Total Alertas Respondidas"]}`,
                "Total Alertas Respondidas A Tiempo": `${data["Total Alertas Respondidas A Tiempo"]}`,
                "Cumplimiento": `${data["Cumplimiento"]}%`,
                "Promedio": `${data["Promedio"]}`,
            };
            rows.push(obj);
        }
        else if (conditions.objetive == 'RUTINA DE GUARDIA') {
            obj = {
                "Usuario": `${data["name"]}`,
                "Total Rutinas": `${data["totalRutinas"]}`,
                "Total Ubicaciones": `${data["totalUbicaciones"]}`,
                "Total Esperadas": `${data["totalEsperadas"]}`,
                "Total Realizadas": `${data["totalRealizadas"]}`,
                "Total Validas": `${data["totalValidas"]}`,
                "Ponderado": `${data["ponderado"]}%`,
            };
            rows.push(obj);
        }
    }
    if (conditions.objetive == 'RUTINA DE GUARDIA') {
        generarReporteGuardia(rows, conditions.filterStartDate, conditions.filterEndDate);
    }
    else {
        generarReporteConsola(rows, conditions.filterStartDate, conditions.filterEndDate);
    }
};
const generarReporteGuardia = async (usuarios, fechaInicial, fechaFinal) => {
    // @ts-ignore
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Personal");
    // Encabezado principal
    const titulo = sheet.addRow(["REPORTE DE CUMPLIMIENTO POR CUSTODIO"]);
    titulo.font = { bold: true, size: 14 };
    titulo.alignment = { horizontal: "center" };
    sheet.mergeCells("A1:G1");
    sheet.addRow([]);
    const fechas = sheet.addRow([`FECHA INICIAL: ${fechaInicial} - FECHA CORTE: ${fechaFinal}`]);
    fechas.font = { italic: true };
    sheet.mergeCells("A3:G3");
    sheet.addRow([]);
    
    const header = sheet.addRow([
        "Usuario",
        "Total Rutinas",
        "Total Ubicaciones",
        "Total Esperadas",
        "Total Realizadas",
        "Total Válidas",
        "Ponderado",
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
        const row = sheet.addRow([u["Usuario"], u["Total Rutinas"], u["Total Ubicaciones"], u["Total Esperadas"], u["Total Realizadas"], u["Total Validas"], u["Ponderado"]]);
        // @ts-ignore
        row.eachCell(cell => {
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            cell.alignment = { horizontal: "center" };
        });
    });
    sheet.addRow([]);
    
    // Ajustar ancho de columnas
    sheet.columns = [
        { width: 25 },
        { width: 25 },
        { width: 25 },
        { width: 25 },
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
    link.download = "Cumplimiento_Custodio.xlsx";
    link.click();
    URL.revokeObjectURL(blobUrl);
    // @ts-ignore
    //window.location=link;
};
const generarReporteConsola = async (usuarios, fechaInicial, fechaFinal) => {
    // @ts-ignore
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Personal");
    // Encabezado principal
    const titulo = sheet.addRow(["REPORTE DE CUMPLIMIENTO POR CONSOLA"]);
    titulo.font = { bold: true, size: 14 };
    titulo.alignment = { horizontal: "center" };
    sheet.mergeCells("A1:F1");
    sheet.addRow([]);
    const fechas = sheet.addRow([`FECHA INICIAL: ${fechaInicial} - FECHA CORTE: ${fechaFinal}`]);
    fechas.font = { italic: true };
    sheet.mergeCells("A3:F3");
    sheet.addRow([]);
    const header = sheet.addRow([
        "Usuario",
        "Total Alertas Generadas",
        //"Total Alertas No Marcadas",
        "Total Alertas Respondidas",
        "Total Alertas Respondidas A Tiempo",
        "Cumplimiento",
        "Promedio",
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
        const row = sheet.addRow([u["Usuario"], u["Total Alertas Generadas"], u["Total Alertas Respondidas"], u["Total Alertas Respondidas A Tiempo"], u["Cumplimiento"], u["Promedio"]]);
        // @ts-ignore
        row.eachCell(cell => {
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            cell.alignment = { horizontal: "center" };
        });
    });
    sheet.addRow([]);
    // Ajustar ancho de columnas
    sheet.columns = [
        { width: 25 },
        { width: 25 },
        //{ width: 25 },
        { width: 25 },
        { width: 35 },
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
    link.download = "Cumplimiento_Consola.xlsx";
    link.click();
    URL.revokeObjectURL(blobUrl);
    // @ts-ignore
    //window.location=link;
};
