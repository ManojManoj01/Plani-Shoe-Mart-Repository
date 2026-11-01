package com.stepstyle.service;

public interface MailService {

    void sendPasswordResetEmail(String recipientEmail, String rawToken);
}
