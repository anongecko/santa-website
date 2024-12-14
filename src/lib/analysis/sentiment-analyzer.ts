// src/lib/analysis/sentiment-analyzer.ts

import { OpenAI } from 'openai';
import { Redis } from 'ioredis';
import * as cheerio from 'cheerio';

interface ReviewSentiment {
  overall: number; // -1 to 1
  aspects: {
    [key: string]: {
      score: number;
      mentions: number;
      examples: string[];
    };
  };
  keywords: {
    positive: string[];
    negative: string[];
  };
  summaryPoints: string[];
  confidence: number;
}

interface ProcessedReview {
  text: string;
  rating: number;
  verified: boolean;
  helpful: number;
  date: string;
}

export class SentimentAnalyzer {
  private openai: OpenAI;
  private redis: Redis;
  private readonly CACHE_TTL = 60 * 60 * 24 * 7; // 1 week

  constructor(redis: Redis) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.redis = redis;
  }

  async analyzeProductSentiment(productUrl: string): Promise<ReviewSentiment> {
    const cacheKey = `sentiment:${this.normalizeUrl(productUrl)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const reviews = await this.fetchProductReviews(productUrl);
    const sentiment = await this.analyzeSentiment(reviews);

    await this.redis.set(cacheKey, JSON.stringify(sentiment), 'EX', this.CACHE_TTL);
    return sentiment;
  }

  private async fetchProductReviews(url: string): Promise<ProcessedReview[]> {
    try {
      const reviews: ProcessedReview[] = [];
      const reviewUrl = this.getReviewUrl(url);
      const html = await fetch(reviewUrl).then(r => r.text());
      const $ = cheerio.load(html);

      $('.review').each((_, element) => {
        const $review = $(element);
        reviews.push({
          text: $review.find('.review-text').text().trim(),
          rating: parseInt($review.find('.review-rating').text()),
          verified: $review.find('.verified-purchase').length > 0,
          helpful: parseInt($review.find('.helpful-votes').text()) || 0,
          date: $review.find('.review-date').text(),
        });
      });

      return reviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }

  private async analyzeSentiment(reviews: ProcessedReview[]): Promise<ReviewSentiment> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Analyze product reviews and provide a detailed sentiment analysis.
                   Consider verified purchases more heavily.
                   Identify key aspects mentioned and their sentiment.
                   Format response as JSON with following structure:
                   {
                     "overall": number (-1 to 1),
                     "aspects": {
                       "aspect": {
                         "score": number,
                         "mentions": number,
                         "examples": string[]
                       }
                     },
                     "keywords": {
                       "positive": string[],
                       "negative": string[]
                     },
                     "summaryPoints": string[]
                   }`,
        },
        {
          role: 'user',
          content: JSON.stringify(reviews),
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0]?.message?.content || '{}');

    return {
      ...analysis,
      confidence: this.calculateConfidence(reviews),
    };
  }

  private calculateConfidence(reviews: ProcessedReview[]): number {
    let confidence = 0.5; // Base confidence

    // Number of reviews factor (up to 0.3)
    confidence += Math.min(reviews.length / 100, 1) * 0.3;

    // Verified purchases factor (up to 0.1)
    const verifiedRatio = reviews.filter(r => r.verified).length / reviews.length;
    confidence += verifiedRatio * 0.1;

    // Review recency factor (up to 0.1)
    const recentReviews = reviews.filter(r => {
      const reviewDate = new Date(r.date);
      const monthsAgo = (Date.now() - reviewDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsAgo <= 3;
    }).length;
    confidence += (recentReviews / reviews.length) * 0.1;

    return Math.min(confidence, 1);
  }

  private getReviewUrl(productUrl: string): string {
    const asin = this.extractAsin(productUrl);
    return `https://www.amazon.com/product-reviews/${asin}`;
  }

  private extractAsin(url: string): string {
    const match = url.match(/\/([A-Z0-9]{10})/);
    return match ? match[1] : '';
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0].split('#')[0];
  }
}
