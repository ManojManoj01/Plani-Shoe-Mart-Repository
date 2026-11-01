package com.stepstyle.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CartResponseDto {

    private Long id;
    private List<CartItemResponseDto> items = new ArrayList<>();
    private int totalItems;
    private BigDecimal subtotalAmount = BigDecimal.ZERO;
    private BigDecimal shippingAmount = BigDecimal.ZERO;
    private BigDecimal totalAmount = BigDecimal.ZERO;

    public CartResponseDto() {
    }

    public CartResponseDto(Long id, List<CartItemResponseDto> items, int totalItems,
                           BigDecimal subtotalAmount, BigDecimal shippingAmount, BigDecimal totalAmount) {
        this.id = id;
        this.items = items;
        this.totalItems = totalItems;
        this.subtotalAmount = subtotalAmount;
        this.shippingAmount = shippingAmount;
        this.totalAmount = totalAmount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<CartItemResponseDto> getItems() {
        return items;
    }

    public void setItems(List<CartItemResponseDto> items) {
        this.items = items;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }

    public BigDecimal getSubtotalAmount() {
        return subtotalAmount;
    }

    public void setSubtotalAmount(BigDecimal subtotalAmount) {
        this.subtotalAmount = subtotalAmount;
    }

    public BigDecimal getShippingAmount() {
        return shippingAmount;
    }

    public void setShippingAmount(BigDecimal shippingAmount) {
        this.shippingAmount = shippingAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
