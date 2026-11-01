package com.stepstyle.controller;

import com.stepstyle.dto.*;
import com.stepstyle.security.UserPrincipal;
import com.stepstyle.service.AuthService;
import com.stepstyle.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/auth", ""})
@Tag(name = "Authentication", description = "Endpoints for user signup, registration, login, token refresh, and password management")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    /**
     * Step 2: Sign Up API
     * Validates input, hashes password using BCrypt, saves user to JPA repository, initializes cart,
     * and returns success response.
     */
    @PostMapping("/signup")
    @Operation(summary = "User Sign Up", description = "Register a new user account with hashed password and validations")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        ApiResponse<UserSummaryDto> response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/register")
    @Operation(summary = "User Registration", description = "Register a new customer account")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        ApiResponse<UserSummaryDto> response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping({"/login", "/api/admin/login"})
    @Operation(summary = "User / Admin Login", description = "Authenticates admin or user and returns JWT access token")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authService.login(request, httpRequest, httpResponse));
    }

    @GetMapping("/me")
    @Operation(summary = "Get Current User Profile", description = "Returns details of the currently authenticated user")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<UserSummaryDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(userService.getCurrentUser(userPrincipal));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot Password", description = "Sends a password reset token via email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset Password", description = "Resets password using a valid reset token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh Access Token", description = "Issues a new JWT access token using the HttpOnly refresh cookie")
    public ResponseEntity<AuthResponse> refreshToken(
            @CookieValue(name = "stepstyle_refresh_token", required = false) String refreshToken,
            HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authService.refreshToken(refreshToken, httpResponse));
    }

    @PostMapping("/logout")
    @Operation(summary = "User Logout", description = "Revokes refresh token and clears session cookie")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = "stepstyle_refresh_token", required = false) String refreshToken,
            HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authService.logout(refreshToken, httpResponse));
    }
}
