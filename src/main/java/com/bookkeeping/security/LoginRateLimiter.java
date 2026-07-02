package com.bookkeeping.security;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory brute-force guard for login, keyed by username.
 * After {@link #MAX_FAILS} consecutive failures the account's login is locked
 * for {@link #LOCK_MS}. A successful login clears the counter.
 */
@Component
public class LoginRateLimiter {

    private static final int MAX_FAILS = 8;
    private static final long LOCK_MS = 5 * 60 * 1000L; // 5 minutes

    private static final class Entry {
        int fails;
        long lockedUntil;
    }

    private final Map<String, Entry> attempts = new ConcurrentHashMap<>();

    private String key(String name) {
        return name == null ? "" : name.trim().toLowerCase();
    }

    /** Throws 429 if the username is currently locked out. */
    public void assertAllowed(String name) {
        Entry e = attempts.get(key(name));
        if (e != null && e.lockedUntil > System.currentTimeMillis()) {
            long secs = (e.lockedUntil - System.currentTimeMillis()) / 1000 + 1;
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many failed attempts. Try again in " + secs + "s.");
        }
    }

    public void onFailure(String name) {
        Entry e = attempts.computeIfAbsent(key(name), k -> new Entry());
        e.fails++;
        if (e.fails >= MAX_FAILS) {
            e.lockedUntil = System.currentTimeMillis() + LOCK_MS;
            e.fails = 0;
        }
    }

    public void onSuccess(String name) {
        attempts.remove(key(name));
    }
}
