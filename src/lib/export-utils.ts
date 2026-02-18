/**
 * Export data as CSV file download
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        const str = val === null || val === undefined ? '' : String(val);
        // Escape quotes and wrap in quotes if contains comma/newline
        return str.includes(',') || str.includes('\n') || str.includes('"')
          ? `"${str.replace(/"/g, '""')}"` 
          : str;
      }).join(',')
    ),
  ];
  
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data as Google Sheets compatible TSV file
 * Google Sheets can open .tsv files directly
 */
export function exportToGoogleSheets(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const tsvRows = [
    headers.join('\t'),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        const str = val === null || val === undefined ? '' : String(val);
        return str.replace(/\t/g, ' ').replace(/\n/g, ' ');
      }).join('\t')
    ),
  ];
  
  const blob = new Blob([tsvRows.join('\n')], { type: 'text/tab-separated-values;charset=utf-8;' });
  downloadBlob(blob, `${filename}.tsv`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
