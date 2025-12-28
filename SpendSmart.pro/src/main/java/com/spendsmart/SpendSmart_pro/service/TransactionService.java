package com.spendsmart.SpendSmart_pro.service;

import com.spendsmart.SpendSmart_pro.dto.request.TransactionRequest;
import com.spendsmart.SpendSmart_pro.dto.response.DashboardSummaryResponse;
import com.spendsmart.SpendSmart_pro.dto.response.TransactionResponse;
import com.spendsmart.SpendSmart_pro.enums.TransactionType;

import java.time.LocalDate;
import java.util.List;

public interface TransactionService {

    TransactionResponse create(TransactionRequest request);

    TransactionResponse update(Long id, TransactionRequest request);

    void delete(Long id);

    TransactionResponse getById(Long id);

    List<TransactionResponse> getTransactions(LocalDate startDate,
                                              LocalDate endDate,
                                              TransactionType type,
                                              Long categoryId);

    DashboardSummaryResponse getDashboardSummary(LocalDate startDate, LocalDate endDate);
}