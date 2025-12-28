package com.spendsmart.SpendSmart_pro.repository;

import com.spendsmart.SpendSmart_pro.entity.Category;
import com.spendsmart.SpendSmart_pro.enums.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByNameIgnoreCaseAndType(String name, CategoryType type);
    Optional<Category> findByNameIgnoreCaseAndType(String name, CategoryType type);
    List<Category> findByType(CategoryType type);
}

