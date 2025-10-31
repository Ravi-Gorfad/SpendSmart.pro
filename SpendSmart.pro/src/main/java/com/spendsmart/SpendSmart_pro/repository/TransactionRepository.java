package com.spendsmart.SpendSmart_pro.repository;

import com.spendsmart.SpendSmart_pro.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction,Long> {
}
