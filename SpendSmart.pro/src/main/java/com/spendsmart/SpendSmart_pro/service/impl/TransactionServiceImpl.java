package com.spendsmart.SpendSmart_pro.service.impl;

import com.spendsmart.SpendSmart_pro.dto.request.TransactionRequest;
import com.spendsmart.SpendSmart_pro.dto.response.DashboardSummaryResponse;
import com.spendsmart.SpendSmart_pro.dto.response.TransactionResponse;
import com.spendsmart.SpendSmart_pro.entity.Category;
import com.spendsmart.SpendSmart_pro.entity.Transaction;
import com.spendsmart.SpendSmart_pro.entity.User;
import com.spendsmart.SpendSmart_pro.enums.CategoryType;
import com.spendsmart.SpendSmart_pro.enums.TransactionType;
import com.spendsmart.SpendSmart_pro.exception.BadRequestException;
import com.spendsmart.SpendSmart_pro.exception.ResourceNotFoundException;
import com.spendsmart.SpendSmart_pro.repository.CategoryRepository;
import com.spendsmart.SpendSmart_pro.repository.TransactionRepository;
import com.spendsmart.SpendSmart_pro.repository.UserRepository;
import com.spendsmart.SpendSmart_pro.security.SecurityUtils;
import com.spendsmart.SpendSmart_pro.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    public TransactionResponse create(TransactionRequest request) {
        User user = getCurrentUser();
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Transaction transaction = Transaction.builder()
                .user(user)
                .category(category)
                .type(request.getType())
                .amount(request.getAmount())
                .date(request.getDate())
                .description(request.getDescription())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return mapToResponse(saved);
    }

    @Override
    public TransactionResponse update(Long id, TransactionRequest request) {
        User user = getCurrentUser();
        Transaction existing = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!existing.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You cannot modify this transaction");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        existing.setCategory(category);
        existing.setType(request.getType());
        existing.setAmount(request.getAmount());
        existing.setDate(request.getDate());
        existing.setDescription(request.getDescription());

        return mapToResponse(transactionRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        User user = getCurrentUser();
        Transaction existing = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!existing.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You cannot delete this transaction");
        }
        transactionRepository.delete(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getById(Long id) {
        User user = getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return mapToResponse(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactions(LocalDate startDate,
                                                     LocalDate endDate,
                                                     TransactionType type,
                                                     Long categoryId) {
        User user = getCurrentUser();
        List<Transaction> transactions = transactionRepository.findTransactions(
                user.getId(),
                type,
                categoryId,
                startDate,
                endDate
        );
        return transactions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(LocalDate startDate, LocalDate endDate) {
        User user = getCurrentUser();
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        LocalDate start = startDate != null ? startDate : end.minusDays(29);

        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(user.getId(), start, end);

        BigDecimal totalIncome = sumByType(transactions, TransactionType.INCOME);
        BigDecimal totalExpense = sumByType(transactions, TransactionType.EXPENSE);
        BigDecimal balance = totalIncome.subtract(totalExpense);

        long days = Math.max(1, ChronoUnit.DAYS.between(start, end) + 1);
        BigDecimal averageDailyExpense = totalExpense.divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP);

        Map<Long, List<Transaction>> groupedByCategory = transactions.stream()
                .collect(Collectors.groupingBy(t -> t.getCategory().getId()));

        List<DashboardSummaryResponse.CategoryBreakdown> categoryBreakdown = groupedByCategory.values().stream()
                .map(list -> {
                    Transaction sample = list.get(0);
                    BigDecimal sum = list.stream()
                            .filter(t -> t.getType() == TransactionType.EXPENSE)
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    double percentage = totalExpense.compareTo(BigDecimal.ZERO) == 0
                            ? 0
                            : sum.multiply(BigDecimal.valueOf(100))
                            .divide(totalExpense, 2, RoundingMode.HALF_UP)
                            .doubleValue();

                    return DashboardSummaryResponse.CategoryBreakdown.builder()
                            .categoryId(sample.getCategory().getId())
                            .categoryName(sample.getCategory().getName())
                            .type(sample.getCategory().getType() != null ? sample.getCategory().getType() : CategoryType.EXPENSE)
                            .amount(sum)
                            .percentage(percentage)
                            .build();
                })
                .sorted(Comparator.comparing(DashboardSummaryResponse.CategoryBreakdown::getAmount).reversed())
                .collect(Collectors.toList());

        Map<YearMonth, List<Transaction>> groupedByMonth = transactions.stream()
                .collect(Collectors.groupingBy(t -> YearMonth.from(t.getDate())));

        List<DashboardSummaryResponse.MonthlyTrend> monthlyTrends = groupedByMonth.entrySet().stream()
                .map(entry -> {
                    BigDecimal monthIncome = sumByType(entry.getValue(), TransactionType.INCOME);
                    BigDecimal monthExpenses = sumByType(entry.getValue(), TransactionType.EXPENSE);
                    return DashboardSummaryResponse.MonthlyTrend.builder()
                            .month(entry.getKey())
                            .income(monthIncome)
                            .expense(monthExpenses)
                            .build();
                })
                .sorted(Comparator.comparing(DashboardSummaryResponse.MonthlyTrend::getMonth))
                .collect(Collectors.toList());

        return DashboardSummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(balance)
                .averageDailyExpense(averageDailyExpense)
                .totalTransactions(transactions.size())
                .categoryBreakdown(categoryBreakdown)
                .monthlyTrend(monthlyTrends)
                .build();
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .date(transaction.getDate())
                .description(transaction.getDescription())
                .categoryId(transaction.getCategory().getId())
                .categoryName(transaction.getCategory().getName())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }

    private BigDecimal sumByType(List<Transaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(t -> t.getType() == type)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private User getCurrentUser() {
        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            throw new BadRequestException("Unable to identify current user");
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
