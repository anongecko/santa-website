// src/lib/scraping/quality-filters.ts

import { ScrapedProduct } from './types';

export interface QualityThresholds {
  minRating: number;
  minReviewCount: number;
  minPrime?: boolean;
  preferVerifiedPurchases?: boolean;
  excludeSponsored?: boolean;
}

export class ProductQualityFilter {
  private static DEFAULT_THRESHOLDS: QualityThresholds = {
    minRating: 4.5,
    minReviewCount: 100,
    minPrime: true,
    preferVerifiedPurchases: true,
    excludeSponsored: true,
  };

  static filterProducts(
    products: ScrapedProduct[],
    customThresholds?: Partial<QualityThresholds>
  ): ScrapedProduct[] {
    const thresholds = { ...this.DEFAULT_THRESHOLDS, ...customThresholds };

    return products
      .filter(product => {
        // Basic quality checks
        if (product.rating < thresholds.minRating) return false;
        if (product.reviewCount < thresholds.minReviewCount) return false;
        if (thresholds.minPrime && !product.prime) return false;
        if (thresholds.excludeSponsored && product.sponsored) return false;

        return true;
      })
      .sort((a, b) => {
        // Calculate quality score
        const scoreA = this.calculateQualityScore(a);
        const scoreB = this.calculateQualityScore(b);
        return scoreB - scoreA;
      });
  }

  private static calculateQualityScore(product: ScrapedProduct): number {
    // Base score from rating (0-5)
    let score = product.rating * 2; // Weight of 2 for rating

    // Review count factor (logarithmic scale to prevent domination by huge numbers)
    score += Math.log10(product.reviewCount) / 2;

    // Prime bonus
    if (product.prime) score += 0.5;

    // Bestseller bonus
    if (product.bestSeller) score += 1;

    // Sponsored penalty
    if (product.sponsored) score -= 1;

    return score;
  }

  static findBestProductsInPriceTier(
    products: ScrapedProduct[],
    minPrice: number,
    maxPrice: number,
    customThresholds?: Partial<QualityThresholds>
  ): ScrapedProduct[] {
    // First filter by price range
    const inRange = products.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // Then apply quality filters
    const qualityProducts = this.filterProducts(inRange, customThresholds);

    // If we don't have enough high-quality products, gradually relax constraints
    if (qualityProducts.length < 3) {
      const relaxedThresholds: QualityThresholds = {
        minRating: 4.3,
        minReviewCount: 50,
        minPrime: true,
        preferVerifiedPurchases: true,
        excludeSponsored: true,
      };
      return this.filterProducts(inRange, relaxedThresholds);
    }

    return qualityProducts.slice(0, 3); // Return top 3 products
  }

  static validateProduct(product: ScrapedProduct): boolean {
    return (
      product.rating >= this.DEFAULT_THRESHOLDS.minRating &&
      product.reviewCount >= this.DEFAULT_THRESHOLDS.minReviewCount &&
      (!this.DEFAULT_THRESHOLDS.minPrime || product.prime)
    );
  }
}
