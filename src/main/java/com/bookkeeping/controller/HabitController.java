package com.bookkeeping.controller;

import com.bookkeeping.dto.HabitDto;
import com.bookkeeping.entity.Habit;
import com.bookkeeping.security.SecurityUtil;
import com.bookkeeping.service.HabitService;
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
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/habits")
public class HabitController {

    private final HabitService service;

    public HabitController(HabitService service) {
        this.service = service;
    }

    @GetMapping
    public List<HabitDto> list() {
        return service.findAll(SecurityUtil.currentUserId());
    }

    @PostMapping
    public HabitDto create(@RequestBody Habit habit) {
        return service.create(habit, SecurityUtil.currentUserId());
    }

    @PutMapping("/{id}")
    public HabitDto update(@PathVariable Long id, @RequestBody Habit habit) {
        return service.update(id, habit, SecurityUtil.currentUserId());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id, SecurityUtil.currentUserId());
    }

    /** Toggle a day's check-in. Returns { "checked": true|false }. */
    @PostMapping("/{id}/toggle")
    public Map<String, Boolean> toggle(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return Collections.singletonMap("checked", service.toggle(id, date, SecurityUtil.currentUserId()));
    }
}
