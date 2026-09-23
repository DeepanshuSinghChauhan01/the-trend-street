import { db, slugify } from '../db.js';
import { supabaseAdmin } from '../supabaseAdmin.js';
import { parseCsvText, getCsvField } from './csv.js';
import { downloadImageSafely } from './imageFetch.js';
import { ImportFieldChange, ImportRowAction, ImportRowResult, ImportSummary, ProductImage } from '../../src/types/index.js';

export interface ImportOptions {
  createMissingCategories?: boolean;
  skipErrorRows?: boolean;
}

interface ValidRowData {
  productTitle: string;
  categoryName: string;
  subcategory?: string;
  gender: 'men' | 'women' | 'unisex';
  description: string;
  price: number;
  compareAtPrice?: number;
  material?: string;
  fit?: string;
  color: string;
  size: string;
  stock: number;
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  featured: boolean;
  newArrival: boolean;
  images: string[];
  seoTitle?: string;
  seoDescription?: string;
}

interface AnalyzedRow {
  rowNumber: number;
  sku: string;
  productTitle: string;
  data?: ValidRowData;
  errors: string[];
  categoryId?: string;
  categorySlug?: string;
}

interface WritePlanGroup {
  existingProductId?: string;
  existingImages: ProductImage[];
  representative: AnalyzedRow;
  rows: AnalyzedRow[];
  productChanges: ImportFieldChange[];
}

interface AnalysisResult {
  summary: ImportSummary;
  rows: ImportRowResult[];
  writePlan: WritePlanGroup[];
  blockingErrors: boolean;
  topLevelError?: string;
}

function emptySummary(): ImportSummary {
  return {
    totalRows: 0, productsNew: 0, productsUpdate: 0, productsUnchanged: 0,
    variantsNew: 0, variantsUpdate: 0, imagesNew: 0, errorCount: 0, categoriesMissing: [],
  };
}

function diff(field: string, from: string, to: string): ImportFieldChange {
  return { field, from, to };
}

function parseBoolean(raw: string): boolean | null {
  const v = raw.trim().toLowerCase();
  if (v === '') return false;
  if (['true', '1', 'yes', 'y'].includes(v)) return true;
  if (['false', '0', 'no', 'n'].includes(v)) return false;
  return null;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function parseRow(record: Record<string, string>): { data?: ValidRowData; errors: string[] } {
  const errors: string[] = [];

  const sku = getCsvField(record, 'SKU');
  const productTitle = getCsvField(record, 'Product Title');
  const categoryName = getCsvField(record, 'Category');
  const subcategory = getCsvField(record, 'Subcategory');
  const genderRaw = getCsvField(record, 'Gender').toLowerCase();
  const description = getCsvField(record, 'Description');
  const priceRaw = getCsvField(record, 'Price');
  const compareAtRaw = getCsvField(record, 'Compare At Price');
  const material = getCsvField(record, 'Material');
  const fit = getCsvField(record, 'Fit');
  const color = getCsvField(record, 'Color');
  const size = getCsvField(record, 'Size');
  const stockRaw = getCsvField(record, 'Stock');
  const tagsRaw = getCsvField(record, 'Tags');
  const statusRaw = (getCsvField(record, 'Status') || 'active').toLowerCase();
  const featuredRaw = getCsvField(record, 'Featured');
  const newArrivalRaw = getCsvField(record, 'New Arrival');
  const seoTitle = getCsvField(record, 'SEO Title');
  const seoDescription = getCsvField(record, 'SEO Description');
  const images = [1, 2, 3, 4, 5].map(n => getCsvField(record, `Image ${n}`)).filter(Boolean);

  if (!sku) errors.push('SKU is missing');
  if (!productTitle) errors.push('Product Title is missing');
  if (!categoryName) errors.push('Category is missing');
  if (!color) errors.push('Color is missing');
  if (!size) errors.push('Size is missing');

  const price = Number(priceRaw);
  if (!priceRaw || Number.isNaN(price) || price < 0) errors.push('Invalid price');

  let compareAtPrice: number | undefined;
  if (compareAtRaw) {
    compareAtPrice = Number(compareAtRaw);
    if (Number.isNaN(compareAtPrice) || compareAtPrice < 0) {
      errors.push('Invalid compare-at price');
    } else if (!Number.isNaN(price) && compareAtPrice < price) {
      errors.push('Compare-at price must be greater than or equal to price');
    }
  }

  const stock = Number(stockRaw);
  if (!stockRaw || Number.isNaN(stock) || !Number.isInteger(stock) || stock < 0) {
    errors.push('Invalid or negative stock');
  }

  if (!['men', 'women', 'unisex'].includes(genderRaw)) {
    errors.push('Gender must be men, women, or unisex');
  }
  if (!['active', 'draft', 'archived'].includes(statusRaw)) {
    errors.push('Status must be active, draft, or archived');
  }

  const featured = parseBoolean(featuredRaw);
  if (featured === null) errors.push('Featured must be true/false');
  const newArrival = parseBoolean(newArrivalRaw);
  if (newArrival === null) errors.push('New Arrival must be true/false');

  for (const imgUrl of images) {
    if (!isValidHttpUrl(imgUrl)) errors.push(`Malformed image URL: ${imgUrl}`);
  }

  if (errors.length > 0) return { errors };

  return {
    errors: [],
    data: {
      productTitle, categoryName, subcategory: subcategory || undefined,
      gender: genderRaw as 'men' | 'women' | 'unisex', description, price, compareAtPrice,
      material: material || undefined, fit: fit || undefined, color, size, stock,
      tags: tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
      status: statusRaw as 'active' | 'draft' | 'archived',
      featured: featured!, newArrival: newArrival!,
      images, seoTitle: seoTitle || undefined, seoDescription: seoDescription || undefined,
    },
  };
}

async function analyzeImport(csvText: string, options: ImportOptions): Promise<AnalysisResult> {
  const parsed = parseCsvText(csvText);
  if ('error' in parsed) {
    return { summary: emptySummary(), rows: [], writePlan: [], blockingErrors: true, topLevelError: parsed.error };
  }

  const analyzedRows: AnalyzedRow[] = parsed.records.map((record, idx) => {
    const rowNumber = idx + 2; // header is row 1
    const sku = getCsvField(record, 'SKU');
    const productTitle = getCsvField(record, 'Product Title');
    const { data, errors } = parseRow(record);
    return { rowNumber, sku, productTitle, data, errors: [...errors] };
  });

  // Duplicate SKU within the file
  const skuCounts = new Map<string, number>();
  for (const r of analyzedRows) {
    if (r.sku) skuCounts.set(r.sku, (skuCounts.get(r.sku) || 0) + 1);
  }
  for (const r of analyzedRows) {
    if (r.sku && (skuCounts.get(r.sku) || 0) > 1) {
      r.errors.push('Duplicate SKU within this file');
    }
  }

  // Category resolution
  const categories = await db.getCategories();
  const categoryByName = new Map(categories.map(c => [c.name.toLowerCase().trim(), c]));
  const categoryNameBySlug = new Map(categories.map(c => [c.slug, c.name]));
  const missingCategoryNames = new Set<string>();

  for (const r of analyzedRows) {
    if (!r.data) continue;
    const match = categoryByName.get(r.data.categoryName.toLowerCase().trim());
    if (match) {
      r.categoryId = match.id;
      r.categorySlug = match.slug;
    } else {
      missingCategoryNames.add(r.data.categoryName);
      if (!options.createMissingCategories) {
        r.errors.push(`Category "${r.data.categoryName}" does not exist`);
      }
    }
  }

  const validRows = analyzedRows.filter(r => r.errors.length === 0 && r.data);

  // Existing variants by SKU (targeted query, not a full-table scan)
  const skuList = validRows.map(r => r.sku);
  const existingVariantBySku = new Map<string, { id: string; product_id: string; price: number; compare_at_price: number | null; stock: number; color: string; size: string }>();
  if (skuList.length) {
    const { data: variantRows, error } = await supabaseAdmin
      .from('product_variants')
      .select('id, sku, product_id, price, compare_at_price, stock, color, size')
      .in('sku', skuList);
    if (error) throw error;
    for (const v of variantRows || []) existingVariantBySku.set(v.sku as string, v as any);
  }

  // Existing products by title (case-insensitive) — lets a CSV add a new
  // colorway/size to an existing product even if its SKUs are all new.
  const { data: existingProductsRaw, error: prodErr } = await supabaseAdmin.from('products').select('id, title');
  if (prodErr) throw prodErr;
  const existingProductIdByTitleLower = new Map<string, string>();
  for (const p of existingProductsRaw || []) {
    existingProductIdByTitleLower.set((p.title as string).toLowerCase().trim(), p.id as string);
  }

  // Group rows into products
  const groups = new Map<string, { existingProductId?: string; rows: AnalyzedRow[] }>();
  for (const r of validRows) {
    const variantMatch = existingVariantBySku.get(r.sku);
    const existingProductId = variantMatch?.product_id || existingProductIdByTitleLower.get(r.data!.productTitle.toLowerCase().trim());
    const key = existingProductId || `new:${r.data!.productTitle.toLowerCase().trim()}`;
    if (!groups.has(key)) groups.set(key, { existingProductId, rows: [] });
    groups.get(key)!.rows.push(r);
  }

  // Fetch full existing product detail for diffing (once per unique product)
  const uniqueExistingIds = [...new Set([...groups.values()].map(g => g.existingProductId).filter(Boolean))] as string[];
  const existingProductById = new Map<string, Awaited<ReturnType<typeof db.getProductById>>>();
  for (const id of uniqueExistingIds) {
    existingProductById.set(id, await db.getProductById(id));
  }

  const writePlan: WritePlanGroup[] = [];
  const rowResults: ImportRowResult[] = [];
  let productsNew = 0, productsUpdate = 0, productsUnchanged = 0, variantsNew = 0, variantsUpdate = 0, imagesNew = 0;

  for (const group of groups.values()) {
    const representative = group.rows[0];
    const rep = representative.data!;
    const existing = group.existingProductId ? existingProductById.get(group.existingProductId) : undefined;
    const isNewProduct = !existing;

    const productChanges: ImportFieldChange[] = [];
    if (existing) {
      if (existing.title !== rep.productTitle) productChanges.push(diff('Title', existing.title, rep.productTitle));
      const existingCategoryName = categoryNameBySlug.get(existing.category) || existing.category;
      if (!representative.categorySlug || existing.category !== representative.categorySlug) {
        productChanges.push(diff('Category', existingCategoryName, rep.categoryName));
      }
      if ((existing.subcategory || '') !== (rep.subcategory || '')) productChanges.push(diff('Subcategory', existing.subcategory || '', rep.subcategory || ''));
      if (existing.gender !== rep.gender) productChanges.push(diff('Gender', existing.gender, rep.gender));
      if (existing.status !== rep.status) productChanges.push(diff('Status', existing.status, rep.status));
      if ((existing.material || '') !== (rep.material || '')) productChanges.push(diff('Material', existing.material || '', rep.material || ''));
      if ((existing.fit || '') !== (rep.fit || '')) productChanges.push(diff('Fit', existing.fit || '', rep.fit || ''));
      if (Boolean(existing.isFeatured) !== rep.featured) productChanges.push(diff('Featured', String(Boolean(existing.isFeatured)), String(rep.featured)));
      if (Boolean(existing.isNewArrival) !== rep.newArrival) productChanges.push(diff('New Arrival', String(Boolean(existing.isNewArrival)), String(rep.newArrival)));
      if (Number(existing.basePrice) !== rep.price) productChanges.push(diff('Base Price', String(existing.basePrice), String(rep.price)));
      const existingTagsStr = (existing.tags || []).slice().sort().join(', ');
      const newTagsStr = rep.tags.slice().sort().join(', ');
      if (existingTagsStr !== newTagsStr) productChanges.push(diff('Tags', existingTagsStr, newTagsStr));
    }

    if (isNewProduct) productsNew++;
    else if (productChanges.length > 0) productsUpdate++;

    let anyVariantChangeInGroup = false;
    for (const r of group.rows) {
      const rd = r.data!;
      const existingVariant = existingVariantBySku.get(r.sku);
      let action: ImportRowAction;
      const changes: ImportFieldChange[] = [];

      if (existingVariant) {
        if (Number(existingVariant.price) !== rd.price) changes.push(diff('Price', String(existingVariant.price), String(rd.price)));
        const existingCompare = existingVariant.compare_at_price != null ? Number(existingVariant.compare_at_price) : undefined;
        if ((existingCompare ?? '') !== (rd.compareAtPrice ?? '')) changes.push(diff('Compare At Price', String(existingCompare ?? ''), String(rd.compareAtPrice ?? '')));
        if (Number(existingVariant.stock) !== rd.stock) changes.push(diff('Stock', String(existingVariant.stock), String(rd.stock)));
        if (existingVariant.color !== rd.color) changes.push(diff('Color', existingVariant.color, rd.color));
        if (existingVariant.size !== rd.size) changes.push(diff('Size', existingVariant.size, rd.size));
        action = changes.length > 0 ? 'UPDATE' : 'UNCHANGED';
        if (action === 'UPDATE') variantsUpdate++;
      } else {
        action = 'CREATE';
        if (!isNewProduct) variantsNew++;
      }

      if (action !== 'UNCHANGED') anyVariantChangeInGroup = true;

      rowResults.push({
        rowNumber: r.rowNumber, sku: r.sku, productTitle: rd.productTitle,
        action, isNewProduct, errors: [], changes,
      });
    }

    const colorImageUrls = new Map<string, string[]>();
    for (const r of group.rows) {
      if (!colorImageUrls.has(r.data!.color)) colorImageUrls.set(r.data!.color, r.data!.images.slice(0, 5));
    }
    const groupImageCount = [...colorImageUrls.values()].reduce((sum, urls) => sum + urls.length, 0);

    if (isNewProduct) {
      variantsNew += group.rows.length;
      imagesNew += groupImageCount;
    } else if (productChanges.length === 0 && !anyVariantChangeInGroup) {
      productsUnchanged++;
    } else {
      imagesNew += groupImageCount;
    }

    if (isNewProduct || productChanges.length > 0 || anyVariantChangeInGroup) {
      writePlan.push({
        existingProductId: group.existingProductId,
        existingImages: existing?.images || [],
        representative,
        rows: group.rows,
        productChanges,
      });
    }
  }

  for (const r of analyzedRows) {
    if (r.errors.length > 0) {
      rowResults.push({
        rowNumber: r.rowNumber, sku: r.sku || '(missing)', productTitle: r.productTitle || '(missing)',
        action: 'ERROR', isNewProduct: false, errors: r.errors, changes: [],
      });
    }
  }
  rowResults.sort((a, b) => a.rowNumber - b.rowNumber);

  const summary: ImportSummary = {
    totalRows: analyzedRows.length,
    productsNew, productsUpdate, productsUnchanged,
    variantsNew, variantsUpdate, imagesNew,
    errorCount: rowResults.filter(r => r.action === 'ERROR').length,
    categoriesMissing: [...missingCategoryNames],
  };

  return { summary, rows: rowResults, writePlan, blockingErrors: summary.errorCount > 0 };
}

export async function previewImport(csvText: string, options: ImportOptions) {
  const analysis = await analyzeImport(csvText, options);
  if (analysis.topLevelError) {
    return { success: false, summary: analysis.summary, rows: analysis.rows, message: analysis.topLevelError };
  }
  return { success: true, summary: analysis.summary, rows: analysis.rows };
}

export async function commitImport(csvText: string, options: ImportOptions) {
  const analysis = await analyzeImport(csvText, options);
  if (analysis.topLevelError) {
    return { success: false, imported: false, summary: analysis.summary, rows: analysis.rows, message: analysis.topLevelError };
  }
  if (analysis.blockingErrors && !options.skipErrorRows) {
    return {
      success: false,
      imported: false,
      summary: analysis.summary,
      rows: analysis.rows,
      message: `Import blocked: ${analysis.summary.errorCount} row(s) have errors. Fix them, or check "Import valid rows, skip errors" to proceed with the rest.`,
    };
  }

  const imageCache = new Map<string, string>(); // source URL -> uploaded public URL
  const categorySlugCreatedThisRun = new Map<string, string>(); // category name -> slug

  for (const group of analysis.writePlan) {
    try {
      const rep = group.representative.data!;
      let categorySlug = group.representative.categorySlug;

      if (!categorySlug) {
        const cacheKey = rep.categoryName.toLowerCase().trim();
        if (categorySlugCreatedThisRun.has(cacheKey)) {
          categorySlug = categorySlugCreatedThisRun.get(cacheKey);
        } else {
          const slug = slugify(rep.categoryName);
          const { data: created, error } = await supabaseAdmin
            .from('categories')
            .upsert({ name: rep.categoryName, slug, description: '', display_order: 999 }, { onConflict: 'slug' })
            .select('slug')
            .single();
          if (error) throw error;
          categorySlug = created.slug;
          categorySlugCreatedThisRun.set(cacheKey, created.slug);
        }
      }

      // Every CSV row has its own Color (required column), so the images it
      // lists belong to that color specifically — never the product-level
      // "default/fallback" group, which stays reserved for the admin form /
      // pre-existing product-level images. Rows for the same color repeat
      // the same URLs (S/M/L/XL of one colorway), so we only download/upload
      // each color's image set once, keyed by first occurrence in the file.
      const urlsByColor = new Map<string, string[]>();
      for (const r of group.rows) {
        const color = r.data!.color;
        if (!urlsByColor.has(color)) urlsByColor.set(color, r.data!.images.slice(0, 5));
      }

      const imageErrors: string[] = [];
      const uploadedImages: { url: string; altText?: string; isPrimary?: boolean; color?: string }[] = [];
      let isFirstColorGroup = true;
      for (const [color, urls] of urlsByColor) {
        for (let i = 0; i < urls.length; i++) {
          const raw = urls[i];
          const isPrimary = isFirstColorGroup && i === 0;
          const cachedUrl = imageCache.get(raw);
          if (cachedUrl) {
            uploadedImages.push({ url: cachedUrl, altText: `${rep.productTitle} - ${color}`, isPrimary, color });
            continue;
          }
          const downloaded = await downloadImageSafely(raw);
          if (!downloaded.ok) {
            imageErrors.push(`${color} image ${i + 1}: ${downloaded.error}`);
            continue;
          }
          const path = `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${downloaded.extension}`;
          const { error: uploadErr } = await supabaseAdmin.storage
            .from('product-images')
            .upload(path, downloaded.buffer, { contentType: downloaded.contentType, upsert: false });
          if (uploadErr) {
            imageErrors.push(`${color} image ${i + 1}: upload failed - ${uploadErr.message}`);
            continue;
          }
          const { data: pub } = supabaseAdmin.storage.from('product-images').getPublicUrl(path);
          imageCache.set(raw, pub.publicUrl);
          uploadedImages.push({ url: pub.publicUrl, altText: `${rep.productTitle} - ${color}`, isPrimary, color });
        }
        isFirstColorGroup = false;
      }

      // For an EXISTING product, only the colors mentioned in THIS csv run
      // get their images replaced — every other color (and the product-level
      // default/fallback set) is carried over untouched, so a CSV that only
      // updates Black doesn't silently wipe White/Blue's images.
      const touchedColors = new Set(urlsByColor.keys());
      const preservedExistingImages = group.existingImages
        .filter(img => !img.color || !touchedColors.has(img.color))
        .map(img => ({ url: img.url, altText: img.altText, isPrimary: img.isPrimary, color: img.color }));

      const variantsInput = group.rows.map(r => ({
        color: r.data!.color,
        colorHex: '#18181b',
        size: r.data!.size,
        price: r.data!.price,
        compareAtPrice: r.data!.compareAtPrice,
        stock: r.data!.stock,
        exactSku: r.sku,
      }));

      if (!group.existingProductId) {
        if (uploadedImages.length === 0) {
          throw new Error(`Could not create product: no images could be downloaded (${imageErrors.join('; ') || 'no image URLs provided'})`);
        }
        await db.createProduct({
          title: rep.productTitle,
          brand: 'TREND STREET',
          description: rep.description || '',
          categorySlug: categorySlug!,
          subcategory: rep.subcategory,
          gender: rep.gender,
          sku: group.rows[0].sku,
          basePrice: rep.price,
          compareAtPrice: rep.compareAtPrice,
          status: rep.status,
          tags: rep.tags,
          material: rep.material,
          fit: rep.fit,
          isFeatured: rep.featured,
          isNewArrival: rep.newArrival,
          seoTitle: rep.seoTitle,
          seoDescription: rep.seoDescription,
          images: uploadedImages,
          variants: variantsInput,
        });
      } else {
        const updatePayload: Record<string, unknown> = {
          title: rep.productTitle,
          categorySlug,
          subcategory: rep.subcategory,
          gender: rep.gender,
          basePrice: rep.price,
          compareAtPrice: rep.compareAtPrice,
          status: rep.status,
          tags: rep.tags,
          material: rep.material,
          fit: rep.fit,
          isFeatured: rep.featured,
          isNewArrival: rep.newArrival,
          seoTitle: rep.seoTitle,
          seoDescription: rep.seoDescription,
          variants: variantsInput,
        };
        if (rep.description) updatePayload.description = rep.description;
        const mergedImages = [...preservedExistingImages, ...uploadedImages];
        if (mergedImages.length > 0) updatePayload.images = mergedImages;
        await db.updateProduct(group.existingProductId, updatePayload as any);
      }

      if (imageErrors.length) {
        for (const r of group.rows) {
          analysis.rows.find(rr => rr.rowNumber === r.rowNumber)?.errors.push(...imageErrors);
        }
      }
    } catch (err: any) {
      const message = err?.message || 'Unknown error while saving this product';
      for (const r of group.rows) {
        const rowResult = analysis.rows.find(rr => rr.rowNumber === r.rowNumber);
        if (rowResult) {
          rowResult.action = 'ERROR';
          rowResult.errors.push(message);
        }
      }
    }
  }

  const finalErrorCount = analysis.rows.filter(r => r.action === 'ERROR').length;
  return {
    success: true,
    imported: true,
    summary: { ...analysis.summary, errorCount: finalErrorCount },
    rows: analysis.rows,
    message: `Import complete: ${analysis.summary.productsNew} new product(s), ${analysis.summary.productsUpdate} updated, ${finalErrorCount} error(s).`,
  };
}
