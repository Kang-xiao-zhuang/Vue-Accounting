package com.bookkeeping.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** A rule that materializes an AccountRecord on a schedule (daily / weekly / monthly). */
@Data
@TableName("recurring_rule")
public class RecurringRule {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    /** "income" or "expense" */
    private String type;

    private String category;

    private BigDecimal amount;

    private String note;

    /** DAILY | WEEKLY | MONTHLY */
    private String frequency;

    /** The next date an occurrence is due; advanced as occurrences are generated. */
    @TableField("next_run_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate nextRunDate;

    private boolean active = true;

    private LocalDateTime createdAt;
}
