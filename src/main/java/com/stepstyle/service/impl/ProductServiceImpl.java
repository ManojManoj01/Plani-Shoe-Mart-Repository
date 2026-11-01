package com.stepstyle.service.impl;

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
import org.springframework.beans.factory.annotation.Value;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    @Value("${app.dashboard.low-stock-threshold:10}")
    private int lowStockThreshold = 10;

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
        if (requestDto.getOriginalPrice() != null && requestDto.getOriginalPrice().compareTo(requestDto.getPrice()) < 0) {
            throw new BadRequestException("Original price cannot be less than sale price");
        }

        validateCategory(requestDto.getCategory());

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
        if (requestDto.getOriginalPrice() != null && requestDto.getOriginalPrice().compareTo(requestDto.getPrice()) < 0) {
            throw new BadRequestException("Original price cannot be less than sale price");
        }

        validateCategory(requestDto.getCategory());

        mapDtoToEntity(requestDto, product);
        Product updatedProduct = productRepository.save(product);
        return mapToResponseDto(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        try {
            productRepository.delete(product);
            productRepository.flush();
        } catch (Exception ex) {
            // If relational constraints (such as past order history) prevent hard deletion,
            // deactivate the product to preserve referential integrity.
            product.setActive(false);
            productRepository.save(product);
        }
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

        Specification<Product> spec = Specification.where(null);

        if (cleanCategory != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(cb.lower(root.get("category")), cleanCategory.toLowerCase()));
        }

        if (active != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("active"), active));
        }

        if (cleanSearch != null) {
            String pattern = "%" + cleanSearch.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("brand")), pattern),
                    cb.like(cb.lower(root.get("sku")), pattern)
            ));
        }

        Page<Product> page = productRepository.findAll(spec, pageable);
        return mapToPageResponse(page);
    }

    @Override
    public DashboardStatsDto getDashboardStats() {
        long totalProducts = productRepository.countByActiveTrue();
        long totalShoes = productRepository.countShoeProducts();
        long totalChappals = productRepository.countChappalProducts();
        long totalSlippers = productRepository.countSlipperProducts();
        long totalCategories = categoryRepository.count();
        long lowStockCount = productRepository.countByStockQuantityLessThanAndActiveTrue(lowStockThreshold);
        long chappalsInStock = productRepository.sumChappalStock();

        return new DashboardStatsDto(
                totalProducts,
                totalShoes,
                totalChappals,
                totalSlippers,
                totalCategories,
                lowStockCount,
                chappalsInStock
        );
    }

    private void validateCategory(String categoryName) {
        if (categoryName == null || categoryName.trim().isEmpty()) {
            throw new BadRequestException("Category name cannot be empty");
        }
        String cleanCat = categoryName.trim();
        boolean valid = categoryRepository.existsByNameIgnoreCase(cleanCat)
                || categoryRepository.existsBySlugIgnoreCase(cleanCat);
        if (!valid) {
            throw new BadRequestException("Invalid category: '" + cleanCat + "'. Product must reference a valid category (e.g. Shoes, Chappals, Slippers).");
        }
    }

    private void mapDtoToEntity(ProductRequestDto dto, Product product) {
        product.setName(dto.getName().trim());
        product.setSku(dto.getSku() != null ? dto.getSku().trim() : null);
        product.setBrand(dto.getBrand() != null && !dto.getBrand().trim().isEmpty() ? dto.getBrand().trim() : "StepStyle");
        product.setDescription(dto.getDescription().trim());
        product.setPrice(dto.getPrice());
        product.setOriginalPrice(dto.getOriginalPrice() != null ? dto.getOriginalPrice() : dto.getPrice());
        product.setCategory(dto.getCategory().trim());
        if (dto.getAvailableSizes() != null && !dto.getAvailableSizes().isEmpty()) {
            product.setAvailableSizesList(dto.getAvailableSizes());
        } else {
            product.setAvailableSizesList(List.of("7", "8", "9", "10"));
        }
        if (dto.getAvailableColors() != null && !dto.getAvailableColors().isEmpty()) {
            product.setAvailableColorsList(dto.getAvailableColors());
        } else {
            product.setAvailableColorsList(List.of("Black", "Brown"));
        }
        product.setStockQuantity(dto.getStockQuantity());
        if (dto.getImageUrl() != null && !dto.getImageUrl().trim().isEmpty()) {
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
