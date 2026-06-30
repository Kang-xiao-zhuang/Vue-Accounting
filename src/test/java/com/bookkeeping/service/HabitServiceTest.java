package com.bookkeeping.service;

import com.bookkeeping.dto.HabitDto;
import com.bookkeeping.entity.Habit;
import com.bookkeeping.entity.HabitCheckin;
import com.bookkeeping.mapper.HabitCheckinMapper;
import com.bookkeeping.mapper.HabitMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HabitServiceTest {

    @Mock
    HabitMapper habitMapper;

    @Mock
    HabitCheckinMapper checkinMapper;

    @InjectMocks
    HabitService service;

    private Habit owned(Long id, Long userId) {
        Habit h = new Habit();
        h.setId(id);
        h.setUserId(userId);
        h.setName("Read");
        h.setColor("#6d86ff");
        return h;
    }

    @Test
    void create_setsUserId_andDefaultColorWhenBlank() {
        Habit input = new Habit();
        input.setName("  Meditate  ");

        HabitDto dto = service.create(input, 9L);

        assertThat(dto.getUserId()).isEqualTo(9L);
        assertThat(dto.getName()).isEqualTo("Meditate");
        assertThat(dto.getColor()).isEqualTo("#3dd6a3"); // default
        assertThat(dto.getCheckins()).isEmpty();
        verify(habitMapper).insert(any(Habit.class));
    }

    @Test
    void create_blankName_throwsBadRequest() {
        Habit input = new Habit();
        input.setName("  ");
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.create(input, 1L));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(habitMapper, never()).insert(any());
    }

    @Test
    void toggle_whenNotCheckedYet_addsCheckinAndReturnsTrue() {
        LocalDate date = LocalDate.of(2026, 6, 30);
        when(habitMapper.selectById(1L)).thenReturn(owned(1L, 1L));
        when(checkinMapper.selectOne(any())).thenReturn(null);

        boolean checked = service.toggle(1L, date, 1L);

        assertThat(checked).isTrue();
        verify(checkinMapper).insert(any(HabitCheckin.class));
    }

    @Test
    void toggle_whenAlreadyChecked_removesCheckinAndReturnsFalse() {
        LocalDate date = LocalDate.of(2026, 6, 30);
        HabitCheckin existing = new HabitCheckin();
        existing.setId(50L);
        existing.setHabitId(1L);
        existing.setCheckinDate(date);
        when(habitMapper.selectById(1L)).thenReturn(owned(1L, 1L));
        when(checkinMapper.selectOne(any())).thenReturn(existing);

        boolean checked = service.toggle(1L, date, 1L);

        assertThat(checked).isFalse();
        verify(checkinMapper).deleteById(50L);
    }

    @Test
    void toggle_whenNotOwner_throwsNotFound() {
        when(habitMapper.selectById(1L)).thenReturn(owned(1L, 2L));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.toggle(1L, LocalDate.of(2026, 6, 30), 1L));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void delete_whenOwner_removesCheckinsThenHabit() {
        when(habitMapper.selectById(1L)).thenReturn(owned(1L, 1L));

        service.delete(1L, 1L);

        verify(checkinMapper).delete(any());
        verify(habitMapper).deleteById(1L);
    }

    @Test
    void update_whenNotOwner_throwsNotFound() {
        when(habitMapper.selectById(1L)).thenReturn(owned(1L, 2L));

        assertThrows(ResponseStatusException.class, () -> service.update(1L, owned(1L, 2L), 1L));
        verify(habitMapper, never()).updateById(any());
    }
}
