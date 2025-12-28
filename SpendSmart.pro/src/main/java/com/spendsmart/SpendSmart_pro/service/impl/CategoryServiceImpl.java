package com.spendsmart.SpendSmart_pro.service.impl;

import com.spendsmart.SpendSmart_pro.dto.request.CategoryRequest;
import com.spendsmart.SpendSmart_pro.dto.response.CategoryResponse;
import com.spendsmart.SpendSmart_pro.entity.Category;
import com.spendsmart.SpendSmart_pro.enums.CategoryType;
import com.spendsmart.SpendSmart_pro.exception.DuplicateResourceException;
import com.spendsmart.SpendSmart_pro.exception.ResourceNotFoundException;
import com.spendsmart.SpendSmart_pro.repository.CategoryRepository;
import com.spendsmart.SpendSmart_pro.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll(CategoryType type) {
        List<Category> categories = type == null ? categoryRepository.findAll() : categoryRepository.findByType(type);
        return categories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToResponse(category);
    }

    @Override
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCaseAndType(request.getName(), request.getType())) {
            throw new DuplicateResourceException("Category already exists for type " + request.getType());
        }

        Category category = Category.builder()
                .name(request.getName().trim())
                .type(request.getType())
                .description(request.getDescription())
                .build();

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        boolean nameChanged = !existing.getName().equalsIgnoreCase(request.getName())
                || existing.getType() != request.getType();

        if (nameChanged && categoryRepository.existsByNameIgnoreCaseAndType(request.getName(), request.getType())) {
            throw new DuplicateResourceException("Another category already exists with same name and type");
        }

        existing.setName(request.getName().trim());
        existing.setType(request.getType());
        existing.setDescription(request.getDescription());

        return mapToResponse(categoryRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        categoryRepository.delete(existing);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .description(category.getDescription())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
