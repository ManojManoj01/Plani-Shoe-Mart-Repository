package com.stepstyle.service;

import com.stepstyle.dto.CreateOrderRequest;
import com.stepstyle.dto.OrderResponseDto;
import com.stepstyle.security.UserPrincipal;

import java.util.List;

public interface OrderService {

    OrderResponseDto createOrderFromCart(UserPrincipal principal, CreateOrderRequest request);

    List<OrderResponseDto> getMyOrders(UserPrincipal principal);

    OrderResponseDto getOrderById(UserPrincipal principal, Long orderId);

    List<OrderResponseDto> getAllOrders();
}
