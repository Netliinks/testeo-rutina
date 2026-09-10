const COLORS = {
    navy: 'FF2E3480',
    title: 'FF2A2E6E',
    text: 'FF2E2E2E',
    muted: 'FF7A7F8C',
    line: 'FFD9DFEA',
    soft: 'FFEFF1FB',
    white: 'FFFFFFFF',
    stripe: 'FFFAFAFB',
    green: 'FFDFF3E3',
    amber: 'FFFCF0D6',
    red: 'FFFBDEDA'
};
const border = { top: { style: 'thin', color: { argb: COLORS.line } }, left: { style: 'thin', color: { argb: COLORS.line } }, bottom: { style: 'thin', color: { argb: COLORS.line } }, right: { style: 'thin', color: { argb: COLORS.line } } };
const numeric = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const percentage = (value) => value === 'N/A' || value === undefined || value === null ? null : numeric(String(value).replace('%', '')) / 100;
const periodDateTime = (date, time) => date ? `${date} ${String(time || '').replace(/:00$/, '')}`.trim() : '-';

const download = async (workbook, filename) => {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
};

const fillRow = (sheet, rowNumber, first, last, color) => {
    for (let column = first; column <= last; column++) sheet.getRow(rowNumber).getCell(column).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
};

/**
 * Aplica el mismo lenguaje visual del Excel estadístico de Trace sin tocar las
 * métricas calculadas por NetGuard. Los valores de cumplimiento se reciben ya
 * calculados por las funciones existentes de tools.js.
 */
export const exportNetGuardStatisticalReport = async ({ title, filename, conditions, rows, glossary }) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'NetGuard';
    workbook.created = new Date();
    const sheet = workbook.addWorksheet('Estadísticas', { views: [{ state: 'frozen', ySplit: 7 }] });
    sheet.columns = [{ width: 26 }, { width: 46 }, { width: 17 }, { width: 17 }, { width: 18 }];

    sheet.mergeCells('A1:E1');
    const header = sheet.getCell('A1');
    header.value = title;
    header.font = { name: 'Calibri', size: 18, bold: true, color: { argb: COLORS.title } };
    header.alignment = { vertical: 'middle', horizontal: 'left' };
    sheet.getRow(1).height = 30;
    fillRow(sheet, 1, 1, 5, COLORS.soft);

    sheet.mergeCells('A2:E2');
    const period = sheet.getCell('A2');
    period.value = `FECHA INICIAL: ${periodDateTime(conditions.filterStartDate, conditions.filterStartTime)}   —   FECHA CORTE: ${periodDateTime(conditions.filterEndDate, conditions.filterEndTime)}`;
    period.font = { name: 'Calibri', size: 11, color: { argb: COLORS.muted } };
    period.alignment = { vertical: 'middle', horizontal: 'left' };
    sheet.getRow(2).height = 20;
    fillRow(sheet, 2, 1, 5, COLORS.soft);
    sheet.getRow(3).height = 15;

    const required = rows.reduce((sum, row) => sum + numeric(row.required), 0);
    const completed = rows.reduce((sum, row) => sum + numeric(row.completed), 0);
    const compliance = required > 0 ? completed / required : 0;
    const kpis = [
        { label: 'Usuarios evaluados', value: rows.length, format: null },
        { label: 'Registros requeridos', value: required, format: null },
        { label: 'Registros realizados', value: completed, format: null },
        { label: 'Cumplimiento global', value: compliance, format: '0.00%' }
    ];
    kpis.forEach((kpi, index) => {
        const column = index + 1;
        const label = sheet.getCell(4, column);
        const value = sheet.getCell(5, column);
        label.value = kpi.label;
        label.font = { name: 'Calibri', size: 9, bold: true, color: { argb: COLORS.muted } };
        label.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        label.border = border;
        label.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6F7F9' } };
        value.value = kpi.value;
        value.font = { name: 'Calibri', size: 16, bold: true, color: { argb: COLORS.title } };
        value.alignment = { vertical: 'bottom', horizontal: 'right' };
        value.border = border;
        value.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6F7F9' } };
        if (kpi.format) value.numFmt = kpi.format;
    });
    sheet.getRow(4).height = 20;
    sheet.getRow(5).height = 25;
    sheet.getRow(6).height = 15;

    const headers = ['Cliente', 'Usuario', 'Requeridos', 'Realizados', 'Cumplimiento'];
    const tableHeader = sheet.getRow(7);
    tableHeader.height = 25;
    headers.forEach((value, index) => {
        const cell = tableHeader.getCell(index + 1);
        cell.value = value;
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.white } };
        cell.alignment = { vertical: 'middle', horizontal: index < 2 ? 'left' : 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navy } };
        cell.border = border;
    });

    rows.forEach((item, index) => {
        const row = sheet.getRow(8 + index);
        row.height = 22;
        const values = [item.customer, item.user, item.required, item.completed, percentage(item.compliance)];
        values.forEach((value, cellIndex) => {
            const cell = row.getCell(cellIndex + 1);
            cell.value = value === null ? 'N/A' : value;
            cell.font = { name: 'Calibri', size: 10, bold: cellIndex === 1, color: { argb: COLORS.text } };
            cell.alignment = { vertical: 'middle', horizontal: cellIndex < 2 ? 'left' : 'center', wrapText: true };
            cell.border = border;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: index % 2 === 0 ? COLORS.white : COLORS.stripe } };
            if (cellIndex === 4 && value !== null) {
                cell.numFmt = '0.00%';
                const color = value >= 0.9 ? COLORS.green : value >= 0.7 ? COLORS.amber : COLORS.red;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
            }
        });
    });
    if (rows.length) {
        sheet.addConditionalFormatting({ ref: `E8:E${7 + rows.length}`, rules: [{ type: 'dataBar', cfvo: [{ type: 'num', value: 0 }, { type: 'num', value: 1 }], color: { argb: 'FF6FAF8A' } }] });
    }

    const glossaryTitleRow = 9 + rows.length;
    sheet.mergeCells(`A${glossaryTitleRow}:E${glossaryTitleRow}`);
    const glossaryTitle = sheet.getCell(glossaryTitleRow, 1);
    glossaryTitle.value = 'GLOSARIO Y DEFINICIONES DE MÉTRICAS';
    glossaryTitle.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.title } };
    glossaryTitle.alignment = { horizontal: 'left', vertical: 'middle' };
    fillRow(sheet, glossaryTitleRow, 1, 5, COLORS.soft);
    sheet.getRow(glossaryTitleRow).height = 22;

    glossary.forEach((item, index) => {
        const rowNumber = glossaryTitleRow + 1 + index;
        sheet.mergeCells(`B${rowNumber}:E${rowNumber}`);
        const term = sheet.getCell(rowNumber, 1);
        const definition = sheet.getCell(rowNumber, 2);
        term.value = item.term;
        term.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.navy } };
        term.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6F7F9' } };
        term.border = border;
        term.alignment = { vertical: 'middle', wrapText: true };
        definition.value = item.definition;
        definition.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF4A4E58' } };
        definition.border = border;
        definition.alignment = { vertical: 'middle', wrapText: true };
        sheet.getRow(rowNumber).height = 30;
    });
    const footerRow = glossaryTitleRow + glossary.length + 2;
    sheet.mergeCells(`A${footerRow}:E${footerRow}`);
    const footer = sheet.getCell(footerRow, 1);
    footer.value = 'NetGuard — reporte generado automáticamente';
    footer.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF9AA0AC' } };
    footer.alignment = { vertical: 'middle', horizontal: 'left' };
    sheet.getRow(footerRow).height = 20;
    await download(workbook, filename);
};
