package com.bookkeeping.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bookkeeping.entity.TodoItem;
import com.bookkeeping.mapper.TodoItemMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TodoService {

    private final TodoItemMapper mapper;

    public TodoService(TodoItemMapper mapper) {
        this.mapper = mapper;
    }

    /** All items for a user (the frontend filters them by day). Ordered by creation. */
    public List<TodoItem> findAll(Long userId) {
        return mapper.selectList(new LambdaQueryWrapper<TodoItem>()
                .eq(TodoItem::getUserId, userId).orderByAsc(TodoItem::getId));
    }

    public TodoItem create(TodoItem item, Long userId) {
        if (item.getText() == null || item.getText().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo text is required");
        }
        if (item.getDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo date is required");
        }
        item.setId(null);
        item.setUserId(userId);
        item.setText(item.getText().trim());
        item.setCreatedAt(LocalDateTime.now());
        mapper.insert(item);
        return item;
    }

    /** Rename / re-text an item. */
    public TodoItem update(Long id, TodoItem input, Long userId) {
        TodoItem existing = requireOwned(id, userId);
        if (input.getText() != null && !input.getText().trim().isEmpty()) {
            existing.setText(input.getText().trim());
        }
        mapper.updateById(existing);
        return existing;
    }

    /** Toggle the done flag. Returns the new value. */
    public boolean toggle(Long id, Long userId) {
        TodoItem existing = requireOwned(id, userId);
        existing.setDone(!existing.isDone());
        mapper.updateById(existing);
        return existing.isDone();
    }

    public void delete(Long id, Long userId) {
        TodoItem existing = mapper.selectById(id);
        if (existing == null) {
            return;
        }
        requireOwner(existing.getUserId(), userId);
        mapper.deleteById(id);
    }

    public void deleteAll(Long userId) {
        mapper.delete(new LambdaQueryWrapper<TodoItem>().eq(TodoItem::getUserId, userId));
    }

    private TodoItem requireOwned(Long id, Long userId) {
        TodoItem item = mapper.selectById(id);
        if (item == null) {
            throw notFound(id);
        }
        requireOwner(item.getUserId(), userId);
        return item;
    }

    private void requireOwner(Long ownerId, Long userId) {
        if (ownerId == null || !ownerId.equals(userId)) {
            throw notFound(null);
        }
    }

    private ResponseStatusException notFound(Long id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Todo not found" + (id != null ? ": " + id : ""));
    }
}
