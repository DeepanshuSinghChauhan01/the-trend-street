import React, { useRef, useState } from 'react';
import { X, Upload, Download, AlertTriangle, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { ImportPreviewResponse, ImportCommitResponse, ImportRowResult, ImportRowAction } from '../../types/index.js';

interface ProductImportModalProps {
  adminToken: string | null;
  onClose: () => void;
  onImportComplete: () => void;
}

type Step = 'upload' | 'preview' | 'result';

const ACTION_STYLES: Record<ImportRowAction, string> = {
  CREATE: 'bg-emerald-950 text-emerald-400 border-emerald-800',
  UPDATE: 'bg-amber-950 text-amber-400 border-amber-800',
  UNCHANGED: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  ERROR: 'bg-rose-950 text-rose-400 border-rose-800',
};

function downloadBlob(content: string, filename: string, mime = 'text/csv') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string): string {
  const v = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function buildErrorCsv(rows: ImportRowResult[]): string {
  const lines = ['Row,SKU,Error'];
  for (const r of rows) {
    for (const err of r.errors) {
      lines.push([String(r.rowNumber), csvEscape(r.sku), csvEscape(err)].join(','));
    }
  }
  return lines.join('\n');
}

export const ProductImportModal: React.FC<ProductImportModalProps> = ({ adminToken, onClose, onImportComplete }) => {
  const [step, setStep] = useState<Step>('upload');
  const [csvText, setCsvText] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [createMissingCategories, setCreateMissingCategories] = useState(false);
  const [skipErrorRows, setSkipErrorRows] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreviewResponse | null>(null);
  const [importResult, setImportResult] = useState<ImportCommitResponse | null>(null);
  const [topLevelError, setTopLevelError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken || ''}`,
  };

  const handleDownloadTemplate = async () => {
    const res = await fetch('/api/admin/products/import/template', { headers: { Authorization: `Bearer ${adminToken || ''}` } });
    if (!res.ok) {
      alert('Failed to download template.');
      return;
    }
    const text = await res.text();
    downloadBlob(text, 'trend-street-product-import-template.csv');
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setTopLevelError('Please select a .csv file. Excel files must be exported/downloaded as CSV first.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setTopLevelError('File is too large (max ~20MB).');
      return;
    }
    setTopLevelError('');
    const text = await file.text();
    setCsvText(text);
    setFileName(file.name);
  };

  const handleValidate = async () => {
    if (!csvText) return;
    setIsValidating(true);
    setTopLevelError('');
    try {
      const res = await fetch('/api/admin/products/import/validate', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ csv: csvText, createMissingCategories }),
      });
      const data: ImportPreviewResponse = await res.json();
      if (!data.success) {
        setTopLevelError(data.message || 'Validation failed.');
        return;
      }
      setPreviewData(data);
      setStep('preview');
    } catch {
      setTopLevelError('Could not reach the server to validate this file.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!csvText) return;
    setIsImporting(true);
    setTopLevelError('');
    try {
      const res = await fetch('/api/admin/products/import/commit', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ csv: csvText, createMissingCategories, skipErrorRows }),
      });
      const data: ImportCommitResponse = await res.json();
      setImportResult(data);
      setStep('result');
      if (data.imported) onImportComplete();
    } catch {
      setTopLevelError('Could not reach the server to run this import.');
    } finally {
      setIsImporting(false);
    }
  };

  const resetAll = () => {
    setStep('upload');
    setCsvText(null);
    setFileName('');
    setPreviewData(null);
    setImportResult(null);
    setTopLevelError('');
    setSkipErrorRows(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const activeRows = step === 'result' ? importResult?.rows : previewData?.rows;
  const activeSummary = step === 'result' ? importResult?.summary : previewData?.summary;
  const displayRows = (activeRows || []).slice(0, 300);
  const hasMoreRows = (activeRows?.length || 0) > 300;
  const blockedByErrors = Boolean(previewData && previewData.summary.errorCount > 0 && !skipErrorRows);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#121215] border-0 sm:border sm:border-zinc-800 w-full h-full sm:h-auto sm:w-[92vw] sm:max-w-[1000px] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Sticky header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-zinc-800">
          <h3 className="font-display font-bold text-base text-white uppercase">Import Products</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white p-1 -mr-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-5 text-base sm:text-xs">
          {topLevelError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{topLevelError}</span>
            </div>
          )}

          {/* STEP: UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Template
                </button>
                <label className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" /> {fileName || 'Choose CSV'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    hidden
                    onChange={e => handleFileSelect(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              {csvText && (
                <div className="p-3 bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">{fileName}</span>
                  <span className="text-zinc-500 shrink-0">({(csvText.length / 1024).toFixed(1)} KB)</span>
                </div>
              )}

              <label className="flex items-start gap-2 text-zinc-300">
                <input type="checkbox" className="mt-1" checked={createMissingCategories} onChange={e => setCreateMissingCategories(e.target.checked)} />
                <span>
                  Automatically create categories that don't exist yet.
                  <span className="block text-zinc-500">Off by default — rows with an unrecognized category will be flagged as errors instead.</span>
                </span>
              </label>

              <p className="text-zinc-500">
                CSV must include these columns: SKU, Product Title, Category, Gender, Price, Color, Size, Stock (plus optional
                Subcategory, Description, Compare At Price, Material, Fit, Tags, Status, Featured, New Arrival, Image 1–5, SEO Title, SEO Description).
                Rows sharing the same Product Title become one product with multiple variants.
              </p>

              <button
                type="button"
                disabled={!csvText || isValidating}
                onClick={handleValidate}
                className="w-full py-3 bg-white text-zinc-950 font-bold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isValidating ? <><Loader2 className="w-4 h-4 animate-spin" /> Validating...</> : 'Validate'}
              </button>
            </div>
          )}

          {/* STEP: PREVIEW or RESULT (shared table UI) */}
          {(step === 'preview' || step === 'result') && activeSummary && (
            <div className="space-y-5">
              {step === 'result' && importResult && (
                <div className={`p-3 border rounded flex items-center gap-2 ${importResult.imported ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border-rose-800 text-rose-300'}`}>
                  {importResult.imported ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                  <span>{importResult.message}</span>
                </div>
              )}

              <div>
                <h4 className="text-zinc-400 font-bold uppercase tracking-wider mb-2">Products</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-zinc-950 border border-zinc-800 p-3 text-center">
                    <p className="font-display font-black text-xl text-emerald-400">{activeSummary.productsNew}</p>
                    <p className="text-zinc-500 uppercase tracking-wider">New</p>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 p-3 text-center">
                    <p className="font-display font-black text-xl text-amber-400">{activeSummary.productsUpdate}</p>
                    <p className="text-zinc-500 uppercase tracking-wider">Update</p>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 p-3 text-center">
                    <p className="font-display font-black text-xl text-zinc-300">{activeSummary.productsUnchanged}</p>
                    <p className="text-zinc-500 uppercase tracking-wider">Unchanged</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-zinc-400 font-bold uppercase tracking-wider mb-2">Variants &amp; Images</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-zinc-950 border border-zinc-800 p-3 text-center">
                    <p className="font-display font-black text-xl text-emerald-400">{activeSummary.variantsNew}</p>
                    <p className="text-zinc-500 uppercase tracking-wider">New Variants</p>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 p-3 text-center">
                    <p className="font-display font-black text-xl text-amber-400">{activeSummary.variantsUpdate}</p>
                    <p className="text-zinc-500 uppercase tracking-wider">Updated Variants</p>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 p-3 text-center">
                    <p className="font-display font-black text-xl text-zinc-300">{activeSummary.imagesNew}</p>
                    <p className="text-zinc-500 uppercase tracking-wider">New Images</p>
                  </div>
                </div>
              </div>

              {activeSummary.errorCount > 0 && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{activeSummary.errorCount} row(s) with errors</span>
                    <button
                      type="button"
                      onClick={() => downloadBlob(buildErrorCsv(activeRows || []), 'import-errors.csv')}
                      className="underline hover:text-rose-100"
                    >
                      Download Error CSV
                    </button>
                  </div>
                  {step === 'preview' && (
                    <label className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1" checked={skipErrorRows} onChange={e => setSkipErrorRows(e.target.checked)} />
                      <span>Import valid rows and skip the ones with errors (default: block the whole import until fixed).</span>
                    </label>
                  )}
                </div>
              )}

              {activeSummary.categoriesMissing.length > 0 && (
                <div className="p-3 bg-amber-950/60 border border-amber-800 text-amber-300 rounded">
                  {createMissingCategories ? 'Will create these new categories: ' : 'Missing categories (rows flagged as errors): '}
                  {activeSummary.categoriesMissing.join(', ')}
                </div>
              )}

              <div className="border border-zinc-800 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider">
                      <th className="p-2 font-semibold">Row</th>
                      <th className="p-2 font-semibold">SKU</th>
                      <th className="p-2 font-semibold">Product</th>
                      <th className="p-2 font-semibold">Action</th>
                      <th className="p-2 font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {displayRows.map(r => (
                      <tr key={r.rowNumber}>
                        <td className="p-2 font-mono">{r.rowNumber}</td>
                        <td className="p-2 font-mono">{r.sku}</td>
                        <td className="p-2 max-w-[160px] truncate">{r.productTitle}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border rounded ${ACTION_STYLES[r.action]}`}>{r.action}</span>
                        </td>
                        <td className="p-2 max-w-xs">
                          {r.errors.length > 0 && <span className="text-rose-400">{r.errors.join('; ')}</span>}
                          {r.changes.length > 0 && (
                            <span className="text-zinc-400">
                              {r.changes.map(c => `${c.field}: ${c.from || '—'} → ${c.to || '—'}`).join('; ')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {hasMoreRows && (
                  <div className="p-2 text-center text-zinc-500 border-t border-zinc-800">
                    Showing first 300 of {activeRows?.length} rows — download the error CSV or export for the full list.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sticky footer actions */}
        <div className="shrink-0 flex gap-3 px-4 sm:px-6 py-4 border-t border-zinc-800 text-sm sm:text-xs">
          {step === 'upload' && (
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-zinc-800 text-zinc-300 font-bold uppercase tracking-wider">
              Cancel
            </button>
          )}
          {step === 'preview' && (
            <>
              <button
                type="button"
                disabled={isImporting || blockedByErrors}
                onClick={handleImport}
                className="flex-1 py-3 bg-white text-zinc-950 font-bold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
                title={blockedByErrors ? 'Fix errors or enable "skip errors" to continue' : undefined}
              >
                {isImporting ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</> : 'Import Products'}
              </button>
              <button type="button" onClick={resetAll} className="flex-1 py-3 bg-zinc-800 text-zinc-300 font-bold uppercase tracking-wider">
                Back
              </button>
            </>
          )}
          {step === 'result' && (
            <>
              <button type="button" onClick={onClose} className="flex-1 py-3 bg-white text-zinc-950 font-bold uppercase tracking-wider">
                Done
              </button>
              <button type="button" onClick={resetAll} className="flex-1 py-3 bg-zinc-800 text-zinc-300 font-bold uppercase tracking-wider">
                Import Another File
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
