package com.bookkeeping.controller;

import com.bookkeeping.entity.Budget;
import com.bookkeeping.security.SecurityUtil;
import com.bookkeeping.service.BudgetService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService service;

    public BudgetController(BudgetService service) {
        this.service = service;
    }

    @GetMapping
    public List<Budget> list() {
        return service.findAll(SecurityUtil.currentUserId());
    }

    /** Create or update the budget for a category (or the overall budget when category is empty). */
    @PutMapping
    public Budget upsert(@RequestBody Budget budget) {
        return service.upsert(budget, SecurityUtil.currentUserId());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id, SecurityUtil.currentUserId());
    }
}
