package com.bookkeeping.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** A single item on a user's daily checklist (todo). */
@Data
@TableName("todo_item")
public class TodoItem {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    /** Column is `todo_date`; serialized to JSON as yyyy-MM-dd. */
    @TableField("todo_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    /** Column is `content` because `text` is reserved in MySQL; JSON field stays "text". */
    @TableField("content")
    private String text;

    private boolean done;

    /** 0 = low, 1 = medium, 2 = high. */
    private Integer priority;

    /** Optional time range as "HH:mm" strings. */
    @TableField("start_time")
    private String startTime;

    @TableField("end_time")
    private String endTime;

    private LocalDateTime createdAt;
}
