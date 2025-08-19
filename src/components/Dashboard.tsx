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

  const formatPrice = (price: string | number) => {
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
            return (url.includes('myntassets.com') || url.includes('sdlcdn.com')) && 
                   !url.includes('logo') && 
                   !url.includes('icon') && 
                   !url.includes('loader') &&
                   !url.includes('loading') &&
                   !url.includes('banner') &&
                   !url.includes('chevron') &&
                   !url.includes('studio') &&
                   (url.includes('.jpeg') || url.includes('.jpg') || url.includes('.png') || url.includes('.webp'));
          }
          return false;
        })
        .slice(0, 5)
        .map((img: any, index: number) => ({
          url: typeof img === 'string' ? img : img.url,
          alt: typeof img === 'object' ? img.alt || '' : '',
          index
        }));
    }
    return [];
  };

  const getSpecificationList = (specs: Product['specifications']) => {
    if (!specs || Object.keys(specs).length === 0) return [];
    return Object.entries(specs).slice(0, 5).map(([key, value]) => `${key}: ${value}`);
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
                    src={getMainImage(product.images)}
                    alt={product.title}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMDBDODAgODkuNTQ0NyA4OC4wMDAxIDgxIDEwMCA4MUMxMTEuOTU2IDgxIDEyMCA4OS41NDQ3IDEyMCAxMDBDMTIwIDExMC40NTUgMTExLjk1NiAxMTkgMTAwIDExOUM4OC4wMDAxIDExOSA4MCAxMTAuNDU1IDgwIDEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAxMzVDMTE1LjQ2NCAxMzUgMTI3LjUgMTIyLjk2NCAxMjcuNSAxMDcuNUMxMjcuNSA5Mi4wMzU5IDExNS40NjQgODAgMTAwIDgwQzg0LjUzNTkgODAgNzIuNSA5Mi4wMzU5IDcyLjUgMTA3LjVDNzIuNSAxMjIuOTY0IDg0LjUzNTkgMTM1IDEwMCAxMzVaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
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

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium">{product.rating}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.ratingCount}
                      </span>
                    </div>
                  )}

                  {/* Seller Info */}
                  {'seller' in product && product.seller && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Sold by:</span>
                      <span className="font-medium">{product.seller.name}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-current text-yellow-400" />
                        <span>{product.seller.rating}</span>
                      </div>
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
                    </div>
                  )}

                  {/* Availability */}
                  {'availability' in product && product.availability && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <Shield className="w-4 h-4" />
                      <span>{product.availability}</span>
                    </div>
                  )}

                  {/* Sizes */}
                  {'sizes' in product && renderSizes(product.sizes)}

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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Highlights</h3>
                    <ul className="space-y-2">
                      {product.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Specifications */}
                {getSpecificationList(product.specifications).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                    <div className="space-y-2">
                      {getSpecificationList(product.specifications).map((spec, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">{spec.split(':')[0]}:</span>
                          <span className="text-gray-900">{spec.split(':')[1]}</span>
                        </div>
                      ))}
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
                        <div className="text-sm font-medium text-orange-800">{offer.type}</div>
                        <div className="text-xs text-orange-700 mt-1">{offer.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
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