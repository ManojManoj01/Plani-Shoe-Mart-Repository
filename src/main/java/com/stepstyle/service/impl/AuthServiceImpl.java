package com.stepstyle.service.impl;

import com.stepstyle.dto.*;
import com.stepstyle.entity.Cart;
import com.stepstyle.entity.PasswordResetToken;
import com.stepstyle.entity.RefreshToken;
import com.stepstyle.entity.Role;
import com.stepstyle.entity.User;
import com.stepstyle.exception.BadRequestException;
import com.stepstyle.exception.InvalidTokenException;
import com.stepstyle.exception.RateLimitExceededException;
import com.stepstyle.exception.UnauthorizedException;
import com.stepstyle.repository.CartRepository;
import com.stepstyle.repository.PasswordResetTokenRepository;
import com.stepstyle.repository.RefreshTokenRepository;
import com.stepstyle.repository.UserRepository;
import com.stepstyle.security.JwtTokenProvider;
import com.stepstyle.security.RateLimitingService;
import com.stepstyle.security.UserPrincipal;
import com.stepstyle.service.AuthService;
import com.stepstyle.service.MailService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RateLimitingService rateLimitingService;
    private final MailService mailService;

    private final String refreshCookieName;
    private final long refreshExpirationMs;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            RefreshTokenRepository refreshTokenRepository,
            CartRepository cartRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            RateLimitingService rateLimitingService,
            MailService mailService,
            @Value("${app.jwt.refresh-cookie-name:stepstyle_refresh_token}") String refreshCookieName,
            @Value("${app.jwt.refresh-expiration-ms:604800000}") long refreshExpirationMs) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.rateLimitingService = rateLimitingService;
        this.mailService = mailService;
        this.refreshCookieName = refreshCookieName;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    @Override
    @Transactional
    public ApiResponse<UserSummaryDto> signup(SignupRequest request) {
        // 1. Password confirmation check (if confirmPassword provided)
        if (request.getConfirmPassword() != null && !request.getConfirmPassword().isBlank()) {
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                throw new BadRequestException("Password and confirm password do not match");
            }
        }

        // 2. Uniqueness checks
        String trimmedUsername = request.getUsername().trim();
        String trimmedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(trimmedUsername)) {
            throw new BadRequestException("Username '" + request.getUsername() + "' is already taken");
        }

        if (userRepository.existsByEmail(trimmedEmail)) {
            throw new BadRequestException("Email '" + request.getEmail() + "' is already registered");
        }

        // 3. Fallback names if not provided
        String firstName = (request.getFirstName() != null && !request.getFirstName().trim().isEmpty())
                ? request.getFirstName().trim()
                : trimmedUsername;
        String lastName = (request.getLastName() != null && !request.getLastName().trim().isEmpty())
                ? request.getLastName().trim()
                : "";

        // 4. Create User with BCrypt hashed password
        User user = new User(
                trimmedUsername,
                trimmedEmail,
                passwordEncoder.encode(request.getPassword()),
                firstName,
                lastName,
                Role.ROLE_USER
        );

        User savedUser = userRepository.save(user);

        // 5. Initialize empty cart for the user
        Cart cart = new Cart(savedUser);
        cartRepository.save(cart);

        UserSummaryDto userSummary = new UserSummaryDto(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getRole()
        );

        return ApiResponse.ok("User registered successfully. You can now log in.", userSummary);
    }

    @Override
    @Transactional
    public ApiResponse<UserSummaryDto> register(RegisterRequest request) {
        // 1. Password confirmation check
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        // 2. Uniqueness checks
        if (userRepository.existsByUsername(request.getUsername().trim())) {
            throw new BadRequestException("Username '" + request.getUsername() + "' is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Email '" + request.getEmail() + "' is already registered");
        }

        // 3. Create User with BCrypt hashed password
        User user = new User(
                request.getUsername().trim(),
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                request.getFirstName().trim(),
                request.getLastName().trim(),
                Role.ROLE_USER
        );

        User savedUser = userRepository.save(user);

        // 4. Initialize empty cart for the user
        Cart cart = new Cart(savedUser);
        cartRepository.save(cart);

        UserSummaryDto userSummary = new UserSummaryDto(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getRole()
        );

        return ApiResponse.ok("Registration successful. You can now log in.", userSummary);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String clientIp = getClientIp(httpRequest);
        String rateLimitKey = clientIp + ":" + request.getUsernameOrEmail().trim().toLowerCase();

        // 1. Check rate limiting
        if (rateLimitingService.isBlocked(rateLimitKey)) {
            long remaining = rateLimitingService.getRemainingLockoutMinutes(rateLimitKey);
            throw new RateLimitExceededException(
                    "Too many failed login attempts. Your IP has been temporarily locked out. Please try again in "
                            + remaining + " minute(s).");
        }

        // 2. Retrieve user by username or email
        String identifier = request.getUsernameOrEmail().trim();
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier.toLowerCase()))
                .orElse(null);

        // 3. Validate user presence and password
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            rateLimitingService.loginFailed(rateLimitKey);
            throw new UnauthorizedException("Invalid username/email or password");
        }

        if (!user.isActive()) {
            throw new UnauthorizedException("Your account has been deactivated. Please contact customer support.");
        }

        // Login succeeded, clear failed attempts
        rateLimitingService.loginSucceeded(rateLimitKey);

        // 4. Generate JWT access token
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String accessToken = tokenProvider.generateAccessToken(userPrincipal);

        // 5. Generate secure refresh token, store hash in DB, and set HttpOnly SameSite cookie
        String rawRefreshToken = tokenProvider.generateSecureRandomToken();
        String tokenHash = tokenProvider.hashToken(rawRefreshToken);
        LocalDateTime expiry = LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000);

        RefreshToken refreshToken = new RefreshToken(tokenHash, user, expiry);
        refreshTokenRepository.save(refreshToken);

        setRefreshTokenCookie(httpResponse, rawRefreshToken, refreshExpirationMs / 1000);

        UserSummaryDto userSummary = new UserSummaryDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        );

        return new AuthResponse(accessToken, tokenProvider.getExpirationMs() / 1000, userSummary);
    }

    @Override
    @Transactional
    public ApiResponse<Void> forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // Security best practice: Never reveal if an email exists in our system
        userRepository.findByEmail(email).ifPresent(user -> {
            // Invalidate any existing reset tokens for this user
            passwordResetTokenRepository.deleteByUser(user);

            // Generate cryptographically secure token
            String rawToken = tokenProvider.generateSecureRandomToken();
            String tokenHash = tokenProvider.hashToken(rawToken);
            LocalDateTime expiry = LocalDateTime.now().plusMinutes(15);

            PasswordResetToken resetToken = new PasswordResetToken(tokenHash, user, expiry);
            passwordResetTokenRepository.save(resetToken);

            // Send password reset email link
            mailService.sendPasswordResetEmail(user.getEmail(), rawToken);
        });

        return ApiResponse.ok("If an account with that email exists, password reset instructions have been sent.");
    }

    @Override
    @Transactional
    public ApiResponse<Void> resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        String tokenHash = tokenProvider.hashToken(request.getToken().trim());
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired password reset token"));

        if (resetToken.isUsed()) {
            throw new InvalidTokenException("This password reset token has already been used");
        }

        if (resetToken.isExpired()) {
            throw new InvalidTokenException("This password reset token has expired. Please request a new one");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return ApiResponse.ok("Password has been reset successfully. You can now log in with your new password.");
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(String rawRefreshToken, HttpServletResponse httpResponse) {
        if (rawRefreshToken == null || rawRefreshToken.trim().isEmpty()) {
            throw new UnauthorizedException("Refresh token is missing");
        }

        String tokenHash = tokenProvider.hashToken(rawRefreshToken.trim());
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (storedToken.isRevoked() || storedToken.isExpired()) {
            refreshTokenRepository.delete(storedToken);
            throw new UnauthorizedException("Refresh token is expired or revoked. Please log in again");
        }

        User user = storedToken.getUser();
        if (!user.isActive()) {
            throw new UnauthorizedException("User account is inactive");
        }

        // Token rotation: Revoke old refresh token and issue new one
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        String newRawRefreshToken = tokenProvider.generateSecureRandomToken();
        String newTokenHash = tokenProvider.hashToken(newRawRefreshToken);
        LocalDateTime expiry = LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000);

        RefreshToken newRefreshToken = new RefreshToken(newTokenHash, user, expiry);
        refreshTokenRepository.save(newRefreshToken);

        setRefreshTokenCookie(httpResponse, newRawRefreshToken, refreshExpirationMs / 1000);

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String accessToken = tokenProvider.generateAccessToken(userPrincipal);

        UserSummaryDto userSummary = new UserSummaryDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        );

        return new AuthResponse(accessToken, tokenProvider.getExpirationMs() / 1000, userSummary);
    }

    @Override
    @Transactional
    public ApiResponse<Void> logout(String rawRefreshToken, HttpServletResponse httpResponse) {
        if (rawRefreshToken != null && !rawRefreshToken.trim().isEmpty()) {
            String tokenHash = tokenProvider.hashToken(rawRefreshToken.trim());
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });
        }

        // Expire cookie
        ResponseCookie cookie = ResponseCookie.from(refreshCookieName, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ApiResponse.ok("Logged out successfully");
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String tokenValue, long maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from(refreshCookieName, tokenValue)
                .httpOnly(true)
                .secure(false) // Set to true when running over HTTPS in production
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) return "unknown";
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
