package com.stepstyle.service;

import com.stepstyle.dto.CategoryRequestDto;
import com.stepstyle.dto.CategoryResponseDto;

import java.util.List;

public interface CategoryService {
    List<CategoryResponseDto> getAllCategories(boolean onlyActive);
    CategoryResponseDto getCategoryById(Long id);
    CategoryResponseDto createCategory(CategoryRequestDto requestDto);
    CategoryResponseDto updateCategory(Long id, CategoryRequestDto requestDto);
    void deleteCategory(Long id);
    void seedDefaultCategoriesIfEmpty();
}
