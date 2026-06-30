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

@Data
@TableName("account_record")
public class AccountRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    /** "income" or "expense" */
    private String type;

    private String category;

    private BigDecimal amount;

    /** Column is `record_date`; serialized to JSON as yyyy-MM-dd. */
    @TableField("record_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    private String note;

    private LocalDateTime createdAt;
}
