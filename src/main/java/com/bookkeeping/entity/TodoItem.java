package com.bookkeeping.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** A single item on a user's daily checklist (todo). */
@Data
@Entity
@Table(name = "todo_item")
public class TodoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Owning user (app_user.id). */
    @Column(name = "user_id")
    private Long userId;

    /** The day this item belongs to; serialized to JSON as yyyy-MM-dd. */
    @Column(name = "todo_date", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    /** Column is `content` because `text` is reserved in MySQL; JSON field stays "text". */
    @Column(name = "content", nullable = false, length = 255)
    private String text;

    @Column(nullable = false)
    private boolean done;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
