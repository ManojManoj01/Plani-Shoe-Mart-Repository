package com.stepstyle.service;

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
