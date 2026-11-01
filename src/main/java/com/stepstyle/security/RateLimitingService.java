package com.stepstyle.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class RateLimitingService {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitingService.class);

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_SECONDS = 15 * 60; // 15 minutes

    private static class AttemptRecord {
        int attempts;
        Instant lockoutUntil;

        AttemptRecord(int attempts) {
            this.attempts = attempts;
            this.lockoutUntil = null;
        }
    }

    private final ConcurrentMap<String, AttemptRecord> attemptCache = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        AttemptRecord record = attemptCache.get(key);
        if (record == null) {
            return false;
        }

        if (record.lockoutUntil != null) {
            if (Instant.now().isBefore(record.lockoutUntil)) {
                return true;
            } else {
                // Lockout expired, reset attempts
                attemptCache.remove(key);
                return false;
            }
        }

        return false;
    }

    public void loginFailed(String key) {
        attemptCache.compute(key, (k, record) -> {
            if (record == null) {
                return new AttemptRecord(1);
            }

            // If already locked out and expired, reset
            if (record.lockoutUntil != null && Instant.now().isAfter(record.lockoutUntil)) {
                return new AttemptRecord(1);
            }

            record.attempts++;
            if (record.attempts >= MAX_FAILED_ATTEMPTS) {
                record.lockoutUntil = Instant.now().plusSeconds(LOCKOUT_DURATION_SECONDS);
                logger.warn("Rate limit triggered: Key '{}' is locked out for 15 minutes due to {} failed attempts",
                        k, record.attempts);
            }
            return record;
        });
    }

    public void loginSucceeded(String key) {
        attemptCache.remove(key);
    }

    public long getRemainingLockoutMinutes(String key) {
        AttemptRecord record = attemptCache.get(key);
        if (record != null && record.lockoutUntil != null) {
            long remaining = java.time.Duration.between(Instant.now(), record.lockoutUntil).toMinutes();
            return Math.max(1, remaining);
        }
        return 0;
    }
}
