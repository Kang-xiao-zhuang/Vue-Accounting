package com.bookkeeping.service;

import com.bookkeeping.entity.User;
import com.bookkeeping.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public List<User> findAll() {
        return repository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public User create(User user) {
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User name is required");
        }
        String name = user.getName().trim();
        if (repository.existsByName(name)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already exists: " + name);
        }
        user.setId(null);
        user.setName(name);
        return repository.save(user);
    }

    public User update(Long id, User input) {
        User existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
        if (input.getName() == null || input.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User name is required");
        }
        String name = input.getName().trim();
        if (!name.equals(existing.getName()) && repository.existsByName(name)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already exists: " + name);
        }
        existing.setName(name);
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
