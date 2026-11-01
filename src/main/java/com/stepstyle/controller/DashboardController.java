package com.stepstyle.controller;

import com.stepstyle.dto.DashboardStatsDto;
import com.stepstyle.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Dashboard", description = "Real-time footwear store statistics from Supabase database")
@SecurityRequirement(name = "BearerAuth")
public class DashboardController {

    private final ProductService productService;

    public DashboardController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get Dashboard Stats", description = "Returns real counts: total products, total shoes, total slippers & chappals, total categories, and low-stock alerts")
    public ResponseEntity<DashboardStatsDto> getStats() {
        return ResponseEntity.ok(productService.getDashboardStats());
    }
}
