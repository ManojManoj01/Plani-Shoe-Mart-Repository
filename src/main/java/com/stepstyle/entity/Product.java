package com.stepstyle.entity;

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

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
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
