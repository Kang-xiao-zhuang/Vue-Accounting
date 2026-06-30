package com.bookkeeping.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("habit")
public class Habit {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String name;

    /** Hex color used for the contribution grid, e.g. "#3dd6a3". */
    private String color;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}
