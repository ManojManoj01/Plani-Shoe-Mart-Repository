package com.stepstyle.service;

import com.stepstyle.dto.AddToCartRequest;
import com.stepstyle.dto.CartResponseDto;
import com.stepstyle.dto.UpdateCartItemRequest;
import com.stepstyle.security.UserPrincipal;

public interface CartService {

    CartResponseDto getCart(UserPrincipal principal);

    CartResponseDto addItemToCart(UserPrincipal principal, AddToCartRequest request);

    CartResponseDto updateCartItem(UserPrincipal principal, Long itemId, UpdateCartItemRequest request);

    CartResponseDto removeCartItem(UserPrincipal principal, Long itemId);

    CartResponseDto clearCart(UserPrincipal principal);
}
