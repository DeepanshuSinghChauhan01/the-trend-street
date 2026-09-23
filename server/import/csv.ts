import Papa from 'papaparse';

/**
 * Column order/names for both the downloadable template and the exported
 * CSV, so export output can be re-imported unchanged (round-trip compatible).
 */
export const CSV_COLUMNS = [
  'SKU',
  'Product Title',
  'Category',
  'Subcategory',
  'Gender',
  'Description',
  'Price',
  'Compare At Price',
  'Material',
  'Fit',
  'Color',
  'Size',
  'Stock',
  'Tags',
  'Status',
  'Featured',
  'New Arrival',
  'Image 1',
  'Image 2',
  'Image 3',
  'Image 4',
  'Image 5',
  'SEO Title',
  'SEO Description',
] as const;

// Required per the store's business rules (Product Title, SKU, Category,
// Price, Gender, Size, Color, Stock) — Description is intentionally NOT
// required here even though products.description is NOT NULL in the schema,
// because an empty string satisfies NOT NULL; we default it to '' downstream.
export const REQUIRED_COLUMNS = ['SKU', 'Product Title', 'Category', 'Price', 'Gender', 'Size', 'Color', 'Stock'] as const;

const MAX_ROWS = 5000;
const MAX_CSV_CHARS = 20 * 1024 * 1024; // ~20MB of text

export interface ParsedCsv {
  headers: string[];
  records: Record<string, string>[];
}

export interface CsvParseError {
  error: string;
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function parseCsvText(csvText: string): ParsedCsv | CsvParseError {
  if (!csvText || !csvText.trim()) {
    return { error: 'The CSV file is empty.' };
  }
  if (csvText.length > MAX_CSV_CHARS) {
    return { error: 'File is too large. Maximum supported size is ~20MB.' };
  }

  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  });

  if (result.errors?.length) {
    const fatal = result.errors.find(e => e.type !== 'FieldMismatch');
    if (fatal) {
      return { error: `Malformed CSV: ${fatal.message} (row ${(fatal.row ?? 0) + 2})` };
    }
  }

  const headers = (result.meta.fields || []).map(h => h.trim());
  if (headers.length === 0) {
    return { error: 'Could not read a header row from this CSV.' };
  }

  const normalizedHeaders = headers.map(normalizeHeader);
  const missing = REQUIRED_COLUMNS.filter(col => !normalizedHeaders.includes(normalizeHeader(col)));
  if (missing.length) {
    return { error: `Missing required column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}` };
  }

  const records = (result.data || []).filter(r => Object.values(r).some(v => (v ?? '').toString().trim() !== ''));
  if (records.length === 0) {
    return { error: 'The CSV has a header row but no data rows.' };
  }
  if (records.length > MAX_ROWS) {
    return { error: `Too many rows (${records.length}). Maximum supported per import is ${MAX_ROWS}.` };
  }

  // Re-key each record by normalized header name so lookups are case/spacing-insensitive.
  const normalizedRecords = records.map(r => {
    const out: Record<string, string> = {};
    for (const key of Object.keys(r)) {
      out[normalizeHeader(key)] = (r[key] ?? '').toString().trim();
    }
    return out;
  });

  return { headers, records: normalizedRecords };
}

export function getCsvField(record: Record<string, string>, column: string): string {
  return record[normalizeHeader(column)] ?? '';
}

/** Header-only template — deliberately no example data rows, so nothing fake ever reaches the database by accident. */
export function generateTemplateCsv(): string {
  return Papa.unparse({ fields: CSV_COLUMNS as unknown as string[], data: [] });
}

/**
 * Neutralizes CSV-injection payloads (cells starting with =,+,-,@ can be
 * interpreted as formulas by Excel/Sheets when the file is reopened).
 */
function sanitizeCell(value: string): string {
  if (/^[=+\-@]/.test(value)) {
    return `'${value}`;
  }
  return value;
}

export function unparseProductRowsToCsv(rows: Record<string, string>[]): string {
  const sanitizedRows = rows.map(row => {
    const out: Record<string, string> = {};
    for (const col of CSV_COLUMNS) {
      out[col] = sanitizeCell(row[col] ?? '');
    }
    return out;
  });
  return Papa.unparse({ fields: CSV_COLUMNS as unknown as string[], data: sanitizedRows });
}

export function unparseErrorReportToCsv(rows: { rowNumber: number; sku: string; errors: string[] }[]): string {
  const data = rows
    .filter(r => r.errors.length > 0)
    .flatMap(r => r.errors.map(err => ({ Row: String(r.rowNumber), SKU: r.sku, Error: sanitizeCell(err) })));
  return Papa.unparse({ fields: ['Row', 'SKU', 'Error'], data });
}
