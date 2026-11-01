package com.stepstyle.service.impl;

import com.stepstyle.dto.ApiResponse;
import com.stepstyle.dto.ContactRequestDto;
import com.stepstyle.dto.ContactResponseDto;
import com.stepstyle.entity.ContactMessage;
import com.stepstyle.exception.ResourceNotFoundException;
import com.stepstyle.repository.ContactMessageRepository;
import com.stepstyle.service.ContactService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactServiceImpl implements ContactService {

    private final ContactMessageRepository contactMessageRepository;

    public ContactServiceImpl(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    @Override
    @Transactional
    public ApiResponse<ContactResponseDto> submitContactMessage(ContactRequestDto request) {
        ContactMessage message = new ContactMessage(
                request.getName().trim(),
                request.getEmail().trim().toLowerCase(),
                request.getPhone() != null ? request.getPhone().trim() : null,
                request.getSubject().trim(),
                request.getMessage().trim()
        );

        ContactMessage saved = contactMessageRepository.save(message);

        ContactResponseDto dto = mapToDto(saved);
        return ApiResponse.ok("Thank you! Your enquiry has been received and our support team will respond shortly.", dto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactResponseDto> getAllContactMessages() {
        return contactMessageRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ApiResponse<Void> markResolved(Long id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact enquiry not found with id: " + id));
        message.setResolved(true);
        contactMessageRepository.save(message);
        return ApiResponse.ok("Contact enquiry marked as resolved.");
    }

    private ContactResponseDto mapToDto(ContactMessage entity) {
        return new ContactResponseDto(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getSubject(),
                entity.getMessage(),
                entity.isResolved(),
                entity.getCreatedAt()
        );
    }
}
