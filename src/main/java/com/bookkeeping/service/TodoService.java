package com.bookkeeping.service;

import com.bookkeeping.entity.TodoItem;
import com.bookkeeping.repository.TodoItemRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TodoService {

    private final TodoItemRepository repository;

    public TodoService(TodoItemRepository repository) {
        this.repository = repository;
    }

    /** All items for a user (the frontend filters them by day). Ordered by creation. */
    public List<TodoItem> findAll(Long userId) {
        Sort sort = Sort.by(Sort.Direction.ASC, "id");
        return userId != null ? repository.findByUserId(userId, sort) : repository.findAll(sort);
    }

    public TodoItem create(TodoItem item) {
        if (item.getText() == null || item.getText().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo text is required");
        }
        if (item.getDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo date is required");
        }
        item.setId(null);
        item.setText(item.getText().trim());
        repository.save(item);
        return item;
    }

    /** Rename / re-text an item. */
    public TodoItem update(Long id, TodoItem input) {
        TodoItem existing = find(id);
        if (input.getText() != null && !input.getText().trim().isEmpty()) {
            existing.setText(input.getText().trim());
        }
        return repository.save(existing);
    }

    /** Toggle the done flag. Returns the new value. */
    public boolean toggle(Long id) {
        TodoItem existing = find(id);
        existing.setDone(!existing.isDone());
        repository.save(existing);
        return existing.isDone();
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

    private TodoItem find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Todo not found: " + id));
    }
}
