package com.bookkeeping.entity;

import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "habit_checkin",
        uniqueConstraints = @UniqueConstraint(name = "uk_habit_date", columnNames = {"habit_id", "checkin_date"}))
public class HabitCheckin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "habit_id", nullable = false)
    private Long habitId;

    @Column(name = "checkin_date", nullable = false)
    private LocalDate checkinDate;
}
