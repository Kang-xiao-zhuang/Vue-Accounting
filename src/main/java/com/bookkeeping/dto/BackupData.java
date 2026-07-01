package com.bookkeeping.dto;

import com.bookkeeping.entity.AccountRecord;
import com.bookkeeping.entity.Budget;
import com.bookkeeping.entity.RecurringRule;
import com.bookkeeping.entity.TodoItem;
import lombok.Data;

import java.util.List;

/** A full export/import of one user's data. */
@Data
public class BackupData {
    private String exportedAt;
    private List<AccountRecord> records;
    private List<HabitDto> habits;      // each includes its checkin dates
    private List<TodoItem> todos;
    private List<Budget> budgets;
    private List<RecurringRule> recurring;
}
