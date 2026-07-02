package com.bookkeeping.controller;

import com.bookkeeping.security.SecurityUtil;
import com.bookkeeping.service.UserStateService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/state")
public class UserStateController {

    private final UserStateService service;

    public UserStateController(UserStateService service) {
        this.service = service;
    }

    /** Returns { "content": <json string or null> }. */
    @GetMapping("/{key}")
    public Map<String, String> get(@PathVariable String key) {
        return Collections.singletonMap("content", service.get(SecurityUtil.currentUserId(), key));
    }

    @PutMapping("/{key}")
    public Map<String, String> put(@PathVariable String key, @RequestBody Map<String, String> body) {
        service.put(SecurityUtil.currentUserId(), key, body == null ? null : body.get("content"));
        return Collections.singletonMap("status", "ok");
    }
}
