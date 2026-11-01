package com.stepstyle;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stepstyle.dto.ContactRequestDto;
import com.stepstyle.entity.ContactMessage;
import com.stepstyle.repository.ContactMessageRepository;
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

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
class ContactControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    @BeforeEach
    void setup() {
        contactMessageRepository.deleteAll();
    }

    @Test
    @DisplayName("Should successfully submit contact form and persist in database")
    void testSubmitContactMessageSuccess() throws Exception {
        ContactRequestDto request = new ContactRequestDto(
                "Jane Doe",
                "jane.doe@example.com",
                "+91 9876543210",
                "Size exchange enquiry",
                "Hello, I would like to exchange my UK 8 size shoes for UK 9 if available."
        );

        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Jane Doe"))
                .andExpect(jsonPath("$.data.email").value("jane.doe@example.com"))
                .andExpect(jsonPath("$.data.subject").value("Size exchange enquiry"))
                .andExpect(jsonPath("$.data.resolved").value(false));

        assertEquals(1, contactMessageRepository.count());
        ContactMessage saved = contactMessageRepository.findAll().get(0);
        assertEquals("Jane Doe", saved.getName());
        assertEquals("jane.doe@example.com", saved.getEmail());
    }

    @Test
    @DisplayName("Should reject contact form with invalid email and blank message")
    void testSubmitContactMessageValidationFailure() throws Exception {
        ContactRequestDto invalidRequest = new ContactRequestDto(
                "",
                "invalid-email-format",
                null,
                "",
                "short"
        );

        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").exists());

        assertEquals(0, contactMessageRepository.count());
    }

    @Test
    @DisplayName("Should allow Admin to list all customer enquiries")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testAdminGetAllEnquiries() throws Exception {
        ContactMessage msg = new ContactMessage(
                "Customer One",
                "cust1@example.com",
                null,
                "Delivery delay",
                "My order hasn't arrived yet. Please update delivery status."
        );
        contactMessageRepository.save(msg);

        mockMvc.perform(get("/api/contact"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Customer One"))
                .andExpect(jsonPath("$[0].subject").value("Delivery delay"));
    }

    @Test
    @DisplayName("Should forbid unauthenticated user from accessing admin enquiries list")
    void testUnauthenticatedAccessToEnquiriesList() throws Exception {
        mockMvc.perform(get("/api/contact"))
                .andExpect(status().isUnauthorized());
    }
}
