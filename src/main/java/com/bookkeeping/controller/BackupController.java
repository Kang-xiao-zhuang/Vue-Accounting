package com.bookkeeping.controller;

import com.bookkeeping.dto.BackupData;
import com.bookkeeping.security.SecurityUtil;
import com.bookkeeping.service.BackupService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/backup")
public class BackupController {

    private final BackupService service;

    public BackupController(BackupService service) {
        this.service = service;
    }

    /** Full export of the current user's data. */
    @GetMapping
    public BackupData export() {
        return service.export(SecurityUtil.currentUserId());
    }

    /** Import the uploaded backup. mode = "replace" (default) or "merge". */
    @PostMapping("/restore")
    public Map<String, String> restore(@RequestBody BackupData data,
                                       @RequestParam(defaultValue = "replace") String mode) {
        service.restore(SecurityUtil.currentUserId(), data, "merge".equalsIgnoreCase(mode));
        return Collections.singletonMap("status", "restored");
    }
}
