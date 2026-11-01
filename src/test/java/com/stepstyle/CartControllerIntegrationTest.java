package com.stepstyle;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stepstyle.dto.AddToCartRequest;
import com.stepstyle.dto.UpdateCartItemRequest;
import com.stepstyle.entity.Product;
import com.stepstyle.entity.Role;
import com.stepstyle.entity.User;
import com.stepstyle.repository.CartItemRepository;
import com.stepstyle.repository.CartRepository;
import com.stepstyle.repository.ProductRepository;
import com.stepstyle.repository.RefreshTokenRepository;
import com.stepstyle.repository.UserRepository;
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

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
class CartControllerIntegrationTest {

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
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private String userToken;
    private Product sampleProduct;

    @BeforeEach
    void setup() {
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();

        User user = new User(
                "cart_user",
                "cart@example.com",
                passwordEncoder.encode("Password@123"),
                "Cart",
                "Tester",
                Role.ROLE_USER
        );
        user = userRepository.save(user);

        UserPrincipal principal = UserPrincipal.create(user);
        userToken = "Bearer " + tokenProvider.generateAccessToken(principal);

        sampleProduct = new Product(
                "Leather Sandals",
                "StepStyle",
                "Genuine leather daily sandals",
                new BigDecimal("899.00"),
                new BigDecimal("1299.00"),
                "Chappals",
                "UK 8,UK 9",
                "Tan",
                5, // Limited stock of 5
                "https://example.com/sandals.jpg",
                30,
                4.5,
                true
        );
        sampleProduct = productRepository.save(sampleProduct);
    }

    @Test
    @DisplayName("Should retrieve empty cart for newly registered user")
    void testGetEmptyCart() throws Exception {
        mockMvc.perform(get("/api/cart")
                        .header(HttpHeaders.AUTHORIZATION, userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(0))
                .andExpect(jsonPath("$.items", hasSize(0)));
    }

    @Test
    @DisplayName("Should successfully add product to cart and calculate total")
    void testAddToCartSuccess() throws Exception {
        AddToCartRequest request = new AddToCartRequest(
                sampleProduct.getId(),
                "UK 8",
                "Tan",
                2
        );

        mockMvc.perform(post("/api/cart/items")
                        .header(HttpHeaders.AUTHORIZATION, userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.subtotalAmount").value(1798.00));
    }

    @Test
    @DisplayName("Should reject adding item when requested quantity exceeds available stock")
    void testAddToCartInsufficientStock() throws Exception {
        AddToCartRequest excessiveRequest = new AddToCartRequest(
                sampleProduct.getId(),
                "UK 8",
                "Tan",
                10 // Exceeds stock of 5
        );

        mockMvc.perform(post("/api/cart/items")
                        .header(HttpHeaders.AUTHORIZATION, userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(excessiveRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Insufficient stock")));
    }

    @Test
    @DisplayName("Should reject unauthenticated cart operations with 401")
    void testCartUnauthorized() throws Exception {
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isUnauthorized());
    }
}
