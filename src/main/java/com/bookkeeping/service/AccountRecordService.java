package com.bookkeeping.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bookkeeping.entity.AccountRecord;
import com.bookkeeping.mapper.AccountRecordMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class AccountRecordService {

    private static final Set<String> TYPES = new HashSet<>(Arrays.asList("income", "expense"));

    private final AccountRecordMapper mapper;

    public AccountRecordService(AccountRecordMapper mapper) {
        this.mapper = mapper;
    }

    public List<AccountRecord> findAll(Long userId) {
        return mapper.selectList(new LambdaQueryWrapper<AccountRecord>()
                .eq(AccountRecord::getUserId, userId)
                .orderByDesc(AccountRecord::getDate)
                .orderByDesc(AccountRecord::getId));
    }

    public AccountRecord create(AccountRecord record, Long userId) {
        validate(record);
        record.setId(null);
        record.setUserId(userId);
        record.setCategory(record.getCategory().trim());
        record.setCreatedAt(LocalDateTime.now());
        mapper.insert(record);
        return record;
    }

    public AccountRecord update(Long id, AccountRecord input, Long userId) {
        validate(input);
        AccountRecord existing = mapper.selectById(id);
        requireOwner(existing, userId);
        existing.setType(input.getType());
        existing.setCategory(input.getCategory().trim());
        existing.setAmount(input.getAmount());
        existing.setDate(input.getDate());
        existing.setNote(input.getNote());
        mapper.updateById(existing);
        return existing;
    }

    public void delete(Long id, Long userId) {
        AccountRecord existing = mapper.selectById(id);
        if (existing == null) {
            return;
        }
        requireOwner(existing, userId);
        mapper.deleteById(id);
    }

    public void deleteAll(Long userId) {
        mapper.delete(new LambdaQueryWrapper<AccountRecord>().eq(AccountRecord::getUserId, userId));
    }

    private void validate(AccountRecord r) {
        if (r.getType() == null || !TYPES.contains(r.getType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "type must be 'income' or 'expense'");
        }
        if (r.getCategory() == null || r.getCategory().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "category is required");
        }
        if (r.getAmount() == null || r.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "amount must be greater than 0");
        }
        if (r.getDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date is required");
        }
    }

    /** Treat someone else's (or a missing) record as not found, to avoid leaking ids. */
    private void requireOwner(AccountRecord existing, Long userId) {
        if (existing == null || existing.getUserId() == null || !existing.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found");
        }
    }
}
