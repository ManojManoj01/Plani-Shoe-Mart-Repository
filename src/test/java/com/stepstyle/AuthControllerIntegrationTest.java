package com.stepstyle;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stepstyle.dto.ForgotPasswordRequest;
import com.stepstyle.dto.LoginRequest;
import com.stepstyle.dto.RegisterRequest;
import com.stepstyle.dto.ResetPasswordRequest;
import com.stepstyle.entity.PasswordResetToken;
import com.stepstyle.entity.Role;
import com.stepstyle.entity.User;
import com.stepstyle.repository.CartItemRepository;
import com.stepstyle.repository.CartRepository;
import com.stepstyle.repository.PasswordResetTokenRepository;
import com.stepstyle.repository.RefreshTokenRepository;
import com.stepstyle.repository.UserRepository;
import com.stepstyle.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @BeforeEach
    void setup() {
        tokenRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Should successfully register a new user")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "sarah_connor",
                "Sarah",
                "Connor",
                "sarah@example.com",
                "Secret@123",
                "Secret@123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("sarah_connor"))
                .andExpect(jsonPath("$.data.email").value("sarah@example.com"))
                .andExpect(jsonPath("$.data.role").value("ROLE_USER"));

        assertTrue(userRepository.existsByUsername("sarah_connor"));
    }

    @Test
    @DisplayName("Should reject registration with duplicate email")
    void testRegisterDuplicateEmail() throws Exception {
        User existingUser = new User(
                "first_user",
                "duplicate@example.com",
                passwordEncoder.encode("Password@123"),
                "First",
                "User",
                Role.ROLE_USER
        );
        userRepository.save(existingUser);

        RegisterRequest duplicateRequest = new RegisterRequest(
                "second_user",
                "Second",
                "User",
                "duplicate@example.com",
                "Password@123",
                "Password@123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already registered")));
    }

    @Test
    @DisplayName("Should reject registration with mismatched passwords")
    void testRegisterPasswordMismatch() throws Exception {
        RegisterRequest mismatchRequest = new RegisterRequest(
                "mismatch_user",
                "Mismatch",
                "User",
                "mismatch@example.com",
                "Password@123",
                "DifferentPassword@456"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mismatchRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("do not match")));
    }

    @Test
    @DisplayName("Should successfully authenticate valid credentials and return JWT")
    void testLoginSuccess() throws Exception {
        User user = new User(
                "auth_user",
                "auth@example.com",
                passwordEncoder.encode("ValidPass@123"),
                "Auth",
                "User",
                Role.ROLE_USER
        );
        userRepository.save(user);

        LoginRequest loginRequest = new LoginRequest("auth_user", "ValidPass@123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.username").value("auth_user"))
                .andExpect(header().exists("Set-Cookie"));
    }

    @Test
    @DisplayName("Should reject login with invalid password returning 401")
    void testLoginFailure() throws Exception {
        User user = new User(
                "valid_user",
                "user@example.com",
                passwordEncoder.encode("CorrectPass@123"),
                "Valid",
                "User",
                Role.ROLE_USER
        );
        userRepository.save(user);

        LoginRequest badRequest = new LoginRequest("valid_user", "WrongPassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("Should handle forgot password request cleanly without leaking email presence")
    void testForgotPassword() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest("nonexistent@example.com");

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Should reject expired password reset token")
    void testPasswordResetExpiredToken() throws Exception {
        User user = new User(
                "reset_user",
                "reset@example.com",
                passwordEncoder.encode("OldPassword@123"),
                "Reset",
                "User",
                Role.ROLE_USER
        );
        userRepository.save(user);

        String rawToken = "sample-expired-token";
        String tokenHash = tokenProvider.hashToken(rawToken);
        // Expiry in past
        PasswordResetToken expiredToken = new PasswordResetToken(tokenHash, user, LocalDateTime.now().minusHours(1));
        tokenRepository.save(expiredToken);

        ResetPasswordRequest request = new ResetPasswordRequest(rawToken, "NewSecret@123", "NewSecret@123");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("expired")));
    }
}
