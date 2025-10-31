package com.spendsmart.SpendSmart_pro.repository;

import com.spendsmart.SpendSmart_pro.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<Long, User> {
}
