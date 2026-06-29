package com.bookkeeping.repository;

import com.bookkeeping.entity.TodoItem;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TodoItemRepository extends JpaRepository<TodoItem, Long> {
    List<TodoItem> findByUserId(Long userId, Sort sort);

    long deleteByUserId(Long userId);
}
