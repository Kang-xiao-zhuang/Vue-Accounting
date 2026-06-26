package com.bookkeeping.service;

import com.bookkeeping.entity.AccountRecord;
import com.bookkeeping.repository.AccountRecordRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.util.List;

@Service
public class AccountRecordService {

    private final AccountRecordRepository repository;

    public AccountRecordService(AccountRecordRepository repository) {
        this.repository = repository;
    }

    public List<AccountRecord> findAll(Long userId) {
        Sort sort = Sort.by(Sort.Direction.DESC, "date", "id");
        if (userId != null) {
            return repository.findByUserId(userId, sort);
        }
        return repository.findAll(sort);
    }

    public AccountRecord create(AccountRecord record) {
        record.setId(null);
        return repository.save(record);
    }

    public AccountRecord update(Long id, AccountRecord input) {
        AccountRecord existing = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Record not found: " + id));
        existing.setType(input.getType());
        existing.setCategory(input.getCategory());
        existing.setAmount(input.getAmount());
        existing.setDate(input.getDate());
        existing.setNote(input.getNote());
        if (input.getUserId() != null) {
            existing.setUserId(input.getUserId());
        }
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Transactional
    public void deleteAll(Long userId) {
        if (userId != null) {
            repository.deleteByUserId(userId);
        } else {
            repository.deleteAllInBatch();
        }
    }
}
