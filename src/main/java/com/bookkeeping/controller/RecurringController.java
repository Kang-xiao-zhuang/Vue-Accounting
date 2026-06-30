package com.bookkeeping.controller;

import com.bookkeeping.entity.RecurringRule;
import com.bookkeeping.security.SecurityUtil;
import com.bookkeeping.service.RecurringService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recurring")
public class RecurringController {

    private final RecurringService service;

    public RecurringController(RecurringService service) {
        this.service = service;
    }

    @GetMapping
    public List<RecurringRule> list() {
        return service.findAll(SecurityUtil.currentUserId());
    }

    @PostMapping
    public RecurringRule create(@RequestBody RecurringRule rule) {
        return service.create(rule, SecurityUtil.currentUserId());
    }

    @PutMapping("/{id}")
    public RecurringRule update(@PathVariable Long id, @RequestBody RecurringRule rule) {
        return service.update(id, rule, SecurityUtil.currentUserId());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id, SecurityUtil.currentUserId());
    }

    /** Catch up: materialize any occurrences due up to today. Returns { "created": n }. */
    @PostMapping("/run")
    public Map<String, Integer> run() {
        return Collections.singletonMap("created", service.runDue(SecurityUtil.currentUserId()));
    }
}
