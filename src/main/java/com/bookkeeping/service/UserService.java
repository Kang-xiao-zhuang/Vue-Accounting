package com.bookkeeping.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bookkeeping.entity.User;
import com.bookkeeping.mapper.UserMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    /** Create a new account with a hashed password. */
    public User register(String rawName, String rawPassword) {
        String name = rawName == null ? "" : rawName.trim();
        if (name.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        }
        if (rawPassword == null || rawPassword.length() < 6
                || !rawPassword.matches(".*[A-Za-z].*") || !rawPassword.matches(".*\\d.*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Password must be at least 6 characters and include a letter and a number");
        }
        Long existing = userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getName, name));
        if (existing != null && existing > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already taken: " + name);
        }
        User user = new User();
        user.setName(name);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setCreatedAt(LocalDateTime.now());
        userMapper.insert(user);
        return user;
    }

    /** Verify credentials and return the user, or throw 401. */
    public User authenticate(String rawName, String rawPassword) {
        String name = rawName == null ? "" : rawName.trim();
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getName, name));
        if (user == null || user.getPassword() == null || rawPassword == null
                || !passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
        return user;
    }

    public User findById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id);
        }
        return user;
    }
}
