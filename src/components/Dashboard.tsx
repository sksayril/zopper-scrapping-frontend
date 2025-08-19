import React, { useState } from 'react';
import { LogOut, Search, Package, Loader, ExternalLink, Star, ShoppingCart, Clock, Globe, AlertCircle, Heart, Truck, Shield, Tag } from 'lucide-react';
import { 
  SUPPORTED_SITES, 
  validateUrl, 
  scrapeProducts, 
  handleApiError,
  type Product,
  type SiteId,
  type Site,
  type ProductSize
} from '../services/api';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [selectedSite, setSelectedSite] = useState<Site>(SUPPORTED_SITES[0]);
  const [url, setUrl] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastScrapeTime, setLastScrapeTime] = useState<string>('');

  const handleSiteChange = (site: Site) => {
    setSelectedSite(site);
    setUrl('');
    setError('');
    setProduct(null);
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Validate URL for selected site
    if (!validateUrl(url, selectedSite.id)) {
      setError(`Please enter a valid ${selectedSite.name} URL`);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await scrapeProducts({
        url: url.trim(),
        site: selectedSite.id
      });
      
      setProduct(response.data);
      setLastScrapeTime(response.timestamp);
      setError('');
    } catch (err) {
      setError(handleApiError(err));
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: string | number | undefined) => {
    if (!price && price !== 0) {
      return '0';
    }
    if (typeof price === 'number') {
      return price.toLocaleString('en-IN');
    }
    return price.toString().replace(/[₹,]/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getMainImage = (images: Product['images']) => {
    if (Array.isArray(images)) {
      // Handle Flipkart image structure - look for main product images
      const flipkartMainImage = images.find((img: any) => {
        if (typeof img === 'object' && img.url) {
          // Look for images that are likely product images (not icons/logos)
          const url = img.url.toLowerCase();
          return url.includes('rukminim2.flixcart.com') && 
                 !url.includes('logo') && 
                 !url.includes('icon') && 
                 !url.includes('banner') &&
                 !url.includes('chevron') &&
                 !url.includes('studio') &&
                 !url.includes('promos') &&
                 !url.includes('prod-fk-cms-brand-images') &&
                 (url.includes('.jpeg') || url.includes('.jpg') || url.includes('.png') || url.includes('.webp'));
        }
        return false;
      });
      if (flipkartMainImage && typeof flipkartMainImage === 'object') {
        return flipkartMainImage.highQualityUrl || flipkartMainImage.url;
      }

      // Handle Myntra image structure - look for main product images
      const myntraMainImage = images.find((img: any) => {
        if (typeof img === 'object' && img.url) {
          // Look for images that are likely product images (not icons/logos)
          const url = img.url.toLowerCase();
          return url.includes('myntassets.com') && 
                 !url.includes('logo') && 
                 !url.includes('icon') && 
                 !url.includes('banner') &&
                 !url.includes('chevron') &&
                 !url.includes('studio') &&
                 (url.includes('.jpeg') || url.includes('.jpg') || url.includes('.png') || url.includes('.webp'));
        }
        return false;
      });
      if (myntraMainImage && typeof myntraMainImage === 'object') {
        return myntraMainImage.url;
      }

      // Handle Snapdeal image structure - look for main product images
      const snapdealMainImage = images.find((img: any) => {
        if (typeof img === 'object' && img.url) {
          // Look for images that are likely product images (not icons/logos)
          const url = img.url.toLowerCase();
          return url.includes('sdlcdn.com') && 
                 !url.includes('logo') && 
                 !url.includes('icon') && 
                 !url.includes('loader') &&
                 !url.includes('loading') &&
                 (url.includes('.jpeg') || url.includes('.jpg') || url.includes('.png'));
        }
        return false;
      });
      if (snapdealMainImage && typeof snapdealMainImage === 'object') {
        return snapdealMainImage.url;
      }
      
      // Handle Max Fashion image structure
      const maxMainImage = images.find((img: any) => 
        typeof img === 'object' && img.url && img.url.includes('831') && img.url.includes('615')
      );
      if (maxMainImage && typeof maxMainImage === 'object') {
        return maxMainImage.url;
      }
      
      // Handle string array (Max Fashion) or object array (other sites)
      const firstImage = images[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      }
      if (typeof firstImage === 'object' && firstImage.url) {
        return firstImage.url;
      }
    }
    return '';
  };

  const getThumbnailImages = (images: Product['images']) => {
    if (Array.isArray(images)) {
      return images
        .filter((img: any) => {
          if (typeof img === 'string') {
            return img.includes('150') && img.includes('150');
          }
          if (typeof img === 'object' && img.url) {
            const url = img.url.toLowerCase();
            // Filter out non-product images (logos, icons, loaders, banners)
            return (url.includes('myntassets.com') || url.includes('sdlcdn.com') || url.includes('rukminim2.flixcart.com')) && 
                   !url.includes('logo') && 
                   !url.includes('icon') && 
                   !url.includes('loader') &&
                   !url.includes('loading') &&
                   !url.includes('banner') &&
                   !url.includes('chevron') &&
                   !url.includes('studio') &&
                   !url.includes('promos') &&
                   !url.includes('prod-fk-cms-brand-images') &&
                   (url.includes('.jpeg') || url.includes('.jpg') || url.includes('.png') || url.includes('.webp'));
          }
          return false;
        })
        .slice(0, 5)
        .map((img: any, index: number) => ({
          url: typeof img === 'string' ? img : (img.highQualityUrl || img.url),
          alt: typeof img === 'object' ? img.alt || '' : '',
          index
        }));
    }
    return [];
  };

  const getSpecificationList = (specs: Product['specifications']) => {
    if (!specs || Object.keys(specs).length === 0) return [];
    
    // Handle different possible formats
    if (Array.isArray(specs)) {
      // If specs is an array, try to handle it
      return specs.slice(0, 10).map((spec, index) => {
        if (typeof spec === 'string') {
          // Handle string format like "key: value"
          const colonIndex = spec.indexOf(':');
          if (colonIndex > 0) {
            return { key: spec.substring(0, colonIndex).trim(), value: spec.substring(colonIndex + 1).trim() };
          }
          return { key: `Feature ${index + 1}`, value: spec };
        }
        if (typeof spec === 'object' && spec !== null) {
          // Handle object format
          if ('key' in spec && 'value' in spec) {
            return { key: spec.key, value: spec.value };
          }
          // Handle other object formats
          const entries = Object.entries(spec);
          if (entries.length > 0) {
            return { key: entries[0][0], value: entries[0][1] };
          }
        }
        return { key: `Feature ${index + 1}`, value: String(spec) };
      });
    }
    
    // Handle object format (default case)
    return Object.entries(specs).slice(0, 10).map(([key, value]) => ({ 
      key: String(key), 
      value: String(value) 
    }));
  };

  // Helper function to safely render any value
  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return String(value);
    if (typeof value === 'object') {
      // Handle common object patterns
      if ('text' in value) return String(value.text);
      if ('value' in value) return String(value.value);
      if ('description' in value) return String(value.description);
      if ('totalRatings' in value) return String(value.totalRatings);
      if ('totalReviews' in value) return String(value.totalReviews);
      // Fallback to JSON string
      return JSON.stringify(value);
    }
    return String(value);
  };

  const renderSizes = (sizes?: ProductSize[]) => {
    if (!sizes || sizes.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Available Sizes:</h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                size.available
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-gray-50 text-gray-400 border-gray-200'
              }`}
            >
              {size.size}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderBrand = (brand?: string) => {
    if (!brand) return null;

    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
        <Tag className="w-4 h-4" />
        <span className="font-medium">{brand}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Multi-Site Product Scraper
              </h1>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Site Selection */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Globe className="w-6 h-6 text-blue-500" />
              <span>Choose E-commerce Site</span>
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {SUPPORTED_SITES.map((site) => (
                <button
                  key={site.id}
                  onClick={() => handleSiteChange(site)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                    selectedSite.id === site.id
                      ? `border-blue-500 bg-gradient-to-r ${site.color} text-white shadow-lg`
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-2">{site.icon}</div>
                  <div className="font-medium text-sm">{site.name}</div>
                  <div className="text-xs opacity-75 mt-1">{site.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrape Form */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <div className={`w-8 h-8 bg-gradient-to-r ${selectedSite.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                {selectedSite.icon}
              </div>
              <span>Scrape Product from {selectedSite.name}</span>
            </h2>
            
            <form onSubmit={handleScrape} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedSite.name} Product URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={selectedSite.placeholder}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    url && !validateUrl(url, selectedSite.id)
                      ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                      : 'border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  required
                />
                {url && !validateUrl(url, selectedSite.id) && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Please enter a valid {selectedSite.name} URL</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isLoading || !url.trim() || !validateUrl(url, selectedSite.id)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Scraping from {selectedSite.name}...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Scrape Product</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setUrl(selectedSite.sampleUrl)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200"
                >
                  Use Sample URL
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Display */}
        {product && (
          <div className="space-y-6">
            {/* Product Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-gradient-to-r ${selectedSite.color} rounded-lg flex items-center justify-center text-white`}>
                    {selectedSite.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Product Details from {selectedSite.name}
                    </h3>
                    {lastScrapeTime && (
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Scraped at {formatDate(lastScrapeTime)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Images */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4">
                  <img
                    src={'mainImage' in product && product.mainImage ? product.mainImage : getMainImage(product.images)}
                    alt={product.title}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMDBDODAgODkuNTQ0NyA4OC4wMDAxIDgxIDEwMCA4MUMxMTEuOTU2IDgxIDEyMCA4OS41NDQ3IDEyMCAxMDBDMTIwIDExMC40NTUgMTExLjk1NiAxMTkgMTAwIDExOUM4OC4wMDAxIDExOSA4MCAxMTAuNDU1IDgwIDEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAxMzVDMTE1LjQ2NCAxMzUgMTI3LjUgMTIyLjk2NCAxMjcuNSAxMDcuNUMxMjcuNSA5Mi4wMzU5IDExNS40NjQgODAgMTAwIDgwQzg0LjUzNTkgODAgNzIuNSA5Mi4wMzU5IDcyLjUgMTA3LjVDNzIuNSA5Mi4wMzU5IDcyLjUgMTA3LjVDNzIuNSAxMjIuOTY0IDg0LjUzNTkgMTM1IDEwMCAxMzVaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
                    }}
                  />
                </div>
                
                {/* Thumbnail Images */}
                <div className="grid grid-cols-5 gap-2">
                  {getThumbnailImages(product.images).map((image, index) => (
                    <div key={index} className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h2>
                  </div>

                  {/* Brand */}
                  {'brand' in product && renderBrand(product.brand)}

                  {/* Description */}
                  {product.description && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Description:</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{formatPrice(product.currentPrice)}
                    </span>
                    {product.originalPrice && (
                      <>
                        <span className="text-lg text-gray-500 line-through">
                          ₹{formatPrice(product.originalPrice)}
                        </span>
                        {product.discount && (
                          <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                            {typeof product.discount === 'number' ? `₹${product.discount} off` : product.discount}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Vijay Sales Pricing Info */}
                  {'pricing' in product && product.pricing && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm text-blue-800 mb-2">
                        <span className="font-medium">Pricing Details:</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {product.pricing.mrp && (
                          <div>
                            <span className="font-medium text-blue-700">MRP:</span>
                            <span className="text-blue-600 ml-2">₹{product.pricing.mrp.toLocaleString()}</span>
                          </div>
                        )}
                        {product.pricing.sellingPrice && (
                          <div>
                            <span className="font-medium text-blue-700">Selling Price:</span>
                            <span className="text-blue-600 ml-2">₹{product.pricing.sellingPrice.toLocaleString()}</span>
                          </div>
                        )}
                        {!product.pricing.sellingPrice && product.pricing.mrp && product.pricing.discount && (
                          <div>
                            <span className="font-medium text-blue-700">Calculated Price:</span>
                            <span className="text-blue-600 ml-2">₹{formatPrice(product.currentPrice)}</span>
                          </div>
                        )}
                        {product.pricing.discount && (
                          <div>
                            <span className="font-medium text-blue-700">Discount:</span>
                            <span className="text-blue-600 ml-2">{product.pricing.discount}</span>
                          </div>
                        )}
                        {product.pricing.currency && (
                          <div>
                            <span className="font-medium text-blue-700">Currency:</span>
                            <span className="text-blue-600 ml-2">{product.pricing.currency}</span>
                          </div>
                        )}
                        {product.pricing.includesTax !== undefined && (
                          <div>
                            <span className="font-medium text-blue-700">Tax Included:</span>
                            <span className="text-blue-600 ml-2">{product.pricing.includesTax ? 'Yes' : 'No'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium">
                          {safeRender(product.rating)}
                        </span>
                      </div>
                      {product.ratingCount && (
                        <span className="text-sm text-gray-600">
                          {safeRender(product.ratingCount)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Seller Info */}
                  {'seller' in product && product.seller && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Sold by:</span>
                      <span className="font-medium">
                        {typeof product.seller === 'string' ? product.seller : product.seller.name}
                      </span>
                      {typeof product.seller === 'object' && product.seller.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-current text-yellow-400" />
                          <span>
                            {safeRender(product.seller.rating)}
                          </span>
                        </div>
                      )}
                      {typeof product.seller === 'object' && product.seller.policies && product.seller.policies.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {(product.seller as any).policies.map((policy: any, index: number) => (
                            <span key={index}>
                              {safeRender(policy)}
                              {index < (product.seller as any).policies.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delivery Info */}
                  {'delivery' in product && product.delivery && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Truck className="w-4 h-4" />
                      {product.delivery.date ? (
                        <span>Delivery by {product.delivery.date}</span>
                      ) : (
                        <span>Delivery information available</span>
                      )}
                      {product.delivery.time && (
                        <span>({product.delivery.time})</span>
                      )}
                      {product.delivery.cost && (
                        <span className="text-green-600 font-medium">{product.delivery.cost}</span>
                      )}
                    </div>
                  )}

                  {/* Availability */}
                  {'availability' in product && product.availability && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Shield className="w-4 h-4" />
                      <span className={typeof product.availability === 'object' && product.availability && 'inStock' in product.availability
                        ? (product.availability as any).inStock ? 'text-green-600' : 'text-red-600'
                        : 'text-green-600'
                      }>
                        {typeof product.availability === 'string' 
                          ? product.availability 
                          : typeof product.availability === 'object' && product.availability && 'status' in product.availability
                          ? (product.availability as any).status
                          : typeof product.availability === 'object' && product.availability && 'inStock' in product.availability
                          ? (product.availability as any).inStock ? 'In Stock' : 'Out of Stock'
                          : 'Available'}
                      </span>
                      {typeof product.availability === 'object' && product.availability && 'notifyMe' in product.availability && (product.availability as any).notifyMe && (
                        <span className="text-blue-600 text-xs">(Notify when available)</span>
                      )}
                    </div>
                  )}

                  {/* Sizes */}
                  {'sizes' in product && renderSizes(product.sizes)}

                  {/* Colors */}
                  {'colors' in product && product.colors && product.colors.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Available Colors:</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200"
                          >
                            {safeRender(color)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category */}
                  {'category' in product && product.category && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Category:</h4>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          {product.category.breadcrumbs?.map((crumb, index) => (
                            <React.Fragment key={index}>
                              <span className="text-gray-500">{safeRender(crumb)}</span>
                              {index < (product.category?.breadcrumbs?.length || 0) - 1 && (
                                <span className="text-gray-400">/</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div> 
                      </div>
                    </div>
                  )}

                  {/* Breadcrumbs */}
                  {'breadcrumbs' in product && product.breadcrumbs && product.breadcrumbs.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Navigation:</h4>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-1 flex-wrap">
                          {product.breadcrumbs?.map((crumb, index) => (
                            <React.Fragment key={index}>
                              <a 
                                href={crumb.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {safeRender(crumb.text)}
                              </a>
                              {index < (product.breadcrumbs?.length || 0) - 1 && (
                                <span className="text-gray-400">/</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>View on {selectedSite.name}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    
                    <button className="px-4 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Tabs */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Highlights */}
                {product.highlights && product.highlights.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Key Highlights</h3>
                      <span className="text-sm text-gray-500">
                        {product.highlights.length} features
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Feature</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.highlights.map((highlight, index) => {
                            // Handle different highlight formats
                            const displayText = safeRender(highlight);
                            
                            return (
                              <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                                  <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>{displayText}</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Specifications */}
                {getSpecificationList(product.specifications).length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Specifications</h3>
                      {Object.keys(product.specifications || {}).length > 10 && (
                        <span className="text-sm text-gray-500">
                          Showing 10 of {Object.keys(product.specifications || {}).length}
                        </span>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Feature</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getSpecificationList(product.specifications).map((spec, index) => (
                            <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-600 border-b border-gray-100">
                                {spec.key}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                                {spec.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Offers */}
              {'offers' in product && product.offers && product.offers.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Offers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.offers.map((offer, index) => (
                      <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="text-sm font-medium text-orange-800">{safeRender(offer.type)}</div>
                        <div className="text-xs text-orange-700 mt-1">{safeRender(offer.description)}</div>
                        {'hasTnC' in offer && (offer as any).hasTnC && (
                          <div className="text-xs text-orange-600 mt-1 italic">*Terms & Conditions apply</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bank Offers */}
              {'bankOffers' in product && product.bankOffers && product.bankOffers.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Offers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.bankOffers.map((offer, index) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-sm font-medium text-blue-800">Bank Offer</div>
                        <div className="text-xs text-blue-700 mt-1">{safeRender(offer)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coupon Offers */}
              {'couponOffers' in product && product.couponOffers && product.couponOffers.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Coupon Offers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.couponOffers.map((offer, index) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-sm font-medium text-green-800">Coupon Code</div>
                        <div className="text-xs text-green-700 mt-1">{safeRender(offer)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Information */}
              {'productInformation' in product && product.productInformation && Object.keys(product.productInformation).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(product.productInformation).map(([key, value], index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-800">{safeRender(key)}</div>
                        <div className="text-xs text-gray-700 mt-1">{safeRender(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Return Policy */}
              {'returnPolicy' in product && product.returnPolicy && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Policy</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-sm text-yellow-800">{safeRender(product.returnPolicy)}</div>
                  </div>
                </div>
              )}

              {/* Delivery Info */}
              {'deliveryInfo' in product && product.deliveryInfo && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-sm text-purple-800">{safeRender(product.deliveryInfo.message)}</div>
                  </div>
                </div>
              )}

              {/* Vijay Sales Specific Sections */}
              {/* EMI Information */}
              {'emi' in product && product.emi && (product.emi.amount || product.emi.text) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">EMI Information</h3>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    {product.emi.amount && (
                      <div className="text-sm text-indigo-800 mb-2">
                        <span className="font-medium">EMI Amount:</span> ₹{product.emi.amount}
                        {product.emi.months && ` for ${product.emi.months} months`}
                      </div>
                    )}
                    {product.emi.text && (
                      <div className="text-sm text-indigo-700">{safeRender(product.emi.text)}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Loyalty Points */}
              {'loyaltyPoints' in product && product.loyaltyPoints && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Loyalty Points</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-sm text-green-800">
                      <span className="font-medium">Earn:</span> {product.loyaltyPoints} points on this purchase
                    </div>
                  </div>
                </div>
              )}

              {/* Warranty Information */}
              {'warranty' in product && product.warranty && (product.warranty.title || product.warranty.description) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Warranty</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    {product.warranty.title && (
                      <div className="text-sm font-medium text-blue-800 mb-1">{product.warranty.title}</div>
                    )}
                    {product.warranty.description && (
                      <div className="text-sm text-blue-700">{safeRender(product.warranty.description)}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Installation Information */}
              {'installation' in product && product.installation && (product.installation.title || product.installation.description) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Installation</h3>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    {product.installation.title && (
                      <div className="text-sm font-medium text-orange-800 mb-1">{product.installation.title}</div>
                    )}
                    {product.installation.description && (
                      <div className="text-sm text-orange-700">{safeRender(product.installation.description)}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Exchange Offer */}
              {'exchangeOffer' in product && product.exchangeOffer && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Exchange Offer</h3>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-sm text-purple-800">{safeRender(product.exchangeOffer)}</div>
                  </div>
                </div>
              )}

              {/* Pricing Details */}
              {'pricing' in product && product.pricing && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Details</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {product.pricing.mrp && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-800">MRP:</span>
                          <span className="text-gray-700 ml-2">₹{product.pricing.mrp}</span>
                        </div>
                      )}
                      {product.pricing.sellingPrice && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-800">Selling Price:</span>
                          <span className="text-gray-700 ml-2">₹{product.pricing.sellingPrice}</span>
                        </div>
                      )}
                      {product.pricing.discount && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-800">Discount:</span>
                          <span className="text-gray-700 ml-2">{safeRender(product.pricing.discount)}</span>
                        </div>
                      )}
                      {product.pricing.currency && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-800">Currency:</span>
                          <span className="text-gray-700 ml-2">{product.pricing.currency}</span>
                        </div>
                      )}
                      {product.pricing.includesTax !== undefined && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-800">Tax Included:</span>
                          <span className="text-gray-700 ml-2">{product.pricing.includesTax ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Max Fashion Specific Sections */}
              {product.source === 'Max Fashion' && (
                <>
                  {/* Product ID */}
                  {'productId' in product && product.productId && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product ID</h3>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="text-sm text-purple-800 font-mono">{product.productId}</div>
                      </div>
                    </div>
                  )}

                  {/* Currency */}
                  {product.currency && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency</h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-sm text-green-800">{product.currency}</div>
                      </div>
                    </div>
                  )}

                  {/* Discount Details */}
                  {product.discount && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount Information</h3>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {product.discount && (
                            <div className="text-sm">
                              <span className="font-medium text-orange-800">Discount Amount:</span>
                              <span className="text-orange-700 ml-2">{safeRender(product.discount)}</span>
                            </div>
                          )}
                          {product.discountPercentage && (
                            <div className="text-sm">
                              <span className="font-medium text-orange-800">Discount Percentage:</span>
                              <span className="text-orange-700 ml-2">{product.discountPercentage}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Information */}
                  {'delivery' in product && product.delivery && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="space-y-3">
                          {product.delivery.estimatedDays !== null && (
                            <div className="text-sm">
                              <span className="font-medium text-blue-800">Estimated Delivery:</span>
                              <span className="text-blue-700 ml-2">{product.delivery.estimatedDays} days</span>
                            </div>
                          )}
                          {product.delivery.freeShipping !== undefined && (
                            <div className="text-sm">
                              <span className="font-medium text-blue-800">Free Shipping:</span>
                              <span className="text-blue-700 ml-2">{product.delivery.freeShipping ? 'Yes' : 'No'}</span>
                            </div>
                          )}
                          {product.delivery.deliveryInfo && (
                            <div className="text-sm">
                              <span className="font-medium text-blue-800">Delivery Info:</span>
                              <span className="text-blue-700 ml-2">{product.delivery.deliveryInfo}</span>
                            </div>
                          )}
                          {product.delivery.pincode && (
                            <div className="text-sm">
                              <span className="font-medium text-blue-800">Pincode Check:</span>
                              <span className="text-blue-700 ml-2">
                                {product.delivery.pincode.available ? 'Available' : 'Not Available'} - {product.delivery.pincode.text}
                              </span>
                            </div>
                          )}
                          {product.delivery.clickAndCollect && (
                            <div className="text-sm">
                              <span className="font-medium text-blue-800">Click & Collect:</span>
                              <span className="text-blue-700 ml-2">
                                {product.delivery.clickAndCollect.available ? 'Available' : 'Not Available'} - {product.delivery.clickAndCollect.text}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Social Sharing */}
                  {'socialSharing' in product && product.socialSharing && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Sharing</h3>
                      <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                        <div className="text-sm text-pink-800 mb-3">
                          <span className="font-medium">Available:</span> {(product.socialSharing as any).available ? 'Yes' : 'No'}
                        </div>
                        {(product.socialSharing as any).platforms && (product.socialSharing as any).platforms.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {(product.socialSharing as any).platforms.map((platform: any, index: number) => (
                              <div key={index} className="text-xs bg-white p-2 rounded border">
                                <div className="font-medium text-pink-700">{platform.name}</div>
                                {platform.text && <div className="text-pink-600">{platform.text}</div>}
                                {platform.iconUrl && (
                                  <img src={platform.iconUrl} alt={platform.name} className="w-4 h-4 mt-1" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Shop The Look */}
                  {'shopTheLook' in product && product.shopTheLook && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shop The Look</h3>
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                        <div className="text-sm text-indigo-800 mb-3">
                          <span className="font-medium">Available:</span> {(product.shopTheLook as any).available ? 'Yes' : 'No'}
                        </div>
                        {(product.shopTheLook as any).title && (
                          <div className="text-sm text-indigo-700 mb-2">
                            <span className="font-medium">Title:</span> {(product.shopTheLook as any).title}
                          </div>
                        )}
                        {(product.shopTheLook as any).products && (product.shopTheLook as any).products.length > 0 && (
                          <div className="text-sm text-indigo-600">
                            <span className="font-medium">Products:</span> {(product.shopTheLook as any).products.length} items
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Return Policy */}
                  {'returnPolicy' in product && product.returnPolicy && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Policy</h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        {typeof product.returnPolicy === 'string' ? (
                          <div className="text-sm text-yellow-800">{product.returnPolicy}</div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-sm text-yellow-800">
                              <span className="font-medium">Available:</span> {product.returnPolicy.available ? 'Yes' : 'No'}
                            </div>
                            {product.returnPolicy.days && (
                              <div className="text-sm text-yellow-700">
                                <span className="font-medium">Return Period:</span> {product.returnPolicy.days} days
                              </div>
                            )}
                            {product.returnPolicy.text && (
                              <div className="text-sm text-yellow-600">{product.returnPolicy.text}</div>
                            )}
                            {product.returnPolicy.detailsUrl && (
                              <div className="text-sm">
                                <a 
                                  href={product.returnPolicy.detailsUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-yellow-700 hover:text-yellow-800 underline"
                                >
                                  View Details
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Options */}
                  {'paymentOptions' in product && product.paymentOptions && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Options</h3>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <div className="space-y-2">
                          <div className="text-sm text-emerald-800">
                            <span className="font-medium">Installments Available:</span> {(product.paymentOptions as any).installmentsAvailable ? 'Yes' : 'No'}
                          </div>
                          {(product.paymentOptions as any).text && (
                            <div className="text-sm text-emerald-700">{(product.paymentOptions as any).text}</div>
                          )}
                          {(product.paymentOptions as any).detailsUrl && (
                            <div className="text-sm">
                              <a 
                                href={(product.paymentOptions as any).detailsUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-emerald-700 hover:text-emerald-800 underline"
                              >
                                View Details
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Overview */}
                  {'overview' in product && product.overview && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Overview</h3>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="space-y-3">
                          {(product.overview as any).description && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Description:</span>
                              <div className="text-gray-700 mt-1 leading-relaxed">{(product.overview as any).description}</div>
                            </div>
                          )}
                          {(product.overview as any).details && (product.overview as any).details.length > 0 && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Details:</span>
                              <div className="text-gray-700 mt-1">
                                {(product.overview as any).details.map((detail: any, index: number) => (
                                  <div key={index} className="mb-1">{detail}</div>
                                ))}
                              </div>
                            </div>
                          )}
                          {(product.overview as any).styleNote && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-800">Style Note:</span>
                              <div className="text-gray-700 mt-1">{(product.overview as any).styleNote}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Images with Details */}
                  {product.images && product.images.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">All Product Images</h3>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {product.images.map((image, index) => (
                            <div key={index} className="text-center">
                              {typeof image === 'string' ? (
                                <div className="mb-2">
                                  <img src={image} alt={`Product image ${index + 1}`} className="w-full h-24 object-cover rounded border" />
                                  <div className="text-xs text-gray-600 mt-1">Image {index + 1}</div>
                                </div>
                              ) : (
                                <div className="mb-2">
                                  <img src={image.url} alt={image.alt || `Product image ${index + 1}`} className="w-full h-24 object-cover rounded border" />
                                  <div className="text-xs text-gray-600 mt-1">
                                    {image.alt || `Image ${index + 1}`}
                                    {image.index !== undefined && ` (Index: ${image.index})`}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* TataCliq Specific Sections */}
              {(product.source === 'TataCliq' || (product.url && product.url.includes('tatacliq.com'))) && (
                <>
                  {/* Brand Information */}
                  {'brand' in product && product.brand && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Information</h3>
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                        <div className="space-y-3">
                          <div className="text-sm text-teal-800">
                            <span className="font-medium">Brand Name:</span> {product.brand}
                          </div>
                          {'brandInfo' in product && (product as any).brandInfo && (
                            <div className="text-sm text-teal-700 leading-relaxed">
                              {(product as any).brandInfo}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rating and Reviews */}
                  {(product.rating || product.reviewCount || product.ratingCount) && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating & Reviews</h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {product.rating && (
                            <div className="text-sm">
                              <span className="font-medium text-yellow-800">Rating:</span>
                              <span className="text-yellow-700 ml-2">{product.rating}/5</span>
                            </div>
                          )}
                          {product.ratingCount && (
                            <div className="text-sm">
                              <span className="font-medium text-yellow-800">Total Ratings:</span>
                              <span className="text-yellow-700 ml-2">{product.ratingCount}</span>
                            </div>
                          )}
                          {product.reviewCount && (
                            <div className="text-sm">
                              <span className="font-medium text-yellow-800">Total Reviews:</span>
                              <span className="text-yellow-700 ml-2">{product.reviewCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product Features */}
                  {'features' in product && (product as any).features && (product as any).features.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Features</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(product as any).features.map((feature: any, index: number) => (
                            <div key={index} className="text-sm bg-white p-2 rounded border">
                              <div className="font-medium text-blue-800">{feature.name}</div>
                              <div className="text-blue-700">{feature.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Available Offers */}
                  {'offers' in product && (product as any).offers && (product as any).offers.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Offers</h3>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="space-y-3">
                          {(product as any).offers.map((offer: any, index: number) => (
                            <div key={index} className="bg-white p-3 rounded border border-orange-200">
                              <div className="text-sm font-medium text-orange-800 mb-2">{offer.title}</div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                                {offer.offerPrice && (
                                  <div>
                                    <span className="font-medium text-orange-700">Offer Price:</span>
                                    <span className="text-orange-600 ml-2">{String(offer.offerPrice)}</span>
                                  </div>
                                )}
                                {offer.code && (
                                  <div>
                                    <span className="font-medium text-orange-700">Code:</span>
                                    <span className="text-orange-600 ml-2 font-mono">{String(offer.code)}</span>
                                  </div>
                                )}
                                {offer.minPurchase && (
                                  <div>
                                    <span className="font-medium text-orange-700">Min Purchase:</span>
                                    <span className="text-orange-600 ml-2">{String(offer.minPurchase)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warranty Information */}
                  {'warranty' in product && (product as any).warranty && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Warranty</h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-sm text-green-800">
                          {(product as any).warranty || 'Warranty information not available'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Product Images */}
                  {product.images && product.images.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">All Product Images ({product.images.length} images)</h3>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {product.images.map((image, index) => (
                            <div key={index} className="text-center">
                              {typeof image === 'string' ? (
                                <div className="mb-2">
                                  <img 
                                    src={image} 
                                    alt={`Product image ${index + 1}`} 
                                    className="w-full h-24 object-cover rounded border"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMDBDODAgODkuNTQ0NyA4OC4wMDAxIDgxIDEwMCA4MUMxMTEuOTU2IDgxIDEyMCA4OS41NDQ3IDEyMCAxMDBDMTIwIDExMC40NTUgMTExLjk1NiAxMTkgMTAwIDExOUM4OC4wMDAxIDExOSA4MCAxMTAuNDU1IDgwIDEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAxMzVDMTE1LjQ2NCAxMzUgMTI3LjUgMTIyLjk2NCAxMjcuNSAxMDcuNUMxMjcuNSA5Mi4wMzU5IDExNS40NjQgODAgMTAwIDgwQzg0LjUzNTkgODAgNzIuNSA5Mi4wMzU5IDcyLjUgMTA3LjVDNzIuNSA5Mi4wMzU5IDcyLjUgMTA3LjVDNzIuNSAxMjIuOTY0IDg0LjUzNTkgMTM1IDEwMCAxMzVaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
                                    }}
                                  />
                                  <div className="text-xs text-gray-600 mt-1">Image {index + 1}</div>
                                </div>
                              ) : 'src' in image ? (
                                <div className="mb-2">
                                  <img 
                                    src={image.src} 
                                    alt={image.alt || `Product image ${index + 1}`} 
                                    className="w-full h-24 object-cover rounded border"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMDBDODAgODkuNTQ0NyA4OC4wMDAxIDgxIDEwMCA4MUMxMTEuOTU2IDgxIDEyMCA4OS41NDQ3IDEyMCAxMDBDMTIwIDExMC40NTUgMTExLjk1NiAxMTkgMTAwIDExOUM4OC4wMDAxIDExOSA4MCAxMTAuNDU1IDgwIDEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAxMzVDMTE1LjQ2NCAxMzUgMTI3LjUgMTIyLjk2NCAxMjcuNSAxMDcuNUMxMjcuNSA5Mi4wMzU5IDcyLjUgODAgMTAwIDgwQzg0LjUzNTkgODAgNzIuNSA5Mi4wMzU5IDcyLjUgMTA3LjVDNzIuNSA5Mi4wMzU5IDcyLjUgMTA3LjVDNzIuNSAxMjIuOTY0IDg0LjUzNTkgMTM1IDEwMCAxMzVaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
                                    }}
                                  />
                                  <div className="text-xs text-gray-600 mt-1">
                                    {image.alt || `Image ${index + 1}`}
                                  </div>
                                </div>
                              ) : (
                                <div className="mb-2">
                                  <img 
                                    src={(image as any).url} 
                                    alt={(image as any).alt || `Product image ${index + 1}`} 
                                    className="w-full h-24 object-cover rounded border"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMDBDODAgODkuNTQ0NyA4OC4wMDAxIDgxIDEwMCA4MUMxMTEuOTU2IDgxIDEyMCA4OS41NDQ3IDEyMCAxMDBDMTIwIDExMC40NTUgMTExLjk1NiAxMTkgMTAwIDExOUM4OC4wMDAxIDExOSA4MCAxMTAuNDU1IDgwIDEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAxMzVDMTE1LjQ2NCAxMzUgMTI3LjUgMTIyLjk2NCAxMjcuNSAxMDcuNUMxMjcuNSA5Mi4wMzU5IDExNS40NjQgODAgMTAwIDgwQzg0LjUzNTkgODAgNzIuNSA5Mi4wMzU5IDcyLjUgMTA3LjVDNzIuNSA5Mi4wMzU5IDcyLjUgMTA3LjVDNzIuNSAxMjIuOTY0IDg0LjUzNTkgMTM1IDEwMCAxMzVaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
                                    }}
                                  />
                                  <div className="text-xs text-gray-600 mt-1">
                                    {(image as any).alt || `Image ${index + 1}`}
                                    {(image as any).index !== undefined && ` (Index: ${(image as any).index})`}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  
                 
                </>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!product && !isLoading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Product Yet
            </h3>
            <p className="text-gray-500">
              Select a site and enter a product URL above to start scraping
            </p>
          </div>
        )}
      </div>
    </div>
  );
}