package com.spendsmart.SpendSmart_pro.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.spendsmart.SpendSmart_pro.enums.TransactionType;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Value
@Builder
public class TransactionResponse {
    Long id;
    TransactionType type;
    BigDecimal amount;
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate date;
    String description;
    Long categoryId;
    String categoryName;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}

