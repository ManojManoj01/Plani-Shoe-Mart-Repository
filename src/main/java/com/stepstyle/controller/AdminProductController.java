package com.stepstyle.controller;

import com.stepstyle.dto.ApiResponse;
import com.stepstyle.dto.ProductRequestDto;
import com.stepstyle.dto.ProductResponseDto;
import com.stepstyle.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Products", description = "Admin-only endpoints for catalog and inventory management")
@SecurityRequirement(name = "BearerAuth")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @Operation(summary = "Create new product (Admin only)", description = "Adds a new product to the catalog")
    public ResponseEntity<ProductResponseDto> createProduct(@Valid @RequestBody ProductRequestDto requestDto) {
        ProductResponseDto created = productService.createProduct(requestDto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product (Admin only)", description = "Updates details and stock for existing product")
    public ResponseEntity<ProductResponseDto> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDto requestDto) {
        ProductResponseDto updated = productService.updateProduct(id, requestDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product (Admin only)", description = "Deactivates product from catalog")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Product deleted successfully"));
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload product image (Admin only)", description = "Validates and uploads product image, updating imageUrl")
    public ResponseEntity<ProductResponseDto> uploadProductImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        ProductResponseDto updated = productService.uploadProductImage(id, file);
        return ResponseEntity.ok(updated);
    }
}
