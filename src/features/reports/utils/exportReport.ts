import type { ReportColumnDefinition, ReportDataRow } from '../types/reports.types';

export function downloadCsvReport(
  filename: string,
  selectedColumns: ReportColumnDefinition[],
  rows: ReportDataRow[],
): void {
  const headers = selectedColumns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(',');
  const lines = rows.map((row) =>
    selectedColumns
      .map((col) => {
        const val = String((row as unknown as Record<string, unknown>)[col.id] ?? '');
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(','),
  );

  const csvContent = '\uFEFF' + [headers, ...lines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerBrowserDownload(blob, `${filename}.csv`);
}

export function downloadTxtReport(
  filename: string,
  selectedColumns: ReportColumnDefinition[],
  rows: ReportDataRow[],
  metadataHeader: string,
): void {
  const separator = ' | ';
  const headerLine = selectedColumns.map((col) => col.label).join(separator);
  const dividerLine = '-'.repeat(Math.min(headerLine.length, 120));

  const dataLines = rows.map((row) =>
    selectedColumns
      .map((col) => String((row as unknown as Record<string, unknown>)[col.id] ?? ''))
      .join(separator),
  );

  const txtContent = [
    '================================================================================',
    'LIVERPOOL · GESTIÓN DE ESTRUCTURAS COMERCIALES (ZDEPTOS)',
    `REPORTE OFICIAL GENERADO: ${new Date().toLocaleString('es-MX')}`,
    metadataHeader,
    '================================================================================',
    '',
    headerLine,
    dividerLine,
    ...dataLines,
    '',
    `Total de registros exportados: ${rows.length}`,
    'Fin del reporte.',
  ].join('\r\n');

  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
  triggerBrowserDownload(blob, `${filename}.txt`);
}

function triggerBrowserDownload(blob: Blob, fullFilename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fullFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
