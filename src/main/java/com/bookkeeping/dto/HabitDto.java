package com.bookkeeping.dto;

import com.bookkeeping.entity.Habit;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/** A habit plus its check-in dates (as "yyyy-MM-dd" strings) for the contribution grid. */
@Data
@NoArgsConstructor
public class HabitDto {

    private Long id;
    private Long userId;
    private String name;
    private String color;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    private List<String> checkins;

    public HabitDto(Habit habit, List<String> checkins) {
        this.id = habit.getId();
        this.userId = habit.getUserId();
        this.name = habit.getName();
        this.color = habit.getColor();
        this.createdAt = habit.getCreatedAt();
        this.checkins = checkins;
    }
}
