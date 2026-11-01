package com.stepstyle.service.impl;

import com.stepstyle.dto.CategoryRequestDto;
import com.stepstyle.dto.CategoryResponseDto;
import com.stepstyle.entity.Category;
import com.stepstyle.exception.BadRequestException;
import com.stepstyle.exception.ResourceNotFoundException;
import com.stepstyle.repository.CategoryRepository;
import com.stepstyle.repository.ProductRepository;
import com.stepstyle.service.CategoryService;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    public List<CategoryResponseDto> getAllCategories(boolean onlyActive) {
        List<Category> categories = onlyActive
                ? categoryRepository.findByActiveTrueOrderByDisplayOrderAsc()
                : categoryRepository.findAllByOrderByDisplayOrderAsc();

        return categories.stream().map(cat -> {
            long count = productRepository.countByCategoryIgnoreCaseAndActiveTrue(cat.getName());
            if (count == 0 && cat.getSlug() != null) {
                count = productRepository.countByCategoryIgnoreCaseAndActiveTrue(cat.getSlug());
            }
            return new CategoryResponseDto(
                    cat.getId(),
                    cat.getName(),
                    cat.getSlug(),
                    cat.getDescription(),
                    cat.getImageUrl(),
                    cat.getDisplayOrder(),
                    cat.isActive(),
                    count
            );
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryResponseDto createCategory(CategoryRequestDto requestDto) {
        String trimmedName = requestDto.getName().trim();

        if (categoryRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new BadRequestException("Category with name '" + trimmedName + "' already exists");
        }

        String slug = requestDto.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            slug = trimmedName.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        } else {
            slug = slug.trim().toLowerCase();
        }

        if (categoryRepository.existsBySlugIgnoreCase(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        Category category = new Category(
                trimmedName,
                slug,
                requestDto.getDescription(),
                requestDto.getImageUrl(),
                requestDto.getDisplayOrder()
        );

        Category saved = categoryRepository.save(category);
        return new CategoryResponseDto(
                saved.getId(),
                saved.getName(),
                saved.getSlug(),
                saved.getDescription(),
                saved.getImageUrl(),
                saved.getDisplayOrder(),
                saved.isActive(),
                0
        );
    }

    @Override
    public CategoryResponseDto getCategoryById(Long id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        long count = productRepository.countByCategoryIgnoreCaseAndActiveTrue(cat.getName());
        if (count == 0 && cat.getSlug() != null) {
            count = productRepository.countByCategoryIgnoreCaseAndActiveTrue(cat.getSlug());
        }

        return new CategoryResponseDto(
                cat.getId(),
                cat.getName(),
                cat.getSlug(),
                cat.getDescription(),
                cat.getImageUrl(),
                cat.getDisplayOrder(),
                cat.isActive(),
                count
        );
    }

    @Override
    @Transactional
    public CategoryResponseDto updateCategory(Long id, CategoryRequestDto requestDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        String trimmedName = requestDto.getName().trim();
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(trimmedName, id)) {
            throw new BadRequestException("Another category with name '" + trimmedName + "' already exists");
        }

        String slug = requestDto.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            slug = trimmedName.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        } else {
            slug = slug.trim().toLowerCase();
        }

        if (categoryRepository.existsBySlugIgnoreCaseAndIdNot(slug, id)) {
            throw new BadRequestException("Another category with slug '" + slug + "' already exists");
        }

        category.setName(trimmedName);
        category.setSlug(slug);
        if (requestDto.getDescription() != null) {
            category.setDescription(requestDto.getDescription().trim());
        }
        if (requestDto.getImageUrl() != null && !requestDto.getImageUrl().trim().isEmpty()) {
            category.setImageUrl(requestDto.getImageUrl().trim());
        }
        if (requestDto.getDisplayOrder() != null) {
            category.setDisplayOrder(requestDto.getDisplayOrder());
        }

        Category updated = categoryRepository.save(category);
        long count = productRepository.countByCategoryIgnoreCaseAndActiveTrue(updated.getName());
        if (count == 0 && updated.getSlug() != null) {
            count = productRepository.countByCategoryIgnoreCaseAndActiveTrue(updated.getSlug());
        }

        return new CategoryResponseDto(
                updated.getId(),
                updated.getName(),
                updated.getSlug(),
                updated.getDescription(),
                updated.getImageUrl(),
                updated.getDisplayOrder(),
                updated.isActive(),
                count
        );
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Strict Requirement: Block deletion of a category still assigned to products
        long assignedCount = productRepository.countByCategoryIgnoreCaseAndActiveTrue(category.getName());
        if (assignedCount == 0 && category.getSlug() != null) {
            assignedCount = productRepository.countByCategoryIgnoreCaseAndActiveTrue(category.getSlug());
        }

        if (assignedCount > 0) {
            throw new BadRequestException("Cannot delete category '" + category.getName() + "' because it is currently assigned to "
                    + assignedCount + " product(s). Please reassign or remove the products before deleting this category.");
        }

        try {
            categoryRepository.delete(category);
            categoryRepository.flush();
        } catch (Exception ex) {
            category.setActive(false);
            categoryRepository.save(category);
        }
    }

    @Override
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedDefaultCategoriesIfEmpty() {
        if (categoryRepository.count() > 0) {
            return;
        }

        String[][] defaults = new String[][]{
                {"Shoes", "shoes", "Athletic, sports, formal, sneakers, and casual footwear for daily life and performance", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"},
                {"Chappals", "chappals", "Traditional and modern handcrafted leather and ethnic daily wear chappals", "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=600&q=80"},
                {"Slippers", "slippers", "Comfortable indoor slides, flip-flops, and ergonomic soft memory-foam footwear", "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80"}
        };

        int order = 1;
        for (String[] def : defaults) {
            categoryRepository.save(new Category(def[0], def[1], def[2], def[3], order++));
        }
    }
}
