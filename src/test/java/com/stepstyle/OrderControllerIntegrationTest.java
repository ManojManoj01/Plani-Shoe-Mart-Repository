package com.stepstyle;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stepstyle.dto.AddToCartRequest;
import com.stepstyle.dto.CreateOrderRequest;
import com.stepstyle.entity.Product;
import com.stepstyle.entity.Role;
import com.stepstyle.entity.User;
import com.stepstyle.repository.*;
import com.stepstyle.security.JwtTokenProvider;
import com.stepstyle.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private String userToken;
    private String secondUserToken;
    private Product product;

    @BeforeEach
    void setup() {
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();

        // User 1
        User user1 = new User("alice", "alice@example.com", passwordEncoder.encode("Pass@123"), "Alice", "Smith", Role.ROLE_USER);
        user1 = userRepository.save(user1);
        userToken = "Bearer " + tokenProvider.generateAccessToken(UserPrincipal.create(user1));

        // User 2
        User user2 = new User("bob", "bob@example.com", passwordEncoder.encode("Pass@123"), "Bob", "Jones", Role.ROLE_USER);
        user2 = userRepository.save(user2);
        secondUserToken = "Bearer " + tokenProvider.generateAccessToken(UserPrincipal.create(user2));

        // Product with 10 stock
        product = new Product(
                "Executive Formal Shoes",
                "RoyalStep",
                "Italian leather lace-ups",
                new BigDecimal("2499.00"),
                new BigDecimal("3499.00"),
                "Formal Shoes",
                "UK 8,UK 9",
                "Black",
                10,
                "https://example.com/formal.jpg",
                28,
                4.7,
                true
        );
        product = productRepository.save(product);
    }

    @Test
    @DisplayName("Should successfully place order from cart and decrement inventory")
    void testCreateOrderAndDecrementInventory() throws Exception {
        // 1. Add 2 pairs to Alice's cart
        AddToCartRequest cartRequest = new AddToCartRequest(product.getId(), "UK 8", "Black", 2);
        mockMvc.perform(post("/api/cart/items")
                        .header(HttpHeaders.AUTHORIZATION, userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cartRequest)))
                .andExpect(status().isOk());

        // 2. Place order
        CreateOrderRequest orderRequest = new CreateOrderRequest(
                "456 Park Avenue, Floor 4",
                "Alice Smith",
                "+1234567890",
                "COD"
        );

        MvcResult result = mockMvc.perform(post("/api/orders")
                        .header(HttpHeaders.AUTHORIZATION, userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderNumber", startsWith("ORD-")))
                .andExpect(jsonPath("$.recipientName").value("Alice Smith"))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.totalAmount").value(4998.00))
                .andReturn();

        // 3. Verify product inventory was decremented from 10 to 8
        Product updatedProduct = productRepository.findById(product.getId()).orElseThrow();
        assertEquals(8, updatedProduct.getStockQuantity());

        // 4. Verify cart is now empty
        mockMvc.perform(get("/api/cart")
                        .header(HttpHeaders.AUTHORIZATION, userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(0));
    }

    @Test
    @DisplayName("Should forbid User B from reading User A's order")
    void testOrderOwnershipEnforcement() throws Exception {
        // Place order as Alice
        AddToCartRequest cartRequest = new AddToCartRequest(product.getId(), "UK 8", "Black", 1);
        mockMvc.perform(post("/api/cart/items")
                        .header(HttpHeaders.AUTHORIZATION, userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cartRequest)))
                .andExpect(status().isOk());

        CreateOrderRequest orderRequest = new CreateOrderRequest("Address", "Alice", "1234567890", "COD");
        MvcResult result = mockMvc.perform(post("/api/orders")
                        .header(HttpHeaders.AUTHORIZATION, userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseJson = result.getResponse().getContentAsString();
        Long orderId = objectMapper.readTree(responseJson).get("id").asLong();

        // Bob tries to read Alice's order
        mockMvc.perform(get("/api/orders/" + orderId)
                        .header(HttpHeaders.AUTHORIZATION, secondUserToken))
                .andExpect(status().isForbidden());
    }
}
