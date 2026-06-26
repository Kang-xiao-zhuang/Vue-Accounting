package com.bookkeeping.repository;

import com.bookkeeping.entity.HabitCheckin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitCheckinRepository extends JpaRepository<HabitCheckin, Long> {
    List<HabitCheckin> findByHabitId(Long habitId);

    List<HabitCheckin> findByHabitIdIn(List<Long> habitIds);

    Optional<HabitCheckin> findByHabitIdAndCheckinDate(Long habitId, LocalDate checkinDate);

    long deleteByHabitId(Long habitId);
}
