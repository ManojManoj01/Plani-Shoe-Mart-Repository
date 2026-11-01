package com.stepstyle;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stepstyle.dto.ProductRequestDto;
import com.stepstyle.entity.Product;
import com.stepstyle.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
class ProductControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.stepstyle.repository.OrderItemRepository orderItemRepository;

    @Autowired
    private com.stepstyle.repository.OrderRepository orderRepository;

    @Autowired
    private com.stepstyle.repository.CartItemRepository cartItemRepository;

    @BeforeEach
    void setup() {
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        productRepository.deleteAll();

        // Seed test products
        Product p1 = new Product(
                "Urban Leather Derby",
                "StepStyle",
                "Smart casual derby shoes",
                new BigDecimal("1999.00"),
                new BigDecimal("2999.00"),
                "Casual Shoes",
                "UK 7,UK 8,UK 9",
                "Tan,Black",
                25,
                "https://example.com/derby.jpg",
                33,
                4.6,
                true
        );

        Product p2 = new Product(
                "Ortho Comfort Flip-Flop",
                "SoleEase",
                "Comfortable soft slippers",
                new BigDecimal("599.00"),
                new BigDecimal("899.00"),
                "Slippers",
                "UK 6,UK 7,UK 8",
                "Blue,Grey",
                50,
                "https://example.com/slipper.jpg",
                33,
                4.3,
                true
        );

        productRepository.saveAll(List.of(p1, p2));
    }

    @Test
    @DisplayName("Public can browse active products with pagination")
    void testGetAllProducts() throws Exception {
        mockMvc.perform(get("/api/products?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("Public can search products by keyword")
    void testSearchProducts() throws Exception {
        mockMvc.perform(get("/api/products/search?keyword=derby"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name").value("Urban Leather Derby"));
    }

    @Test
    @DisplayName("Public can filter products by category")
    void testGetProductsByCategory() throws Exception {
        mockMvc.perform(get("/api/products/category/Slippers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].category").value("Slippers"));
    }

    @Test
    @DisplayName("Public can filter products by price range and brand")
    void testFilterProducts() throws Exception {
        mockMvc.perform(get("/api/products/filter?minPrice=1000&maxPrice=3000&brand=StepStyle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].brand").value("StepStyle"));
    }

    @Test
    @DisplayName("Admin can create new product")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testAdminCreateProductSuccess() throws Exception {
        ProductRequestDto newProduct = new ProductRequestDto(
                "TrailBlazer Running Shoes",
                "Velocity",
                "Lightweight marathon trainers",
                new BigDecimal("3499.00"),
                new BigDecimal("4999.00"),
                "Sports Shoes",
                List.of("UK 7", "UK 8", "UK 9", "UK 10"),
                List.of("Neon Green", "Midnight Black"),
                40,
                "https://example.com/running.jpg",
                30,
                4.8,
                true
        );

        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newProduct)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name").value("TrailBlazer Running Shoes"))
                .andExpect(jsonPath("$.stockQuantity").value(40));
    }

    @Test
    @DisplayName("Regular user is forbidden from creating product")
    @WithMockUser(username = "user", roles = {"USER"})
    void testRegularUserCannotCreateProduct() throws Exception {
        ProductRequestDto newProduct = new ProductRequestDto(
                "Unauthorized Shoe",
                "HackBrand",
                "Description",
                new BigDecimal("999.00"),
                new BigDecimal("1299.00"),
                "Casual Shoes",
                List.of("UK 8"),
                List.of("Black"),
                10,
                null,
                0,
                4.0,
                true
        );

        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newProduct)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated user receives 401 when accessing admin endpoints")
    void testUnauthenticatedUserAdminEndpoint() throws Exception {
        mockMvc.perform(delete("/api/admin/products/1"))
                .andExpect(status().isUnauthorized());
    }
}
