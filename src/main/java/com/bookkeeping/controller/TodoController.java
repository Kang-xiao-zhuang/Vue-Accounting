package com.bookkeeping.controller;

import com.bookkeeping.entity.TodoItem;
import com.bookkeeping.security.SecurityUtil;
import com.bookkeeping.service.TodoService;
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
@RequestMapping("/api/todos")
public class TodoController {

    private final TodoService service;

    public TodoController(TodoService service) {
        this.service = service;
    }

    @GetMapping
    public List<TodoItem> list() {
        return service.findAll(SecurityUtil.currentUserId());
    }

    @PostMapping
    public TodoItem create(@RequestBody TodoItem item) {
        return service.create(item, SecurityUtil.currentUserId());
    }

    @PutMapping("/{id}")
    public TodoItem update(@PathVariable Long id, @RequestBody TodoItem item) {
        return service.update(id, item, SecurityUtil.currentUserId());
    }

    /** Toggle done. Returns { "done": true|false }. */
    @PostMapping("/{id}/toggle")
    public Map<String, Boolean> toggle(@PathVariable Long id) {
        return Collections.singletonMap("done", service.toggle(id, SecurityUtil.currentUserId()));
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
