export interface ProductColor {
  name: string;
<<<<<<< HEAD
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
=======
  hex?: string;
}

export interface Product {
  id: number | string;
  name: string;
  sku?: string;
  brand: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  availableSizes: string[] | number[];
  availableColors: string[];
  stockQuantity: number;
  imageUrl?: string;
  additionalImages?: string[];
  discountPercentage?: number;
  rating?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRequest {
  name: string;
  sku?: string;
  brand: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  availableSizes: string[];
  availableColors: string[];
  stockQuantity: number;
  imageUrl?: string;
  additionalImages?: string[];
  discountPercentage?: number;
  rating?: number;
  active: boolean;
}

export interface ProductPageResponse {
  content: Product[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  active: boolean;
  productCount?: number;
}

export interface CategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalShoes: number;
  totalChappalsAndSlippers: number;
  totalCategories: number;
  lowStockCount: number;
  chappalsInStock: number;
}

export interface ImageUploadResponse {
  imageUrl: string;
  message: string;
>>>>>>> 4612e5dfee97dff303e5e71abbdf1dcb739d2fe1
}
