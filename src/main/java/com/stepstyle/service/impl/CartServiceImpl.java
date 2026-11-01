package com.stepstyle.service.impl;

import com.stepstyle.dto.AddToCartRequest;
import com.stepstyle.dto.CartItemResponseDto;
import com.stepstyle.dto.CartResponseDto;
import com.stepstyle.dto.UpdateCartItemRequest;
import com.stepstyle.entity.Cart;
import com.stepstyle.entity.CartItem;
import com.stepstyle.entity.Product;
import com.stepstyle.entity.User;
import com.stepstyle.exception.BadRequestException;
import com.stepstyle.exception.ForbiddenException;
import com.stepstyle.exception.InsufficientStockException;
import com.stepstyle.exception.ResourceNotFoundException;
import com.stepstyle.repository.CartItemRepository;
import com.stepstyle.repository.CartRepository;
import com.stepstyle.repository.ProductRepository;
import com.stepstyle.repository.UserRepository;
import com.stepstyle.security.UserPrincipal;
import com.stepstyle.service.CartService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class CartServiceImpl implements CartService {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("1000.00");
    private static final BigDecimal STANDARD_SHIPPING_FEE = new BigDecimal("99.00");

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartServiceImpl(CartRepository cartRepository,
                           CartItemRepository cartItemRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public CartResponseDto getCart(UserPrincipal principal) {
        Cart cart = getOrCreateCart(principal.getId());
        return mapToCartResponseDto(cart);
    }

    @Override
    @Transactional
    public CartResponseDto addItemToCart(UserPrincipal principal, AddToCartRequest request) {
        Product product = productRepository.findByIdAndActiveTrue(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Active product not found with id: " + request.getProductId()));

        Cart cart = getOrCreateCart(principal.getId());

        String size = request.getSize().trim();
        String color = request.getColor().trim();

        // Check if item already exists in this cart
        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> Objects.equals(item.getProduct().getId(), product.getId())
                        && item.getSize().equalsIgnoreCase(size)
                        && item.getColor().equalsIgnoreCase(color))
                .findFirst();

        int targetQuantity = request.getQuantity();
        if (existingItemOpt.isPresent()) {
            targetQuantity += existingItemOpt.get().getQuantity();
        }

        // Validate stock
        if (product.getStockQuantity() < targetQuantity) {
            throw new InsufficientStockException("Insufficient stock for product '" + product.getName()
                    + "'. Available: " + product.getStockQuantity() + ", requested: " + targetQuantity);
        }

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(targetQuantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem(cart, product, size, color, request.getQuantity());
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        Cart updatedCart = cartRepository.save(cart);
        return mapToCartResponseDto(updatedCart);
    }

    @Override
    @Transactional
    public CartResponseDto updateCartItem(UserPrincipal principal, Long itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(principal.getId());

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        // Ownership enforcement
        if (!Objects.equals(item.getCart().getId(), cart.getId())) {
            throw new ForbiddenException("You are not authorized to modify this cart item");
        }

        Product product = item.getProduct();
        if (product.getStockQuantity() < request.getQuantity()) {
            throw new InsufficientStockException("Insufficient stock for product '" + product.getName()
                    + "'. Available: " + product.getStockQuantity() + ", requested: " + request.getQuantity());
        }

        item.setQuantity(request.getQuantity());
        if (request.getSize() != null && !request.getSize().trim().isEmpty()) {
            item.setSize(request.getSize().trim());
        }
        if (request.getColor() != null && !request.getColor().trim().isEmpty()) {
            item.setColor(request.getColor().trim());
        }

        cartItemRepository.save(item);
        Cart updatedCart = cartRepository.findById(cart.getId()).orElse(cart);
        return mapToCartResponseDto(updatedCart);
    }

    @Override
    @Transactional
    public CartResponseDto removeCartItem(UserPrincipal principal, Long itemId) {
        Cart cart = getOrCreateCart(principal.getId());

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        // Ownership enforcement
        if (!Objects.equals(item.getCart().getId(), cart.getId())) {
            throw new ForbiddenException("You are not authorized to delete this cart item");
        }

        cart.removeItem(item);
        cartItemRepository.delete(item);

        Cart updatedCart = cartRepository.findById(cart.getId()).orElse(cart);
        return mapToCartResponseDto(updatedCart);
    }

    @Override
    @Transactional
    public CartResponseDto clearCart(UserPrincipal principal) {
        Cart cart = getOrCreateCart(principal.getId());
        cart.getItems().clear();
        cartRepository.save(cart);
        return mapToCartResponseDto(cart);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            Cart newCart = new Cart(user);
            return cartRepository.save(newCart);
        });
    }

    private CartResponseDto mapToCartResponseDto(Cart cart) {
        List<CartItemResponseDto> itemDtos = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalQuantity = 0;

        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            BigDecimal unitPrice = product.getPrice();
            BigDecimal itemSubtotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(itemSubtotal);
            totalQuantity += item.getQuantity();

            boolean inStock = product.isActive() && product.getStockQuantity() >= item.getQuantity();

            CartItemResponseDto itemDto = new CartItemResponseDto(
                    item.getId(),
                    product.getId(),
                    product.getName(),
                    product.getBrand(),
                    product.getImageUrl(),
                    item.getSize(),
                    item.getColor(),
                    item.getQuantity(),
                    unitPrice,
                    itemSubtotal,
                    inStock,
                    product.getStockQuantity()
            );
            itemDtos.add(itemDto);
        }

        BigDecimal shipping = BigDecimal.ZERO;
        if (totalQuantity > 0) {
            shipping = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : STANDARD_SHIPPING_FEE;
        }

        BigDecimal total = subtotal.add(shipping);

        return new CartResponseDto(
                cart.getId(),
                itemDtos,
                totalQuantity,
                subtotal,
                shipping,
                total
        );
    }
}
