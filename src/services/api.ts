// API service for multi-site product scraping
export interface ProductImage {
  url: string;
  alt: string;
  type?: string;
  index?: number;
  highQualityUrl?: string;
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
  // Max Fashion specific fields
  pincode?: {
    available: boolean;
    text: string;
  };
  clickAndCollect?: {
    available: boolean;
    text: string;
  };
}

export interface ProductSize {
  size: string;
  code: string;
  available: boolean;
}

// Max Fashion specific interfaces
export interface MaxFashionSocialSharing {
  available: boolean;
  platforms: Array<{
    name: string;
    iconUrl?: string | null;
    text?: string | null;
  }>;
}

export interface MaxFashionShopTheLook {
  available: boolean;
  title?: string | null;
  products: any[];
}

export interface MaxFashionReturnPolicy {
  available: boolean;
  days: number;
  text: string;
  detailsUrl: string;
}

export interface MaxFashionPaymentOptions {
  installmentsAvailable: boolean;
  text: string;
  detailsUrl?: string | null;
}

export interface MaxFashionOverview {
  description: string;
  details: any[];
  styleNote?: string | null;
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
  mainImage?: string;
  description: string;
  highlights: string[];
  specifications: ProductSpecification;
  scrapedAt: string;
  source?: string;
  // Ajio specific fields
  bankOffers?: string[];
  couponOffers?: string[];
  colors?: string[];
  availableColors?: number;
  availableSizes?: number;
  category?: {
    breadcrumbs: string[];
    mainCategory: string;
    subCategory: string;
    fullCategory: string;
  };
  deliveryInfo?: {
    message: string;
  };
  returnPolicy?: string | MaxFashionReturnPolicy;
  pricePerUnit?: string;
  productInformation?: {
    [key: string]: string;
  };
  // Flipkart specific fields
  thumbnails?: ProductImage[];
  highQualityImages?: string[];
  // Vijay Sales specific fields
  emi?: {
    amount?: number | null;
    months?: number | null;
    text?: string;
  };
  loyaltyPoints?: number;
  warranty?: {
    title?: string;
    description?: string;
  };
  installation?: {
    title?: string;
    description?: string;
  };
  exchangeOffer?: string;
  pricing?: {
    mrp?: number;
    sellingPrice?: number | null;
    discount?: string;
    currency?: string;
    includesTax?: boolean;
  };
}

// Extended product interface for sites with additional data
export interface ExtendedProduct extends BaseProduct {
  seller?: ProductSeller | string;
  offers?: ProductOffer[];
  breadcrumbs?: ProductBreadcrumb[];
  availability?: string;
  delivery?: ProductDelivery;
  brand?: string;
  productId?: string;
  sizes?: ProductSize[];
  // Max Fashion specific fields
  socialSharing?: MaxFashionSocialSharing;
  shopTheLook?: MaxFashionShopTheLook;
  returnPolicy?: MaxFashionReturnPolicy;
  paymentOptions?: MaxFashionPaymentOptions;
  overview?: MaxFashionOverview;
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
  // {
  //   id: 'amazon',
  //   name: 'Amazon',
  //   domain: 'amazon.in',
  //   placeholder: 'https://www.amazon.in/s?k=...',
  //   sampleUrl: 'https://www.amazon.in/s?k=smartphones&ref=sr_pg_1',
  //   color: 'from-yellow-500 to-orange-500',
  //   icon: '📦',
  //   description: 'Global e-commerce giant'
  // },
  // {
  //   id: 'snapdeal',
  //   name: 'Snapdeal',
  //   domain: 'snapdeal.com',
  //   placeholder: 'https://www.snapdeal.com/product/...',
  //   sampleUrl: 'https://www.snapdeal.com/product/bhawna-collection-loard-shiv-trishul/672311651336',
  //   color: 'from-blue-500 to-blue-600',
  //   icon: '🎯',
  //   description: 'Value-focused online marketplace'
  // },
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
  },
  {
    id: 'tatacliq',
    name: 'TataCliq',
    domain: 'tatacliq.com',
    placeholder: 'https://www.tatacliq.com/...',
    sampleUrl: 'https://www.tatacliq.com/guess-analog-rose-gold-dial-womens-watch-gw0383l2/p-mp000000019270293',
    color: 'from-teal-500 to-cyan-500',
    icon: '🏪',
    description: 'Tata Group\'s e-commerce platform'
  },
  {
    id: 'jiomart',
    name: 'JioMart',
    domain: 'jiomart.com',
    placeholder: 'https://www.jiomart.com/...',
    sampleUrl: 'https://www.jiomart.com/p/groceries/pears-babugosha-1-kg/590362490',
    color: 'from-blue-600 to-indigo-600',
    icon: '🛍️',
    description: 'Reliance\'s online grocery & retail'
  },
  // {
  //   id: 'ajio',
  //   name: 'Ajio',
  //   domain: 'ajio.com',
  //   placeholder: 'https://www.ajio.com/...',
  //   sampleUrl: 'https://www.ajio.com/poshax-men-regular-fit-zip-front-track-jacket/p/700776668_green',
  //   color: 'from-red-500 to-pink-600',
  //   icon: '👔',
  //   description: 'Reliance\'s fashion destination'
  // },
  {
    id: 'vijaysales',
    name: 'Vijay Sales',
    domain: 'vijaysales.com',
    placeholder: 'https://www.vijaysales.com/...',
    sampleUrl: 'https://www.vijaysales.com/p/234496/sansui-80-cm-32-inches-hd-smart-google-qled-tv-with-dolby-audio-jss32csqled',
    color: 'from-blue-600 to-indigo-700',
    icon: '🏪',
    description: 'Electronics & appliances store'
  },
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

  // Handle Snapdeal specific structure (commented out as snapdeal is disabled)
  // if (siteId === 'snapdeal') {
  //   return {
  //     id: product.productId || product.id,
  //     title: product.title,
  //     url: product.url,
  //     currentPrice: typeof product.currentPrice === 'number' ? `₹${product.currentPrice}` : product.currentPrice,
  //     originalPrice: typeof product.originalPrice === 'number' ? `₹${product.originalPrice}` : product.originalPrice,
  //     discount: typeof product.discount === 'number' ? `₹${product.discount} off` : product.discount,
  //     discountPercentage: product.discountPercentage,
  //     currency: product.currency,
  //     rating: typeof product.rating === 'number' ? product.rating.toString() : product.rating,
  //     images: Array.isArray(product.images) ? product.images.map((img: any, index: number) => 
  //       typeof img === 'string' 
  //         ? { url: img, alt: '', type: 'product', index }
  //         : { url: img.url, alt: img.alt || '', type: 'product', index: img.index || index }
  //     ) : [],
  //     description: product.description,
  //     highlights: product.highlights || [],
  //     specifications: product.specifications || {},
  //     brand: product.brand,
  //     productId: product.productId,
  //     sizes: product.sizes,
  //     availability: product.availability,
  //     scrapedAt: product.scrapedAt,
  //     source: product.source
  //   };
  // }

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

  // Handle TataCliq specific structure
  if (siteId === 'tatacliq') {
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
      availability: product.availability,
      scrapedAt: product.scrapedAt,
      source: product.source
    };
  }

  // Handle JioMart specific structure
  if (siteId === 'jiomart') {
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
      availability: product.availability,
      delivery: product.delivery,
      scrapedAt: product.scrapedAt,
      source: product.source
    };
  }

  // Handle Ajio specific structure
  if (siteId === 'ajio') {
    return {
      id: product.productId || product.id,
      title: product.productName || product.productLongName || product.title,
      url: product.url,
      currentPrice: product.sellingPrice ? `₹${product.sellingPrice}` : (typeof product.currentPrice === 'number' ? `₹${product.currentPrice}` : product.currentPrice),
      originalPrice: product.mrp ? `₹${product.mrp}` : (typeof product.originalPrice === 'number' ? `₹${product.originalPrice}` : product.originalPrice),
      discount: product.discount ? `${product.discount}% off` : (typeof product.discount === 'number' ? `₹${product.discount} off` : product.discount),
      discountPercentage: product.discount || product.discountPercentage,
      currency: product.currency || '₹',
      rating: product.rating ? product.rating.toString() : (typeof product.rating === 'number' ? product.rating.toString() : product.rating),
      ratingCount: product.reviewCount ? product.reviewCount.toString() : (typeof product.ratingCount === 'number' ? product.ratingCount.toString() : product.ratingCount),
      reviewCount: product.reviewCount ? product.reviewCount.toString() : (typeof product.reviewCount === 'number' ? product.reviewCount.toString() : product.reviewCount),
      images: product.productImages ? product.productImages.map((img: string, index: number) => ({
        url: img,
        alt: `${product.productName || 'Product'} - Image ${index + 1}`,
        type: 'product',
        index
      })) : (Array.isArray(product.images) ? product.images.map((img: any, index: number) => 
        typeof img === 'string' 
          ? { url: img, alt: '', type: 'product', index }
          : { url: img.url, alt: img.alt || '', type: 'product', index: img.index || index }
      ) : []),
      mainImage: product.mainImage,
      description: product.description || product.productInformation?.Commodity || '',
      highlights: product.features || product.highlights || [],
      specifications: product.specifications || {},
      brand: product.brand,
      productId: product.productId,
      sizes: product.sizes,
      availability: product.availability,
      offers: product.allOffers ? product.allOffers.map((offer: string) => ({
        type: 'Offer',
        description: offer
      })) : product.offers,
      bankOffers: product.bankOffers,
      couponOffers: product.couponOffers,
      colors: product.colors,
      availableColors: product.availableColors,
      availableSizes: product.availableSizes,
      category: product.category,
      seller: product.seller,
      deliveryInfo: product.deliveryInfo,
      returnPolicy: product.returnPolicy,
      pricePerUnit: product.pricePerUnit,
      productInformation: product.productInformation,
      scrapedAt: product.timestamp || product.scrapedAt,
      source: product.source || 'AJIO'
    };
  }

  // Handle Croma specific structure
  if (siteId === 'croma') {
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
      availability: product.availability,
      offers: product.offers,
      delivery: product.delivery,
      scrapedAt: product.scrapedAt,
      source: product.source
    };
  }

  // Handle Flipkart specific structure
  if (siteId === 'flipkart') {
    return {
      id: product.id,
      title: product.title,
      url: product.url,
      currentPrice: product.currentPrice,
      originalPrice: product.originalPrice,
      discount: product.discount,
      discountPercentage: product.discount ? parseInt(product.discount.replace('% off', '')) : undefined,
      currency: '₹',
      rating: product.rating,
      ratingCount: product.ratingCount,
      reviewCount: product.reviewCount,
      images: product.images?.main || product.images?.all || product.images || [],
      mainImage: product.images?.main?.[0]?.url || product.images?.main?.[0]?.highQualityUrl,
      thumbnails: product.images?.thumbnails || [],
      highQualityImages: product.images?.highQuality || [],
      description: product.description,
      highlights: product.highlights || [],
      specifications: product.specifications || {},
      brand: product.brand,
      productId: product.id,
      availability: product.availability,
      offers: product.offers,
      breadcrumbs: product.breadcrumbs,
      delivery: product.delivery,
      scrapedAt: product.scrapedAt,
      source: 'Flipkart'
    };
  }

  // Handle Vijay Sales specific structure
  if (siteId === 'vijaysales') {
    // Calculate selling price from MRP and discount if selling price is null
    let calculatedSellingPrice = product.pricing?.sellingPrice;
    if (!calculatedSellingPrice && product.pricing?.mrp && product.pricing?.discount) {
      const discountMatch = product.pricing.discount.match(/(\d+)%/);
      if (discountMatch) {
        const discountPercent = parseInt(discountMatch[1]);
        calculatedSellingPrice = Math.round(product.pricing.mrp * (1 - discountPercent / 100));
      }
    }

    return {
      id: product.productSku || product.id || product.productId,
      title: product.productName || product.title,
      url: product.productUrl || product.url,
      currentPrice: calculatedSellingPrice || product.pricing?.sellingPrice || product.currentPrice || product.sellingPrice,
      originalPrice: product.pricing?.mrp || product.originalPrice || product.mrp,
      discount: product.pricing?.discount || product.discount,
      discountPercentage: product.pricing?.discount ? 
        (product.pricing.discount.includes('%') ? 
          parseInt(product.pricing.discount.match(/(\d+)%/)?.[1] || '0') : undefined
        ) : product.discountPercentage,
      currency: product.pricing?.currency || product.currency || '₹',
      rating: product.rating?.value || product.rating,
      ratingCount: product.rating?.totalRatings || product.ratingCount,
      reviewCount: product.rating?.totalReviews || product.reviewCount,
      images: Array.isArray(product.images) ? product.images
        .filter((img: string) => img && !img.includes('icons/') && !img.includes('youtube.com'))
        .map((img: string, index: number) => ({ 
          url: img, 
          alt: `${product.productName || 'Product'} - Image ${index + 1}`, 
          type: 'product', 
          index 
        })) : [],
      mainImage: product.images?.[0] || product.mainImage,
      description: product.description,
      highlights: product.keyFeatures || product.highlights || product.features || [],
      specifications: product.specifications || {},
      brand: product.brand,
      productId: product.productSku || product.id || product.productId,
      availability: product.availability,
      offers: product.extraDeals || product.offers,
      delivery: product.delivery,
      scrapedAt: product.scrapedAt,
      source: 'Vijay Sales',
      // Vijay Sales specific fields
      emi: product.emi,
      loyaltyPoints: product.loyaltyPoints,
      warranty: product.warranty,
      installation: product.installation,
      exchangeOffer: product.exchangeOffer,
      pricing: product.pricing
    };
  }

  // Handle other sites (Amazon, etc.)
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
