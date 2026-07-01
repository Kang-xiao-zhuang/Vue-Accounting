package com.bookkeeping.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.bookkeeping.entity.AccountRecord;
import com.bookkeeping.security.SecurityUtil;
import com.bookkeeping.service.AccountRecordService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
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

    /** Paginated history with optional type / keyword / date-range filters. */
    @GetMapping("/page")
    public IPage<AccountRecord> page(
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "20") long size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.page(SecurityUtil.currentUserId(), page, size, type, q, from, to);
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
