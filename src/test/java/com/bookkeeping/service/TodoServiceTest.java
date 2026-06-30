package com.bookkeeping.service;

import com.bookkeeping.entity.TodoItem;
import com.bookkeeping.mapper.TodoItemMapper;
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
class TodoServiceTest {

    @Mock
    TodoItemMapper mapper;

    @InjectMocks
    TodoService service;

    private TodoItem valid() {
        TodoItem t = new TodoItem();
        t.setText("  buy milk  ");
        t.setDate(LocalDate.of(2026, 6, 30));
        return t;
    }

    @Test
    void create_setsUserId_trimsText() {
        TodoItem saved = service.create(valid(), 4L);

        assertThat(saved.getUserId()).isEqualTo(4L);
        assertThat(saved.getText()).isEqualTo("buy milk");
        assertThat(saved.getId()).isNull();
        verify(mapper).insert(saved);
    }

    @Test
    void create_blankText_throwsBadRequest() {
        TodoItem t = valid();
        t.setText("   ");
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.create(t, 1L));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void create_missingDate_throwsBadRequest() {
        TodoItem t = valid();
        t.setDate(null);
        assertThrows(ResponseStatusException.class, () -> service.create(t, 1L));
    }

    @Test
    void toggle_flipsDoneFlag() {
        TodoItem t = valid();
        t.setId(3L);
        t.setUserId(1L);
        t.setDone(false);
        when(mapper.selectById(3L)).thenReturn(t);

        boolean now = service.toggle(3L, 1L);

        assertThat(now).isTrue();
        assertThat(t.isDone()).isTrue();
        verify(mapper).updateById(t);
    }

    @Test
    void toggle_whenNotOwner_throwsNotFound() {
        TodoItem t = valid();
        t.setId(3L);
        t.setUserId(2L);
        when(mapper.selectById(3L)).thenReturn(t);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.toggle(3L, 1L));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(mapper, never()).updateById(any());
    }

    @Test
    void update_whenNotOwner_throwsNotFound() {
        TodoItem t = valid();
        t.setId(3L);
        t.setUserId(2L);
        when(mapper.selectById(3L)).thenReturn(t);

        assertThrows(ResponseStatusException.class, () -> service.update(3L, valid(), 1L));
        verify(mapper, never()).updateById(any());
    }
}
