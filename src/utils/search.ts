import { Phone } from '@/types/phone';

export interface SearchMatch {
  product: Phone;
  relevance: number;
  highlightCategory: 'phone' | 'laptop';
}

/**
 * Normalizes text for search indexing
 */
function normalize(str: string | undefined | null): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Intelligent multi-token search across phone and laptop specifications.
 * Checks brand, model, variant label, chipset, CPU, GPU, display panel,
 * RAM, storage, pros, and selling points.
 */
export function searchProducts(
  products: Phone[],
  query: string,
  categoryFilter?: 'phone' | 'laptop' | 'all',
  limit?: number
): Phone[] {
  const trimmed = query.trim();
  if (!trimmed) {
    const result = categoryFilter && categoryFilter !== 'all'
      ? products.filter(p => (p.category || 'phone') === categoryFilter)
      : products;
    return limit ? result.slice(0, limit) : result;
  }

  const tokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);

  const scoredResults: { product: Phone; score: number }[] = [];

  for (const product of products) {
    const pCategory = (product.category || 'phone') as 'phone' | 'laptop';
    if (categoryFilter && categoryFilter !== 'all' && pCategory !== categoryFilter) {
      continue;
    }

    const brand = normalize(product.brand);
    const model = normalize(product.model);
    const variantLabel = normalize(product.variantLabel);
    const variantGroupId = normalize(product.variantGroupId);
    
    // Performance specs
    const isLaptop = pCategory === 'laptop';
    const cpuModel = normalize(product.specs.performance?.cpuModel);
    const cpuBrand = normalize(product.specs.performance?.cpuBrand);
    const chipset = normalize(product.specs.performance?.chipset);
    const gpuModel = normalize(product.specs.performance?.gpuModel);
    const gpuType = normalize(product.specs.performance?.gpuType);

    // Display specs
    const displayType = normalize(product.specs.display?.type);
    const panelType = normalize(product.specs.display?.panelType);

    // Storage and RAM strings
    const ramStr = isLaptop
      ? `${product.specs.performance?.ramSize || ''}gb ram`
      : `${(product.specs.performance?.ram || []).join(' ')}gb ram`;
    const storageStr = isLaptop
      ? `${product.specs.performance?.storageCapacity || ''}`
      : `${(product.specs.performance?.storage || []).join(' ')}gb`;

    // Combine all searchable terms into one corpus
    const fullSearchCorpus = [
      brand,
      model,
      variantLabel,
      variantGroupId,
      cpuModel,
      cpuBrand,
      chipset,
      gpuModel,
      gpuType,
      displayType,
      panelType,
      ramStr,
      storageStr,
      ...(product.pros || []).map(normalize),
    ].join(' ');

    // Match each token against the corpus
    let allTokensMatch = true;
    let score = 0;

    for (const token of tokens) {
      if (!fullSearchCorpus.includes(token)) {
        allTokensMatch = false;
        break;
      }

      // Relevance scoring
      if (model.includes(token)) score += 50;
      if (brand.includes(token)) score += 30;
      if (chipset.includes(token) || cpuModel.includes(token)) score += 20;
      if (gpuModel.includes(token)) score += 15;
      if (displayType.includes(token) || panelType.includes(token)) score += 10;
      if (ramStr.includes(token) || storageStr.includes(token)) score += 10;
      score += 5;
    }

    if (allTokensMatch) {
      // Bonus for exact startsWith or full match
      if (model.startsWith(trimmed.toLowerCase())) score += 40;
      if (brand.startsWith(trimmed.toLowerCase())) score += 25;
      // Factor in specsScore as tiebreaker
      score += (product.specsScore || 0) * 0.1;

      scoredResults.push({ product, score });
    }
  }

  scoredResults.sort((a, b) => b.score - a.score);

  const finalProducts = scoredResults.map(r => r.product);
  return limit ? finalProducts.slice(0, limit) : finalProducts;
}

/**
 * Find count of matches in the alternate category (for cross-category recommendations)
 */
export function getAlternateCategoryCount(
  products: Phone[],
  query: string,
  currentCategory: 'phone' | 'laptop'
): { category: 'phone' | 'laptop'; count: number } {
  const alternateCategory = currentCategory === 'phone' ? 'laptop' : 'phone';
  const matches = searchProducts(products, query, alternateCategory);
  return {
    category: alternateCategory,
    count: matches.length,
  };
}
