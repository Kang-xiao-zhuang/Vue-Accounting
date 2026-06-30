package com.bookkeeping.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bookkeeping.dto.HabitDto;
import com.bookkeeping.entity.Habit;
import com.bookkeeping.entity.HabitCheckin;
import com.bookkeeping.mapper.HabitCheckinMapper;
import com.bookkeeping.mapper.HabitMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HabitService {

    private static final String DEFAULT_COLOR = "#3dd6a3";
    private static final String DEFAULT_ICON = "🎯";

    private final HabitMapper habitMapper;
    private final HabitCheckinMapper checkinMapper;

    public HabitService(HabitMapper habitMapper, HabitCheckinMapper checkinMapper) {
        this.habitMapper = habitMapper;
        this.checkinMapper = checkinMapper;
    }

    public List<HabitDto> findAll(Long userId) {
        List<Habit> habits = habitMapper.selectList(new LambdaQueryWrapper<Habit>()
                .eq(Habit::getUserId, userId).orderByAsc(Habit::getId));

        List<Long> ids = habits.stream().map(Habit::getId).collect(Collectors.toList());
        Map<Long, List<String>> byHabit = new HashMap<>();
        if (!ids.isEmpty()) {
            List<HabitCheckin> checkins = checkinMapper.selectList(
                    new LambdaQueryWrapper<HabitCheckin>().in(HabitCheckin::getHabitId, ids));
            for (HabitCheckin c : checkins) {
                byHabit.computeIfAbsent(c.getHabitId(), k -> new ArrayList<>())
                        .add(c.getCheckinDate().toString());
            }
        }
        return habits.stream()
                .map(h -> new HabitDto(h, byHabit.getOrDefault(h.getId(), Collections.emptyList())))
                .collect(Collectors.toList());
    }

    public HabitDto create(Habit habit, Long userId) {
        if (habit.getName() == null || habit.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Habit name is required");
        }
        habit.setId(null);
        habit.setUserId(userId);
        habit.setName(habit.getName().trim());
        if (habit.getColor() == null || habit.getColor().trim().isEmpty()) {
            habit.setColor(DEFAULT_COLOR);
        }
        if (habit.getIcon() == null || habit.getIcon().trim().isEmpty()) {
            habit.setIcon(DEFAULT_ICON);
        } else {
            habit.setIcon(habit.getIcon().trim());
        }
        habit.setCreatedAt(LocalDateTime.now());
        habitMapper.insert(habit);
        return new HabitDto(habit, Collections.emptyList());
    }

    public HabitDto update(Long id, Habit input, Long userId) {
        Habit existing = requireOwnedHabit(id, userId);
        if (input.getName() != null && !input.getName().trim().isEmpty()) {
            existing.setName(input.getName().trim());
        }
        if (input.getColor() != null && !input.getColor().trim().isEmpty()) {
            existing.setColor(input.getColor().trim());
        }
        if (input.getIcon() != null && !input.getIcon().trim().isEmpty()) {
            existing.setIcon(input.getIcon().trim());
        }
        habitMapper.updateById(existing);
        List<String> checkins = checkinMapper.selectList(
                new LambdaQueryWrapper<HabitCheckin>().eq(HabitCheckin::getHabitId, id)).stream()
                .map(c -> c.getCheckinDate().toString())
                .collect(Collectors.toList());
        return new HabitDto(existing, checkins);
    }

    public void delete(Long id, Long userId) {
        requireOwnedHabit(id, userId);
        checkinMapper.delete(new LambdaQueryWrapper<HabitCheckin>().eq(HabitCheckin::getHabitId, id));
        habitMapper.deleteById(id);
    }

    /** Toggle a check-in for the given date. Returns true if now checked, false if removed. */
    public boolean toggle(Long habitId, LocalDate date, Long userId) {
        requireOwnedHabit(habitId, userId);
        HabitCheckin existing = checkinMapper.selectOne(new LambdaQueryWrapper<HabitCheckin>()
                .eq(HabitCheckin::getHabitId, habitId)
                .eq(HabitCheckin::getCheckinDate, date));
        if (existing != null) {
            checkinMapper.deleteById(existing.getId());
            return false;
        }
        HabitCheckin checkin = new HabitCheckin();
        checkin.setHabitId(habitId);
        checkin.setCheckinDate(date);
        checkinMapper.insert(checkin);
        return true;
    }

    private Habit requireOwnedHabit(Long id, Long userId) {
        Habit habit = habitMapper.selectById(id);
        if (habit == null || habit.getUserId() == null || !habit.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Habit not found: " + id);
        }
        return habit;
    }
}
