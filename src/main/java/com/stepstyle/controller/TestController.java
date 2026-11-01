package com.stepstyle.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Health & Testing", description = "Endpoints for testing frontend-to-backend connectivity")
public class TestController {

    @GetMapping("/test")
    @Operation(summary = "Test backend connectivity", description = "Returns plain text confirming the Spring Boot backend is active and reachable")
    public ResponseEntity<String> testConnection() {
        return ResponseEntity.ok("StepStyle Footwear Backend connected successfully! (Spring Boot 3 REST API on Port 8080)");
    }
}
