package com.bookkeeping.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bookkeeping.entity.Budget;
import com.bookkeeping.mapper.BudgetMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetMapper mapper;

    public BudgetService(BudgetMapper mapper) {
        this.mapper = mapper;
    }

    public List<Budget> findAll(Long userId) {
        return mapper.selectList(new LambdaQueryWrapper<Budget>()
                .eq(Budget::getUserId, userId).orderByAsc(Budget::getCategory));
    }

    /** Create or update the budget for a (user, category) pair. */
    public Budget upsert(Budget input, Long userId) {
        if (input.getMonthlyLimit() == null || input.getMonthlyLimit().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "monthlyLimit must be greater than 0");
        }
        String category = input.getCategory() == null ? "" : input.getCategory().trim();
        Budget existing = mapper.selectOne(new LambdaQueryWrapper<Budget>()
                .eq(Budget::getUserId, userId).eq(Budget::getCategory, category));
        if (existing != null) {
            existing.setMonthlyLimit(input.getMonthlyLimit());
            mapper.updateById(existing);
            return existing;
        }
        Budget budget = new Budget();
        budget.setUserId(userId);
        budget.setCategory(category);
        budget.setMonthlyLimit(input.getMonthlyLimit());
        mapper.insert(budget);
        return budget;
    }

    public void delete(Long id, Long userId) {
        Budget existing = mapper.selectById(id);
        if (existing == null) {
            return;
        }
        if (existing.getUserId() == null || !existing.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found: " + id);
        }
        mapper.deleteById(id);
    }
}
