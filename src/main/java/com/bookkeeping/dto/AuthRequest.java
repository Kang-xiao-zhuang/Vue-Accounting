package com.bookkeeping.dto;

import lombok.Data;

/** Login / register payload. */
@Data
public class AuthRequest {
    private String name;
    private String password;
}
