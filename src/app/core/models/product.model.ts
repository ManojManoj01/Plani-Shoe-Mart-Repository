export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductSpecification {
  material?: string;
  soleMaterial?: string;
  closure?: string;
  occasion?: string;
  careInstructions?: string;
  warranty?: string;
  origin?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'men' | 'women' | 'kids' | 'sports' | 'formal' | 'casual' | 'chappals';
  price: number;
  originalPrice: number;
  discountPercentage: number;
  description: string;
  images: string[];
  sizes: number[];
  colors: ProductColor[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isSpecialOffer?: boolean;
  features?: string[];
  specifications?: ProductSpecification;
}

export interface Category {
  id: string;
  name: string;
  slug: 'men' | 'women' | 'kids' | 'sports' | 'formal' | 'casual' | 'chappals';
  image: string;
  description: string;
  itemCount: number;
}

export interface FilterCriteria {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: number[];
  brands?: string[];
  searchQuery?: string;
  sortBy?: 'price-low' | 'price-high' | 'newest' | 'popularity' | 'discount';
  inStockOnly?: boolean;
}
