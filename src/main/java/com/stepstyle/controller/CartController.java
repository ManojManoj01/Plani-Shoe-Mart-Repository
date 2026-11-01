package com.stepstyle.controller;

import com.stepstyle.dto.AddToCartRequest;
import com.stepstyle.dto.CartResponseDto;
import com.stepstyle.dto.UpdateCartItemRequest;
import com.stepstyle.security.UserPrincipal;
import com.stepstyle.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "Shopping Cart", description = "Endpoints for managing customer cart items, sizes, and quantities")
@SecurityRequirement(name = "BearerAuth")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    @Operation(summary = "Get user shopping cart", description = "Retrieves cart items, stock status, and server-calculated totals")
    public ResponseEntity<CartResponseDto> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(cartService.getCart(principal));
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart", description = "Validates inventory and adds item with chosen size and color")
    public ResponseEntity<CartResponseDto> addItemToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(cartService.addItemToCart(principal, request));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update cart item quantity", description = "Updates item quantity after stock validation")
    public ResponseEntity<CartResponseDto> updateCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(cartService.updateCartItem(principal, itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove item from cart", description = "Deletes specific item from customer cart")
    public ResponseEntity<CartResponseDto> removeCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeCartItem(principal, itemId));
    }

    @DeleteMapping
    @Operation(summary = "Clear shopping cart", description = "Removes all items from the customer cart")
    public ResponseEntity<CartResponseDto> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(cartService.clearCart(principal));
    }
}
