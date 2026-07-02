package com.bookkeeping.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** Generic per-user key/value state (e.g. timer/stopwatch state) for cross-device sync. */
@Data
@TableName("user_state")
public class UserState {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    @TableField("state_key")
    private String stateKey;

    /** Arbitrary JSON payload. */
    private String content;

    private LocalDateTime updatedAt;
}
