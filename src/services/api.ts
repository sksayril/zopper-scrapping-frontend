// API service for multi-site product scraping
export interface ProductImage {
  url: string;
  alt: string;
  type?: string;
  index?: number;
}

export interface ProductSpecification {
  [key: string]: string;
}

export interface ProductOffer {
  type: string;
  description: string;
}

export interface ProductSeller {
  name: string;
  rating: string;
  policies: string[];
}

export interface ProductBreadcrumb {
  text: string;
  url: string;
}

export interface ProductDelivery {
  date?: string;
  time?: string;
  cost?: string;
  estimatedDays?: number | null;
  freeShipping?: boolean;
  deliveryInfo?: string | null;
}

export interface ProductSize {
  size: string;
  code: string;
  available: boolean;
}

// Base product interface
export interface BaseProduct {
  id?: string;
  title: string;
  url: string;
  currentPrice: string | number;
  originalPrice?: string | number;
  discount?: string | number;
  discountPercentage?: number;
  currency?: string;
  rating?: string;
  ratingCount?: string;
  reviewCount?: string;
  images: ProductImage[] | string[];
  description: string;
  highlights: string[];
  specifications: ProductSpecification;
  scrapedAt: string;
  source?: string;
}

// Extended product interface for sites with additional data
export interface ExtendedProduct extends BaseProduct {
  seller?: ProductSeller;
  offers?: ProductOffer[];
  breadcrumbs?: ProductBreadcrumb[];
  availability?: string;
  delivery?: ProductDelivery;
  brand?: string;
  productId?: string;
  sizes?: ProductSize[];
}

// Union type for all product types
export type Product = BaseProduct | ExtendedProduct;

export interface ApiResponse {
  success: boolean;
  data: Product;
  timestamp: string;
  message?: string;
}

export interface ScrapeRequest {
  url: string;
  site: string;
}

export interface ScrapeError {
  message: string;
  code?: string;
  details?: any;
}

// Site configuration
export const SUPPORTED_SITES = [
  {
    id: 'flipkart',
    name: 'Flipkart',
    domain: 'flipkart.com',
    placeholder: 'https://www.flipkart.com/search?q=...',
    sampleUrl: 'https://www.flipkart.com/search?sid=tyy%2C4io&otracker=CLP_Filters&p%5B%5D=facets.brand%255B%255D%3DApple&page=2',
    color: 'from-orange-500 to-red-500',
    icon: '🛒',
    description: 'India\'s leading e-commerce platform'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    domain: 'amazon.in',
    placeholder: 'https://www.amazon.in/s?k=...',
    sampleUrl: 'https://www.amazon.in/s?k=smartphones&ref=sr_pg_1',
    color: 'from-yellow-500 to-orange-500',
    icon: '📦',
    description: 'Global e-commerce giant'
  },
  {
    id: 'snapdeal',
    name: 'Snapdeal',
    domain: 'snapdeal.com',
    placeholder: 'https://www.snapdeal.com/product/...',
    sampleUrl: 'https://www.snapdeal.com/product/bhawna-collection-loard-shiv-trishul/672311651336',
    color: 'from-blue-500 to-blue-600',
    icon: '🎯',
    description: 'Value-focused online marketplace'
  },
  {
    id: 'myntra',
    name: 'Myntra',
    domain: 'myntra.com',
    placeholder: 'https://www.myntra.com/...',
    sampleUrl: 'https://www.myntra.com/hair-oil/indulekha/indulekha-bringha-hair-oil-100-ml/2508145/buy',
    color: 'from-pink-500 to-red-500',
    icon: '👕',
    description: 'Fashion and lifestyle destination'
  },
  {
    id: 'max',
    name: 'Max Fashion',
    domain: 'maxfashion.in',
    placeholder: 'https://www.maxfashion.in/in/en/SHOP-...',
    sampleUrl: 'https://www.maxfashion.in/in/en/SHOP-Max-Global-Brown-Women-Embroidered-Midi-Skirt-For-Women/p/1000015151660-Brown-BROWN',
    color: 'from-purple-500 to-pink-500',
    icon: '👗',
    description: 'Fashion retail chain'
  }
] as const;

export type SiteId = typeof SUPPORTED_SITES[number]['id'];
export type Site = typeof SUPPORTED_SITES[number];

// API configuration
// const API_BASE_URL = 'http://localhost:3000/api';
const API_BASE_URL = 'https://7cvccltb-3000.inc1.devtunnels.ms/api';

// Utility functions
export const validateUrl = (url: string, siteId: SiteId): boolean => {
  try {
    const urlObj = new URL(url);
    const site = SUPPORTED_SITES.find(s => s.id === siteId);
    return site ? urlObj.hostname.includes(site.domain) : false;
  } catch {
    return false;
  }
};

export const getSiteById = (siteId: SiteId) => {
  return SUPPORTED_SITES.find(site => site.id === siteId);
};

// Helper function to normalize product data
export const normalizeProductData = (product: any, siteId: SiteId): Product => {
  // Handle Max Fashion specific structure
  if (siteId === 'max') {
    return {
      id: product.productId || product.id,
      title: product.title,
      url: product.url,
      currentPrice: typeof product.currentPrice === 'number' ? `₹${product.currentPrice}` : product.currentPrice,
      originalPrice: typeof product.originalPrice === 'number' ? `₹${product.originalPrice}` : product.originalPrice,
      discount: typeof product.discount === 'number' ? `₹${product.discount} off` : product.discount,
      discountPercentage: product.discountPercentage,
      currency: product.currency,
      images: Array.isArray(product.images) ? product.images.map((img: any, index: number) => 
        typeof img === 'string' 
          ? { url: img, alt: '', type: 'product', index }
          : { url: img.url, alt: img.alt || '', type: 'product', index: img.index || index }
      ) : [],
      description: product.description,
      highlights: product.highlights || [],
      specifications: product.specifications || {},
      brand: product.brand,
      productId: product.productId,
      sizes: product.sizes,
      availability: product.availability,
      delivery: product.delivery,
      scrapedAt: product.scrapedAt,
      source: product.source
    };
  }

  // Handle Snapdeal specific structure
  if (siteId === 'snapdeal') {
    return {
      id: product.productId || product.id,
      title: product.title,
      url: product.url,
      currentPrice: typeof product.currentPrice === 'number' ? `₹${product.currentPrice}` : product.currentPrice,
      originalPrice: typeof product.originalPrice === 'number' ? `₹${product.originalPrice}` : product.originalPrice,
      discount: typeof product.discount === 'number' ? `₹${product.discount} off` : product.discount,
      discountPercentage: product.discountPercentage,
      currency: product.currency,
      rating: typeof product.rating === 'number' ? product.rating.toString() : product.rating,
      images: Array.isArray(product.images) ? product.images.map((img: any, index: number) => 
        typeof img === 'string' 
          ? { url: img, alt: '', type: 'product', index }
          : { url: img.url, alt: img.alt || '', type: 'product', index: img.index || index }
      ) : [],
      description: product.description,
      highlights: product.highlights || [],
      specifications: product.specifications || {},
      brand: product.brand,
      productId: product.productId,
      sizes: product.sizes,
      availability: product.availability,
      scrapedAt: product.scrapedAt,
      source: product.source
    };
  }

  // Handle Myntra specific structure
  if (siteId === 'myntra') {
    return {
      id: product.productId || product.id,
      title: product.title,
      url: product.url,
      currentPrice: typeof product.currentPrice === 'number' ? `₹${product.currentPrice}` : product.currentPrice,
      originalPrice: typeof product.originalPrice === 'number' ? `₹${product.originalPrice}` : product.originalPrice,
      discount: typeof product.discount === 'number' ? `₹${product.discount} off` : product.discount,
      discountPercentage: product.discountPercentage,
      currency: product.currency,
      rating: typeof product.rating === 'number' ? product.rating.toString() : product.rating,
      ratingCount: typeof product.ratingCount === 'number' ? product.ratingCount.toString() : product.ratingCount,
      images: Array.isArray(product.images) ? product.images.map((img: any, index: number) => 
        typeof img === 'string' 
          ? { url: img, alt: '', type: 'product', index }
          : { url: img.url, alt: img.alt || '', type: 'product', index: img.index || index }
      ) : [],
      description: product.description,
      highlights: product.highlights || [],
      specifications: product.specifications || {},
      brand: product.brand,
      productId: product.productId,
      sizes: product.sizes,
      availability: product.availability,
      scrapedAt: product.scrapedAt,
      source: product.source
    };
  }

  // Handle other sites (Flipkart, Amazon, etc.)
  return product;
};

// API functions
export const scrapeProducts = async (request: ScrapeRequest): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${request.site}/product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ url: request.url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Scraping failed');
    }

    // Normalize the product data based on site
    data.data = normalizeProductData(data.data, request.site as SiteId);

    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to scrape products');
  }
};

export const getScrapingStatus = async (): Promise<{ status: string; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error('Failed to check scraping status');
  }
};

// Error handling utilities
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Rate limiting and retry logic
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (i === maxRetries - 1) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};
