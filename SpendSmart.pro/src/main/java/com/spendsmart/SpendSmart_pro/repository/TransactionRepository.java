package com.spendsmart.SpendSmart_pro.repository;

import com.spendsmart.SpendSmart_pro.entity.Transaction;
import com.spendsmart.SpendSmart_pro.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("""
            SELECT t FROM Transaction t
            WHERE t.user.id = :userId
            AND (:type IS NULL OR t.type = :type)
            AND (:categoryId IS NULL OR t.category.id = :categoryId)
            AND (:startDate IS NULL OR t.date >= :startDate)
            AND (:endDate IS NULL OR t.date <= :endDate)
            ORDER BY t.date DESC, t.createdAt DESC
            """)
    List<Transaction> findTransactions(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    List<Transaction> findTop10ByUserIdOrderByDateDesc(Long userId);

    List<Transaction> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);
}
