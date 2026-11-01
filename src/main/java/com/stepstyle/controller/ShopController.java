package com.stepstyle.controller;

import com.stepstyle.dto.ShopLocationDto;
import com.stepstyle.service.ShopService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shop")
@Tag(name = "Shop Information", description = "Endpoints for physical retail store location and operating hours")
public class ShopController {

    private final ShopService shopService;

    public ShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    @GetMapping("/location")
    @Operation(summary = "Get physical shop location", description = "Returns store address, contact details, opening hours, and coordinates")
    public ResponseEntity<ShopLocationDto> getShopLocation() {
        return ResponseEntity.ok(shopService.getShopLocation());
    }
}
