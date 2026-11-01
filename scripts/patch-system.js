const fs = require('fs');
const path = require('path');

const BACKEND_BASE = path.resolve('..', 'Shoe_Shop');
const CUSTOMER_BASE = path.resolve('..', 'shoe-shop');

console.log('Patching backend at:', BACKEND_BASE);
console.log('Patching customer site at:', CUSTOMER_BASE);

function writeFile(destPath, content) {
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(destPath, content, 'utf8');
  console.log('Wrote file:', destPath);
}

// ==========================================
// 1. BACKEND: Category Entity
// ==========================================
writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/entity/Category.java'),
`package com.stepstyle.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(length = 500)
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Category() {
    }

    public Category(String name, String slug, String description, String imageUrl, Integer displayOrder) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.imageUrl = imageUrl;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
        this.active = true;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
`
);

// ==========================================
// 2. BACKEND: ProductImage Entity
// ==========================================
writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/entity/ProductImage.java'),
`package com.stepstyle.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_images")
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public ProductImage() {
    }

    public ProductImage(Product product, String imageUrl, Integer displayOrder) {
        this.product = product;
        this.imageUrl = imageUrl;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
`
);

// ==========================================
// 3. BACKEND: Product Entity (with SKU & Images)
// ==========================================
writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/entity/Product.java'),
`package com.stepstyle.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 50)
    private String sku;

    @Column(nullable = false, length = 100)
    private String brand;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "original_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "available_sizes", nullable = false)
    private String availableSizes;

    @Column(name = "available_colors", nullable = false)
    private String availableColors;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductImage> additionalImages = new ArrayList<>();

    @Column(name = "discount_percentage")
    private Integer discountPercentage = 0;

    @Column(name = "rating")
    private Double rating = 4.5;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Product() {
    }

    public Product(String name, String brand, String description, BigDecimal price, BigDecimal originalPrice,
                   String category, String availableSizes, String availableColors, Integer stockQuantity,
                   String imageUrl, Integer discountPercentage, Double rating, boolean active) {
        this.name = name;
        this.brand = brand;
        this.description = description;
        this.price = price;
        this.originalPrice = originalPrice;
        this.category = category;
        this.availableSizes = availableSizes;
        this.availableColors = availableColors;
        this.stockQuantity = stockQuantity;
        this.imageUrl = imageUrl;
        this.discountPercentage = discountPercentage;
        this.rating = rating;
        this.active = active;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public List<String> getAvailableSizesList() {
        if (availableSizes == null || availableSizes.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.stream(availableSizes.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    public void setAvailableSizesList(List<String> sizes) {
        if (sizes == null || sizes.isEmpty()) {
            this.availableSizes = "";
        } else {
            this.availableSizes = String.join(",", sizes);
        }
    }

    public List<String> getAvailableColorsList() {
        if (availableColors == null || availableColors.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.stream(availableColors.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    public void setAvailableColorsList(List<String> colors) {
        if (colors == null || colors.isEmpty()) {
            this.availableColors = "";
        } else {
            this.availableColors = String.join(",", colors);
        }
    }

    public List<String> getAdditionalImageUrls() {
        if (additionalImages == null) {
            return new ArrayList<>();
        }
        return additionalImages.stream()
                .map(ProductImage::getImageUrl)
                .collect(Collectors.toList());
    }

    public void setAdditionalImageUrls(List<String> urls) {
        if (this.additionalImages == null) {
            this.additionalImages = new ArrayList<>();
        } else {
            this.additionalImages.clear();
        }
        if (urls != null) {
            int order = 0;
            for (String url : urls) {
                if (url != null && !url.trim().isEmpty()) {
                    this.additionalImages.add(new ProductImage(this, url.trim(), order++));
                }
            }
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getAvailableSizes() {
        return availableSizes;
    }

    public void setAvailableSizes(String availableSizes) {
        this.availableSizes = availableSizes;
    }

    public String getAvailableColors() {
        return availableColors;
    }

    public void setAvailableColors(String availableColors) {
        this.availableColors = availableColors;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<ProductImage> getAdditionalImages() {
        return additionalImages;
    }

    public void setAdditionalImages(List<ProductImage> additionalImages) {
        this.additionalImages = additionalImages;
    }

    public Integer getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(Integer discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
`
);

// ==========================================
// 4. BACKEND: CategoryRepository & ProductImageRepository
// ==========================================
writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/repository/CategoryRepository.java'),
`package com.stepstyle.repository;

import com.stepstyle.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsBySlugIgnoreCase(String slug);

    Optional<Category> findBySlugIgnoreCase(String slug);

    List<Category> findAllByOrderByDisplayOrderAsc();

    List<Category> findByActiveTrueOrderByDisplayOrderAsc();
}
`
);

writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/repository/ProductImageRepository.java'),
`package com.stepstyle.repository;

import com.stepstyle.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(Long productId);
    void deleteByProductId(Long productId);
}
`
);

// Update ProductRepository with stats & admin filtering queries
writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/repository/ProductRepository.java'),
`package com.stepstyle.repository;

import com.stepstyle.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Page<Product> findByActiveTrue(Pageable pageable);

    Optional<Product> findByIdAndActiveTrue(Long id);

    Page<Product> findByCategoryIgnoreCaseAndActiveTrue(String category, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchPublicProducts(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
           "(:category IS NULL OR LOWER(p.category) = LOWER(:category)) AND " +
           "(:active IS NULL OR p.active = :active) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(p.brand) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> searchAdminProducts(@Param("category") String category,
                                      @Param("active") Boolean active,
                                      @Param("search") String search,
                                      Pageable pageable);

    long countByActiveTrue();

    long countByCategoryIgnoreCaseAndActiveTrue(String category);

    long countByStockQuantityLessThanAndActiveTrue(Integer threshold);

    @Query("SELECT COALESCE(SUM(p.stockQuantity), 0) FROM Product p WHERE " +
           "(LOWER(p.category) LIKE '%chappal%' OR LOWER(p.category) LIKE '%slipper%') AND p.active = true")
    Long sumChappalStock();

    @Query("SELECT COUNT(p) FROM Product p WHERE " +
           "(LOWER(p.category) LIKE '%chappal%' OR LOWER(p.category) LIKE '%slipper%') AND p.active = true")
    Long countChappalProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE " +
           "(LOWER(p.category) NOT LIKE '%chappal%' AND LOWER(p.category) NOT LIKE '%slipper%') AND p.active = true")
    Long countShoeProducts();
}
`
);

// ==========================================
// 5. BACKEND: DTOs
// ==========================================
writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/dto/CategoryRequestDto.java'),
`package com.stepstyle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CategoryRequestDto {

    @NotBlank(message = "Category name is required")
    @Size(max = 100, message = "Category name cannot exceed 100 characters")
    private String name;

    private String slug;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    private String imageUrl;

    private Integer displayOrder = 0;

    public CategoryRequestDto() {
    }

    public CategoryRequestDto(String name, String slug, String description, String imageUrl, Integer displayOrder) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.imageUrl = imageUrl;
        this.displayOrder = displayOrder;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
`
);

writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/dto/CategoryResponseDto.java'),
`package com.stepstyle.dto;

public class CategoryResponseDto {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Integer displayOrder;
    private boolean active;
    private long productCount;

    public CategoryResponseDto() {
    }

    public CategoryResponseDto(Long id, String name, String slug, String description, String imageUrl,
                               Integer displayOrder, boolean active, long productCount) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.imageUrl = imageUrl;
        this.displayOrder = displayOrder;
        this.active = active;
        this.productCount = productCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public long getProductCount() {
        return productCount;
    }

    public void setProductCount(long productCount) {
        this.productCount = productCount;
    }
}
`
);

writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/dto/ProductRequestDto.java'),
`package com.stepstyle.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductRequestDto {

    @NotBlank(message = "Product name is required")
    @Size(max = 150, message = "Product name cannot exceed 150 characters")
    private String name;

    @Size(max = 50, message = "SKU cannot exceed 50 characters")
    private String sku;

    @NotBlank(message = "Brand is required")
    @Size(max = 100, message = "Brand cannot exceed 100 characters")
    private String brand;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal price;

    @NotNull(message = "Original price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Original price must be greater than zero")
    private BigDecimal originalPrice;

    @NotBlank(message = "Category is required")
    private String category;

    @NotEmpty(message = "At least one available size is required")
    private List<String> availableSizes = new ArrayList<>();

    @NotEmpty(message = "At least one available color is required")
    private List<String> availableColors = new ArrayList<>();

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    private String imageUrl;

    private List<String> additionalImages = new ArrayList<>();

    @Min(value = 0, message = "Discount percentage cannot be negative")
    @Max(value = 100, message = "Discount percentage cannot exceed 100")
    private Integer discountPercentage = 0;

    @DecimalMin(value = "0.0", message = "Rating cannot be negative")
    @DecimalMax(value = "5.0", message = "Rating cannot exceed 5.0")
    private Double rating = 4.5;

    private boolean active = true;

    public ProductRequestDto() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<String> getAvailableSizes() {
        return availableSizes;
    }

    public void setAvailableSizes(List<String> availableSizes) {
        this.availableSizes = availableSizes;
    }

    public List<String> getAvailableColors() {
        return availableColors;
    }

    public void setAvailableColors(List<String> availableColors) {
        this.availableColors = availableColors;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<String> getAdditionalImages() {
        return additionalImages;
    }

    public void setAdditionalImages(List<String> additionalImages) {
        this.additionalImages = additionalImages;
    }

    public Integer getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(Integer discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
`
);

writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/dto/ProductResponseDto.java'),
`package com.stepstyle.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ProductResponseDto {

    private Long id;
    private String name;
    private String sku;
    private String brand;
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String category;
    private List<String> availableSizes = new ArrayList<>();
    private List<String> availableColors = new ArrayList<>();
    private Integer stockQuantity;
    private String imageUrl;
    private List<String> additionalImages = new ArrayList<>();
    private Integer discountPercentage;
    private Double rating;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProductResponseDto() {
    }

    public ProductResponseDto(Long id, String name, String sku, String brand, String description, BigDecimal price,
                              BigDecimal originalPrice, String category, List<String> availableSizes,
                              List<String> availableColors, Integer stockQuantity, String imageUrl,
                              List<String> additionalImages, Integer discountPercentage, Double rating,
                              boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.brand = brand;
        this.description = description;
        this.price = price;
        this.originalPrice = originalPrice;
        this.category = category;
        this.availableSizes = availableSizes != null ? availableSizes : new ArrayList<>();
        this.availableColors = availableColors != null ? availableColors : new ArrayList<>();
        this.stockQuantity = stockQuantity;
        this.imageUrl = imageUrl;
        this.additionalImages = additionalImages != null ? additionalImages : new ArrayList<>();
        this.discountPercentage = discountPercentage;
        this.rating = rating;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<String> getAvailableSizes() {
        return availableSizes;
    }

    public void setAvailableSizes(List<String> availableSizes) {
        this.availableSizes = availableSizes;
    }

    public List<String> getAvailableColors() {
        return availableColors;
    }

    public void setAvailableColors(List<String> availableColors) {
        this.availableColors = availableColors;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<String> getAdditionalImages() {
        return additionalImages;
    }

    public void setAdditionalImages(List<String> additionalImages) {
        this.additionalImages = additionalImages;
    }

    public Integer getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(Integer discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
`
);

writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/dto/DashboardStatsDto.java'),
`package com.stepstyle.dto;

public class DashboardStatsDto {
    private long totalProducts;
    private long totalShoes;
    private long totalChappalsAndSlippers;
    private long totalCategories;
    private long lowStockCount;
    private long chappalsInStock;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalProducts, long totalShoes, long totalChappalsAndSlippers,
                             long totalCategories, long lowStockCount, long chappalsInStock) {
        this.totalProducts = totalProducts;
        this.totalShoes = totalShoes;
        this.totalChappalsAndSlippers = totalChappalsAndSlippers;
        this.totalCategories = totalCategories;
        this.lowStockCount = lowStockCount;
        this.chappalsInStock = chappalsInStock;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalShoes() {
        return totalShoes;
    }

    public void setTotalShoes(long totalShoes) {
        this.totalShoes = totalShoes;
    }

    public long getTotalChappalsAndSlippers() {
        return totalChappalsAndSlippers;
    }

    public void setTotalChappalsAndSlippers(long totalChappalsAndSlippers) {
        this.totalChappalsAndSlippers = totalChappalsAndSlippers;
    }

    public long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public long getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(long lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public long getChappalsInStock() {
        return chappalsInStock;
    }

    public void setChappalsInStock(long chappalsInStock) {
        this.chappalsInStock = chappalsInStock;
    }
}
`
);

// ==========================================
// 6. BACKEND: CategoryService & CategoryServiceImpl
// ==========================================
writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/service/CategoryService.java'),
`package com.stepstyle.service;

import com.stepstyle.dto.CategoryRequestDto;
import com.stepstyle.dto.CategoryResponseDto;

import java.util.List;

public interface CategoryService {
    List<CategoryResponseDto> getAllCategories(boolean onlyActive);
    CategoryResponseDto createCategory(CategoryRequestDto requestDto);
    void deleteCategory(Long id);
    void seedDefaultCategoriesIfEmpty();
}
`
);

writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/service/impl/CategoryServiceImpl.java'),
`package com.stepstyle.service.impl;

import com.stepstyle.dto.CategoryRequestDto;
import com.stepstyle.dto.CategoryResponseDto;
import com.stepstyle.entity.Category;
import com.stepstyle.exception.BadRequestException;
import com.stepstyle.exception.ResourceNotFoundException;
import com.stepstyle.repository.CategoryRepository;
import com.stepstyle.repository.ProductRepository;
import com.stepstyle.service.CategoryService;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    public List<CategoryResponseDto> getAllCategories(boolean onlyActive) {
        List<Category> categories = onlyActive
                ? categoryRepository.findByActiveTrueOrderByDisplayOrderAsc()
                : categoryRepository.findAllByOrderByDisplayOrderAsc();

        return categories.stream().map(cat -> {
            long count = productRepository.countByCategoryIgnoreCaseAndActiveTrue(cat.getName());
            if (count == 0 && cat.getSlug() != null) {
                count = productRepository.countByCategoryIgnoreCaseAndActiveTrue(cat.getSlug());
            }
            return new CategoryResponseDto(
                    cat.getId(),
                    cat.getName(),
                    cat.getSlug(),
                    cat.getDescription(),
                    cat.getImageUrl(),
                    cat.getDisplayOrder(),
                    cat.isActive(),
                    count
            );
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryResponseDto createCategory(CategoryRequestDto requestDto) {
        String trimmedName = requestDto.getName().trim();

        if (categoryRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new BadRequestException("Category with name '" + trimmedName + "' already exists");
        }

        String slug = requestDto.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            slug = trimmedName.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        } else {
            slug = slug.trim().toLowerCase();
        }

        if (categoryRepository.existsBySlugIgnoreCase(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        Category category = new Category(
                trimmedName,
                slug,
                requestDto.getDescription(),
                requestDto.getImageUrl(),
                requestDto.getDisplayOrder()
        );

        Category saved = categoryRepository.save(category);
        return new CategoryResponseDto(
                saved.getId(),
                saved.getName(),
                saved.getSlug(),
                saved.getDescription(),
                saved.getImageUrl(),
                saved.getDisplayOrder(),
                saved.isActive(),
                0
        );
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        category.setActive(false);
        categoryRepository.save(category);
    }

    @Override
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedDefaultCategoriesIfEmpty() {
        if (categoryRepository.count() > 0) {
            return;
        }

        String[][] defaults = new String[][]{
                {"Men's Shoes", "men", "Athletic runners, formal oxfords, and versatile loafers", "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"},
                {"Women's Shoes", "women", "Graceful heels, cushioned flats, running trainers, and everyday comfort", "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80"},
                {"Kids' Shoes", "kids", "Playproof sneakers, school shoes, and soft flexible sandals", "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80"},
                {"Sports Shoes", "sports", "High-performance marathon, gym trainers, and court shoes", "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80"},
                {"Casual Shoes", "casual", "Trendsetting street sneakers, boat shoes, and relaxed loafers", "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80"},
                {"Formal Shoes", "formal", "Handcrafted genuine leather oxfords, derbies, and executive slip-ons", "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80"},
                {"Sneakers", "sneakers", "Modern street style sneakers and daily lifestyle footwear", "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80"},
                {"Sandals", "sandals", "Comfortable strap sandals and airy outdoor footwear", "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80"},
                {"Slippers", "slippers", "Orthopedic memory foam slippers and indoor slide comforts", "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80"},
                {"Chappals", "chappals", "Authentic South Indian handcrafted leather chappals and daily comforts", "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=600&q=80"},
                {"Flip-Flops", "flip-flops", "Waterproof lightweight daily slides and beach wear", "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80"},
                {"Other Footwear", "other", "Specialty and multi-purpose footwear accessories", "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"}
        };

        int order = 1;
        for (String[] def : defaults) {
            categoryRepository.save(new Category(def[0], def[1], def[2], def[3], order++));
        }
    }
}
`
);

// ==========================================
// 7. BACKEND: CategoryController
// ==========================================
writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/controller/CategoryController.java'),
`package com.stepstyle.controller;

import com.stepstyle.dto.CategoryRequestDto;
import com.stepstyle.dto.CategoryResponseDto;
import com.stepstyle.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Categories", description = "Public category viewing and Admin category management")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @Operation(summary = "Get all categories", description = "Returns active categories with product counts")
    public ResponseEntity<List<CategoryResponseDto>> getAllCategories(
            @RequestParam(defaultValue = "false") boolean all) {
        return ResponseEntity.ok(categoryService.getAllCategories(!all));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create category (Admin)", description = "Creates a new category with duplicate prevention")
    public ResponseEntity<CategoryResponseDto> createCategory(@Valid @RequestBody CategoryRequestDto requestDto) {
        return new ResponseEntity<>(categoryService.createCategory(requestDto), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete category (Admin)", description = "Deactivates a category")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
`
);

// ==========================================
// 8. BACKEND: FileStorageService (Supabase Storage + Local Fallback)
// ==========================================
writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/service/impl/FileStorageServiceImpl.java'),
`package com.stepstyle.service.impl;

import com.stepstyle.exception.FileStorageException;
import com.stepstyle.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageServiceImpl.class);

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".webp", ".gif"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    private final Path fileStorageLocation;
    private final String uploadDir;

    // Supabase Storage configuration
    private final String supabaseUrl;
    private final String supabaseKey;
    private final String supabaseBucket;
    private final RestTemplate restTemplate = new RestTemplate();

    public FileStorageServiceImpl(
            @Value("\${app.upload.dir:uploads/products}") String uploadDir,
            @Value("\${app.supabase.url:}") String supabaseUrl,
            @Value("\${app.supabase.key:}") String supabaseKey,
            @Value("\${app.supabase.bucket:product-images}") String supabaseBucket) {
        this.uploadDir = uploadDir;
        this.supabaseUrl = (supabaseUrl != null && !supabaseUrl.isBlank()) ? supabaseUrl.replaceAll("/+$", "") : "";
        this.supabaseKey = (supabaseKey != null && !supabaseKey.isBlank()) ? supabaseKey.trim() : "";
        this.supabaseBucket = (supabaseBucket != null && !supabaseBucket.isBlank()) ? supabaseBucket.trim() : "product-images";

        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new FileStorageException("Could not create local upload directory: " + uploadDir, ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("Cannot store an empty file");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileStorageException("File size exceeds maximum limit of 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new FileStorageException("Invalid file format. Only JPEG, PNG, WEBP, and GIF images are permitted");
        }

        String rawOriginalFilename = file.getOriginalFilename();
        if (rawOriginalFilename == null) {
            throw new FileStorageException("Original filename cannot be null");
        }

        String originalFilename = StringUtils.cleanPath(rawOriginalFilename);
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\\\")) {
            throw new FileStorageException("Filename contains invalid path sequence: " + originalFilename);
        }

        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf(".");
        if (dotIndex >= 0) {
            fileExtension = originalFilename.substring(dotIndex).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
            throw new FileStorageException("Unsupported file extension: " + fileExtension);
        }

        String uniqueFileName = UUID.randomUUID() + fileExtension;

        // 1. Try Supabase Storage if configured
        if (!supabaseUrl.isEmpty() && !supabaseKey.isEmpty()) {
            try {
                String uploadEndpoint = supabaseUrl + "/storage/v1/object/" + supabaseBucket + "/" + uniqueFileName;

                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "Bearer " + supabaseKey);
                headers.set("apikey", supabaseKey);
                headers.setContentType(MediaType.parseMediaType(contentType));

                HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);
                ResponseEntity<String> response = restTemplate.exchange(
                        uploadEndpoint,
                        HttpMethod.POST,
                        requestEntity,
                        String.class
                );

                if (response.getStatusCode().is2xxSuccessful()) {
                    String publicUrl = supabaseUrl + "/storage/v1/object/public/" + supabaseBucket + "/" + uniqueFileName;
                    logger.info("Successfully uploaded image to Supabase Storage: {}", publicUrl);
                    return publicUrl;
                } else {
                    logger.warn("Supabase Storage responded with non-2xx: {}. Falling back to local storage.", response.getStatusCode());
                }
            } catch (Exception ex) {
                logger.warn("Supabase Storage upload failed ({}). Falling back to local storage.", ex.getMessage());
            }
        }

        // 2. Fallback to Local Filesystem
        try {
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName).normalize();
            if (!targetLocation.startsWith(this.fileStorageLocation)) {
                throw new FileStorageException("Security violation: Attempted path traversal outside upload directory");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            logger.info("Successfully uploaded file locally: {} -> {}", originalFilename, uniqueFileName);

            String normalizedDir = uploadDir.replace("\\\\", "/");
            if (!normalizedDir.startsWith("/")) {
                normalizedDir = "/" + normalizedDir;
            }
            if (!normalizedDir.endsWith("/")) {
                normalizedDir = normalizedDir + "/";
            }

            return normalizedDir + uniqueFileName;
        } catch (IOException ex) {
            throw new FileStorageException("Failed to store file " + uniqueFileName + ". Please try again!", ex);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.trim().isEmpty()) {
            return;
        }

        // Handle Supabase Storage deletion if relevant
        if (fileUrl.contains(supabaseBucket) && !supabaseUrl.isEmpty() && !supabaseKey.isEmpty()) {
            try {
                String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
                String deleteEndpoint = supabaseUrl + "/storage/v1/object/" + supabaseBucket + "/" + fileName;

                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "Bearer " + supabaseKey);
                headers.set("apikey", supabaseKey);

                HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
                restTemplate.exchange(deleteEndpoint, HttpMethod.DELETE, requestEntity, Void.class);
                logger.info("Deleted image from Supabase Storage: {}", fileName);
                return;
            } catch (Exception ex) {
                logger.warn("Could not delete from Supabase Storage: {}", ex.getMessage());
            }
        }

        // Local deletion
        try {
            int lastSlash = fileUrl.lastIndexOf("/");
            String filename = (lastSlash >= 0) ? fileUrl.substring(lastSlash + 1) : fileUrl;

            if (filename.contains("..") || filename.contains("/") || filename.contains("\\\\")) {
                return;
            }

            Path filePath = this.fileStorageLocation.resolve(filename).normalize();
            if (filePath.startsWith(this.fileStorageLocation)) {
                Files.deleteIfExists(filePath);
                logger.info("Deleted local product image: {}", filePath);
            }
        } catch (IOException ex) {
            logger.warn("Could not delete file at URL {}: {}", fileUrl, ex.getMessage());
        }
    }
}
`
);

// ==========================================
// 9. BACKEND: ProductService & ProductServiceImpl Enhancements
// ==========================================
writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/service/ProductService.java'),
`package com.stepstyle.service;

import com.stepstyle.dto.DashboardStatsDto;
import com.stepstyle.dto.ProductPageResponse;
import com.stepstyle.dto.ProductRequestDto;
import com.stepstyle.dto.ProductResponseDto;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

public interface ProductService {

    ProductPageResponse getAllProducts(Pageable pageable);

    ProductResponseDto getProductById(Long id);

    ProductPageResponse searchProducts(String keyword, Pageable pageable);

    ProductPageResponse getProductsByCategory(String category, Pageable pageable);

    ProductPageResponse filterProducts(BigDecimal minPrice, BigDecimal maxPrice, String size, String brand, Pageable pageable);

    ProductPageResponse sortProducts(String sortBy, String direction, Pageable pageable);

    ProductResponseDto createProduct(ProductRequestDto requestDto);

    ProductResponseDto updateProduct(Long id, ProductRequestDto requestDto);

    void deleteProduct(Long id);

    ProductResponseDto toggleProductStatus(Long id, boolean active);

    ProductResponseDto uploadProductImage(Long id, MultipartFile file);

    String uploadStandaloneImage(MultipartFile file);

    ProductPageResponse getAdminProducts(String category, Boolean active, String search, Pageable pageable);

    DashboardStatsDto getDashboardStats();
}
`
);

writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/service/impl/ProductServiceImpl.java'),
`package com.stepstyle.service.impl;

import com.stepstyle.dto.DashboardStatsDto;
import com.stepstyle.dto.ProductPageResponse;
import com.stepstyle.dto.ProductRequestDto;
import com.stepstyle.dto.ProductResponseDto;
import com.stepstyle.entity.Product;
import com.stepstyle.exception.BadRequestException;
import com.stepstyle.exception.ResourceNotFoundException;
import com.stepstyle.repository.CategoryRepository;
import com.stepstyle.repository.ProductRepository;
import com.stepstyle.service.FileStorageService;
import com.stepstyle.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    public ProductServiceImpl(ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              FileStorageService fileStorageService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public ProductPageResponse getAllProducts(Pageable pageable) {
        Page<Product> page = productRepository.findByActiveTrue(pageable);
        return mapToPageResponse(page);
    }

    @Override
    public ProductResponseDto getProductById(Long id) {
        Product product = productRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Active product not found with id: " + id));
        return mapToResponseDto(product);
    }

    @Override
    public ProductPageResponse searchProducts(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllProducts(pageable);
        }
        Page<Product> page = productRepository.searchPublicProducts(keyword.trim(), pageable);
        return mapToPageResponse(page);
    }

    @Override
    public ProductPageResponse getProductsByCategory(String category, Pageable pageable) {
        Page<Product> page = productRepository.findByCategoryIgnoreCaseAndActiveTrue(category.trim(), pageable);
        return mapToPageResponse(page);
    }

    @Override
    public ProductPageResponse filterProducts(BigDecimal minPrice, BigDecimal maxPrice, String size, String brand, Pageable pageable) {
        Specification<Product> spec = Specification.where((root, query, cb) -> cb.isTrue(root.get("active")));

        if (minPrice != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice));
        }
        if (brand != null && !brand.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("brand")), brand.trim().toLowerCase()));
        }
        if (size != null && !size.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.like(root.get("availableSizes"), "%" + size.trim() + "%"));
        }

        Page<Product> page = productRepository.findAll(spec, pageable);
        return mapToPageResponse(page);
    }

    @Override
    public ProductPageResponse sortProducts(String sortBy, String direction, Pageable pageable) {
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String field = switch (sortBy.toLowerCase()) {
            case "price" -> "price";
            case "rating" -> "rating";
            case "name" -> "name";
            case "createdat", "newest" -> "createdAt";
            default -> "id";
        };

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(sortDirection, field));
        Page<Product> page = productRepository.findByActiveTrue(sortedPageable);
        return mapToPageResponse(page);
    }

    @Override
    @Transactional
    public ProductResponseDto createProduct(ProductRequestDto requestDto) {
        if (requestDto.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Price must be greater than zero");
        }
        if (requestDto.getOriginalPrice().compareTo(requestDto.getPrice()) < 0) {
            throw new BadRequestException("Original price cannot be less than sale price");
        }

        Product product = new Product();
        mapDtoToEntity(requestDto, product);
        Product savedProduct = productRepository.save(product);
        return mapToResponseDto(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponseDto updateProduct(Long id, ProductRequestDto requestDto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (requestDto.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Price must be greater than zero");
        }
        if (requestDto.getOriginalPrice().compareTo(requestDto.getPrice()) < 0) {
            throw new BadRequestException("Original price cannot be less than sale price");
        }

        mapDtoToEntity(requestDto, product);
        Product updatedProduct = productRepository.save(product);
        return mapToResponseDto(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Soft delete active status to preserve order history integrity
        product.setActive(false);
        productRepository.save(product);
    }

    @Override
    @Transactional
    public ProductResponseDto toggleProductStatus(Long id, boolean active) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setActive(active);
        Product updated = productRepository.save(product);
        return mapToResponseDto(updated);
    }

    @Override
    @Transactional
    public ProductResponseDto uploadProductImage(Long id, MultipartFile file) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (product.getImageUrl() != null && product.getImageUrl().startsWith("/uploads/")) {
            fileStorageService.deleteFile(product.getImageUrl());
        }

        String storedImageUrl = fileStorageService.storeFile(file);
        product.setImageUrl(storedImageUrl);
        Product saved = productRepository.save(product);
        return mapToResponseDto(saved);
    }

    @Override
    public String uploadStandaloneImage(MultipartFile file) {
        return fileStorageService.storeFile(file);
    }

    @Override
    public ProductPageResponse getAdminProducts(String category, Boolean active, String search, Pageable pageable) {
        String cleanCategory = (category != null && !category.isBlank() && !category.equalsIgnoreCase("all"))
                ? category.trim() : null;
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        Page<Product> page = productRepository.searchAdminProducts(cleanCategory, active, cleanSearch, pageable);
        return mapToPageResponse(page);
    }

    @Override
    public DashboardStatsDto getDashboardStats() {
        long totalProducts = productRepository.countByActiveTrue();
        long totalShoes = productRepository.countShoeProducts();
        long totalChappalsAndSlippers = productRepository.countChappalProducts();
        long totalCategories = categoryRepository.count();
        long lowStockCount = productRepository.countByStockQuantityLessThanAndActiveTrue(10);
        long chappalsInStock = productRepository.sumChappalStock();

        return new DashboardStatsDto(
                totalProducts,
                totalShoes,
                totalChappalsAndSlippers,
                totalCategories,
                lowStockCount,
                chappalsInStock
        );
    }

    private void mapDtoToEntity(ProductRequestDto dto, Product product) {
        product.setName(dto.getName().trim());
        product.setSku(dto.getSku() != null ? dto.getSku().trim() : null);
        product.setBrand(dto.getBrand().trim());
        product.setDescription(dto.getDescription().trim());
        product.setPrice(dto.getPrice());
        product.setOriginalPrice(dto.getOriginalPrice());
        product.setCategory(dto.getCategory().trim());
        product.setAvailableSizesList(dto.getAvailableSizes());
        product.setAvailableColorsList(dto.getAvailableColors());
        product.setStockQuantity(dto.getStockQuantity());
        if (dto.getImageUrl() != null) {
            product.setImageUrl(dto.getImageUrl().trim());
        }
        if (dto.getAdditionalImages() != null) {
            product.setAdditionalImageUrls(dto.getAdditionalImages());
        }
        product.setDiscountPercentage(dto.getDiscountPercentage());
        product.setRating(dto.getRating() != null ? dto.getRating() : 4.5);
        product.setActive(dto.isActive());
    }

    private ProductResponseDto mapToResponseDto(Product product) {
        return new ProductResponseDto(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getBrand(),
                product.getDescription(),
                product.getPrice(),
                product.getOriginalPrice(),
                product.getCategory(),
                product.getAvailableSizesList(),
                product.getAvailableColorsList(),
                product.getStockQuantity(),
                product.getImageUrl(),
                product.getAdditionalImageUrls(),
                product.getDiscountPercentage(),
                product.getRating(),
                product.isActive(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    private ProductPageResponse mapToPageResponse(Page<Product> page) {
        List<ProductResponseDto> content = page.getContent().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());

        return new ProductPageResponse(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }
}
`
);

// ==========================================
// 10. BACKEND: ProductController & AdminController
// ==========================================
writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/controller/ProductController.java'),
`package com.stepstyle.controller;

import com.stepstyle.dto.ProductPageResponse;
import com.stepstyle.dto.ProductRequestDto;
import com.stepstyle.dto.ProductResponseDto;
import com.stepstyle.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products", description = "Public catalog browsing & Admin management endpoints")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "Get all active products (paginated)", description = "Returns active products with pagination support")
    public ResponseEntity<ProductPageResponse> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort.Direction sortDir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDir, sortBy));
        return ResponseEntity.ok(productService.getAllProducts(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Returns single active product details")
    public ResponseEntity<ProductResponseDto> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/search")
    @Operation(summary = "Search products by keyword", description = "Searches across product name, brand, description, and category")
    public ResponseEntity<ProductPageResponse> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(productService.searchProducts(keyword, pageable));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get products by category", description = "Filters active footwear products by category")
    public ResponseEntity<ProductPageResponse> getProductsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(productService.getProductsByCategory(category, pageable));
    }

    @GetMapping("/filter")
    @Operation(summary = "Filter products by price, size, and brand", description = "Multi-criteria filtering on active products")
    public ResponseEntity<ProductPageResponse> filterProducts(
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String brand,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int sizeCount) {

        Pageable pageable = PageRequest.of(page, sizeCount);
        return ResponseEntity.ok(productService.filterProducts(minPrice, maxPrice, size, brand, pageable));
    }

    @GetMapping("/sort")
    @Operation(summary = "Sort active products", description = "Sorts products by price, rating, name, or recency")
    public ResponseEntity<ProductPageResponse> sortProducts(
            @RequestParam(defaultValue = "price") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(productService.sortProducts(sortBy, direction, pageable));
    }

    // ==========================================
    // ADMIN ENDPOINTS (Secured with ROLE_ADMIN)
    // ==========================================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create product (Admin)", description = "Adds a new product to the catalog")
    public ResponseEntity<ProductResponseDto> createProduct(@Valid @RequestBody ProductRequestDto requestDto) {
        return new ResponseEntity<>(productService.createProduct(requestDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update product (Admin)", description = "Updates existing product details")
    public ResponseEntity<ProductResponseDto> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDto requestDto) {
        return ResponseEntity.ok(productService.updateProduct(id, requestDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete product (Admin)", description = "Soft-deletes a product")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle product active status (Admin)", description = "Toggles product visibility")
    public ResponseEntity<ProductResponseDto> toggleProductStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> payload) {
        boolean active = payload != null && Boolean.TRUE.equals(payload.get("active"));
        return ResponseEntity.ok(productService.toggleProductStatus(id, active));
    }

    @PostMapping("/upload-image")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload image (Admin)", description = "Uploads an image to Supabase Storage and returns URL")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = productService.uploadStandaloneImage(file);
        return ResponseEntity.ok(Map.of("imageUrl", url, "message", "Image uploaded successfully"));
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload product image (Admin)", description = "Uploads and sets product main image")
    public ResponseEntity<ProductResponseDto> uploadProductImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(productService.uploadProductImage(id, file));
    }
}
`
);

writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/controller/AdminController.java'),
`package com.stepstyle.controller;

import com.stepstyle.dto.DashboardStatsDto;
import com.stepstyle.dto.ProductPageResponse;
import com.stepstyle.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Operations", description = "Dashboard stats and product management for admin panel")
public class AdminController {

    private final ProductService productService;

    public AdminController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get Dashboard Stats", description = "Returns summary counts including Chappals stock and low-stock alerts")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(productService.getDashboardStats());
    }

    @GetMapping("/products")
    @Operation(summary = "Get Admin Products", description = "Returns all products with active/inactive filtering, search, and pagination")
    public ResponseEntity<ProductPageResponse> getAdminProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDir, sortBy));
        return ResponseEntity.ok(productService.getAdminProducts(category, active, search, pageable));
    }
}
`
);

// ==========================================
// 11. BACKEND: SecurityConfig (Admin & Customer CORS & Role Guards)
// ==========================================
writeFile(
  path.join(BACKEND_BASE, 'src/main/java/com/stepstyle/security/SecurityConfig.java'),
`package com.stepstyle.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final String allowedOrigins;

    public SecurityConfig(
            JwtAuthenticationEntryPoint authenticationEntryPoint,
            CustomAccessDeniedHandler accessDeniedHandler,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            @Value("\${app.cors.allowed-origins:http://localhost:4200,http://localhost:4201}") String allowedOrigins) {
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.allowedOrigins = allowedOrigins;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .toList();

        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setExposedHeaders(List.of("Authorization", "Set-Cookie"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(authorize -> authorize
                        // Pre-flight CORS requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Swagger / OpenAPI documentation
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // Public Authentication endpoints
                        .requestMatchers("/api/auth/**", "/signup", "/register", "/login", "/forgot-password", "/reset-password").permitAll()

                        // Public Category browsing endpoint
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()

                        // Public Product browsing endpoints
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()

                        // Public Shop location endpoint
                        .requestMatchers(HttpMethod.GET, "/api/shop/**").permitAll()

                        // Public Contact enquiry submission endpoint
                        .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()

                        // Static uploaded image serving
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                        // Explicit Admin Endpoints (Product mutating, Category mutating, and Admin operations)
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Authenticated Customer endpoints
                        .requestMatchers("/api/cart/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/orders/**").hasAnyRole("USER", "ADMIN")

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
`
);

// ==========================================
// 12. BACKEND: application.properties & SQL Migration V3
// ==========================================
const appPropsPath = path.join(BACKEND_BASE, 'src/main/resources/application.properties');
let appProps = fs.readFileSync(appPropsPath, 'utf8');
if (!appProps.includes('app.supabase.url')) {
  appProps += `
# Supabase Storage Configuration
app.supabase.url=\${SUPABASE_URL:}
app.supabase.key=\${SUPABASE_SERVICE_ROLE_KEY:\${SUPABASE_KEY:}}
app.supabase.bucket=\${SUPABASE_STORAGE_BUCKET:product-images}
`;
  appProps = appProps.replace(
    'app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:4200}',
    'app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:4200,http://localhost:4201}'
  );
  fs.writeFileSync(appPropsPath, appProps, 'utf8');
  console.log('Updated application.properties with Supabase Storage and Admin CORS.');
}

writeFile(
  path.join(BACKEND_BASE, 'src/main/resources/db/migration/V3__categories_and_admin_enhancements.sql'),
`-- ==============================================================================
-- Flyway Database Migration: V3__categories_and_admin_enhancements.sql
-- StepStyle Footwear Store - Categories, SKU, and Product Images Support
-- ==============================================================================

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_category_slug ON categories (slug);
CREATE INDEX IF NOT EXISTS idx_category_name ON categories (name);
CREATE INDEX IF NOT EXISTS idx_category_active ON categories (active);

-- 2. Add SKU column to products if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'sku'
    ) THEN
        ALTER TABLE products ADD COLUMN sku VARCHAR(50);
        CREATE INDEX idx_product_sku ON products (sku);
    END IF;
END $$;

-- 3. Product Images Table (Multi-image support)
CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pi_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pi_product_id ON product_images (product_id);

-- 4. Advance Sequence Values
SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1));
`
);

// ==========================================
// 13. CUSTOMER SITE: ProductService error handling update
// ==========================================
const custProdServicePath = path.join(CUSTOMER_BASE, 'src/app/core/services/product.service.ts');
let custProdService = fs.readFileSync(custProdServicePath, 'utf8');

// Replace the silent fallback with an explicit error throwing and clear error message
const oldCatchBlock = `      catchError(error => {
        console.warn(
          'Spring Boot backend is not running at http://localhost:8080 (ECONNREFUSED). Falling back to local sample products.'
        );
        this.productsSignal.set(SAMPLE_PRODUCTS);
        return of(SAMPLE_PRODUCTS);
      }),`;

const newCatchBlock = `      catchError(error => {
        console.error('Failed to load products from live API (http://localhost:8080/api/products):', error);
        this.productsSignal.set([]);
        const errorMessage = error?.status === 0
          ? 'Cannot connect to backend at http://localhost:8080. Please ensure the Spring Boot server is running.'
          : (error?.error?.message || 'Error fetching products from server.');
        return throwError(() => new Error(errorMessage));
      }),`;

if (custProdService.includes(oldCatchBlock)) {
  custProdService = custProdService.replace(oldCatchBlock, newCatchBlock);
  if (!custProdService.includes('throwError')) {
    custProdService = custProdService.replace("import { Observable, of }", "import { Observable, of, throwError }");
  }
  fs.writeFileSync(custProdServicePath, custProdService, 'utf8');
  console.log('Updated customer ProductService with live API error handling (no silent sample fallback).');
}

console.log('Backend and Customer site patches successfully written!');
