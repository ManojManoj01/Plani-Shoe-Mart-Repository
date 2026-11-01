package com.stepstyle.controller;

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
    @Operation(summary = "Get products", description = "Returns products with optional search, category, status, pagination, and sorting")
    public ResponseEntity<ProductPageResponse> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String sort) {

        String query = (search != null && !search.isBlank()) ? search.trim() : (keyword != null ? keyword.trim() : null);

        Boolean resolvedActive = active;
        if (resolvedActive == null && status != null && !status.isBlank() && !status.equalsIgnoreCase("all")) {
            if ("active".equalsIgnoreCase(status) || "true".equalsIgnoreCase(status)) {
                resolvedActive = true;
            } else if ("inactive".equalsIgnoreCase(status) || "false".equalsIgnoreCase(status)) {
                resolvedActive = false;
            }
        }

        String sortField = sortBy;
        String sortDirStr = direction;
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split("_");
            if (parts.length == 2) {
                sortField = parts[0];
                sortDirStr = parts[1];
            } else {
                sortField = sort;
            }
        }

        Sort.Direction sortDir = "asc".equalsIgnoreCase(sortDirStr) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDir, sortField));

        return ResponseEntity.ok(productService.getAdminProducts(category, resolvedActive, query, pageable));
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
