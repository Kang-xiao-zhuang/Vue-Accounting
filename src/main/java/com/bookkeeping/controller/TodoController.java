package com.bookkeeping.controller;

import com.bookkeeping.entity.TodoItem;
import com.bookkeeping.service.TodoService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public List<TodoItem> list(@RequestParam(required = false) Long userId) {
        return service.findAll(userId);
    }

    @PostMapping
    public TodoItem create(@RequestBody TodoItem item) {
        return service.create(item);
    }

    @PutMapping("/{id}")
    public TodoItem update(@PathVariable Long id, @RequestBody TodoItem item) {
        return service.update(id, item);
    }

    /** Toggle done. Returns { "done": true|false }. */
    @PostMapping("/{id}/toggle")
    public Map<String, Boolean> toggle(@PathVariable Long id) {
        return Collections.singletonMap("done", service.toggle(id));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @DeleteMapping
    public void deleteAll(@RequestParam(required = false) Long userId) {
        service.deleteAll(userId);
    }
}
