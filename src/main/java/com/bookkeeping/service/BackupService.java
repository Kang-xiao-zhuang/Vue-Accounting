package com.bookkeeping.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bookkeeping.dto.BackupData;
import com.bookkeeping.dto.HabitDto;
import com.bookkeeping.entity.AccountRecord;
import com.bookkeeping.entity.Budget;
import com.bookkeeping.entity.Habit;
import com.bookkeeping.entity.HabitCheckin;
import com.bookkeeping.entity.RecurringRule;
import com.bookkeeping.entity.TodoItem;
import com.bookkeeping.mapper.AccountRecordMapper;
import com.bookkeeping.mapper.BudgetMapper;
import com.bookkeeping.mapper.HabitCheckinMapper;
import com.bookkeeping.mapper.HabitMapper;
import com.bookkeeping.mapper.RecurringRuleMapper;
import com.bookkeeping.mapper.TodoItemMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BackupService {

    private final AccountRecordMapper recordMapper;
    private final HabitMapper habitMapper;
    private final HabitCheckinMapper checkinMapper;
    private final TodoItemMapper todoMapper;
    private final BudgetMapper budgetMapper;
    private final RecurringRuleMapper ruleMapper;
    private final HabitService habitService;

    public BackupService(AccountRecordMapper recordMapper, HabitMapper habitMapper, HabitCheckinMapper checkinMapper,
                         TodoItemMapper todoMapper, BudgetMapper budgetMapper, RecurringRuleMapper ruleMapper,
                         HabitService habitService) {
        this.recordMapper = recordMapper;
        this.habitMapper = habitMapper;
        this.checkinMapper = checkinMapper;
        this.todoMapper = todoMapper;
        this.budgetMapper = budgetMapper;
        this.ruleMapper = ruleMapper;
        this.habitService = habitService;
    }

    public BackupData export(Long userId) {
        BackupData data = new BackupData();
        data.setExportedAt(LocalDateTime.now().toString());
        data.setRecords(recordMapper.selectList(eqUser(userId)));
        data.setHabits(habitService.findAll(userId)); // HabitDto with checkin dates
        data.setTodos(todoMapper.selectList(new LambdaQueryWrapper<TodoItem>().eq(TodoItem::getUserId, userId)));
        data.setBudgets(budgetMapper.selectList(new LambdaQueryWrapper<Budget>().eq(Budget::getUserId, userId)));
        data.setRecurring(ruleMapper.selectList(new LambdaQueryWrapper<RecurringRule>().eq(RecurringRule::getUserId, userId)));
        return data;
    }

    /** Replaces ALL of the user's data with the backup contents. */
    @Transactional
    public void restore(Long userId, BackupData data) {
        // Wipe existing data for this user.
        List<Habit> oldHabits = habitMapper.selectList(new LambdaQueryWrapper<Habit>().eq(Habit::getUserId, userId));
        List<Long> oldHabitIds = oldHabits.stream().map(Habit::getId).collect(Collectors.toList());
        if (!oldHabitIds.isEmpty()) {
            checkinMapper.delete(new LambdaQueryWrapper<HabitCheckin>().in(HabitCheckin::getHabitId, oldHabitIds));
        }
        habitMapper.delete(new LambdaQueryWrapper<Habit>().eq(Habit::getUserId, userId));
        recordMapper.delete(eqUser(userId));
        todoMapper.delete(new LambdaQueryWrapper<TodoItem>().eq(TodoItem::getUserId, userId));
        budgetMapper.delete(new LambdaQueryWrapper<Budget>().eq(Budget::getUserId, userId));
        ruleMapper.delete(new LambdaQueryWrapper<RecurringRule>().eq(RecurringRule::getUserId, userId));

        if (data == null) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();

        if (data.getRecords() != null) {
            for (AccountRecord r : data.getRecords()) {
                r.setId(null);
                r.setUserId(userId);
                if (r.getCreatedAt() == null) r.setCreatedAt(now);
                recordMapper.insert(r);
            }
        }
        if (data.getTodos() != null) {
            for (TodoItem t : data.getTodos()) {
                t.setId(null);
                t.setUserId(userId);
                if (t.getCreatedAt() == null) t.setCreatedAt(now);
                todoMapper.insert(t);
            }
        }
        if (data.getBudgets() != null) {
            for (Budget b : data.getBudgets()) {
                b.setId(null);
                b.setUserId(userId);
                budgetMapper.insert(b);
            }
        }
        if (data.getRecurring() != null) {
            for (RecurringRule rule : data.getRecurring()) {
                rule.setId(null);
                rule.setUserId(userId);
                if (rule.getCreatedAt() == null) rule.setCreatedAt(now);
                ruleMapper.insert(rule);
            }
        }
        if (data.getHabits() != null) {
            for (HabitDto hd : data.getHabits()) {
                Habit h = new Habit();
                h.setUserId(userId);
                h.setName(hd.getName());
                h.setIcon(hd.getIcon());
                h.setColor(hd.getColor());
                h.setCreatedAt(hd.getCreatedAt() != null ? hd.getCreatedAt() : now);
                habitMapper.insert(h);
                if (hd.getCheckins() != null) {
                    for (String date : hd.getCheckins()) {
                        HabitCheckin c = new HabitCheckin();
                        c.setHabitId(h.getId());
                        c.setCheckinDate(LocalDate.parse(date));
                        checkinMapper.insert(c);
                    }
                }
            }
        }
    }

    private LambdaQueryWrapper<AccountRecord> eqUser(Long userId) {
        return new LambdaQueryWrapper<AccountRecord>().eq(AccountRecord::getUserId, userId);
    }
}
