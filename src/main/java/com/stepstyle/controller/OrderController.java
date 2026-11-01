package com.stepstyle.controller;

import com.stepstyle.dto.CreateOrderRequest;
import com.stepstyle.dto.OrderResponseDto;
import com.stepstyle.security.UserPrincipal;
import com.stepstyle.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Order placement, history retrieval, and order status tracking")
@SecurityRequirement(name = "BearerAuth")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all customer orders (Admin only)", description = "Returns complete list of customer orders for admin portal")
    public ResponseEntity<List<OrderResponseDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PostMapping
    @Operation(summary = "Create order from cart", description = "Checks stock, decrements inventory, creates order snapshot, and clears cart")
    public ResponseEntity<OrderResponseDto> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderResponseDto order = orderService.createOrderFromCart(principal, request);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Get user order history", description = "Returns list of all past orders for the authenticated user")
    public ResponseEntity<List<OrderResponseDto>> getMyOrders(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(orderService.getMyOrders(principal));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Returns details for specific order, enforcing user ownership")
    public ResponseEntity<OrderResponseDto> getOrderById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(principal, id));
    }
}
