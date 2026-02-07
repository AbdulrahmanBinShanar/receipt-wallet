/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename?: string): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Escape commas and quotes
                const stringValue = String(value || '');
                return stringValue.includes(',') || stringValue.includes('"')
                    ? `"${stringValue.replace(/"/g, '""')}"`
                    : stringValue;
            }).join(',')
        )
    ].join('\n');

    return csvContent;
}

/**
 * Download CSV file in the browser
 */
export function downloadCSV(csvContent: string, filename: string) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}
