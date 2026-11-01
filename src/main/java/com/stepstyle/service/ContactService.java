package com.stepstyle.service;

import com.stepstyle.dto.ApiResponse;
import com.stepstyle.dto.ContactRequestDto;
import com.stepstyle.dto.ContactResponseDto;

import java.util.List;

public interface ContactService {

    ApiResponse<ContactResponseDto> submitContactMessage(ContactRequestDto request);

    List<ContactResponseDto> getAllContactMessages();

    ApiResponse<Void> markResolved(Long id);
}
