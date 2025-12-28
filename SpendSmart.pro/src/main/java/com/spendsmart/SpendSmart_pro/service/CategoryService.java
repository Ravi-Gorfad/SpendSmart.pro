package com.spendsmart.SpendSmart_pro.service;

import com.spendsmart.SpendSmart_pro.dto.request.CategoryRequest;
import com.spendsmart.SpendSmart_pro.dto.response.CategoryResponse;
import com.spendsmart.SpendSmart_pro.enums.CategoryType;

import java.util.List;

public interface CategoryService {

    List<CategoryResponse> getAll(CategoryType type);

    CategoryResponse getById(Long id);

    CategoryResponse create(CategoryRequest request);

    CategoryResponse update(Long id, CategoryRequest request);

    void delete(Long id);
}
