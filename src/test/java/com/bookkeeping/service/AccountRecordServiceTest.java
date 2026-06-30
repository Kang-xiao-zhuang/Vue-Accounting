package com.bookkeeping.service;

import com.bookkeeping.entity.AccountRecord;
import com.bookkeeping.mapper.AccountRecordMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountRecordServiceTest {

    @Mock
    AccountRecordMapper mapper;

    @InjectMocks
    AccountRecordService service;

    private AccountRecord valid() {
        AccountRecord r = new AccountRecord();
        r.setType("expense");
        r.setCategory("  Dining  ");
        r.setAmount(new BigDecimal("12.50"));
        r.setDate(LocalDate.of(2026, 6, 30));
        return r;
    }

    @Test
    void create_setsUserId_trimsCategory_andInserts() {
        AccountRecord saved = service.create(valid(), 7L);

        assertThat(saved.getUserId()).isEqualTo(7L);
        assertThat(saved.getId()).isNull();
        assertThat(saved.getCategory()).isEqualTo("Dining");
        verify(mapper).insert(saved);
    }

    @Test
    void create_invalidType_throwsBadRequest() {
        AccountRecord r = valid();
        r.setType("transfer");
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.create(r, 1L));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(mapper, never()).insert(any());
    }

    @Test
    void create_nonPositiveAmount_throwsBadRequest() {
        AccountRecord r = valid();
        r.setAmount(BigDecimal.ZERO);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.create(r, 1L));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void create_missingDate_throwsBadRequest() {
        AccountRecord r = valid();
        r.setDate(null);
        assertThrows(ResponseStatusException.class, () -> service.create(r, 1L));
    }

    @Test
    void update_whenNotOwner_throwsNotFound() {
        AccountRecord existing = valid();
        existing.setId(5L);
        existing.setUserId(2L);
        when(mapper.selectById(5L)).thenReturn(existing);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.update(5L, valid(), 1L));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(mapper, never()).updateById(any());
    }

    @Test
    void update_whenOwner_updatesFields() {
        AccountRecord existing = valid();
        existing.setId(5L);
        existing.setUserId(1L);
        when(mapper.selectById(5L)).thenReturn(existing);

        AccountRecord input = valid();
        input.setType("income");
        input.setAmount(new BigDecimal("99.00"));

        AccountRecord saved = service.update(5L, input, 1L);

        assertThat(saved.getType()).isEqualTo("income");
        assertThat(saved.getAmount()).isEqualByComparingTo("99.00");
        verify(mapper).updateById(existing);
    }

    @Test
    void delete_whenNotOwner_throwsAndDoesNotDelete() {
        AccountRecord existing = valid();
        existing.setUserId(2L);
        when(mapper.selectById(5L)).thenReturn(existing);

        assertThrows(ResponseStatusException.class, () -> service.delete(5L, 1L));
        verify(mapper, never()).delete(any());
    }

    @Test
    void delete_whenMissing_isNoOp() {
        when(mapper.selectById(5L)).thenReturn(null);
        service.delete(5L, 1L);
        verify(mapper, never()).delete(any());
    }
}
