import XLSX from 'xlsx';

export function parseXlsx(buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const result = {};

    for (const sheetName of workbook.SheetNames) {
        result[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }

    return result;
}