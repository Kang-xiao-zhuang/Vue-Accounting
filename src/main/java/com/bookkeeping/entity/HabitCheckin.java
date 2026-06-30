package com.bookkeeping.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;

@Data
@TableName("habit_checkin")
public class HabitCheckin {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long habitId;

    private LocalDate checkinDate;
}
