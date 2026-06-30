package com.bookkeeping.service;

import com.bookkeeping.entity.User;
import com.bookkeeping.mapper.UserMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    UserMapper userMapper;

    @Mock
    PasswordEncoder passwordEncoder;

    @InjectMocks
    UserService service;

    @Test
    void register_hashesPasswordAndInserts() {
        when(userMapper.selectCount(any())).thenReturn(0L);
        when(passwordEncoder.encode("secret")).thenReturn("HASH");

        User user = service.register("  alice  ", "secret");

        assertThat(user.getName()).isEqualTo("alice");
        assertThat(user.getPassword()).isEqualTo("HASH");
        verify(passwordEncoder).encode("secret");
        verify(userMapper).insert(user);
    }

    @Test
    void register_shortPassword_throwsBadRequest() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.register("alice", "no"));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(userMapper, never()).insert(any());
    }

    @Test
    void register_blankName_throwsBadRequest() {
        assertThrows(ResponseStatusException.class, () -> service.register("  ", "secret"));
    }

    @Test
    void register_duplicateName_throwsBadRequest() {
        when(userMapper.selectCount(any())).thenReturn(1L);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.register("alice", "secret"));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(userMapper, never()).insert(any());
    }

    @Test
    void authenticate_unknownUser_throwsUnauthorized() {
        when(userMapper.selectOne(any())).thenReturn(null);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.authenticate("ghost", "secret"));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void authenticate_wrongPassword_throwsUnauthorized() {
        User u = new User();
        u.setName("alice");
        u.setPassword("HASH");
        when(userMapper.selectOne(any())).thenReturn(u);
        when(passwordEncoder.matches("wrong", "HASH")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.authenticate("alice", "wrong"));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void authenticate_validCredentials_returnsUser() {
        User u = new User();
        u.setId(11L);
        u.setName("alice");
        u.setPassword("HASH");
        when(userMapper.selectOne(any())).thenReturn(u);
        when(passwordEncoder.matches(eq("secret"), eq("HASH"))).thenReturn(true);

        User result = service.authenticate("alice", "secret");

        assertThat(result.getId()).isEqualTo(11L);
    }

    @Test
    void findById_missing_throwsNotFound() {
        when(userMapper.selectById(99L)).thenReturn(null);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.findById(99L));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
