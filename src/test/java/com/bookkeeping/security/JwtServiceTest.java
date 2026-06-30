package com.bookkeeping.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    // 32+ byte secret required for HS256.
    private final JwtService jwt = new JwtService(
            "test-secret-test-secret-test-secret-0123456789", 3_600_000L);

    @Test
    void generateThenParse_roundTripsUserId() {
        String token = jwt.generate(42L, "alice");
        assertThat(jwt.parseUserId(token)).isEqualTo(42L);
    }

    @Test
    void parse_garbageToken_throws() {
        assertThatThrownBy(() -> jwt.parseUserId("not.a.jwt")).isInstanceOf(Exception.class);
    }

    @Test
    void parse_tokenSignedWithDifferentSecret_throws() {
        JwtService other = new JwtService("another-secret-another-secret-aaaa-9999", 3_600_000L);
        String foreign = other.generate(1L, "bob");
        assertThatThrownBy(() -> jwt.parseUserId(foreign)).isInstanceOf(Exception.class);
    }
}
