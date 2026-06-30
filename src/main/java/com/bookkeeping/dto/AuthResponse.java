package com.bookkeeping.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/** Returned on successful login / register. */
@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long id;
    private String name;
}
