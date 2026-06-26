package com.bookkeeping.service;

import com.bookkeeping.dto.HabitDto;
import com.bookkeeping.entity.Habit;
import com.bookkeeping.entity.HabitCheckin;
import com.bookkeeping.repository.HabitCheckinRepository;
import com.bookkeeping.repository.HabitRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HabitService {

    private static final String DEFAULT_COLOR = "#3dd6a3";

    private final HabitRepository habitRepository;
    private final HabitCheckinRepository checkinRepository;

    public HabitService(HabitRepository habitRepository, HabitCheckinRepository checkinRepository) {
        this.habitRepository = habitRepository;
        this.checkinRepository = checkinRepository;
    }

    public List<HabitDto> findAll(Long userId) {
        Sort sort = Sort.by(Sort.Direction.ASC, "id");
        List<Habit> habits = userId != null
                ? habitRepository.findByUserId(userId, sort)
                : habitRepository.findAll(sort);

        List<Long> ids = habits.stream().map(Habit::getId).collect(Collectors.toList());
        Map<Long, List<String>> byHabit = new HashMap<>();
        if (!ids.isEmpty()) {
            for (HabitCheckin c : checkinRepository.findByHabitIdIn(ids)) {
                byHabit.computeIfAbsent(c.getHabitId(), k -> new ArrayList<>())
                        .add(c.getCheckinDate().toString());
            }
        }
        return habits.stream()
                .map(h -> new HabitDto(h, byHabit.getOrDefault(h.getId(), Collections.emptyList())))
                .collect(Collectors.toList());
    }

    public HabitDto create(Habit habit) {
        if (habit.getName() == null || habit.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Habit name is required");
        }
        habit.setId(null);
        habit.setName(habit.getName().trim());
        if (habit.getColor() == null || habit.getColor().trim().isEmpty()) {
            habit.setColor(DEFAULT_COLOR);
        }
        Habit saved = habitRepository.save(habit);
        return new HabitDto(saved, Collections.emptyList());
    }

    public HabitDto update(Long id, Habit input) {
        Habit existing = habitRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Habit not found: " + id));
        if (input.getName() != null && !input.getName().trim().isEmpty()) {
            existing.setName(input.getName().trim());
        }
        if (input.getColor() != null && !input.getColor().trim().isEmpty()) {
            existing.setColor(input.getColor().trim());
        }
        Habit saved = habitRepository.save(existing);
        List<String> checkins = checkinRepository.findByHabitId(id).stream()
                .map(c -> c.getCheckinDate().toString())
                .collect(Collectors.toList());
        return new HabitDto(saved, checkins);
    }

    @Transactional
    public void delete(Long id) {
        checkinRepository.deleteByHabitId(id);
        habitRepository.deleteById(id);
    }

    /** Toggle a check-in for the given date. Returns true if now checked, false if removed. */
    @Transactional
    public boolean toggle(Long habitId, LocalDate date) {
        if (!habitRepository.existsById(habitId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Habit not found: " + habitId);
        }
        Optional<HabitCheckin> existing = checkinRepository.findByHabitIdAndCheckinDate(habitId, date);
        if (existing.isPresent()) {
            checkinRepository.delete(existing.get());
            return false;
        }
        HabitCheckin checkin = new HabitCheckin();
        checkin.setHabitId(habitId);
        checkin.setCheckinDate(date);
        checkinRepository.save(checkin);
        return true;
    }
}
