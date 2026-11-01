package com.stepstyle.controller;

import com.stepstyle.dto.ApiResponse;
import com.stepstyle.dto.ContactRequestDto;
import com.stepstyle.dto.ContactResponseDto;
import com.stepstyle.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
@Tag(name = "Contact", description = "Customer support enquiry submission and administration")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    @Operation(summary = "Submit contact form enquiry", description = "Validates input and saves customer message to database")
    public ResponseEntity<ApiResponse<ContactResponseDto>> submitContactMessage(
            @Valid @RequestBody ContactRequestDto request) {
        ApiResponse<ContactResponseDto> response = contactService.submitContactMessage(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get all enquiries (Admin only)", description = "Retrieves all customer support enquiries")
    public ResponseEntity<List<ContactResponseDto>> getAllEnquiries() {
        return ResponseEntity.ok(contactService.getAllContactMessages());
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Mark enquiry as resolved (Admin only)", description = "Marks a customer enquiry as handled")
    public ResponseEntity<ApiResponse<Void>> markResolved(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.markResolved(id));
    }
}
