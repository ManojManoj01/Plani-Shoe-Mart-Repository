package com.stepstyle.service.impl;

import com.stepstyle.dto.CreateOrderRequest;
import com.stepstyle.dto.OrderItemResponseDto;
import com.stepstyle.dto.OrderResponseDto;
import com.stepstyle.entity.*;
import com.stepstyle.exception.BadRequestException;
import com.stepstyle.exception.ForbiddenException;
import com.stepstyle.exception.InsufficientStockException;
import com.stepstyle.exception.ResourceNotFoundException;
import com.stepstyle.repository.CartRepository;
import com.stepstyle.repository.OrderRepository;
import com.stepstyle.repository.ProductRepository;
import com.stepstyle.repository.UserRepository;
import com.stepstyle.security.UserPrincipal;
import com.stepstyle.service.OrderService;
import com.stepstyle.service.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("1000.00");
    private static final BigDecimal STANDARD_SHIPPING_FEE = new BigDecimal("99.00");

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PaymentService paymentService;

    public OrderServiceImpl(OrderRepository orderRepository,
                            CartRepository cartRepository,
                            ProductRepository productRepository,
                            UserRepository userRepository,
                            PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.paymentService = paymentService;
    }

    @Override
    @Transactional
    public OrderResponseDto createOrderFromCart(UserPrincipal principal, CreateOrderRequest request) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Your cart is empty. Add products to cart before ordering."));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot create an order with an empty cart");
        }

        // 1. Calculate items total and validate stock for each item
        BigDecimal itemsTotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setShippingAddress(request.getShippingAddress().trim());
        order.setRecipientName(request.getRecipientName().trim());
        order.setRecipientPhone(request.getRecipientPhone().trim());
        order.setPaymentMethod(request.getPaymentMethod().trim().toUpperCase());

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            // Re-fetch product to ensure live stock check in transaction
            Product liveProduct = productRepository.findById(product.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + product.getId()));

            if (!liveProduct.isActive()) {
                throw new BadRequestException("Product '" + liveProduct.getName() + "' is currently unavailable");
            }

            if (liveProduct.getStockQuantity() < cartItem.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product '" + liveProduct.getName()
                        + "'. Available: " + liveProduct.getStockQuantity() + ", requested: " + cartItem.getQuantity());
            }

            // Decrement inventory inside transaction
            liveProduct.setStockQuantity(liveProduct.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(liveProduct);

            BigDecimal unitPrice = liveProduct.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            itemsTotal = itemsTotal.add(subtotal);

            // Create immutable price and product snapshot
            OrderItem orderItem = new OrderItem(
                    order,
                    liveProduct,
                    liveProduct.getName(),
                    liveProduct.getBrand(),
                    liveProduct.getImageUrl(),
                    cartItem.getSize(),
                    cartItem.getColor(),
                    cartItem.getQuantity(),
                    unitPrice,
                    subtotal
            );
            orderItems.add(orderItem);
        }

        // 2. Shipping calculation
        BigDecimal shippingFee = itemsTotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : STANDARD_SHIPPING_FEE;
        BigDecimal finalTotal = itemsTotal.add(shippingFee);

        // 3. Generate unique order number: e.g. ORD-20261019-XXXXX
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String orderNumber = "ORD-" + datePrefix + "-" + randomSuffix;

        order.setOrderNumber(orderNumber);
        order.setTotalAmount(finalTotal);
        order.setItems(orderItems);

        // 4. Process payment through payment service abstraction
        PaymentService.PaymentResult paymentResult = paymentService.processPayment(
                order.getPaymentMethod(),
                finalTotal,
                orderNumber
        );

        if (!paymentResult.isSuccess()) {
            throw new BadRequestException("Payment processing failed: " + paymentResult.getMessage());
        }

        order.setPaymentStatus(paymentResult.getStatus());
        order.setTransactionId(paymentResult.getTransactionId());

        if (paymentResult.getStatus() == PaymentStatus.PAID) {
            order.setStatus(OrderStatus.CONFIRMED);
        } else {
            order.setStatus(OrderStatus.PENDING);
        }

        Order savedOrder = orderRepository.save(order);

        // 5. Clear the user's cart
        cart.getItems().clear();
        cartRepository.save(cart);

        return mapToOrderResponseDto(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDto> getMyOrders(UserPrincipal principal) {
        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(principal.getId());
        return orders.stream()
                .map(this::mapToOrderResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDto getOrderById(UserPrincipal principal, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(Role.ROLE_ADMIN.name()));

        // Ownership enforcement: regular users can only read their own orders
        if (!isAdmin && !Objects.equals(order.getUser().getId(), principal.getId())) {
            throw new ForbiddenException("You are not authorized to view this order");
        }

        return mapToOrderResponseDto(order);
    }

    private OrderResponseDto mapToOrderResponseDto(Order order) {
        List<OrderItemResponseDto> itemDtos = order.getItems().stream()
                .map(item -> new OrderItemResponseDto(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProductName(),
                        item.getProductBrand(),
                        item.getProductImageUrl(),
                        item.getSize(),
                        item.getColor(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()
                ))
                .collect(Collectors.toList());

        return new OrderResponseDto(
                order.getId(),
                order.getOrderNumber(),
                order.getOrderDate(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getShippingAddress(),
                order.getRecipientName(),
                order.getRecipientPhone(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getTransactionId(),
                itemDtos
        );
    }

    @Override
    public List<OrderResponseDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToOrderResponseDto)
                .collect(Collectors.toList());
    }
}
