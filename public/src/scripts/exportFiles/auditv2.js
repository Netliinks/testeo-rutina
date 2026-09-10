import { auditResponse } from '../tools.js';

// El formato sigue el mismo patrón de los Excel estadísticos: encabezado,
// indicadores, tabla de resultados, glosario y pie. Solo se formatean los
// datos ya calculados por NetGuard; aquí no se recalcula ningún porcentaje.
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
    greenText: 'FF168A4B',
    amber: 'FFFCF0D6',
    amberText: 'FFF0A01E',
    red: 'FFFBDEDA',
    redText: 'FFE03135'
};

const border = {
    top: { style: 'thin', color: { argb: COLORS.line } },
    left: { style: 'thin', color: { argb: COLORS.line } },
    bottom: { style: 'thin', color: { argb: COLORS.line } },
    right: { style: 'thin', color: { argb: COLORS.line } }
};

const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const percentage = (value) => Math.max(0, Math.min(100, number(String(value ?? '').replace('%', '')))) / 100;
const valueOrDash = (value) => value === undefined || value === null || value === '' ? '-' : String(value);

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

const styleCells = (sheet, rowNumber, from, to, style) => {
    for (let column = from; column <= to; column++) Object.assign(sheet.getCell(rowNumber, column), style);
};

const periodDateTime = (date, time) => date ? `${date} ${String(time || '').replace(/:00$/, '')}`.trim() : '-';

const buildWorkbook = ({ title, startDate, startTime, endDate, endTime, widths }) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'NetGuard';
    workbook.created = new Date();
    const sheet = workbook.addWorksheet('Estadísticas', { views: [{ state: 'frozen', ySplit: 7 }] });
    sheet.columns = widths.map((width) => ({ width }));
    sheet.properties.defaultRowHeight = 20;
    sheet.pageSetup = {
        orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0,
        margins: { left: 0.25, right: 0.25, top: 0.35, bottom: 0.35, header: 0.1, footer: 0.1 }
    };

    const last = sheet.getColumn(widths.length).letter;
    sheet.mergeCells(`A1:${last}1`);
    const heading = sheet.getCell('A1');
    heading.value = title;
    heading.font = { name: 'Calibri', size: 18, bold: true, color: { argb: COLORS.title } };
    heading.alignment = { horizontal: 'left', vertical: 'middle' };
    styleCells(sheet, 1, 1, widths.length, { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.soft } }, border });
    sheet.getRow(1).height = 30;

    sheet.mergeCells(`A2:${last}2`);
    const period = sheet.getCell('A2');
    period.value = `FECHA INICIAL: ${periodDateTime(startDate, startTime)}   —   FECHA CORTE: ${periodDateTime(endDate, endTime)}`;
    period.font = { name: 'Calibri', size: 11, color: { argb: COLORS.muted } };
    period.alignment = { horizontal: 'left', vertical: 'middle' };
    styleCells(sheet, 2, 1, widths.length, { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.soft } }, border });
    sheet.getRow(2).height = 20;
    sheet.getRow(3).height = 15;
    return { workbook, sheet };
};

const addIndicators = (sheet, indicators, spans = []) => {
    indicators.forEach((indicator, index) => {
        const [from, to] = spans[index] || [index + 1, index + 1];
        const fromLetter = sheet.getColumn(from).letter;
        const toLetter = sheet.getColumn(to).letter;
        if (from !== to) {
            sheet.mergeCells(`${fromLetter}4:${toLetter}4`);
            sheet.mergeCells(`${fromLetter}5:${toLetter}5`);
        }
        const label = sheet.getCell(4, from);
        const metric = sheet.getCell(5, from);
        label.value = indicator.label.toUpperCase();
        label.font = { name: 'Calibri', size: 9, bold: true, color: { argb: COLORS.muted } };
        label.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        label.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6F7F9' } };
        label.border = border;
        metric.value = indicator.value;
        metric.font = { name: 'Calibri', size: 16, bold: true, color: { argb: COLORS.title } };
        metric.alignment = { horizontal: 'right', vertical: 'middle' };
        metric.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6F7F9' } };
        metric.border = border;
        if (indicator.format) metric.numFmt = indicator.format;
        styleCells(sheet, 4, from, to, { border, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6F7F9' } } });
        styleCells(sheet, 5, from, to, { border, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6F7F9' } } });
    });
    sheet.getRow(4).height = 20;
    sheet.getRow(5).height = 25;
    sheet.getRow(6).height = 15;
};

const scoreColors = (score) => {
    if (score >= 0.9) return { fill: COLORS.green, text: COLORS.greenText };
    if (score >= 0.7) return { fill: COLORS.amber, text: COLORS.amberText };
    return { fill: COLORS.red, text: COLORS.redText };
};

const addTable = (sheet, { headers, rows, percentageColumn, mergeFirstTwoColumns = false }) => {
    const tableHeader = sheet.getRow(7);
    tableHeader.height = 28;
    const actualColumns = headers.length + (mergeFirstTwoColumns ? 1 : 0);
    headers.forEach((header, index) => {
        const column = mergeFirstTwoColumns && index > 0 ? index + 2 : index + 1;
        const cell = tableHeader.getCell(column);
        cell.value = header;
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.white } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navy } };
        cell.border = border;
    });
    if (mergeFirstTwoColumns) {
        sheet.mergeCells('A7:B7');
        styleCells(sheet, 7, 1, actualColumns, { border, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navy } } });
    }

    rows.forEach((values, rowIndex) => {
        const row = sheet.getRow(8 + rowIndex);
        row.height = 24;
        values.forEach((value, columnIndex) => {
            const column = mergeFirstTwoColumns && columnIndex > 0 ? columnIndex + 2 : columnIndex + 1;
            const cell = row.getCell(column);
            cell.value = value;
            cell.font = { name: 'Calibri', size: 10, bold: columnIndex === 0, color: { argb: COLORS.text } };
            cell.alignment = { horizontal: columnIndex === 0 ? 'left' : 'center', vertical: 'middle', wrapText: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowIndex % 2 === 0 ? COLORS.white : COLORS.stripe } };
            cell.border = border;
        });
        if (mergeFirstTwoColumns) {
            styleCells(sheet, row.number, 1, actualColumns, { border, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: rowIndex % 2 === 0 ? COLORS.white : COLORS.stripe } } });
            sheet.mergeCells(`A${row.number}:B${row.number}`);
            const guardCell = row.getCell(1);
            guardCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.text } };
            guardCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        }
        if (percentageColumn) {
            const actualPercentageColumn = mergeFirstTwoColumns ? percentageColumn + 1 : percentageColumn;
            const cell = row.getCell(actualPercentageColumn);
            const colors = scoreColors(number(cell.value));
            cell.numFmt = '0.00%';
            cell.font = { name: 'Calibri', size: 10, bold: false, color: { argb: COLORS.text } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.fill } };
        }
    });
    if (percentageColumn && rows.length) {
        const actualPercentageColumn = mergeFirstTwoColumns ? percentageColumn + 1 : percentageColumn;
        const columnLetter = sheet.getColumn(actualPercentageColumn).letter;
        sheet.addConditionalFormatting({
            ref: `${columnLetter}8:${columnLetter}${7 + rows.length}`,
            rules: [{
                type: 'dataBar',
                cfvo: [{ type: 'num', value: 0 }, { type: 'num', value: 1 }],
                color: { argb: 'FF6FAF8A' }
            }]
        });
    }
    return Math.max(8, 7 + rows.length);
};

const addGlossary = (sheet, startRow, columnCount, glossary) => {
    const last = sheet.getColumn(columnCount).letter;
    sheet.mergeCells(`A${startRow}:${last}${startRow}`);
    const heading = sheet.getCell(startRow, 1);
    heading.value = 'GLOSARIO Y DEFINICIONES DE MÉTRICAS';
    heading.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.title } };
    heading.alignment = { horizontal: 'left', vertical: 'middle' };
    styleCells(sheet, startRow, 1, columnCount, { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.soft } }, border });
    sheet.getRow(startRow).height = 22;

    glossary.forEach((item, index) => {
        const rowNumber = startRow + index + 1;
        styleCells(sheet, rowNumber, 1, columnCount, { border });
        sheet.mergeCells(`B${rowNumber}:${last}${rowNumber}`);
        const term = sheet.getCell(rowNumber, 1);
        term.value = item.term;
        term.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.navy } };
        term.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6F7F9' } };
        term.alignment = { vertical: 'middle', wrapText: true };
        const definition = sheet.getCell(rowNumber, 2);
        definition.value = item.definition;
        definition.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF4A4E58' } };
        definition.alignment = { vertical: 'middle', wrapText: true };
        sheet.getRow(rowNumber).height = 30;
    });

    const footerRow = startRow + glossary.length + 2;
    sheet.mergeCells(`A${footerRow}:${last}${footerRow}`);
    const footer = sheet.getCell(footerRow, 1);
    footer.value = 'NetGuard — reporte generado automáticamente';
    footer.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF9AA0AC' } };
    footer.alignment = { horizontal: 'left', vertical: 'middle' };
    sheet.getRow(footerRow).height = 20;
};

const averageTime = (values) => {
    const seconds = values.map((value) => {
        if (!/^\d{2}:\d{2}:\d{2}$/.test(String(value))) return null;
        const [hours, minutes, secs] = String(value).split(':').map(Number);
        return hours * 3600 + minutes * 60 + secs;
    }).filter((value) => value !== null);
    if (!seconds.length) return 'N/A';
    const total = Math.round(seconds.reduce((sum, value) => sum + value, 0) / seconds.length);
    return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60].map((item) => String(item).padStart(2, '0')).join(':');
};

export const exportAuditV2Xls = async (conditions) => {
    const response = await auditResponse(conditions);

    if (conditions.objetive === 'RUTINA DE GUARDIA') {
        const rows = response.map((item) => ({
            user: valueOrDash(item.name),
            company: valueOrDash(item.empresa),
            routines: number(item.totalRutinas),
            locations: number(item.totalUbicaciones),
            expected: number(item.totalEsperadas),
            completed: number(item.totalRealizadas),
            valid: number(item.totalValidas),
            score: percentage(item.ponderado)
        }));
        const expected = rows.reduce((sum, item) => sum + item.expected, 0);
        const completed = rows.reduce((sum, item) => sum + item.completed, 0);
        const valid = rows.reduce((sum, item) => sum + item.valid, 0);
        const { workbook, sheet } = buildWorkbook({
            title: 'REPORTE DE CUMPLIMIENTO POR GUARDIA — NETGUARD',
            startDate: conditions.filterStartDate,
            startTime: conditions.filterStartTime,
            endDate: conditions.filterEndDate,
            endTime: conditions.filterEndTime,
        widths: [28, 30, 12, 14, 16, 16, 14, 16]
        });
        addIndicators(sheet, [
            { label: 'Guardias evaluados', value: rows.length },
            { label: 'Marcaciones esperadas', value: expected },
            { label: 'Marcaciones realizadas', value: completed },
            { label: 'Cumplimiento global', value: expected ? valid / expected : 0, format: '0.00%' }
        ], [[1, 2], [3, 4], [5, 6], [7, 8]]);
        const lastRow = addTable(sheet, {
            headers: ['GUARDIA', 'EMPRESA', 'RUTINAS', 'UBICACIONES', 'ESPERADAS', 'REALIZADAS', 'VÁLIDAS', 'PONDERADO'],
            rows: rows.map((item) => [item.user, item.company, item.routines, item.locations, item.expected, item.completed, item.valid, item.score]),
            percentageColumn: 8
        });
        addGlossary(sheet, lastRow + 2, 8, [
            { term: 'Empresa', definition: 'Empresa del cliente asociada a la asignación de la rutina del guardia.' },
            { term: 'Rutinas', definition: 'Cantidad de rutinas asignadas al guardia durante el período consultado.' },
            { term: 'Marcaciones esperadas', definition: 'Total de marcaciones planificadas para las rutinas y ubicaciones asignadas.' },
            { term: 'Marcaciones válidas', definition: 'Marcaciones realizadas que cumplen la validación operativa configurada.' },
            { term: 'Ponderado', definition: 'Marcaciones válidas / marcaciones esperadas. Los valores se calculan únicamente con los registros del período seleccionado.' }
        ]);
        await download(workbook, 'Reporte_Estadistico_Guardias_NetGuard.xlsx');
        return;
    }

    const rows = response.map((item) => ({
        user: valueOrDash(item.Usuario),
        generated: number(item['Total Alertas Generadas']),
        answered: number(item['Total Alertas Respondidas']),
        onTime: number(item['Total Alertas Respondidas A Tiempo']),
        compliance: percentage(item.Cumplimiento),
        average: valueOrDash(item.Promedio, 'N/A')
    }));
    const generated = rows.reduce((sum, item) => sum + item.generated, 0);
    const answered = rows.reduce((sum, item) => sum + item.answered, 0);
    const onTime = rows.reduce((sum, item) => sum + item.onTime, 0);
    const { workbook, sheet } = buildWorkbook({
        title: 'REPORTE DE CUMPLIMIENTO POR CONSOLA — NETGUARD',
        startDate: conditions.filterStartDate,
        startTime: conditions.filterStartTime,
        endDate: conditions.filterEndDate,
        endTime: conditions.filterEndTime,
        widths: [34, 22, 22, 24, 22, 26]
    });
    addIndicators(sheet, [
        { label: 'Alertas generadas', value: generated },
        { label: 'Alertas respondidas', value: answered },
        { label: 'Cumplimiento global', value: generated ? onTime / generated : 0, format: '0.00%' },
        { label: 'Tiempo promedio', value: averageTime(rows.map((item) => item.average)) }
    ]);
    const lastRow = addTable(sheet, {
        headers: ['USUARIO DE CONSOLA', 'ALERTAS GENERADAS', 'RESPONDIDAS', 'RESPONDIDAS A TIEMPO', 'CUMPLIMIENTO', 'TIEMPO PROMEDIO'],
        rows: rows.map((item) => [item.user, item.generated, item.answered, item.onTime, item.compliance, item.average]),
        percentageColumn: 5
    });
    addGlossary(sheet, lastRow + 2, 6, [
        { term: 'Alertas generadas', definition: 'Número total de alertas o requerimientos asignados a la consola durante el período.' },
        { term: 'Alertas respondidas', definition: 'Cantidad de alertas que fueron gestionadas por el operador.' },
        { term: 'Respondidas a tiempo', definition: 'Alertas atendidas dentro del tiempo operativo configurado.' },
        { term: 'Cumplimiento', definition: 'Alertas respondidas a tiempo / alertas generadas.' },
        { term: 'Tiempo promedio', definition: 'Tiempo medio de respuesta entre la generación de la alerta y su atención.' }
    ]);
    await download(workbook, 'Reporte_Estadistico_Consola_NetGuard.xlsx');
};
