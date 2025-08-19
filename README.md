# Multi-Site Product Scraper

A modern, responsive web application for scraping product information from multiple e-commerce platforms including Flipkart, Amazon, Snapdeal, and Myntra.

## 🚀 Features

- **Multi-Site Support**: Scrape products from Flipkart, Amazon, Snapdeal, and Myntra
- **Real-time Validation**: URL validation for each supported site
- **Rich Product Details**: Comprehensive product information including images, specifications, offers, and more
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Error Handling**: Robust error handling with user-friendly messages
- **Type Safety**: Full TypeScript support for better development experience

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom gradients and animations
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: React Hooks for local state management

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zopper-scrapping-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🔧 Configuration

### API Configuration

The application is configured to work with a local API server. Update the API base URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

### Supported Sites

The application supports the following e-commerce platforms:

| Site | Domain | Description |
|------|--------|-------------|
| Flipkart | flipkart.com | India's leading e-commerce platform |
| Amazon | amazon.in | Global e-commerce giant |
| Snapdeal | snapdeal.com | Value-focused online marketplace |
| Myntra | myntra.com | Fashion and lifestyle destination |
| Max Fashion | maxfashion.in | Fashion retail chain |

## 🎯 Usage

### Authentication

1. Use the demo credentials to log in:
   - **Username**: `admin`
   - **Password**: `demo123`

### Scraping Products

1. **Select a Site**: Choose from the available e-commerce platforms
2. **Enter Product URL**: Paste a valid product URL from the selected site
3. **Scrape**: Click "Scrape Product" to fetch product information
4. **View Results**: Explore detailed product information including:
   - Product images and thumbnails
   - Pricing and discounts
   - Ratings and reviews
   - Seller information
   - Delivery details
   - Product specifications
   - Available offers
   - Key highlights

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard with scraping functionality
│   ├── LoginPage.tsx          # Authentication page
│   └── ErrorBoundary.tsx      # Error handling component
├── services/
│   └── api.ts                 # API service and type definitions
├── App.tsx                    # Main application component
├── main.tsx                   # Application entry point
└── index.css                  # Global styles
```

## 🔌 API Integration

The application integrates with a REST API that provides the following endpoints:

### Scrape Product
- **Endpoint**: `POST /api/{site}/product`
- **Body**: `{ "url": "product-url" }`
- **Response**: Detailed product information

### Example API Response Structure

```json
{
  "success": true,
  "data": {
    "id": "product-id",
    "title": "Product Title",
    "url": "product-url",
    "currentPrice": "₹1,099",
    "originalPrice": "₹6,999",
    "discount": "84% off",
    "rating": "4.1",
    "ratingCount": "97,011 Ratings & 4,531 Reviews",
    "images": [...],
    "specifications": {...},
    "offers": [...],
    "seller": {...},
    "delivery": {...}
  },
  "timestamp": "2025-08-12T07:28:36.853Z"
}
```

## 🎨 UI Components

### Site Selection
- Interactive site cards with hover effects
- Visual indicators for selected site
- Site-specific colors and icons

### Product Display
- Responsive grid layout
- Image gallery with thumbnails
- Detailed product information cards
- Action buttons for external links

### Error Handling
- User-friendly error messages
- Validation feedback
- Loading states with spinners

## 🔒 Security Features

- URL validation for each supported site
- Input sanitization
- Secure API communication
- Error boundary for unexpected errors

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile devices

## 🚀 Performance Optimizations

- Lazy loading for images
- Optimized bundle size with Vite
- Efficient re-rendering with React hooks
- Minimal API calls with proper caching

## 🧪 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Consistent naming conventions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Multi-site scraping support
- Modern UI/UX design
- TypeScript implementation
- Error handling and validation

---

**Note**: This application is designed for educational and development purposes. Please ensure compliance with the terms of service of the target websites when using this scraper.
