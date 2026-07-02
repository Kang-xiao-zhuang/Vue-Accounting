package com.bookkeeping.controller;

import com.bookkeeping.dto.AuthRequest;
import com.bookkeeping.dto.AuthResponse;
import com.bookkeeping.entity.User;
import com.bookkeeping.security.JwtService;
import com.bookkeeping.security.LoginRateLimiter;
import com.bookkeeping.security.SecurityUtil;
import com.bookkeeping.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final LoginRateLimiter rateLimiter;

    public AuthController(UserService userService, JwtService jwtService, LoginRateLimiter rateLimiter) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.rateLimiter = rateLimiter;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody AuthRequest req) {
        User user = userService.register(req.getName(), req.getPassword());
        return toResponse(user);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest req) {
        rateLimiter.assertAllowed(req.getName());
        try {
            User user = userService.authenticate(req.getName(), req.getPassword());
            rateLimiter.onSuccess(req.getName());
            return toResponse(user);
        } catch (ResponseStatusException e) {
            if (e.getStatus() == HttpStatus.UNAUTHORIZED) {
                rateLimiter.onFailure(req.getName());
            }
            throw e;
        }
    }

    /** Current account, derived from the bearer token. */
    @GetMapping("/me")
    public AuthResponse me() {
        User user = userService.findById(SecurityUtil.currentUserId());
        return new AuthResponse(null, user.getId(), user.getName());
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(jwtService.generate(user.getId(), user.getName()), user.getId(), user.getName());
    }
}
