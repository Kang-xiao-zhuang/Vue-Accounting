package com.bookkeeping.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;

/** A monthly spending limit. An empty category means the overall monthly budget. */
@Data
@TableName("budget")
public class Budget {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    /** "" = overall budget; otherwise an expense category name. */
    private String category = "";

    private BigDecimal monthlyLimit;
}
