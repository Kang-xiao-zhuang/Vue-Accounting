package com.bookkeeping.controller;

import com.bookkeeping.entity.AccountRecord;
import com.bookkeeping.service.AccountRecordService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public List<AccountRecord> list(@RequestParam(required = false) Long userId) {
        return service.findAll(userId);
    }

    @PostMapping
    public AccountRecord create(@RequestBody AccountRecord record) {
        return service.create(record);
    }

    @PutMapping("/{id}")
    public AccountRecord update(@PathVariable Long id, @RequestBody AccountRecord record) {
        return service.update(id, record);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @DeleteMapping
    public void deleteAll() {
        service.deleteAll();
    }
}
