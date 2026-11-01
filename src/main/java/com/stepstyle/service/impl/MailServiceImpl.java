package com.stepstyle.service.impl;

import com.stepstyle.service.MailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailServiceImpl implements MailService {

    private static final Logger logger = LoggerFactory.getLogger(MailServiceImpl.class);

    private final JavaMailSender mailSender;
    private final boolean devMode;
    private final String fromEmail;
    private final String frontendResetUrl;

    public MailServiceImpl(
            @Autowired(required = false) JavaMailSender mailSender,
            @Value("${app.mail.dev-mode:true}") boolean devMode,
            @Value("${app.mail.from-email:noreply@stepstyle.com}") String fromEmail,
            @Value("${app.frontend.reset-password-url:http://localhost:4200/reset-password}") String frontendResetUrl) {
        this.mailSender = mailSender;
        this.devMode = devMode;
        this.fromEmail = fromEmail;
        this.frontendResetUrl = frontendResetUrl;
    }

    @Override
    public void sendPasswordResetEmail(String recipientEmail, String rawToken) {
        String resetLink = frontendResetUrl + "?token=" + rawToken;

        if (devMode || mailSender == null) {
            logger.info("================================================================================");
            logger.info("[DEV MODE EMAIL SINK] Password Reset Email Simulation");
            logger.info("To: {}", recipientEmail);
            logger.info("From: {}", fromEmail);
            logger.info("Subject: StepStyle - Password Reset Request");
            logger.info("Password Reset Link: {}", resetLink);
            logger.info("Single-Use Raw Token: {}", rawToken);
            logger.info("This link expires in 15 minutes. Note: Real emails are suppressed in dev mode.");
            logger.info("================================================================================");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(recipientEmail);
            message.setSubject("StepStyle - Password Reset Request");
            message.setText("Hello,\n\n"
                    + "You requested to reset your password for your StepStyle account.\n"
                    + "Please click the link below to set a new password:\n\n"
                    + resetLink + "\n\n"
                    + "This link will expire in 15 minutes.\n"
                    + "If you did not request a password reset, please ignore this email.\n\n"
                    + "Best regards,\n"
                    + "The StepStyle Team");

            mailSender.send(message);
            logger.info("Password reset email successfully dispatched to {}", recipientEmail);
        } catch (Exception ex) {
            logger.error("Failed to send password reset email to {}: {}. Falling back to console log.",
                    recipientEmail, ex.getMessage());
            logger.info("[FALLBACK] Reset link for {}: {}", recipientEmail, resetLink);
        }
    }
}
