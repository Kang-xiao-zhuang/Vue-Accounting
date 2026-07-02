package com.bookkeeping.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bookkeeping.entity.UserState;
import com.bookkeeping.mapper.UserStateMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserStateService {

    private final UserStateMapper mapper;

    public UserStateService(UserStateMapper mapper) {
        this.mapper = mapper;
    }

    /** The stored JSON content for (user, key), or null. */
    public String get(Long userId, String key) {
        UserState s = find(userId, key);
        return s == null ? null : s.getContent();
    }

    /** Create or update the content for (user, key). */
    public void put(Long userId, String key, String content) {
        UserState existing = find(userId, key);
        if (existing != null) {
            existing.setContent(content);
            existing.setUpdatedAt(LocalDateTime.now());
            mapper.updateById(existing);
        } else {
            UserState s = new UserState();
            s.setUserId(userId);
            s.setStateKey(key);
            s.setContent(content);
            s.setUpdatedAt(LocalDateTime.now());
            mapper.insert(s);
        }
    }

    private UserState find(Long userId, String key) {
        return mapper.selectOne(new LambdaQueryWrapper<UserState>()
                .eq(UserState::getUserId, userId)
                .eq(UserState::getStateKey, key));
    }
}
