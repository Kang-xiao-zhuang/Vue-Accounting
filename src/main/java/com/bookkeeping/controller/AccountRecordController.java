package com.bookkeeping.controller;

import com.bookkeeping.entity.AccountRecord;
import com.bookkeeping.security.SecurityUtil;
import com.bookkeeping.service.AccountRecordService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/records")
public class AccountRecordController {

    private final AccountRecordService service;

    public AccountRecordController(AccountRecordService service) {
        this.service = service;
    }

    @GetMapping
    public List<AccountRecord> list() {
        return service.findAll(SecurityUtil.currentUserId());
    }

    @PostMapping
    public AccountRecord create(@RequestBody AccountRecord record) {
        return service.create(record, SecurityUtil.currentUserId());
    }

    @PutMapping("/{id}")
    public AccountRecord update(@PathVariable Long id, @RequestBody AccountRecord record) {
        return service.update(id, record, SecurityUtil.currentUserId());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id, SecurityUtil.currentUserId());
    }

    @DeleteMapping
    public void deleteAll() {
        service.deleteAll(SecurityUtil.currentUserId());
    }
}
