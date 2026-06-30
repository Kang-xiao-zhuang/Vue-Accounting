package com.bookkeeping.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bookkeeping.entity.AccountRecord;
import com.bookkeeping.entity.RecurringRule;
import com.bookkeeping.mapper.AccountRecordMapper;
import com.bookkeeping.mapper.RecurringRuleMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RecurringService {

    private static final Set<String> TYPES = new HashSet<>(Arrays.asList("income", "expense"));
    private static final Set<String> FREQS = new HashSet<>(Arrays.asList("DAILY", "WEEKLY", "MONTHLY"));

    private final RecurringRuleMapper ruleMapper;
    private final AccountRecordMapper recordMapper;

    public RecurringService(RecurringRuleMapper ruleMapper, AccountRecordMapper recordMapper) {
        this.ruleMapper = ruleMapper;
        this.recordMapper = recordMapper;
    }

    public List<RecurringRule> findAll(Long userId) {
        return ruleMapper.selectList(new LambdaQueryWrapper<RecurringRule>()
                .eq(RecurringRule::getUserId, userId).orderByAsc(RecurringRule::getId));
    }

    public RecurringRule create(RecurringRule rule, Long userId) {
        validate(rule);
        rule.setId(null);
        rule.setUserId(userId);
        rule.setCategory(rule.getCategory().trim());
        rule.setFrequency(rule.getFrequency().toUpperCase());
        rule.setCreatedAt(LocalDateTime.now());
        ruleMapper.insert(rule);
        return rule;
    }

    public RecurringRule update(Long id, RecurringRule input, Long userId) {
        validate(input);
        RecurringRule existing = requireOwned(id, userId);
        existing.setType(input.getType());
        existing.setCategory(input.getCategory().trim());
        existing.setAmount(input.getAmount());
        existing.setNote(input.getNote());
        existing.setFrequency(input.getFrequency().toUpperCase());
        existing.setNextRunDate(input.getNextRunDate());
        existing.setActive(input.isActive());
        ruleMapper.updateById(existing);
        return existing;
    }

    public void delete(Long id, Long userId) {
        RecurringRule existing = ruleMapper.selectById(id);
        if (existing == null) {
            return;
        }
        if (existing.getUserId() == null || !existing.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Recurring rule not found: " + id);
        }
        ruleMapper.deleteById(id);
    }

    /** Materialize any due occurrences for one user. Returns the number of records created. */
    @Transactional
    public int runDue(Long userId) {
        int created = 0;
        LocalDate today = LocalDate.now();
        for (RecurringRule rule : findAll(userId)) {
            created += materialize(rule, today);
        }
        return created;
    }

    /** Materialize due occurrences for all users (used by the scheduled job). */
    @Transactional
    public int runAllDue() {
        int created = 0;
        LocalDate today = LocalDate.now();
        List<RecurringRule> active = ruleMapper.selectList(
                new LambdaQueryWrapper<RecurringRule>().eq(RecurringRule::isActive, true));
        for (RecurringRule rule : active) {
            created += materialize(rule, today);
        }
        return created;
    }

    private int materialize(RecurringRule rule, LocalDate today) {
        if (!rule.isActive() || rule.getNextRunDate() == null) {
            return 0;
        }
        int created = 0;
        LocalDate next = rule.getNextRunDate();
        while (!next.isAfter(today)) {
            AccountRecord record = new AccountRecord();
            record.setUserId(rule.getUserId());
            record.setType(rule.getType());
            record.setCategory(rule.getCategory());
            record.setAmount(rule.getAmount());
            record.setDate(next);
            record.setNote(rule.getNote());
            record.setCreatedAt(LocalDateTime.now());
            recordMapper.insert(record);
            created++;
            next = advance(next, rule.getFrequency());
        }
        if (created > 0) {
            rule.setNextRunDate(next);
            ruleMapper.updateById(rule);
        }
        return created;
    }

    private LocalDate advance(LocalDate date, String frequency) {
        switch (frequency) {
            case "DAILY": return date.plusDays(1);
            case "WEEKLY": return date.plusWeeks(1);
            case "MONTHLY": return date.plusMonths(1);
            default: return date.plusMonths(1);
        }
    }

    private void validate(RecurringRule r) {
        if (r.getType() == null || !TYPES.contains(r.getType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "type must be 'income' or 'expense'");
        }
        if (r.getCategory() == null || r.getCategory().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "category is required");
        }
        if (r.getAmount() == null || r.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "amount must be greater than 0");
        }
        if (r.getFrequency() == null || !FREQS.contains(r.getFrequency().toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "frequency must be DAILY, WEEKLY or MONTHLY");
        }
        if (r.getNextRunDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "nextRunDate is required");
        }
    }

    private RecurringRule requireOwned(Long id, Long userId) {
        RecurringRule rule = ruleMapper.selectById(id);
        if (rule == null || rule.getUserId() == null || !rule.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Recurring rule not found: " + id);
        }
        return rule;
    }
}
