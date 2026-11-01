package com.stepstyle.service.impl;

import com.stepstyle.dto.ShopLocationDto;
import com.stepstyle.entity.Shop;
import com.stepstyle.repository.ShopRepository;
import com.stepstyle.service.ShopService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ShopServiceImpl implements ShopService {

    private final ShopRepository shopRepository;

    public ShopServiceImpl(ShopRepository shopRepository) {
        this.shopRepository = shopRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ShopLocationDto getShopLocation() {
        return shopRepository.findFirstByOrderByIdAsc()
                .map(this::mapToDto)
                .orElseGet(this::getDefaultPlaceholderShop);
    }

    private ShopLocationDto mapToDto(Shop shop) {
        return new ShopLocationDto(
                shop.getShopName(),
                shop.getAddress(),
                shop.getCity(),
                shop.getState(),
                shop.getPostalCode(),
                shop.getPhoneNumber(),
                shop.getOpeningHours(),
                shop.getLatitude(),
                shop.getLongitude()
        );
    }

    private ShopLocationDto getDefaultPlaceholderShop() {
        return new ShopLocationDto(
                "StepStyle Flagship Experience Store [Demo Location]",
                "Plot 42, Sample Fashion Street, Sector 18 (Demo Address)",
                "Metropolis",
                "State",
                "110001",
                "+91 11 2345 6789",
                "Mon - Sat: 10:00 AM - 09:30 PM, Sun: 11:00 AM - 08:00 PM",
                28.6139391,
                77.2090212
        );
    }
}
