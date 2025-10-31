package com.spendsmart.SpendSmart_pro.repository;

import com.spendsmart.SpendSmart_pro.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepositry extends JpaRepository<Category,Long> {
}
