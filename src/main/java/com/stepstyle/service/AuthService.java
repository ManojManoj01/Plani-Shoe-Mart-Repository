package com.stepstyle.service;

import com.stepstyle.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {

    ApiResponse<UserSummaryDto> signup(SignupRequest request);

    ApiResponse<UserSummaryDto> register(RegisterRequest request);

    AuthResponse login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse);

    ApiResponse<Void> forgotPassword(ForgotPasswordRequest request);

    ApiResponse<Void> resetPassword(ResetPasswordRequest request);

    AuthResponse refreshToken(String refreshToken, HttpServletResponse httpResponse);

    ApiResponse<Void> logout(String refreshToken, HttpServletResponse httpResponse);
}
