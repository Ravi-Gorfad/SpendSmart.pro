package com.spendsmart.SpendSmart_pro.config;

import com.spendsmart.SpendSmart_pro.entity.Category;
import com.spendsmart.SpendSmart_pro.enums.CategoryType;
import com.spendsmart.SpendSmart_pro.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CategoryDataSeeder implements ApplicationRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(ApplicationArguments args) {
        seedCategories();
    }

    private void seedCategories() {
        List<CategorySeed> seeds = List.of(
                // Expense categories
                new CategorySeed("Food & Dining", "Restaurants, cafes, takeout and dining out", CategoryType.EXPENSE),
                new CategorySeed("Groceries", "Supermarket and household grocery purchases", CategoryType.EXPENSE),
                new CategorySeed("Shopping", "Clothes, accessories, gadgets and shopping sprees", CategoryType.EXPENSE),
                new CategorySeed("Housing", "Rent, mortgage, maintenance and HOA fees", CategoryType.EXPENSE),
                new CategorySeed("Utilities", "Electricity, water, gas, internet, mobile", CategoryType.EXPENSE),
                new CategorySeed("Transportation", "Fuel, public transit, ride sharing, vehicle maintenance", CategoryType.EXPENSE),
                new CategorySeed("Healthcare", "Doctor visits, medication, insurance co-pays", CategoryType.EXPENSE),
                new CategorySeed("Insurance", "Life, health, auto and other insurance premiums", CategoryType.EXPENSE),
                new CategorySeed("Entertainment", "Movies, concerts, streaming, hobbies and fun", CategoryType.EXPENSE),
                new CategorySeed("Travel", "Flights, hotels, vacations and weekend getaways", CategoryType.EXPENSE),
                new CategorySeed("Education", "Tuition, courses, books and certifications", CategoryType.EXPENSE),
                new CategorySeed("Subscriptions", "Music, streaming, software and recurring subscriptions", CategoryType.EXPENSE),
                new CategorySeed("Gifts & Donations", "Charity, donations and gifting loved ones", CategoryType.EXPENSE),
                new CategorySeed("Personal Care", "Salon, spa, fitness and wellness expenses", CategoryType.EXPENSE),
                new CategorySeed("Taxes", "Income tax, property tax or other government dues", CategoryType.EXPENSE),
                new CategorySeed("Savings Transfer", "Money moved to savings or emergency funds", CategoryType.EXPENSE),
                new CategorySeed("Investment Purchase", "Mutual funds, stock purchases and SIPs", CategoryType.EXPENSE),
                new CategorySeed("Miscellaneous", "Everything that doesn't fit in other categories", CategoryType.EXPENSE),

                // Income categories
                new CategorySeed("Salary", "Monthly or bi-weekly salary credited", CategoryType.INCOME),
                new CategorySeed("Bonus", "Annual bonus, incentives or performance bonus", CategoryType.INCOME),
                new CategorySeed("Freelancing", "Side gigs, consulting or freelance projects", CategoryType.INCOME),
                new CategorySeed("Investments", "Capital gains, interest received or trading profits", CategoryType.INCOME),
                new CategorySeed("Rental Income", "Income from renting out property or assets", CategoryType.INCOME),
                new CategorySeed("Refunds & Reimbursements", "Refunds from merchants or expense reimbursements", CategoryType.INCOME),
                new CategorySeed("Interest Income", "Bank interest or fixed deposit returns", CategoryType.INCOME),
                new CategorySeed("Dividends", "Payouts from stocks, mutual funds or equity", CategoryType.INCOME),
                new CategorySeed("Gift Income", "Cash gifts received from friends or family", CategoryType.INCOME),
                new CategorySeed("Other Income", "Any other income source not categorised", CategoryType.INCOME)
        );

        long createdCount = seeds.stream()
                .filter(seed -> !categoryRepository.existsByNameIgnoreCaseAndType(seed.name(), seed.type()))
                .map(seed -> categoryRepository.save(
                        Category.builder()
                                .name(seed.name())
                                .type(seed.type())
                                .description(seed.description())
                                .build()
                ))
                .count();

        if (createdCount > 0) {
            log.info("Seeded {} default categories", createdCount);
        } else {
            log.info("Default categories already present. Skipping seeding.");
        }
    }

    private record CategorySeed(String name, String description, CategoryType type) {
    }
}

