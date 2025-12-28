package com.spendsmart.SpendSmart_pro.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.spendsmart.SpendSmart_pro.enums.CategoryType;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

@Value
@Builder
public class DashboardSummaryResponse {
    BigDecimal totalIncome;
    BigDecimal totalExpense;
    BigDecimal balance;
    BigDecimal averageDailyExpense;
    int totalTransactions;
    List<CategoryBreakdown> categoryBreakdown;
    List<MonthlyTrend> monthlyTrend;

    @Value
    @Builder
    public static class CategoryBreakdown {
        Long categoryId;
        String categoryName;
        CategoryType type;
        BigDecimal amount;
        double percentage;
    }

    @Value
    @Builder
    public static class MonthlyTrend {
        @JsonFormat(pattern = "yyyy-MM")
        YearMonth month;
        BigDecimal income;
        BigDecimal expense;
    }
}

