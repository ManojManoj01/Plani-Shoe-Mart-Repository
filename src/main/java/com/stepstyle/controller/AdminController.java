package com.stepstyle.controller;

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
