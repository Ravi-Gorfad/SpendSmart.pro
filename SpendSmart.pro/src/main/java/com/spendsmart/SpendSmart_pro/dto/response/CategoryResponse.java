package com.spendsmart.SpendSmart_pro.dto.response;

import com.spendsmart.SpendSmart_pro.enums.CategoryType;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class CategoryResponse {
    Long id;
    String name;
    CategoryType type;
    String description;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}

