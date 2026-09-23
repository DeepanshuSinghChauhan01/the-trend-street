import { db } from '../db.js';
import { unparseProductRowsToCsv } from './csv.js';

/** One row per variant, matching the import column layout so the export can be re-imported unchanged. */
export async function exportProductsToCsv(): Promise<string> {
  const rows: Record<string, string>[] = [];
  let page = 1;
  const pageSize = 60;

  // Walk every page of every status so the export is a complete catalog dump, not just active products.
  for (const status of ['active', 'draft', 'archived']) {
    page = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const result = await db.getProducts({ status, page, pageSize });
      for (const p of result.data) {
        const images = p.images.slice(0, 5).map(i => i.url);
        for (const v of p.variants) {
          rows.push({
            'SKU': v.sku,
            'Product Title': p.title,
            'Category': p.category,
            'Subcategory': p.subcategory || '',
            'Gender': p.gender,
            'Description': p.description,
            'Price': String(v.price),
            'Compare At Price': v.compareAtPrice != null ? String(v.compareAtPrice) : '',
            'Material': p.material || '',
            'Fit': p.fit || '',
            'Color': v.color,
            'Size': v.size,
            'Stock': String(v.stock),
            'Tags': (p.tags || []).join(', '),
            'Status': p.status,
            'Featured': String(Boolean(p.isFeatured)),
            'New Arrival': String(Boolean(p.isNewArrival)),
            'Image 1': images[0] || '',
            'Image 2': images[1] || '',
            'Image 3': images[2] || '',
            'Image 4': images[3] || '',
            'Image 5': images[4] || '',
            'SEO Title': p.seoTitle || '',
            'SEO Description': p.seoDescription || '',
          });
        }
      }
      if (!result.hasMore) break;
      page++;
    }
  }

  return unparseProductRowsToCsv(rows);
}
